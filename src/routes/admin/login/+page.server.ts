import { env } from 'cloudflare:workers';
import { fail, redirect } from '@sveltejs/kit';
import { login } from '#lib/server/auth.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	if (locals.adminAccess) redirect(303, '/admin');
	return { configured: !!env.ADMIN_PASSWORD };
};

export const actions: Actions = {
	default: async ({ cookies, request }) => {
		const password = String((await request.formData()).get('password') ?? '');
		if (!(await login(cookies, 'admin', env.ADMIN_PASSWORD, password))) {
			return fail(400, { error: 'Das Passwort stimmt leider nicht.' });
		}
		redirect(303, '/admin');
	}
};
