import { env } from 'cloudflare:workers';

/**
 * Public Key aus der Umgebungsvariable `PUBLIC_KEY`, einzeilig als Base64 (SPKI).
 * Versehentlich mitkopierte PEM-Kopfzeilen oder Zeilenumbrüche werden toleriert.
 * Gibt den reinen Base64-Teil zurück oder `null`, wenn nichts Brauchbares gesetzt ist.
 */
export function getPublicKey(): string | null {
	const base64 = (env.PUBLIC_KEY ?? '').replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
	return base64.length > 200 && /^[A-Za-z0-9+/]+={0,2}$/.test(base64) ? base64 : null;
}
