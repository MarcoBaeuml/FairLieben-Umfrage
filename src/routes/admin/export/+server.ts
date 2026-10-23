import { env } from 'cloudflare:workers';
import { loadSurveyInfo } from '#lib/server/survey.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const { results } = await env.DB.prepare(
		'SELECT id, created_at, payload FROM responses ORDER BY created_at'
	).all<{ id: string; created_at: string; payload: string }>();

	const exportedAt = new Date().toISOString();
	const body = {
		format: 'umfrage-export',
		v: 1,
		survey: (await loadSurveyInfo()).title,
		exportedAt,
		responses: results.map((row) => ({
			id: row.id,
			createdAt: row.created_at,
			payload: JSON.parse(row.payload)
		}))
	};

	return new Response(JSON.stringify(body, null, 2), {
		headers: {
			'content-type': 'application/json; charset=utf-8',
			'content-disposition': `attachment; filename="umfrage-export-${exportedAt.slice(0, 10)}.json"`,
			'cache-control': 'no-store'
		}
	});
};
