import { error } from '@sveltejs/kit';
import projects from '../../../data/projects.json';
import { parseMarkdown } from '$lib/utils/markdown';

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
	const project = projects.find((p) => p.name === params.slug);

	if (!project) {
		throw error(404, 'Project not found');
	}

	const contentHtml = parseMarkdown(project.portfolioContent);

	return {
		project,
		contentHtml
	};
}
