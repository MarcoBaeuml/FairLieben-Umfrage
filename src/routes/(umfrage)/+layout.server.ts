import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals, url }) => {
	if (!locals.surveyAccess) {
		const target = url.pathname === '/' ? '' : `?weiter=${encodeURIComponent(url.pathname)}`;
		redirect(303, `/login${target}`);
	}
};
