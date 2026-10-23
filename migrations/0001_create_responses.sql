-- Jede Zeile ist eine komplette, im Browser verschlüsselte Abgabe.
CREATE TABLE responses (
	id TEXT PRIMARY KEY,
	created_at TEXT NOT NULL,
	payload TEXT NOT NULL
);
