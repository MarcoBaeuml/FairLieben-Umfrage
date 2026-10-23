-- Fragen und Texte der Umfrage. Befüllt wird beides mit `yarn fragen` aus fragen.md.
CREATE TABLE questions (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	-- Reihenfolge über alle Fragen; Zielgruppen und Abschnitte erscheinen in der Reihenfolge ihrer ersten Frage
	position INTEGER NOT NULL,
	audience TEXT NOT NULL,
	section TEXT NOT NULL,
	text TEXT NOT NULL
);

-- Titel („title“) und Einleitung („intro“, JSON-Array mit Absätzen)
CREATE TABLE settings (
	key TEXT PRIMARY KEY,
	value TEXT NOT NULL
);
