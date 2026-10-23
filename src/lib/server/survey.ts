import { env } from 'cloudflare:workers';
import { slugify, type Audience, type Survey } from '#lib/survey.ts';

/** Titel und Einleitung, ohne Fragen. Wird auch ohne Login gebraucht (Login-Seite, Link-Vorschau). */
export interface SurveyInfo {
	title: string;
	intro: string[];
}

function parseSettings(rows: { key: string; value: string }[]): SurveyInfo {
	const settings = new Map(rows.map((row) => [row.key, row.value]));
	let intro: string[] = [];
	try {
		intro = JSON.parse(settings.get('intro') ?? '[]');
	} catch {
		// ungültiges JSON: dann eben ohne Einleitung
	}
	return { title: settings.get('title') ?? 'Umfrage', intro };
}

const SETTINGS_QUERY = 'SELECT key, value FROM settings';

export async function loadSurveyInfo(): Promise<SurveyInfo> {
	const { results } = await env.DB.prepare(SETTINGS_QUERY).all<{ key: string; value: string }>();
	return parseSettings(results);
}

/** Komplette Umfrage aus D1. Nur nach dem Login verwenden, die Fragen sind nicht öffentlich. */
export async function loadSurvey(): Promise<Survey> {
	const [settings, questions] = await env.DB.batch<Record<string, unknown>>([
		env.DB.prepare(SETTINGS_QUERY),
		env.DB.prepare('SELECT id, audience, section, text FROM questions ORDER BY position, id')
	]);

	// Zielgruppen und Abschnitte in der Reihenfolge ihrer ersten Frage
	const audiences: Audience[] = [];
	for (const row of questions.results as {
		id: number;
		audience: string;
		section: string;
		text: string;
	}[]) {
		let audience = audiences.find((a) => a.name === row.audience);
		if (!audience) {
			audience = { id: slugify(row.audience), name: row.audience, sections: [] };
			audiences.push(audience);
		}
		let section = audience.sections.find((s) => s.title === row.section);
		if (!section) {
			section = { title: row.section, questions: [] };
			audience.sections.push(section);
		}
		section.questions.push({ id: `f${row.id}`, text: row.text });
	}

	return {
		...parseSettings(settings.results as { key: string; value: string }[]),
		audiences
	};
}
