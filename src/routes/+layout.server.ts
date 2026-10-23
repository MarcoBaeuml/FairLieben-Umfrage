import { loadSurvey, loadSurveyInfo } from '#lib/server/survey.ts';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	// Fragen und Gruppen nur laden und verraten, wenn das Umfrage-Passwort eingegeben wurde
	const survey = locals.surveyAccess
		? await loadSurvey()
		: { ...(await loadSurveyInfo()), audiences: [] };
	return {
		siteTitle: survey.title,
		description: survey.intro[0] ?? '',
		intro: survey.intro,
		audiences: survey.audiences.map(({ id, name }) => ({ id, name }))
	};
};
