/** @type {import('./$types').PageLoad} */
export async function load() {
	const projectFiles = import.meta.glob('/src/content/projects/*.md', { eager: true });

	const projects = Object.entries(projectFiles).map(([path, module]) => {
		const name = path.split('/').pop()?.replace('.md', '') ?? '';
		const { metadata } = /** @type {any} */ (module);
		return {
			name,
			pushedAt: metadata?.pushedAt ?? ''
		};
	});

	// Sort descending by pushed_at (most recently pushed first)
	projects.sort((a, b) => new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime());

	return { projects };
}
