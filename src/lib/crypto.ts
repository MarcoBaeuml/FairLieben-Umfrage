import type { EncryptedPayload } from '#lib/survey.ts';

function pemToBytes(pem: string): Uint8Array<ArrayBuffer> {
	const base64 = pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
	return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

function bytesToBase64(bytes: ArrayBuffer | Uint8Array): string {
	const array = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
	let binary = '';
	for (const byte of array) binary += String.fromCharCode(byte);
	return btoa(binary);
}

/** Nimmt ein PEM oder nur dessen Base64-Teil. */
export function importPublicKey(pem: string): Promise<CryptoKey> {
	return crypto.subtle.importKey(
		'spki',
		pemToBytes(pem),
		{ name: 'RSA-OAEP', hash: 'SHA-256' },
		false,
		['encrypt']
	);
}

/**
 * Hybride Verschlüsselung: Die Daten werden mit einem zufälligen AES-256-GCM-Schlüssel
 * verschlüsselt, dieser wiederum mit dem RSA-Public-Key.
 */
export async function encrypt(publicKey: CryptoKey, value: unknown): Promise<EncryptedPayload> {
	const aesKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
		'encrypt'
	]);
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const data = await crypto.subtle.encrypt(
		{ name: 'AES-GCM', iv },
		aesKey,
		new TextEncoder().encode(JSON.stringify(value))
	);
	const rawKey = await crypto.subtle.exportKey('raw', aesKey);
	const wrappedKey = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, publicKey, rawKey);

	return {
		v: 1,
		key: bytesToBase64(wrappedKey),
		iv: bytesToBase64(iv),
		data: bytesToBase64(data)
	};
}
