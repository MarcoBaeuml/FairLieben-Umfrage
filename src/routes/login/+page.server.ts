import { env } from 'cloudflare:workers';
import { fail, redirect } from '@sveltejs/kit';
import { login, safeRedirectTarget } from '#lib/server/auth.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, url }) => {
	if (locals.surveyAccess) redirect(303, safeRedirectTarget(url.searchParams.get('weiter'), '/'));
	return { configured: !!env.SURVEY_PASSWORD };
};

export const actions: Actions = {
	default: async ({ cookies, request, url }) => {
		const password = String((await request.formData()).get('password') ?? '');
		if (!(await login(cookies, 'survey', env.SURVEY_PASSWORD, password))) {
			return fail(400, { error: 'Das Passwort stimmt leider nicht.' });
		}
		redirect(303, safeRedirectTarget(url.searchParams.get('weiter'), '/'));
	}
};
