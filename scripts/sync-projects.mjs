import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchAllRepos, fetchPortfolioContent, fetchLanguages } from './lib/github-client.mjs';
import { mergeProjects, parseFrontmatter } from './lib/merge-projects.mjs';

// Setup paths relative to the script's location
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.resolve(__dirname, '../src/data/portfolio-config.json');
const projectsJsonPath = path.resolve(__dirname, '../src/data/projects.json');

async function main() {
	try {
		console.log('Starting portfolio synchronization...');

		// 1. Read GH_PAT from process.env.GH_PAT
		const token = process.env.GH_PAT;
		if (!token) {
			console.error('Error: Environment variable GH_PAT is missing.');
			process.exit(1);
		}

		// 2. Read portfolio-config.json from src/data/portfolio-config.json
		if (!fs.existsSync(configPath)) {
			console.error(`Error: Configuration file not found at ${configPath}`);
			process.exit(1);
		}
		
		console.log(`Reading configuration from ${configPath}...`);
		const configContent = fs.readFileSync(configPath, 'utf8');
		const config = JSON.parse(configContent);

		// 3. Call fetchAllRepos(token) to get all repos
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

		// 4. Fetch portfolio files and languages in parallel with a concurrency limit of 5
		console.log('Fetching portfolio files and languages for each repository in batches of 5...');
		const portfolioData = new Map();
		const languages = new Map();
		const batchSize = 5;

		for (let i = 0; i < repos.length; i += batchSize) {
			const batch = repos.slice(i, i + batchSize);
			console.log(`Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(repos.length / batchSize)}...`);

			await Promise.all(
				batch.map(async (repo) => {
					const name = repo.name;
					const [portfolioRes, langs] = await Promise.all([
						fetchPortfolioContent(token, owner, name).catch((err) => {
							console.warn(`Warning: Failed to fetch portfolio content for ${name}: ${err.message}`);
							return { content: null, isPortfolio: false };
						}),
						fetchLanguages(token, owner, name).catch((err) => {
							console.warn(`Warning: Failed to fetch languages for ${name}: ${err.message}`);
							return {};
						})
					]);

					// Parse frontmatter if content exists
					let frontmatter = null;
					let body = portfolioRes.content;
					if (portfolioRes.content) {
						const parsed = parseFrontmatter(portfolioRes.content);
						frontmatter = parsed.frontmatter;
						body = parsed.body;
					}

					portfolioData.set(name, {
						content: portfolioRes.content,
						isPortfolio: portfolioRes.isPortfolio,
						frontmatter,
						body
					});
					languages.set(name, langs);
				})
			);
		}

		console.log('All metadata successfully fetched.');

		// 5. Call mergeProjects(repos, portfolioData, languages, config)
		console.log('Merging project configurations...');
		const mergedProjects = mergeProjects(repos, portfolioData, languages, config);

		// 6. JSON.stringify the result with 2-space indent
		const newProjectsStr = JSON.stringify(mergedProjects, null, 2);

		// 7. Read existing src/data/projects.json if it exists
		let existingProjectsStr = null;
		if (fs.existsSync(projectsJsonPath)) {
			existingProjectsStr = fs.readFileSync(projectsJsonPath, 'utf8');
		}

		// 8. Compare old vs new
		if (existingProjectsStr === newProjectsStr) {
			console.log('No changes detected. projects.json is already up to date.');
			process.exit(0);
		}

		// 9. If different, write new content to src/data/projects.json
		console.log(`Writing changes to ${projectsJsonPath}...`);
		
		// Ensure output directory exists
		const outputDir = path.dirname(projectsJsonPath);
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir, { recursive: true });
		}
		
		fs.writeFileSync(projectsJsonPath, newProjectsStr, 'utf8');
		console.log(`Updated projects.json with ${mergedProjects.length} projects`);
		process.exit(0);

	} catch (error) {
		console.error('Fatal error during execution:', error.message || error);
		process.exit(1);
	}
}

main();
