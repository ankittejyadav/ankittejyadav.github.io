import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
	const modules = import.meta.glob('/src/content/projects/*.md', { eager: true });
	const path = `/src/content/projects/${params.slug}.md`;
	const projectModule = modules[path];

	if (!projectModule) {
		throw error(404, 'Project not found');
	}

	return {
		name: params.slug,
		content: /** @type {any} */ (projectModule).default,
		metadata: /** @type {any} */ (projectModule).metadata
	};
}
