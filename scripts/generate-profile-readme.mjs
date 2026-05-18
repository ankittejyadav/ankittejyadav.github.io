import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseFrontmatter } from './lib/merge-projects.mjs';

// Setup paths relative to the script's location
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectsJsonPath = path.resolve(__dirname, '../src/data/projects.json');
const postsDir = path.resolve(__dirname, '../src/content/posts');
const outputDir = path.resolve(__dirname, 'output');
const outputPath = path.resolve(outputDir, 'profile-readme.md');

/**
 * Format date string (YYYY-MM-DD) to "Month Year" in UTC to prevent timezone offsets.
 * 
 * @param {string} dateStr 
 * @returns {string} Formatted date
 */
function formatMonthYear(dateStr) {
	if (!dateStr) return '';
	const d = new Date(dateStr + 'T00:00:00Z');
	if (isNaN(d.getTime())) return '';
	const month = d.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });
	const year = d.getUTCFullYear();
	return `${month} ${year}`;
}

async function main() {
	try {
		console.log('Generating GitHub Profile README...');

		// 1. Read src/data/projects.json
		if (!fs.existsSync(projectsJsonPath)) {
			console.error(`Error: Projects data file not found at ${projectsJsonPath}`);
			process.exit(1);
		}
		
		console.log(`Reading project data from ${projectsJsonPath}...`);
		const projectsContent = fs.readFileSync(projectsJsonPath, 'utf8');
		const projects = JSON.parse(projectsContent);

		// 2. Aggregate unique languages/technologies sorted by byte usage descending (minimum 1000 bytes)
		const techBytes = {};
		for (const project of projects) {
			if (project.languages && typeof project.languages === 'object') {
				for (const [lang, bytes] of Object.entries(project.languages)) {
					if (bytes && typeof bytes === 'number') {
						techBytes[lang] = (techBytes[lang] || 0) + bytes;
					}
				}
			}
			// Allocate default 1000 bytes for primary language if missing/below threshold
			if (project.language && typeof project.language === 'string') {
				const primary = project.language;
				if (!techBytes[primary] || techBytes[primary] < 1000) {
					techBytes[primary] = Math.max(techBytes[primary] || 0, 1000);
				}
			}
		}

		const sortedTechs = Object.entries(techBytes)
			.filter(([_, bytes]) => bytes >= 1000)
			.sort((a, b) => b[1] - a[1])
			.map(([lang]) => lang);

		const techStackStr = sortedTechs.join(', ');
		console.log(`Aggregated tech stack: ${techStackStr}`);

		// 3. Process Featured Projects (featured === true) or fallback to top 5 recently updated
		let featuredProjects = projects.filter((p) => p.featured === true);
		let isUsingRecentFallback = false;

		if (featuredProjects.length === 0) {
			console.log('No explicitly featured projects found. Falling back to top 5 recently updated projects.');
			isUsingRecentFallback = true;
			featuredProjects = [...projects]
				.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
				.slice(0, 5);
		} else {
			console.log(`Found ${featuredProjects.length} featured projects.`);
		}

		let featuredSection = '';
		if (isUsingRecentFallback) {
			featuredSection += `*Note: No projects are explicitly featured. Displaying top ${featuredProjects.length} recently updated projects instead.*\n\n`;
		}

		for (const project of featuredProjects) {
			const taglineOrDesc = project.tagline || project.description || '';
			const metaParts = [];
			if (project.language) {
				metaParts.push(`🔧 ${project.language}`);
			}
			if (project.stars > 0) {
				metaParts.push(`⭐ ${project.stars}`);
			}

			featuredSection += `### [${project.name}](${project.url})\n`;
			if (taglineOrDesc) {
				featuredSection += `> ${taglineOrDesc}\n\n`;
			}
			if (metaParts.length > 0) {
				featuredSection += `${metaParts.join(' · ')}\n\n`;
			}
		}

		// Remove trailing empty lines
		featuredSection = featuredSection.trimEnd();

		// 4. Process Blog Posts
		console.log(`Reading blog posts from ${postsDir}...`);
		const posts = [];
		if (fs.existsSync(postsDir)) {
			const files = fs.readdirSync(postsDir).filter((file) => file.endsWith('.md'));
			for (const file of files) {
				const filePath = path.join(postsDir, file);
				const content = fs.readFileSync(filePath, 'utf8');
				const { frontmatter } = parseFrontmatter(content);
				if (frontmatter) {
					const slug = file.replace('.md', '');
					posts.push({
						slug,
						title: frontmatter.title || 'Untitled',
						date: frontmatter.date || ''
					});
				}
			}
		}

		// Sort posts by date descending
		posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
		const recentPosts = posts.slice(0, 5);
		console.log(`Found ${posts.length} posts. Displaying ${recentPosts.length} most recent entries.`);

		let writingSection = '';
		for (const post of recentPosts) {
			const formattedDate = formatMonthYear(post.date);
			writingSection += `- [${post.title}](https://ankittejyadav.github.io/blog/${post.slug}) — ${formattedDate}\n`;
		}
		writingSection = writingSection.trimEnd();

		// 5. Build full README content
		const readmeMarkdown = `# Hi, I'm Ankit 👋

Engineer building things with code.

🌐 [ankittejyadav.github.io](https://ankittejyadav.github.io)

---

## 🛠 Tech Stack

<!-- Auto-generated from project data -->

${techStackStr}

---

## 📌 ${isUsingRecentFallback ? 'Recent Projects' : 'Featured Projects'}

<!-- Auto-generated from projects.json -->

${featuredSection}

---

## ✍️ Recent Writing

<!-- Auto-generated from blog posts -->

${writingSection}

---

## 📊 GitHub Stats

![GitHub Stats](https://github-readme-stats.vercel.app/api?username=ankittejyadav&show_icons=true&theme=default&hide_border=true)

---

*This README is auto-generated by a [GitHub Action](https://github.com/ankittejyadav/ankittejyadav.github.io/actions) — powered by my portfolio sync system.*
`;

		// 6. Write generated file to scripts/output/profile-readme.md
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir, { recursive: true });
		}

		fs.writeFileSync(outputPath, readmeMarkdown, 'utf8');
		console.log(`Successfully generated profile README and wrote to ${outputPath}`);

	} catch (error) {
		console.error('Fatal error during profile README generation:', error.message || error);
		process.exit(1);
	}
}

main();
