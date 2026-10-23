import { env } from 'cloudflare:workers';
import { redirect } from '@sveltejs/kit';
import { logout } from '#lib/server/auth.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.adminAccess) redirect(303, '/admin/login');

	const stats = await env.DB.prepare(
		'SELECT COUNT(*) AS count, MAX(created_at) AS latest FROM responses'
	).first<{ count: number; latest: string | null }>();

	return { count: stats?.count ?? 0, latest: stats?.latest ?? null };
};

export const actions: Actions = {
	logout: ({ cookies }) => {
		logout(cookies, 'admin');
		redirect(303, '/admin/login');
	}
};
