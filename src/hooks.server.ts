import { env } from 'cloudflare:workers';
import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit/hooks';
import { hasAccess } from '#lib/server/auth.ts';

export const handle: Handle = async ({ event, resolve }) => {
	const { pathname } = event.url;
	event.locals.surveyAccess = await hasAccess(event.cookies, 'survey', env.SURVEY_PASSWORD);
	event.locals.adminAccess = await hasAccess(event.cookies, 'admin', env.ADMIN_PASSWORD);

	// Endpunkte ohne eigene Seite hier absichern; Seiten leiten in ihren `load`-Funktionen um.
	if (pathname.startsWith('/api/') && !event.locals.surveyAccess) {
		return new Response('Nicht angemeldet', { status: 401 });
	}
	if (pathname === '/admin/export' && !event.locals.adminAccess) {
		redirect(303, '/admin/login');
	}

	const response = await resolve(event);
	// Die Seite soll nicht in Suchmaschinen auftauchen (statische Dateien: siehe `_headers`).
	response.headers.set('X-Robots-Tag', 'noindex, nofollow');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
	return response;
};
