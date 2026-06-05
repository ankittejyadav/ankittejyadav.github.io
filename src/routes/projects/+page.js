import { loadCollection } from '$lib/utils/markdown-loader';

/** @type {import('./$types').PageLoad} */
export async function load() {
	const projectFiles = import.meta.glob('/src/content/projects/*.md', { eager: true });

	const projects = loadCollection(
		projectFiles,
		(slug, metadata) => ({
			name: slug,
			pushedAt: metadata?.pushedAt ?? ''
		}),
		'pushedAt'
	);

	return { projects };
}

