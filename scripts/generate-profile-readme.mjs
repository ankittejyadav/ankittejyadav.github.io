import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseFrontmatter } from './lib/frontmatter.mjs';

// Setup paths relative to the script's location
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectsDir = path.resolve(__dirname, '../src/content/projects');
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

// Map of canonical display names for skills
const DISPLAY_NAMES = {
	'javascript': 'JavaScript',
	'typescript': 'TypeScript',
	'python': 'Python',
	'java': 'Java',
	'html': 'HTML',
	'css': 'CSS',
	'cpp': 'C++',
	'c++': 'C++',
	'go': 'Go',
	'rust': 'Rust',
	'sql': 'SQL',
	'bash': 'Bash',
	'svelte': 'Svelte',
	'sveltekit': 'SvelteKit',
	'react': 'React',
	'flask': 'Flask',
	'springboot': 'Spring Boot',
	'spring boot': 'Spring Boot',
	'vue': 'Vue',
	'nextjs': 'Next.js',
	'next.js': 'Next.js',
	'express': 'Express',
	'django': 'Django',
	'tailwind': 'TailwindCSS',
	'tailwindcss': 'TailwindCSS',
	'git': 'Git',
	'power bi': 'Power BI',
	'powerbi': 'Power BI',
	'tableau': 'Tableau',
	'excel': 'Excel',
	'postgresql': 'PostgreSQL',
	'mysql': 'MySQL',
	'docker': 'Docker',
	'mongodb': 'MongoDB',
	'redis': 'Redis',
	'aws': 'AWS',
	'sqlite': 'SQLite',
	'nodejs': 'Node.js',
	'node': 'Node.js',
	'node.js': 'Node.js'
};

// Category mapping for skills
const CATEGORIES = {
	'Languages': ['javascript', 'typescript', 'python', 'java', 'html', 'css', 'cpp', 'c++', 'go', 'rust', 'sql', 'bash'],
	'Frameworks & Libraries': ['svelte', 'sveltekit', 'react', 'flask', 'springboot', 'spring boot', 'vue', 'nextjs', 'next.js', 'express', 'django', 'tailwind', 'tailwindcss'],
	'Tools & Databases': ['git', 'power bi', 'powerbi', 'tableau', 'excel', 'postgresql', 'mysql', 'docker', 'mongodb', 'redis', 'aws', 'sqlite', 'nodejs', 'node', 'node.js']
};

async function main() {
	try {
		console.log('Generating GitHub Profile README...');

		const projects = [];
		const skillCounts = {};

		// 1. Process Projects
		if (fs.existsSync(projectsDir)) {
			const files = fs.readdirSync(projectsDir).filter((file) => file.endsWith('.md'));
			for (const file of files) {
				const filePath = path.join(projectsDir, file);
				const content = fs.readFileSync(filePath, 'utf8');
				const { frontmatter, body } = parseFrontmatter(content);
				const name = file.replace('.md', '');

				const projPushedAt = frontmatter?.pushedAt || '';
				const projHighlights = frontmatter?.highlights || [];
				const projStack = frontmatter?.stack || [];
				const tagline = frontmatter?.tagline || '';

				// Convert stack to standard array
				let stackArray = [];
				if (Array.isArray(projStack)) {
					stackArray = projStack.filter(s => typeof s === 'string' && s.trim() !== '');
				} else if (typeof projStack === 'string' && projStack.trim() !== '') {
					stackArray = projStack.split(',').map(s => s.trim());
				}

				// FALLBACK 1: If stack is empty in frontmatter, scan body for keywords
				if (stackArray.length === 0 && body) {
					const bodyLower = body.toLowerCase();
					for (const skillKey of Object.keys(DISPLAY_NAMES)) {
						// Match as whole word (or handle special chars like c++)
						const escapedKey = skillKey.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
						const regex = new RegExp(`\\b${escapedKey}\\b`, 'i');
						if (regex.test(bodyLower)) {
							stackArray.push(DISPLAY_NAMES[skillKey]);
						}
					}
				}

				// Convert highlights to standard array
				let highlightsArray = [];
				if (Array.isArray(projHighlights)) {
					highlightsArray = projHighlights.filter(h => typeof h === 'string' && h.trim() !== '');
				} else if (typeof projHighlights === 'string' && projHighlights.trim() !== '') {
					highlightsArray = [projHighlights.trim()];
				}

				// FALLBACK 2: If highlights are empty, use tagline as fallback
				if (highlightsArray.length === 0 && tagline && tagline.trim() !== '') {
					highlightsArray.push(tagline.trim());
				}

				projects.push({
					name,
					pushedAt: projPushedAt,
					highlights: highlightsArray,
					stack: stackArray
				});

				// Track skills from the stack
				for (const rawSkill of stackArray) {
					const skillClean = rawSkill.toLowerCase().trim();
					if (skillClean) {
						skillCounts[skillClean] = (skillCounts[skillClean] || 0) + 1;
					}
				}
			}
		}

		// Sort projects by pushedAt descending (most recent first)
		projects.sort((a, b) => new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime());

		// 2. Build Skills Section (Categorized and sorted by frequency)
		const categorizedSkills = {
			'Languages': [],
			'Frameworks & Libraries': [],
			'Tools & Databases': [],
			'Other Technologies': []
		};

		// Sort all unique skills by how often they are used
		const sortedUniqueSkills = Object.keys(skillCounts).sort((a, b) => skillCounts[b] - skillCounts[a]);

		for (const skill of sortedUniqueSkills) {
			const displayName = DISPLAY_NAMES[skill] || (skill.charAt(0).toUpperCase() + skill.slice(1));
			
			// Find category
			let categorized = false;
			for (const [catName, catKeywords] of Object.entries(CATEGORIES)) {
				if (catKeywords.includes(skill)) {
					categorizedSkills[catName].push(displayName);
					categorized = true;
					break;
				}
			}
			if (!categorized) {
				categorizedSkills['Other Technologies'].push(displayName);
			}
		}

		let skillsSection = '';
		for (const [catName, skillList] of Object.entries(categorizedSkills)) {
			if (skillList.length > 0) {
				skillsSection += `* **${catName}:** ${skillList.join(', ')}\n`;
			}
		}
		skillsSection = skillsSection.trimEnd();

		// 3. Build Recent Highlights Section
		// Collect recent achievements from the 5 most recently active projects that have highlights/taglines
		let highlightsSection = '';
		let highlightCount = 0;
		for (const project of projects) {
			if (project.highlights && project.highlights.length > 0) {
				const recentHighlight = project.highlights[0]; // grab the top highlight
				if (recentHighlight) {
					highlightsSection += `* **${project.name}:** ${recentHighlight}\n`;
					highlightCount++;
				}
			}
			if (highlightCount >= 5) break;
		}
		highlightsSection = highlightsSection.trimEnd();

		// 4. Build Projects List
		let projectsSection = '';
		for (const project of projects.slice(0, 10)) {
			projectsSection += `- [${project.name}](https://github.com/ankittejyadav/${project.name})\n`;
		}
		projectsSection = projectsSection.trimEnd();

		// 5. Process Blog Posts
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

		// 6. Assemble the README Content
		const readmeMarkdown = `# Hi, I'm Ankit 👋

Engineer building things with code.

🌐 [ankittejyadav.github.io](https://ankittejyadav.github.io)

---

## 🛠️ Core Tech Stack & Skills
*(Automatically aggregated from my repositories)*

${skillsSection || '*Syncing skills list...*'}

---

## 🚀 Cool Things I'm Doing
*(Recent key highlights from my active projects)*

${highlightsSection || '*Syncing recent highlights...*'}

---

## 📌 Featured Projects

<!-- Auto-generated from projects directory -->

${projectsSection || '*No projects listed.*'}

---

## ✍️ Recent Writing

<!-- Auto-generated from blog posts -->

${writingSection || '*No recent posts.*'}

---

## 📊 GitHub Stats

![GitHub Stats](https://github-readme-stats.vercel.app/api?username=ankittejyadav&show_icons=true&theme=default&hide_border=true)

---

*This README is auto-generated by a [GitHub Action](https://github.com/ankittejyadav/ankittejyadav.github.io/actions) — powered by my portfolio sync system.*
`;

		// 7. Write generated file to scripts/output/profile-readme.md
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
