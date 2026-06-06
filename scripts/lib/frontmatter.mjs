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
