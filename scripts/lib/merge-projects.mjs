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
export function mergeProjects(repos, portfolioData, languages, config) {
	if (!Array.isArray(repos)) {
		throw new Error('repos must be an array');
	}

	const showForksGlobal = config?.settings?.showForks ?? false;
	const showArchivedGlobal = config?.settings?.showArchived ?? false;
	const excludeRepos = new Set(config?.settings?.excludeRepos ?? []);
	const projectsConfig = config?.projects ?? {};

	const mappedProjects = repos.map((repo) => {
		const name = repo.name;
		const override = projectsConfig[name] || {};

		const repoData = portfolioData instanceof Map ? portfolioData.get(name) : null;
		const isPortfolio = repoData?.isPortfolio ?? false;
		const content = repoData?.content ?? null;
		const projectLanguages = languages instanceof Map ? (languages.get(name) ?? {}) : {};

		const slug = slugify(name);

		let stack = [];
		let highlights = [];
		let role = null;
		let status = null;
		let tagline = override.tagline ?? null;
		let description = override.description ?? repo.description ?? null;
		let portfolioContent = content;

		if (isPortfolio) {
			const fm = repoData?.frontmatter || parseFrontmatter(content).frontmatter;
			const body = repoData?.body !== undefined ? repoData.body : parseFrontmatter(content).body;
			if (fm) {
				stack = fm.stack ?? [];
				highlights = fm.highlights ?? [];
				role = fm.role ?? null;
				status = fm.status ?? null;
				tagline = override.tagline ?? fm.tagline ?? null;
				description = override.description ?? fm.description ?? repo.description ?? null;
				portfolioContent = body;
			}
		}

		const featured = override.featured ?? false;
		const order = override.order ?? null;
		const demoUrl = override.demoUrl ?? repo.homepage ?? null;

		return {
			name,
			slug,
			tagline,
			description,
			language: repo.language ?? null,
			languages: projectLanguages,
			stars: repo.stargazers_count ?? 0,
			forks: repo.forks_count ?? 0,
			topics: repo.topics ?? [],
			url: repo.html_url,
			demoUrl,
			isPrivate: repo.private ?? false,
			isFork: repo.fork ?? false,
			featured,
			order,
			updatedAt: repo.updated_at,
			createdAt: repo.created_at,
			portfolioContent,
			stack,
			highlights,
			role,
			status,
			_archived: repo.archived ?? false,
			_hide: override.hide ?? false,
			_showForkOverride: override.showFork ?? false
		};
	});


	// Filter projects
	const filteredProjects = mappedProjects.filter((project) => {
		// 1. Exclude if in excludeRepos
		if (excludeRepos.has(project.name)) {
			return false;
		}

		// 2. Exclude if archived (unless showArchived is enabled)
		if (project._archived && !showArchivedGlobal) {
			return false;
		}

		// 3. Exclude if hidden
		if (project._hide) {
			return false;
		}

		// 4. Exclude if it is a fork AND showForks is false, EXCEPT if showFork override is explicitly true
		if (project.isFork) {
			if (!showForksGlobal && !project._showForkOverride) {
				return false;
			}
		}

		return true;
	});

	// Remove internal filter flags before returning and sort
	const finalProjects = filteredProjects.map(({ _archived, _hide, _showForkOverride, ...rest }) => rest);

	finalProjects.sort((a, b) => {
		if (a.featured && !b.featured) return -1;
		if (!a.featured && b.featured) return 1;

		if (a.featured && b.featured) {
			const orderA = a.order !== null ? a.order : Infinity;
			const orderB = b.order !== null ? b.order : Infinity;
			if (orderA !== orderB) {
				return orderA - orderB;
			}
			return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
		}

		return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
	});

	return finalProjects;
}
