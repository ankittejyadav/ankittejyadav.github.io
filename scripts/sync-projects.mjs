import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchAllRepos, fetchPortfolioContent } from './lib/github-client.mjs';
import { parseFrontmatter } from './lib/merge-projects.mjs';

// Setup paths relative to the script's location
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const targetDir = path.resolve(__dirname, '../src/content/projects');

async function main() {
	try {
		console.log('Starting portfolio synchronization to markdown files...');

		// 1. Read GH_PAT from process.env.GH_PAT
		const token = process.env.GH_PAT;
		if (!token) {
			console.error('Error: Environment variable GH_PAT is missing.');
			process.exit(1);
		}

		// 2. Call fetchAllRepos(token) to get all repos
		console.log('Fetching repositories from GitHub API...');
		const repos = await fetchAllRepos(token);
		console.log(`Successfully fetched ${repos.length} repositories.`);

		if (repos.length === 0) {
			console.log('No repositories found for this account.');
			process.exit(0);
		}

		// Extract owner from the first repo's owner.login field
		const owner = repos[0]?.owner?.login;
		if (!owner) {
			console.error('Error: Could not extract repository owner login from GitHub response.');
			process.exit(1);
		}
		console.log(`Detected repository owner login: "${owner}"`);

		// Ensure target directory exists
		if (!fs.existsSync(targetDir)) {
			fs.mkdirSync(targetDir, { recursive: true });
		}

		// 3. Fetch portfolio files in parallel with a concurrency limit of 5
		console.log('Fetching portfolio files for each repository in batches of 5...');
		const batchSize = 5;
		const activeProjectFiles = new Set();

		for (let i = 0; i < repos.length; i += batchSize) {
			const batch = repos.slice(i, i + batchSize);
			console.log(`Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(repos.length / batchSize)}...`);

			await Promise.all(
				batch.map(async (repo) => {
					const name = repo.name;
					const portfolioRes = await fetchPortfolioContent(token, owner, name).catch((err) => {
						console.warn(`Warning: Failed to fetch portfolio content for ${name}: ${err.message}`);
						return { content: null, isPortfolio: false };
					});

					if (portfolioRes.isPortfolio && portfolioRes.content !== null) {
						// Parse frontmatter so we don't duplicate it, and inject the pushedAt timestamp
						const parsed = parseFrontmatter(portfolioRes.content);
						const fm = parsed.frontmatter || {};
						fm.pushedAt = repo.pushed_at;

						// Construct standardized markdown file content
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

		// 4. Clean up any local markdown files that are no longer portfolios on GitHub
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
