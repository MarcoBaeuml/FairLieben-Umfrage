import type { Cookies } from '@sveltejs/kit';

/**
 * Passwortschutz per Cookie. Der Cookie-Wert ist ein HMAC über das Passwort: Wird das Passwort
 * geändert, sind alle bisherigen Cookies automatisch ungültig.
 */
export const AREAS = {
	survey: { cookie: 'zugang', path: '/', maxAge: 60 * 60 * 24 * 30 },
	admin: { cookie: 'admin', path: '/admin', maxAge: 60 * 60 * 8 }
} as const;

export type Area = keyof typeof AREAS;

async function token(password: string, area: Area): Promise<string> {
	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey(
		'raw',
		encoder.encode(password),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);
	const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(`fairlieben:${area}`));
	return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

async function sha256(value: string): Promise<Uint8Array> {
	return new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)));
}

/** Vergleicht über Hashes, damit die Laufzeit nicht von Länge oder Inhalt abhängt. */
async function safeEqual(a: string, b: string): Promise<boolean> {
	const [x, y] = await Promise.all([sha256(a), sha256(b)]);
	let diff = 0;
	for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
	return diff === 0;
}

export async function hasAccess(
	cookies: Cookies,
	area: Area,
	password: string | undefined
): Promise<boolean> {
	const value = cookies.get(AREAS[area].cookie);
	if (!password || !value) return false;
	return safeEqual(value, await token(password, area));
}

/** Prüft das Passwort und setzt bei Erfolg das Cookie. */
export async function login(
	cookies: Cookies,
	area: Area,
	password: string | undefined,
	given: string
): Promise<boolean> {
	if (!password || !(await safeEqual(given, password))) {
		// Kleine Bremse gegen automatisiertes Durchprobieren
		await new Promise((resolve) => setTimeout(resolve, 600));
		return false;
	}
	const { cookie, path, maxAge } = AREAS[area];
	cookies.set(cookie, await token(password, area), {
		path,
		maxAge,
		httpOnly: true,
		sameSite: 'lax'
	});
	return true;
}

export function logout(cookies: Cookies, area: Area) {
	cookies.delete(AREAS[area].cookie, { path: AREAS[area].path });
}

/** Nur relative Pfade dieser Seite zulassen, keine Weiterleitung auf fremde Domains. */
export function safeRedirectTarget(target: string | null, fallback: string): string {
	return target?.startsWith('/') && !target.startsWith('//') ? target : fallback;
}
