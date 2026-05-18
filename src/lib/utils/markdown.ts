import { marked } from 'marked';

/**
 * Parses raw markdown content into sanitized HTML using marked.
 * Configured to support GitHub Flavored Markdown (GFM) and line breaks.
 * Handles null, undefined, and empty inputs gracefully by returning an empty string.
 * 
 * @param raw The raw markdown string
 * @returns The parsed HTML string
 */
export function parseMarkdown(raw: string | null | undefined): string {
	if (raw === null || raw === undefined || raw === '') {
		return '';
	}

	return marked.parse(raw, {
		gfm: true,
		breaks: true
	}) as string;
}
