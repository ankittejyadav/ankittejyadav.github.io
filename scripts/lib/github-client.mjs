/**
 * Extracts the URL of the next page from the GitHub API 'Link' header.
 * 
 * @param {string | null} linkHeader The Link header string
 * @returns {string | null} The next URL or null if no next page exists
 */
function getNextUrl(linkHeader) {
	if (!linkHeader) return null;
	const parts = linkHeader.split(',');
	for (const part of parts) {
		const match = part.match(/<([^>]+)>;\s*rel="next"/);
		if (match) {
			return match[1];
		}
	}
	return null;
}

/**
 * Handles errors returned by the GitHub API.
 * 
 * @param {Response} response The Response object from fetch
 * @throws {Error} An error describing the status
 */
async function handleGeneralError(response) {
	const status = response.status;
	if (status === 401) {
		throw new Error('Invalid or expired token');
	}
	if (status === 403) {
		throw new Error('Rate limit exceeded');
	}

	let message = `Request failed with status ${status}`;
	try {
		const data = await response.json();
		if (data && data.message) {
			message += `: ${data.message}`;
		}
	} catch (_) {
		// Ignore JSON parsing issues in the error response body
	}
	throw new Error(message);
}

/**
 * Fetches all repositories for the authenticated user, following pagination.
 * 
 * @param {string} token GitHub Personal Access Token
 * @returns {Promise<Array>} List of repositories
 */
export async function fetchAllRepos(token) {
	if (!token) {
		throw new Error('Token is required');
	}

	let url = 'https://api.github.com/user/repos?per_page=100&type=all';
	const allRepos = [];

	while (url) {
		const res = await fetch(url, {
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: 'application/vnd.github.v3+json',
				'User-Agent': 'portfolio-sync'
			}
		});

		if (!res.ok) {
			await handleGeneralError(res);
		}

		const data = await res.json();
		if (Array.isArray(data)) {
			allRepos.push(...data);
		}

		const linkHeader = res.headers.get('link');
		url = getNextUrl(linkHeader);
	}

	return allRepos;
}

/**
 * Fetches either the portfolio.md content or falls back to README content for a specific repository.
 * 
 * @param {string} token GitHub Personal Access Token
 * @param {string} owner Repository owner username or organization
 * @param {string} repo Repository name
 * @returns {Promise<{ content: string | null, isPortfolio: boolean }>} Decoded content and source indicator
 */
export async function fetchPortfolioContent(token, owner, repo) {
	if (!token || !owner || !repo) {
		throw new Error('Token, owner, and repo are required');
	}

	const headers = {
		Authorization: `Bearer ${token}`,
		Accept: 'application/vnd.github.v3+json',
		'User-Agent': 'portfolio-sync'
	};

	// 1. Try to fetch portfolio.md
	const portfolioUrl = `https://api.github.com/repos/${owner}/${repo}/contents/portfolio.md`;
	const portfolioRes = await fetch(portfolioUrl, { headers });

	if (portfolioRes.ok) {
		const data = await portfolioRes.json();
		if (data && data.content) {
			const decoded = Buffer.from(data.content, 'base64').toString('utf-8');
			return { content: decoded, isPortfolio: true };
		}
		return { content: null, isPortfolio: true };
	}

	// If 404, fallback to README. Otherwise handle general errors (401, 403, etc.)
	if (portfolioRes.status !== 404) {
		await handleGeneralError(portfolioRes);
	}

	// 2. Fallback to README
	const readmeUrl = `https://api.github.com/repos/${owner}/${repo}/readme`;
	const readmeRes = await fetch(readmeUrl, { headers });

	if (readmeRes.status === 404) {
		return { content: null, isPortfolio: false };
	}

	if (!readmeRes.ok) {
		await handleGeneralError(readmeRes);
	}

	const data = await readmeRes.json();
	if (!data.content) {
		return { content: null, isPortfolio: false };
	}

	const decoded = Buffer.from(data.content, 'base64').toString('utf-8');
	return { content: decoded, isPortfolio: false };
}


/**
 * Fetches the language breakdown (bytes per language) for a specific repository.
 * 
 * @param {string} token GitHub Personal Access Token
 * @param {string} owner Repository owner username or organization
 * @param {string} repo Repository name
 * @returns {Promise<Record<string, number> | null>} Map of languages to byte counts, or null if 404
 */
export async function fetchLanguages(token, owner, repo) {
	if (!token || !owner || !repo) {
		throw new Error('Token, owner, and repo are required');
	}

	const url = `https://api.github.com/repos/${owner}/${repo}/languages`;
	const res = await fetch(url, {
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: 'application/vnd.github.v3+json',
			'User-Agent': 'portfolio-sync'
		}
	});

	if (res.status === 404) {
		return null;
	}

	if (!res.ok) {
		await handleGeneralError(res);
	}

	return await res.json();
}
