import { error } from '@sveltejs/kit';
import { getPublicKey } from '#lib/server/public-key.ts';
import { loadSurvey } from '#lib/server/survey.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const survey = await loadSurvey();
	const accentIndex = survey.audiences.findIndex((audience) => audience.id === params.gruppe);
	if (accentIndex === -1) error(404, 'Nicht gefunden');

	return {
		surveyTitle: survey.title,
		audience: survey.audiences[accentIndex],
		accentIndex,
		publicKey: getPublicKey()
	};
};
