/**
 * Überträgt die Fragen aus `fragen.md` in die D1-Datenbank.
 *
 *   yarn fragen                    fragt alles interaktiv ab
 *   yarn fragen --remote --append  echte Datenbank bei Cloudflare, Fragen ergänzen
 *   yarn fragen --local --replace  lokale Datenbank, vorhandene Fragen vorher löschen
 *   yarn fragen andere-datei.md    andere Datei statt fragen.md
 *
 * Abgegebene Antworten bleiben in jedem Fall erhalten.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createInterface } from 'node:readline';
import { parseSurveyMarkdown } from '../src/lib/survey-markdown.ts';

/** Binding aus wrangler.jsonc */
const DATABASE = 'DB';

const args = process.argv.slice(2);
const file = args.find((arg) => !arg.startsWith('--')) ?? 'fragen.md';
const rl = createInterface({ input: process.stdin, output: process.stdout });
// Über den Iterator gelesen gehen keine Eingaben verloren, auch wenn sie schneller kommen als die Fragen
const lines = rl[Symbol.asyncIterator]();

const fragen = (count: number) => `${count} ${count === 1 ? 'Frage' : 'Fragen'}`;

async function choose<T extends string>(question: string, options: Record<string, T>): Promise<T> {
	for (;;) {
		process.stdout.write(question);
		const { value, done } = await lines.next();
		if (done) throw new Error('Keine Eingabe, abgebrochen.');
		const answer = String(value).trim().toLowerCase();
		if (answer in options) return options[answer];
	}
}

function wrangler(target: string, ...rest: string[]): string {
	return execFileSync('yarn', ['wrangler', 'd1', 'execute', DATABASE, target, ...rest], {
		encoding: 'utf8',
		stdio: ['ignore', 'pipe', 'inherit']
	});
}

const sql = (value: string | number) =>
	typeof value === 'number' ? String(value) : `'${value.replaceAll("'", "''")}'`;

async function main() {
	if (!existsSync(file)) {
		throw new Error(`${file} nicht gefunden. Vorlage kopieren: cp fragen.example.md fragen.md`);
	}
	const draft = parseSurveyMarkdown(readFileSync(file, 'utf8'));
	const questions = draft.audiences.flatMap((audience) =>
		audience.sections.flatMap((section) =>
			section.questions.map((text) => ({ audience: audience.name, section: section.title, text }))
		)
	);
	console.log(`\n${file}: „${draft.title}“ mit ${fragen(questions.length)}`);
	for (const audience of draft.audiences) {
		for (const section of audience.sections) {
			console.log(`  ${audience.name} › ${section.title}: ${section.questions.length}`);
		}
	}

	const target = args.includes('--remote')
		? '--remote'
		: args.includes('--local')
			? '--local'
			: await choose('\nWelche Datenbank? [l]okal oder [r]emote (Cloudflare): ', {
					l: '--local',
					r: '--remote'
				});

	let existing: { audience: string; section: string; text: string; position: number }[];
	try {
		const output = wrangler(
			target,
			'--json',
			'--command',
			'SELECT audience, section, text, position FROM questions'
		);
		existing = JSON.parse(output)[0].results;
	} catch {
		throw new Error(
			`Tabelle „questions“ nicht gefunden. Zuerst die Migrationen ausführen:\n  yarn wrangler d1 migrations apply ${DATABASE} ${target}`
		);
	}

	const mode = args.includes('--replace')
		? 'replace'
		: args.includes('--append')
			? 'append'
			: existing.length === 0
				? 'replace'
				: await choose(
						`\nIn der Datenbank sind schon ${existing.length} Fragen. Vorher [l]öschen oder [e]rgänzen? `,
						{ l: 'replace', e: 'append' }
					);

	const key = (q: { audience: string; section: string; text: string }) =>
		[q.audience, q.section, q.text].join('\u0000');
	const known = new Set(mode === 'append' ? existing.map(key) : []);
	const toInsert = questions.filter((q) => !known.has(key(q)));
	let position = mode === 'append' ? Math.max(0, ...existing.map((q) => q.position)) : 0;

	const statements = [
		...(mode === 'replace' ? ['DELETE FROM questions'] : []),
		...toInsert.map(
			(q) =>
				`INSERT INTO questions (position, audience, section, text) VALUES (${sql(++position)}, ${sql(q.audience)}, ${sql(q.section)}, ${sql(q.text)})`
		),
		`INSERT INTO settings (key, value) VALUES ('title', ${sql(draft.title)}) ON CONFLICT (key) DO UPDATE SET value = excluded.value`,
		`INSERT INTO settings (key, value) VALUES ('intro', ${sql(JSON.stringify(draft.intro))}) ON CONFLICT (key) DO UPDATE SET value = excluded.value`
	];

	const where = target === '--remote' ? 'Cloudflare (remote)' : 'lokal';
	console.log(
		mode === 'replace'
			? `\n${fragen(existing.length)} werden gelöscht, ${fragen(toInsert.length)} neu eingetragen (${where}).`
			: `\n${fragen(toInsert.length)} ergänzen, ${fragen(questions.length - toInsert.length)} schon vorhanden (${where}).`
	);
	console.log('Titel und Einleitung werden aus der Datei übernommen. Antworten bleiben erhalten.');
	if ((await choose('Fortfahren? [j/n] ', { j: 'ja', n: 'nein' })) === 'nein') {
		console.log('Abgebrochen, nichts geändert.');
		return;
	}

	const dir = mkdtempSync(join(tmpdir(), 'fragen-'));
	try {
		const sqlFile = join(dir, 'fragen.sql');
		writeFileSync(sqlFile, statements.join(';\n') + ';\n');
		wrangler(target, '--yes', '--file', sqlFile);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
	console.log(`Fertig: ${fragen(toInsert.length)} eingetragen.`);
}

main()
	.catch((error: Error) => {
		console.error(`\nFehler: ${error.message}`);
		process.exitCode = 1;
	})
	.finally(() => rl.close());
