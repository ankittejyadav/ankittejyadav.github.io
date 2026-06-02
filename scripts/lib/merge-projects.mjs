/**
 * Safely converts a repository name into a URL-friendly slug.
 * 
 * @param {string} name 
 * @returns {string}
 */
function slugify(name) {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '');
}

/**
 * Parse simple YAML frontmatter from a string.
 * 
 * @param {string | null} content 
 * @returns {{ frontmatter: any, body: string }}
 */
export function parseFrontmatter(content) {
	if (!content) {
		return { frontmatter: null, body: '' };
	}

	const trimmed = content.trim();
	if (!trimmed.startsWith('---')) {
		return { frontmatter: null, body: content };
	}

	const parts = content.split('\n');
	
	let endIdx = -1;
	let firstDashesSeen = false;
	for (let i = 0; i < parts.length; i++) {
		const line = parts[i].trim();
		if (line === '---') {
			if (!firstDashesSeen) {
				firstDashesSeen = true;
			} else {
				endIdx = i;
				break;
			}
		}
	}

	if (endIdx === -1) {
		return { frontmatter: null, body: content };
	}

	const frontmatterLines = parts.slice(1, endIdx);
	const body = parts.slice(endIdx + 1).join('\n');

	const frontmatter = {};
	let currentArrayKey = null;

	for (const line of frontmatterLines) {
		const trimmedLine = line.trimEnd();
		if (!trimmedLine || trimmedLine.trim() === '') {
			continue;
		}

		if (trimmedLine.trim().startsWith('-')) {
			if (currentArrayKey) {
				let val = trimmedLine.trim().substring(1).trim();
				if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
					val = val.substring(1, val.length - 1);
				}
				if (!frontmatter[currentArrayKey]) {
					frontmatter[currentArrayKey] = [];
				}
				frontmatter[currentArrayKey].push(val);
			}
			continue;
		}

		currentArrayKey = null;

		const colonIdx = trimmedLine.indexOf(':');
		if (colonIdx !== -1) {
			const key = trimmedLine.substring(0, colonIdx).trim();
			let val = trimmedLine.substring(colonIdx + 1).trim();

			if (val === '') {
				currentArrayKey = key;
				frontmatter[key] = [];
			} else {
				if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
					val = val.substring(1, val.length - 1);
				}
				frontmatter[key] = val;
			}
		}
	}

	return { frontmatter, body };
}

/**
 * Merges raw GitHub repository API data, portfolio content (including parsed frontmatter), 
 * languages, and local user configurations to produce a list of resolved Project objects.
 * 
 * @param {Array} repos GitHubRepo[]
 * @param {Map<string, { content: string|null, isPortfolio: boolean, frontmatter: any|null, body?: string }> | null} portfolioData Map of repo name -> portfolio data
 * @param {Map<string, Record<string, number>> | null} languages Map of repo name -> language stats
 * @param {Object} config PortfolioConfig
 * @returns {Array} Project[]
 */
export function mergeProjects(repos, portfolioData) {
	if (!Array.isArray(repos)) {
		throw new Error('repos must be an array');
	}

	const mappedProjects = repos.map((repo) => {
		const name = repo.name;
		const repoData = portfolioData instanceof Map ? portfolioData.get(name) : null;
		const isPortfolio = repoData?.isPortfolio ?? false;
		const content = repoData?.content ?? null;

		return {
			name,
			url: repo.html_url,
			portfolioContent: content,
			isPortfolio,
			pushedAt: repo.pushed_at
		};
	});

	// Filter: ONLY include projects that have portfolio.md
	const filteredProjects = mappedProjects.filter((project) => {
		return project.isPortfolio;
	});

	// Sort descending by pushed_at (most recently pushed first)
	filteredProjects.sort((a, b) => new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime());

	// Remove internal fields, keeping only name, url, and portfolioContent
	const finalProjects = filteredProjects.map(({ isPortfolio, pushedAt, ...rest }) => rest);

	return finalProjects;
}
