import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchAllRepos, fetchPortfolioContent, fetchLanguages } from './github-client.mjs';

describe('GitHub Client', () => {
	const token = 'fake-token';
	const owner = 'fake-owner';
	const repo = 'fake-repo';

	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn());
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('fetchAllRepos', () => {
		it('fetches all repositories across paginated requests', async () => {
			const page1Repos = [{ id: 1, name: 'repo-1' }];
			const page2Repos = [{ id: 2, name: 'repo-2' }];

			const firstHeaders = new Headers();
			firstHeaders.set('link', '<https://api.github.com/user/repos?per_page=100&type=all&page=2>; rel="next"');

			const secondHeaders = new Headers();

			vi.mocked(fetch)
				.mockResolvedValueOnce({
					ok: true,
					status: 200,
					headers: firstHeaders,
					json: async () => page1Repos
				})
				.mockResolvedValueOnce({
					ok: true,
					status: 200,
					headers: secondHeaders,
					json: async () => page2Repos
				});

			const repos = await fetchAllRepos(token);

			expect(repos).toEqual([...page1Repos, ...page2Repos]);
			expect(fetch).toHaveBeenCalledTimes(2);
			expect(fetch).toHaveBeenNthCalledWith(1, 'https://api.github.com/user/repos?per_page=100&type=all', {
				headers: {
					Authorization: `Bearer ${token}`,
					Accept: 'application/vnd.github.v3+json',
					'User-Agent': 'portfolio-sync'
				}
			});
			expect(fetch).toHaveBeenNthCalledWith(2, 'https://api.github.com/user/repos?per_page=100&type=all&page=2', {
				headers: {
					Authorization: `Bearer ${token}`,
					Accept: 'application/vnd.github.v3+json',
					'User-Agent': 'portfolio-sync'
				}
			});
		});

		it('throws an error for unauthorized requests (401)', async () => {
			vi.mocked(fetch).mockResolvedValueOnce({
				ok: false,
				status: 401,
				json: async () => ({ message: 'Bad credentials' })
			});

			await expect(fetchAllRepos(token)).rejects.toThrow('Invalid or expired token');
		});

		it('throws an error for rate limited requests (403)', async () => {
			vi.mocked(fetch).mockResolvedValueOnce({
				ok: false,
				status: 403,
				json: async () => ({ message: 'API rate limit exceeded' })
			});

			await expect(fetchAllRepos(token)).rejects.toThrow('Rate limit exceeded');
		});
	});

	describe('fetchPortfolioContent', () => {
		it('fetches and decodes base64 portfolio.md correctly', async () => {
			const markdownContent = '# My Tech Portfolio';
			const base64Content = Buffer.from(markdownContent, 'utf-8').toString('base64');

			vi.mocked(fetch).mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: async () => ({ content: base64Content })
			});

			const res = await fetchPortfolioContent(token, owner, repo);

			expect(res).toEqual({ content: markdownContent, isPortfolio: true });
			expect(fetch).toHaveBeenCalledTimes(1);
			expect(fetch).toHaveBeenCalledWith(`https://api.github.com/repos/${owner}/${repo}/contents/portfolio.md`, {
				headers: {
					Authorization: `Bearer ${token}`,
					Accept: 'application/vnd.github.v3+json',
					'User-Agent': 'portfolio-sync'
				}
			});
		});

		it('falls back to README on portfolio.md 404', async () => {
			const readmeContent = '# My README fallback';
			const base64Content = Buffer.from(readmeContent, 'utf-8').toString('base64');

			vi.mocked(fetch)
				.mockResolvedValueOnce({
					ok: false,
					status: 404,
					json: async () => ({ message: 'Not Found' })
				})
				.mockResolvedValueOnce({
					ok: true,
					status: 200,
					json: async () => ({ content: base64Content })
				});

			const res = await fetchPortfolioContent(token, owner, repo);

			expect(res).toEqual({ content: readmeContent, isPortfolio: false });
			expect(fetch).toHaveBeenCalledTimes(2);
			expect(fetch).toHaveBeenNthCalledWith(1, `https://api.github.com/repos/${owner}/${repo}/contents/portfolio.md`, expect.any(Object));
			expect(fetch).toHaveBeenNthCalledWith(2, `https://api.github.com/repos/${owner}/${repo}/readme`, expect.any(Object));
		});

		it('returns content null if both portfolio.md and README return 404', async () => {
			vi.mocked(fetch)
				.mockResolvedValueOnce({
					ok: false,
					status: 404,
					json: async () => ({ message: 'Not Found' })
				})
				.mockResolvedValueOnce({
					ok: false,
					status: 404,
					json: async () => ({ message: 'Not Found' })
				});

			const res = await fetchPortfolioContent(token, owner, repo);

			expect(res).toEqual({ content: null, isPortfolio: false });
			expect(fetch).toHaveBeenCalledTimes(2);
		});

		it('throws rate limit error for fetchPortfolioContent (403)', async () => {
			vi.mocked(fetch).mockResolvedValueOnce({
				ok: false,
				status: 403,
				json: async () => ({ message: 'API rate limit exceeded' })
			});

			await expect(fetchPortfolioContent(token, owner, repo)).rejects.toThrow('Rate limit exceeded');
		});
	});


	describe('fetchLanguages', () => {
		it('fetches languages successfully', async () => {
			const languagesData = { TypeScript: 12000, Svelte: 5000 };

			vi.mocked(fetch).mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: async () => languagesData
			});

			const langs = await fetchLanguages(token, owner, repo);

			expect(langs).toEqual(languagesData);
			expect(fetch).toHaveBeenCalledTimes(1);
			expect(fetch).toHaveBeenCalledWith(`https://api.github.com/repos/${owner}/${repo}/languages`, {
				headers: {
					Authorization: `Bearer ${token}`,
					Accept: 'application/vnd.github.v3+json',
					'User-Agent': 'portfolio-sync'
				}
			});
		});

		it('returns null if the repository languages endpoint returns 404', async () => {
			vi.mocked(fetch).mockResolvedValueOnce({
				ok: false,
				status: 404,
				json: async () => ({ message: 'Not Found' })
			});

			const langs = await fetchLanguages(token, owner, repo);
			expect(langs).toBeNull();
		});
	});
});
