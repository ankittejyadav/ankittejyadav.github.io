import { describe, it, expect } from 'vitest';
import { mergeProjects, parseFrontmatter } from './merge-projects.mjs';

describe('mergeProjects & parseFrontmatter', () => {
	const mockRepos = [
		{
			name: 'repo-b',
			html_url: 'https://github.com/user/repo-b'
		},
		{
			name: 'repo-a',
			html_url: 'https://github.com/user/repo-a'
		}
	];

	it('excludes repos that do not have a portfolio.md file', () => {
		const portfolioData = new Map([
			['repo-b', { content: '# Repo B Content', isPortfolio: true }]
		]);
		const result = mergeProjects(mockRepos, portfolioData);
		expect(result.length).toBe(1);
		expect(result[0].name).toBe('repo-b');
		expect(result[0].portfolioContent).toBe('# Repo B Content');
		expect(result[0].url).toBe('https://github.com/user/repo-b');
		expect(result[0].slug).toBe('repo-b');
	});

	it('sorts projects alphabetically by name', () => {
		const portfolioData = new Map([
			['repo-b', { content: '# Repo B', isPortfolio: true }],
			['repo-a', { content: '# Repo A', isPortfolio: true }]
		]);

		const result = mergeProjects(mockRepos, portfolioData);
		expect(result.length).toBe(2);
		expect(result[0].name).toBe('repo-a');
		expect(result[1].name).toBe('repo-b');
	});

	describe('parseFrontmatter', () => {
		it('correctly extracts YAML and body', () => {
			const content = `---\ntagline: "One-line tagline"\n---\n## Title\nHello world`;
			const result = parseFrontmatter(content);
			expect(result.frontmatter).toEqual({
				tagline: 'One-line tagline'
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
});
