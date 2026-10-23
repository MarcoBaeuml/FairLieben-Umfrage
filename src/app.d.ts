// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
// Cloudflare-Bindings (DB, Passwörter) kommen über `import { env } from 'cloudflare:workers'`.
declare global {
	namespace App {
		interface Locals {
			/** Umfrage-Passwort wurde eingegeben (Cookie gültig) */
			surveyAccess: boolean;
			/** Admin-Passwort wurde eingegeben (Cookie gültig) */
			adminAccess: boolean;
		}
	}
}

export {};
