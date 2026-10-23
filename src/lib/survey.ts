export interface Question {
	id: string;
	text: string;
}

export interface Section {
	title: string;
	questions: Question[];
}

/** Zielgruppe, zwischen der auf der Seite umgeschaltet wird (z. B. „Mädels“, „Jungs“). */
export interface Audience {
	/** URL-Pfad der Zielgruppe, z. B. `maedels` */
	id: string;
	name: string;
	sections: Section[];
}

export interface Survey {
	title: string;
	intro: string[];
	audiences: Audience[];
}

/** Maximale Länge einer einzelnen Antwort in Zeichen. */
export const MAX_ANSWER_LENGTH = 5000;

/** Inhalt, der im Browser verschlüsselt wird. */
export interface ResponsePlaintext {
	v: 1;
	survey: string;
	audience: string;
	answers: { id: string; section: string; question: string; answer: string }[];
}

/** So liegt eine Abgabe verschlüsselt in der Datenbank (alle Felder Base64). */
export interface EncryptedPayload {
	v: 1;
	/** AES-256-GCM-Schlüssel, verschlüsselt mit RSA-OAEP (SHA-256) */
	key: string;
	iv: string;
	data: string;
}

/** „Mädchen“ → „maedchen“, wird als URL der Zielgruppe verwendet. */
export function slugify(name: string): string {
	return name
		.toLowerCase()
		.replace(/ä/g, 'ae')
		.replace(/ö/g, 'oe')
		.replace(/ü/g, 'ue')
		.replace(/ß/g, 'ss')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}
