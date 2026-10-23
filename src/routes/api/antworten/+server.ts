import { env } from 'cloudflare:workers';
import { error, json } from '@sveltejs/kit';
import type { EncryptedPayload } from '#lib/survey.ts';
import type { RequestHandler } from './$types';

const MAX_BODY_BYTES = 256 * 1024;
const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/;

function isEncryptedPayload(value: unknown): value is EncryptedPayload {
	if (typeof value !== 'object' || value === null) return false;
	const { v, key, iv, data } = value as Record<string, unknown>;
	return (
		v === 1 &&
		typeof key === 'string' &&
		key.length <= 1024 &&
		BASE64.test(key) &&
		typeof iv === 'string' &&
		iv.length === 16 &&
		BASE64.test(iv) &&
		typeof data === 'string' &&
		data.length <= MAX_BODY_BYTES &&
		BASE64.test(data)
	);
}

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.text();
	if (body.length > MAX_BODY_BYTES) error(413, 'Zu groß');

	let payload: unknown;
	try {
		payload = JSON.parse(body);
	} catch {
		error(400, 'Ungültiges JSON');
	}
	if (!isEncryptedPayload(payload)) error(400, 'Ungültige Daten');

	// Nur die verschlüsselten Felder speichern, keine IP oder sonstige Metadaten.
	const { v, key, iv, data } = payload;
	await env.DB.prepare('INSERT INTO responses (id, created_at, payload) VALUES (?, ?, ?)')
		.bind(crypto.randomUUID(), new Date().toISOString(), JSON.stringify({ v, key, iv, data }))
		.run();

	return json({ ok: true }, { status: 201 });
};
