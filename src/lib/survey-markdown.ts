/** Inhalt von `fragen.md`, bevor er in die Datenbank geschrieben wird. */
export interface SurveyDraft {
	title: string;
	intro: string[];
	audiences: { name: string; sections: { title: string; questions: string[] }[] }[];
}

const LIST_ITEM = /^(?:\d+[.)]|[-*])\s+/;

function fail(lineNumber: number, message: string): never {
	throw new Error(`Zeile ${lineNumber}: ${message}`);
}

/**
 * Liest das Markdown-Format von `fragen.md`:
 *   # Titel
 *   Einleitung (optional)
 *   ## Zielgruppe          → eigene Seite, Auswahl auf der Startseite
 *   ### Abschnitt          → Überschrift über einer Gruppe von Fragen
 *   1. Frage               → nummerierte oder `-`-Liste, Folgezeilen gehören zur Frage
 */
export function parseSurveyMarkdown(markdown: string): SurveyDraft {
	const draft: SurveyDraft = { title: '', intro: [], audiences: [] };
	let audience: SurveyDraft['audiences'][number] | undefined;
	let section: SurveyDraft['audiences'][number]['sections'][number] | undefined;
	let inQuestion = false;
	let paragraph: string[] = [];

	const flushParagraph = () => {
		if (paragraph.length > 0) draft.intro.push(paragraph.join(' '));
		paragraph = [];
	};

	for (const [index, rawLine] of markdown.split(/\r?\n/).entries()) {
		const line = rawLine.trim();

		if (line === '') {
			flushParagraph();
			inQuestion = false;
		} else if (line.startsWith('### ')) {
			if (!audience) fail(index + 1, 'Abschnitt (###) ohne Zielgruppe (##) davor.');
			section = { title: line.slice(4).trim(), questions: [] };
			audience.sections.push(section);
			inQuestion = false;
		} else if (line.startsWith('## ')) {
			flushParagraph();
			audience = { name: line.slice(3).trim(), sections: [] };
			draft.audiences.push(audience);
			section = undefined;
			inQuestion = false;
		} else if (line.startsWith('# ')) {
			draft.title = line.slice(2).trim();
		} else if (LIST_ITEM.test(line)) {
			if (!section) fail(index + 1, 'Frage ohne Abschnitt (###) davor.');
			section.questions.push(line.replace(LIST_ITEM, ''));
			inQuestion = true;
		} else if (inQuestion && section) {
			section.questions[section.questions.length - 1] += ` ${line}`;
		} else if (!audience) {
			paragraph.push(line);
		} else {
			fail(index + 1, `Unerwarteter Text „${line}“. Fragen bitte als Liste (1. …) schreiben.`);
		}
	}
	flushParagraph();

	if (!draft.title) throw new Error('Kein Titel gefunden (# …).');
	if (!draft.audiences.some((a) => a.sections.some((s) => s.questions.length > 0))) {
		throw new Error('Keine Fragen gefunden.');
	}
	return draft;
}
