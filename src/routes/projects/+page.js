import projects from '../../data/projects.json';

/** @type {import('./$types').PageLoad} */
export async function load() {
	return {
		projects
	};
}
