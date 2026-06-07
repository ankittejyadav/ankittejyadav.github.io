/**
 * Parses simple YAML frontmatter block from a string content.
 * Handles JSON-serialized values (like arrays or quoted strings) automatically.
 * 
 * @param {string} content - The markdown file content
 * @returns {{ frontmatter: Record<string, any> | null, body: string }}
 */
export function parseFrontmatter(content) {
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
			
			// Try to parse val as JSON (handles arrays like ["JS"] or double-quoted strings)
			try {
				frontmatter[key] = JSON.parse(val);
			} catch (_) {
				// Fallback if not valid JSON
				if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
					val = val.substring(1, val.length - 1);
				}
				frontmatter[key] = val;
			}
		}
	}
	return { frontmatter, body };
}

// Keywords to recognize category headings vs. technology descriptions
const CATEGORY_KEYWORDS = ['languages', 'frameworks', 'libraries', 'tools', 'databases', 'frontend', 'backend', 'infrastructure', 'devops', 'cloud', 'apis', 'testing', 'architecture', 'database', 'infra', 'category'];

/**
 * Parses structured sections from a markdown string body.
 * Extracts title, tagline, tech stack (from list), and achievements (from list).
 * 
 * @param {string} content
 * @returns {{ title: string, tagline: string, stack: string[], highlights: string[], pushedAt: string, body: string }}
 */
export function parsePortfolioMarkdown(content) {
	const { frontmatter, body } = parseFrontmatter(content);
	const fm = frontmatter || {};

	const lines = body.split('\n');
	let title = '';
	let tagline = '';
	const stack = [];
	const highlights = [];

	let currentSection = '';
	let titleFound = false;
	let taglineFound = false;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();
		if (!line) continue;

		// 1. Parse H1 for Title
		if (line.startsWith('# ') && !titleFound) {
			title = line.substring(2).trim();
			titleFound = true;
			continue;
		}

		// 2. Parse H2 sections
		if (line.startsWith('## ')) {
			const secName = line.substring(3).trim().toLowerCase();
			if (secName.includes('tech stack') || secName.includes('technologies') || secName.includes('built with')) {
				currentSection = 'stack';
			} else if (secName.includes('achievements') || secName.includes('highlights') || secName.includes('accomplishments')) {
				currentSection = 'highlights';
			} else {
				currentSection = '';
			}
			continue;
		}

		// Reset active section on any other heading level
		if (line.startsWith('#')) {
			currentSection = '';
			continue;
		}

		// 3. Parse Tagline (first non-heading paragraph below H1 but before any H2)
		if (titleFound && !taglineFound && !line.startsWith('#') && currentSection === '') {
			tagline = line;
			taglineFound = true;
			continue;
		}

		// 4. Parse list items in active sections
		if (line.startsWith('*') || line.startsWith('-')) {
			const itemText = line.substring(1).trim();
			if (currentSection === 'stack') {
				const colonIdx = itemText.indexOf(':');
				if (colonIdx !== -1) {
					const prefix = itemText.substring(0, colonIdx).trim();
					const prefixLower = prefix.toLowerCase();
					
					// Check if the prefix is a category header (e.g. "**Languages**") or a tech description (e.g. "**Svelte**")
					const isCategory = CATEGORY_KEYWORDS.some(keyword => prefixLower.includes(keyword));
					
					if (isCategory) {
						// Case A: Category listing (e.g., "* **Languages:** Python, JS")
						const skillsText = itemText.substring(colonIdx + 1).trim();
						const splitSkills = skillsText.split(',').map(s => {
							return s.replace(/[\*_`]/g, '').trim();
						}).filter(s => s !== '');
						
						for (const skill of splitSkills) {
							// Filter out descriptive sentences
							if (skill.split(/\s+/).length <= 3) {
								stack.push(skill);
							}
						}
					} else {
						// Case B: Tech description (e.g., "* **Jupyter Notebooks**: Selected as the primary...")
						const skillName = prefix.replace(/[\*_`]/g, '').trim();
						if (skillName && skillName.split(/\s+/).length <= 3) {
							stack.push(skillName);
						}
					}
				} else {
					// Case C: Standard list item (e.g. "* Svelte")
					const skillName = itemText.replace(/[\*_`]/g, '').trim();
					if (skillName && skillName.split(/\s+/).length <= 3) {
						stack.push(skillName);
					}
				}
			} else if (currentSection === 'highlights') {
				// Strip leading bold formatting if present (e.g. "* **Core:** desc" -> "Core: desc")
				const cleaned = itemText.replace(/^\*\*(.*?)\*\*:\s*/, '$1: ').trim();
				highlights.push(cleaned);
			}
		}
	}

	return {
		title,
		tagline,
		stack,
		highlights,
		pushedAt: fm.pushedAt || '',
		body
	};
}
