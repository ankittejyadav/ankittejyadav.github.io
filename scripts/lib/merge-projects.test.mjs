import { describe, it, expect } from 'vitest';
import { mergeProjects, parseFrontmatter } from './merge-projects.mjs';

describe('mergeProjects & parseFrontmatter', () => {
	const mockRepos = [
		{
			name: 'repo-1',
			description: 'Description 1',
			language: 'TypeScript',
			stargazers_count: 10,
			forks_count: 2,
			topics: ['svelte', 'vite'],
			html_url: 'https://github.com/user/repo-1',
			homepage: 'https://repo-1.com',
			private: false,
			fork: false,
			archived: false,
			updated_at: '2026-05-18T10:00:00Z',
			created_at: '2026-05-01T10:00:00Z'
		},
		{
			name: 'repo-fork',
			description: 'Description Fork',
			language: 'JavaScript',
			stargazers_count: 5,
			forks_count: 1,
			topics: [],
			html_url: 'https://github.com/user/repo-fork',
			homepage: null,
			private: false,
			fork: true,
			archived: false,
			updated_at: '2026-05-18T09:00:00Z',
			created_at: '2026-05-02T10:00:00Z'
		},
		{
			name: 'repo-archived',
			description: 'Description Archived',
			language: 'HTML',
			stargazers_count: 1,
			forks_count: 0,
			topics: [],
			html_url: 'https://github.com/user/repo-archived',
			homepage: null,
			private: false,
			fork: false,
			archived: true,
			updated_at: '2026-05-18T08:00:00Z',
			created_at: '2026-05-03T10:00:00Z'
		}
	];

	const defaultEmptyConfig = {
		settings: {
			showForks: false,
			showArchived: false,
			excludeRepos: []
		},
		projects: {}
	};

	it('forks excluded by default', () => {
		const result = mergeProjects(mockRepos, new Map(), new Map(), defaultEmptyConfig);
		const hasFork = result.some((p) => p.name === 'repo-fork');
		expect(hasFork).toBe(false);
	});

	it('specific fork included via showFork override', () => {
		const config = {
			settings: {
				showForks: false,
				showArchived: false,
				excludeRepos: []
			},
			projects: {
				'repo-fork': {
					showFork: true
				}
			}
		};
		const result = mergeProjects(mockRepos, new Map(), new Map(), config);
		const forkProject = result.find((p) => p.name === 'repo-fork');
		expect(forkProject).toBeDefined();
		expect(forkProject.isFork).toBe(true);
	});

	it('excludeRepos filters correctly', () => {
		const config = {
			settings: {
				showForks: false,
				showArchived: false,
				excludeRepos: ['repo-1']
			},
			projects: {}
		};
		const result = mergeProjects(mockRepos, new Map(), new Map(), config);
		const hasRepo1 = result.some((p) => p.name === 'repo-1');
		expect(hasRepo1).toBe(false);
	});

	it('hide:true filters repo', () => {
		const config = {
			settings: {
				showForks: false,
				showArchived: false,
				excludeRepos: []
			},
			projects: {
				'repo-1': {
					hide: true
				}
			}
		};
		const result = mergeProjects(mockRepos, new Map(), new Map(), config);
		const hasRepo1 = result.some((p) => p.name === 'repo-1');
		expect(hasRepo1).toBe(false);
	});

	it('tagline override replaces GitHub description', () => {
		const config = {
			settings: {
				showForks: false,
				showArchived: false,
				excludeRepos: []
			},
			projects: {
				'repo-1': {
					tagline: 'Custom tagline',
					description: 'Custom description'
				}
			}
		};
		const result = mergeProjects(mockRepos, new Map(), new Map(), config);
		const project = result.find((p) => p.name === 'repo-1');
		expect(project.tagline).toBe('Custom tagline');
		expect(project.description).toBe('Custom description');
	});

	it('featured repos sort first by order', () => {
		const repos = [
			{ ...mockRepos[0], name: 'repo-a', updated_at: '2026-05-18T10:00:00Z' },
			{ ...mockRepos[0], name: 'repo-b', updated_at: '2026-05-18T11:00:00Z' },
			{ ...mockRepos[0], name: 'repo-c', updated_at: '2026-05-18T12:00:00Z' }
		];
		const config = {
			settings: { showForks: false, showArchived: false, excludeRepos: [] },
			projects: {
				'repo-a': { featured: true, order: 2 },
				'repo-b': { featured: false },
				'repo-c': { featured: true, order: 1 }
			}
		};
		const result = mergeProjects(repos, new Map(), new Map(), config);
		expect(result[0].name).toBe('repo-c');
		expect(result[1].name).toBe('repo-a');
		expect(result[2].name).toBe('repo-b');
	});

	it('non-featured sort by updatedAt desc', () => {
		const repos = [
			{ ...mockRepos[0], name: 'repo-old', updated_at: '2026-05-18T08:00:00Z' },
			{ ...mockRepos[0], name: 'repo-new', updated_at: '2026-05-18T12:00:00Z' },
			{ ...mockRepos[0], name: 'repo-mid', updated_at: '2026-05-18T10:00:00Z' }
		];
		const result = mergeProjects(repos, new Map(), new Map(), defaultEmptyConfig);
		expect(result[0].name).toBe('repo-new');
		expect(result[1].name).toBe('repo-mid');
		expect(result[2].name).toBe('repo-old');
	});

	it('repo with no README gets null', () => {
		const portfolioData = new Map([['other-repo', { content: '# Some Readme', isPortfolio: false }]]);
		const result = mergeProjects(mockRepos, portfolioData, new Map(), defaultEmptyConfig);
		const project = result.find((p) => p.name === 'repo-1');
		expect(project.portfolioContent).toBeNull();
	});

	it('repo not in config still appears with defaults', () => {
		const result = mergeProjects(mockRepos, new Map(), new Map(), defaultEmptyConfig);
		const project = result.find((p) => p.name === 'repo-1');
		expect(project).toBeDefined();
		expect(project.featured).toBe(false);
		expect(project.order).toBeNull();
		expect(project.tagline).toBeNull();
		expect(project.description).toBe('Description 1');
	});

	it('empty config works (no crashes)', () => {
		expect(() => mergeProjects(mockRepos, new Map(), new Map(), {})).not.toThrow();
		expect(() => mergeProjects(mockRepos, null, null, undefined)).not.toThrow();
		
		const result = mergeProjects(mockRepos, null, null, undefined);
		expect(result.length).toBeGreaterThan(0);
	});

	describe('parseFrontmatter', () => {
		it('correctly extracts YAML and body', () => {
			const content = `---\ntagline: "One-line tagline"\nrole: "Lead Dev"\nstatus: "completed"\nstack:\n  - TypeScript\n  - Svelte\nhighlights:\n  - "Did X"\n  - "Did Y"\ndescription: "Detailed description"\n---\n## Title\nHello world`;
			const result = parseFrontmatter(content);
			expect(result.frontmatter).toEqual({
				tagline: 'One-line tagline',
				role: 'Lead Dev',
				status: 'completed',
				stack: ['TypeScript', 'Svelte'],
				highlights: ['Did X', 'Did Y'],
				description: 'Detailed description'
			});
			expect(result.body.trim()).toBe('## Title\nHello world');
		});

		it('with no frontmatter returns null frontmatter and full body', () => {
			const content = '## Title\nHello world';
			const result = parseFrontmatter(content);
			expect(result.frontmatter).toBeNull();
			expect(result.body).toBe(content);
		});
	});

	describe('portfolio.md and override precedence', () => {
		it('repo with portfolio.md frontmatter -> stack, highlights, role, status populated', () => {
			const content = `---\nrole: "Creator"\nstatus: "active"\nstack:\n  - Rust\nhighlights:\n  - "Accomplished A"\n---\n# Content`;
			const portfolioData = new Map([['repo-1', { content, isPortfolio: true }]]);
			const result = mergeProjects(mockRepos, portfolioData, new Map(), defaultEmptyConfig);
			const project = result.find((p) => p.name === 'repo-1');

			expect(project.role).toBe('Creator');
			expect(project.status).toBe('active');
			expect(project.stack).toEqual(['Rust']);
			expect(project.highlights).toEqual(['Accomplished A']);
			expect(project.portfolioContent.trim()).toBe('# Content');
		});

		it('repo with README fallback -> stack=[], highlights=[], role=null, status=null', () => {
			const portfolioData = new Map([['repo-1', { content: '# Raw README', isPortfolio: false }]]);
			const result = mergeProjects(mockRepos, portfolioData, new Map(), defaultEmptyConfig);
			const project = result.find((p) => p.name === 'repo-1');

			expect(project.role).toBeNull();
			expect(project.status).toBeNull();
			expect(project.stack).toEqual([]);
			expect(project.highlights).toEqual([]);
			expect(project.portfolioContent).toBe('# Raw README');
		});

		it('portfolio.md tagline overrides GitHub description', () => {
			const content = `---\ntagline: "Frontmatter tagline"\n---\n# Body`;
			const portfolioData = new Map([['repo-1', { content, isPortfolio: true }]]);
			const result = mergeProjects(mockRepos, portfolioData, new Map(), defaultEmptyConfig);
			const project = result.find((p) => p.name === 'repo-1');

			expect(project.tagline).toBe('Frontmatter tagline');
		});

		it('portfolio-config.json tagline overrides portfolio.md tagline', () => {
			const content = `---\ntagline: "Frontmatter tagline"\n---\n# Body`;
			const portfolioData = new Map([['repo-1', { content, isPortfolio: true }]]);
			const config = {
				settings: { showForks: false, showArchived: false, excludeRepos: [] },
				projects: {
					'repo-1': { tagline: 'Config override tagline' }
				}
			};
			const result = mergeProjects(mockRepos, portfolioData, new Map(), config);
			const project = result.find((p) => p.name === 'repo-1');

			expect(project.tagline).toBe('Config override tagline');
		});
	});
});
