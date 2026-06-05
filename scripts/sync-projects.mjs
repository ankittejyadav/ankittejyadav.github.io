import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchAllRepos, fetchPortfolioContent } from './lib/github-client.mjs';
// Setup paths relative to the script's location
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const targetDir = path.resolve(__dirname, '../src/content/projects');
const OWNER = 'ankittejyadav';

/**
 * Parses simple YAML frontmatter block from a string content.
 */
function parseFrontmatter(content) {
	if (!content || !content.trim().startsWith('---')) {
		return { frontmatter: null, body: content };
	}
	const parts = content.split('\n');
	let endIdx = -1;
	for (let i = 1; i < parts.length; i++) {
		if (parts[i].trim() === '---') {
			endIdx = i;
			break;
		}
	}
	if (endIdx === -1) return { frontmatter: null, body: content };
	const fmLines = parts.slice(1, endIdx);
	const body = parts.slice(endIdx + 1).join('\n');
	const frontmatter = {};
	for (const line of fmLines) {
		const colonIdx = line.indexOf(':');
		if (colonIdx !== -1) {
			const key = line.substring(0, colonIdx).trim();
			let val = line.substring(colonIdx + 1).trim();
			if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
				val = val.substring(1, val.length - 1);
			}
			frontmatter[key] = val;
		}
	}
	return { frontmatter, body };
}

/**
 * Syncs a single repository incrementally.
 * 
 * @param {string} token 
 * @param {string} repoName 
 */
async function syncSingleRepo(token, repoName) {
	const filePath = path.join(targetDir, `${repoName}.md`);
	console.log(`Performing incremental sync for repository: "${repoName}"...`);

	try {
		// 1. Fetch repository metadata to get pushed_at
		const repoUrl = `https://api.github.com/repos/${OWNER}/${repoName}`;
		const repoRes = await fetch(repoUrl, {
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: 'application/vnd.github.v3+json',
				'User-Agent': 'portfolio-sync'
			}
		});

		if (repoRes.status === 404) {
			console.log(`Repository "${repoName}" not found on GitHub. Deleting local file if it exists.`);
			if (fs.existsSync(filePath)) {
				fs.unlinkSync(filePath);
				console.log(`Deleted local file: ${repoName}.md`);
			}
			return;
		}

		if (!repoRes.ok) {
			throw new Error(`Failed to fetch repo metadata: Status ${repoRes.status}`);
		}

		const repoInfo = await repoRes.json();
		const pushedAt = repoInfo.pushed_at;

		// 2. Fetch portfolio content
		const portfolioRes = await fetchPortfolioContent(token, OWNER, repoName).catch((err) => {
			console.warn(`Warning: Failed to fetch portfolio content for ${repoName}: ${err.message}`);
			return { content: null, isPortfolio: false };
		});

		if (portfolioRes.isPortfolio && portfolioRes.content !== null) {
			const parsed = parseFrontmatter(portfolioRes.content);
			const fm = parsed.frontmatter || {};
			fm.pushedAt = pushedAt;

			let fileContent = '---\n';
			for (const [key, value] of Object.entries(fm)) {
				fileContent += `${key}: ${JSON.stringify(value)}\n`;
			}
			fileContent += '---\n';
			fileContent += parsed.body;

			if (!fs.existsSync(targetDir)) {
				fs.mkdirSync(targetDir, { recursive: true });
			}

			fs.writeFileSync(filePath, fileContent, 'utf8');
			console.log(`Successfully synced: ${repoName}.md`);
		} else {
			console.log(`Repository "${repoName}" does not contain portfolio.md. Deleting local file if it exists.`);
			if (fs.existsSync(filePath)) {
				fs.unlinkSync(filePath);
				console.log(`Deleted local file: ${repoName}.md`);
			}
		}
	} catch (err) {
		console.error(`Error during incremental sync for ${repoName}:`, err.message || err);
		process.exit(1);
	}
}

async function main() {
	try {
		// 1. Read GH_PAT from process.env.GH_PAT
		const token = process.env.GH_PAT;
		if (!token) {
			if (process.env.GITHUB_ACTIONS === 'true') {
				console.error('Error: Environment variable GH_PAT is missing in CI environment.');
				process.exit(1);
			} else {
				console.warn('Warning: Environment variable GH_PAT is missing. Skipping project sync for local build.');
				process.exit(0);
			}
		}

		// Check for target repository argument for incremental sync
		const targetRepo = process.argv[2];
		if (targetRepo) {
			await syncSingleRepo(token, targetRepo);
			process.exit(0);
		}

		// Otherwise, fall back to full sync
		console.log('Starting full portfolio synchronization to markdown files...');
		console.log('Fetching repositories from GitHub API...');
		const repos = await fetchAllRepos(token);
		console.log(`Successfully fetched ${repos.length} repositories.`);

		if (repos.length === 0) {
			console.log('No repositories found for this account.');
			process.exit(0);
		}

		// Ensure target directory exists
		if (!fs.existsSync(targetDir)) {
			fs.mkdirSync(targetDir, { recursive: true });
		}

		console.log('Fetching portfolio files for each repository in parallel in batches of 5...');
		const batchSize = 5;
		const activeProjectFiles = new Set();

		for (let i = 0; i < repos.length; i += batchSize) {
			const batch = repos.slice(i, i + batchSize);
			console.log(`Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(repos.length / batchSize)}...`);

			await Promise.all(
				batch.map(async (repo) => {
					const name = repo.name;
					const portfolioRes = await fetchPortfolioContent(token, OWNER, name).catch((err) => {
						console.warn(`Warning: Failed to fetch portfolio content for ${name}: ${err.message}`);
						return { content: null, isPortfolio: false };
					});

					if (portfolioRes.isPortfolio && portfolioRes.content !== null) {
						const parsed = parseFrontmatter(portfolioRes.content);
						const fm = parsed.frontmatter || {};
						fm.pushedAt = repo.pushed_at;

						let fileContent = '---\n';
						for (const [key, value] of Object.entries(fm)) {
							fileContent += `${key}: ${JSON.stringify(value)}\n`;
						}
						fileContent += '---\n';
						fileContent += parsed.body;

						const filename = `${name}.md`;
						const filePath = path.join(targetDir, filename);

						fs.writeFileSync(filePath, fileContent, 'utf8');
						console.log(`Synced: ${filename}`);
						activeProjectFiles.add(filename);
					}
				})
			);
		}

		console.log('Cleaning up stale local project files...');
		const localFiles = fs.readdirSync(targetDir).filter((file) => file.endsWith('.md'));
		let deletedCount = 0;

		for (const file of localFiles) {
			if (!activeProjectFiles.has(file)) {
				const filePath = path.join(targetDir, file);
				fs.unlinkSync(filePath);
				console.log(`Deleted stale project file: ${file}`);
				deletedCount++;
			}
		}

		console.log(`Portfolio sync complete. Synced ${activeProjectFiles.size} projects. Deleted ${deletedCount} stale files.`);
		process.exit(0);

	} catch (error) {
		console.error('Fatal error during execution:', error.message || error);
		process.exit(1);
	}
}

main();
