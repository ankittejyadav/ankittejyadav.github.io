import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parsePortfolioMarkdown, parseFrontmatter } from './lib/frontmatter.mjs';

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

// Map of canonical display names for skills (also serves as the whitelist of skills to show)
const DISPLAY_NAMES = {
	// Programming Languages
	'javascript': 'JavaScript',
	'typescript': 'TypeScript',
	'python': 'Python',
	'java': 'Java',
	'go': 'Go',
	'rust': 'Rust',
	'c++': 'C++',
	'cpp': 'C++',
	'sql': 'SQL',
	'bash': 'Bash',
	'html': 'HTML',
	'css': 'CSS',

	// Frontend & UI Engineering
	'react': 'React',
	'nextjs': 'Next.js',
	'next.js': 'Next.js',
	'svelte': 'Svelte',
	'sveltekit': 'SvelteKit',
	'angular': 'Angular',
	'tailwind': 'TailwindCSS',
	'tailwindcss': 'TailwindCSS',
	'vanilla css': 'Vanilla CSS',
	'css custom properties': 'CSS Custom Properties',
	'glassmorphism': 'Glassmorphism',
	'responsive design': 'Responsive Design',
	'ssr': 'Server-Side Rendering',
	'server-side rendering': 'Server-Side Rendering',

	// Backend & Systems Design
	'node.js': 'Node.js',
	'nodejs': 'Node.js',
	'express': 'Express',
	'springboot': 'Spring Boot',
	'spring boot': 'Spring Boot',
	'flask': 'Flask',
	'django': 'Django',
	'server actions': 'Server Actions',
	'restful api': 'RESTful API Design',
	'restful api design': 'RESTful API Design',
	'modular monolith': 'Modular Monolith',
	'domain-driven design': 'Domain-Driven Design',
	'api-first design': 'API-First Design',

	// AI, Agents & Machine Learning
	'gemini api': 'Gemini API',
	'openai api': 'OpenAI API',
	'gemini vision': 'Gemini Vision',
	'large language models': 'Large Language Models (LLMs)',
	'llms': 'Large Language Models (LLMs)',
	'llm': 'Large Language Models (LLMs)',
	'llm function calling': 'LLM Function Calling / Tool Use',
	'function calling': 'LLM Function Calling / Tool Use',
	'tool use': 'LLM Function Calling / Tool Use',
	'ai agent': 'AI Agent Architecture',
	'ai agents': 'AI Agent Architecture',
	'ai agent architecture': 'AI Agent Architecture',
	'fallback chains': 'Multi-Model Fallback Chains',
	'fallback chain': 'Multi-Model Fallback Chains',
	'multi-model fallback chains': 'Multi-Model Fallback Chains',
	'structured json': 'Structured JSON Output',
	'structured json output': 'Structured JSON Output',
	'prompt engineering': 'Prompt Engineering',
	'pytorch': 'PyTorch',
	'tensorflow': 'TensorFlow',
	'keras': 'Keras',
	'hugging face': 'Hugging Face',
	'huggingface': 'Hugging Face',
	'peft': 'PEFT',
	'transformers': 'Transformers',
	'multimodal ai input': 'Multimodal AI Input',
	'gemini': 'Gemini API',
	'openai': 'OpenAI API',

	// Databases & Geospatial
	'postgresql': 'PostgreSQL',
	'supabase': 'Supabase',
	'redis': 'Redis',
	'mongodb': 'MongoDB',
	'mysql': 'MySQL',
	'sqlite': 'SQLite',
	'postgis': 'PostGIS',
	'ewkb': 'EWKB Decoding',
	'ewkb decoding': 'EWKB Decoding',
	'row-level security': 'Row-Level Security (RLS)',
	'rls': 'Row-Level Security (RLS)',
	'database migrations': 'Database Migrations',
	'geospatial data': 'Geospatial Data',
	'haversine': 'Haversine Formula',
	'haversine formula': 'Haversine Formula',
	'geofencing': 'Geofencing',
	'reverse geocoding': 'Reverse Geocoding',
	'coordinate systems': 'Coordinate Systems',

	// Cloud & DevOps
	'aws': 'AWS',
	'vercel': 'Vercel',
	'netlify': 'Netlify',
	'docker': 'Docker',
	'git': 'Git',
	'supabase cli': 'Supabase CLI',
	'github actions': 'GitHub Actions',
	'ci/cd': 'CI/CD Pipelines',

	// Developer Tools & Utilities
	'npm': 'npm',
	'uv': 'uv',
	'vite': 'Vite',
	'rollup': 'Rollup',
	'jupyter': 'Jupyter',
	'serde': 'Serde',
	'toml': 'TOML',
	'unified': 'Unified',
	'crossterm': 'Crossterm',
	'portable-pty': 'portable-pty',
	'portablepty': 'portable-pty',
	'web audio api': 'Web Audio API',
	'text-to-speech': 'Text-to-Speech (TTS)',
	'tts': 'Text-to-Speech (TTS)',
	'speech-to-text': 'Speech-to-Text (STT)',
	'stt': 'Speech-to-Text (STT)'
};

// Category mapping for skills
const CATEGORIES = {
	'Programming Languages': [
		'javascript', 'typescript', 'python', 'java', 'go', 'rust', 'c++', 'cpp', 'sql', 'bash', 'html', 'css'
	],
	'Frontend & UI Engineering': [
		'react', 'nextjs', 'next.js', 'svelte', 'sveltekit', 'angular', 'tailwind', 'tailwindcss', 
		'vanilla css', 'css custom properties', 'glassmorphism', 'responsive design', 'ssr', 'server-side rendering'
	],
	'Backend & Systems Design': [
		'node.js', 'nodejs', 'express', 'springboot', 'spring boot', 'flask', 'django', 
		'server actions', 'restful api', 'restful api design', 'modular monolith', 'domain-driven design', 'api-first design'
	],
	'AI, Agents & Machine Learning': [
		'gemini api', 'openai api', 'gemini vision', 'large language models', 'llms', 'llm', 
		'llm function calling', 'function calling', 'tool use', 'ai agent', 'ai agents', 'ai agent architecture', 
		'fallback chains', 'fallback chain', 'multi-model fallback chains', 'structured json', 'structured json output', 
		'prompt engineering', 'pytorch', 'tensorflow', 'keras', 'hugging face', 'huggingface', 'peft', 'transformers', 
		'multimodal ai input', 'gemini', 'openai'
	],
	'Databases & Geospatial': [
		'postgresql', 'supabase', 'redis', 'mongodb', 'mysql', 'sqlite', 'postgis', 'ewkb', 'ewkb decoding', 
		'row-level security', 'rls', 'database migrations', 'geospatial data', 'haversine', 'haversine formula', 
		'geofencing', 'reverse geocoding', 'coordinate systems'
	],
	'Cloud, DevOps & Security': [
		'aws', 'vercel', 'netlify', 'docker', 'git', 'supabase cli', 'github actions', 'ci/cd'
	],
	'Developer Tools & Utilities': [
		'npm', 'uv', 'vite', 'rollup', 'jupyter', 'serde', 'toml', 'unified', 'crossterm', 
		'portable-pty', 'portablepty', 'web audio api', 'text-to-speech', 'tts', 'speech-to-text', 'stt'
	]
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
				const parsed = parsePortfolioMarkdown(content);
				const name = file.replace('.md', '');

				const projPushedAt = parsed.pushedAt || '';
				let highlightsArray = parsed.highlights || [];
				let stackArray = parsed.stack || [];
				const tagline = parsed.tagline || '';

				// FALLBACK 1: If stack is empty in markdown headings, scan body for keywords
				if (stackArray.length === 0 && parsed.body) {
					const bodyLower = parsed.body.toLowerCase();
					for (const skillKey of Object.keys(DISPLAY_NAMES)) {
						const escapedKey = skillKey.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
						const regex = new RegExp(`\\b${escapedKey}\\b`, 'i');
						if (regex.test(bodyLower)) {
							stackArray.push(DISPLAY_NAMES[skillKey]);
						}
					}
				}

				// FALLBACK 2: If highlights are empty, use tagline
				if (highlightsArray.length === 0 && tagline && tagline.trim() !== '') {
					highlightsArray.push(tagline.trim());
				}

				// Whitelist stack elements to exclude parser noise
				const validatedStack = [];
				for (const rawSkill of stackArray) {
					const clean = rawSkill.toLowerCase().trim();
					if (DISPLAY_NAMES[clean]) {
						const canonicalName = DISPLAY_NAMES[clean];
						if (!validatedStack.includes(canonicalName)) {
							validatedStack.push(canonicalName);
						}
					}
				}

				projects.push({
					name,
					pushedAt: projPushedAt,
					highlights: highlightsArray,
					stack: validatedStack
				});

				// Track skills from the stack
				for (const skill of validatedStack) {
					const skillClean = skill.toLowerCase().trim();
					skillCounts[skillClean] = (skillCounts[skillClean] || 0) + 1;
				}
			}
		}

		// Sort projects by pushedAt descending (most recent first)
		projects.sort((a, b) => new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime());

		// 2. Build Skills Section (Categorized and sorted by frequency)
		const categorizedSkills = {};
		for (const catName of Object.keys(CATEGORIES)) {
			categorizedSkills[catName] = [];
		}

		// Sort all unique skills by how often they are used
		const sortedUniqueSkills = Object.keys(skillCounts).sort((a, b) => skillCounts[b] - skillCounts[a]);

		for (const skill of sortedUniqueSkills) {
			const displayName = DISPLAY_NAMES[skill];
			if (!displayName) continue;
			
			// Find category
			for (const [catName, catKeywords] of Object.entries(CATEGORIES)) {
				if (catKeywords.includes(skill)) {
					categorizedSkills[catName].push(displayName);
					break;
				}
			}
		}

		let skillsSection = '';
		for (const [catName, skillList] of Object.entries(categorizedSkills)) {
			if (skillList.length > 0) {
				skillsSection += `* **${catName}:** ${skillList.join(', ')}\n`;
			}
		}
		skillsSection = skillsSection.trimEnd();

		// 3. Build Featured Projects & Key Achievements Table (Top 5 active projects)
		let projectsTable = '| Project | Core Tech | Key Accomplishment / Metric |\n| :--- | :--- | :--- |\n';
		let activeCount = 0;

		for (const project of projects) {
			const highlightText = project.highlights[0] || '';
			if (highlightText && project.stack.length > 0) {
				// Pick top 3 skills to avoid making table too wide
				const shortStack = project.stack.slice(0, 4).join(', ');
				projectsTable += `| [**${project.name}**](https://github.com/ankittejyadav/${project.name}) | ${shortStack} | ${highlightText} |\n`;
				activeCount++;
			}
			if (activeCount >= 5) break;
		}

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

		// 5. Assemble the README Content
		const readmeMarkdown = `# Ankit Yadav

Full-Stack Engineer building high-performance systems and developer tooling.

🌐 [Website & Portfolio](https://ankittejyadav.github.io) | 💼 [LinkedIn](https://linkedin.com/in/ankittejyadav)

---

## 🛠️ Technical Toolbox

${skillsSection || '*Loading skills toolbox...*'}

---

## 🚀 Featured Projects & Key Achievements

${projectsTable}

---

## ✍️ Recent Technical Writing

<!-- Auto-generated from blog posts -->

${writingSection || '*No recent posts.*'}
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
