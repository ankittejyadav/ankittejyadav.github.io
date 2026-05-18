import { describe, it, expect } from 'vitest';
import { parseMarkdown } from './markdown';

describe('parseMarkdown', () => {
	it('headings render correctly', () => {
		const md = '# Heading 1\n## Heading 2';
		const html = parseMarkdown(md);
		expect(html).toMatch(/<h1[^>]*>Heading 1<\/h1>/);
		expect(html).toMatch(/<h2[^>]*>Heading 2<\/h2>/);
	});

	it('code blocks render with <pre><code>', () => {
		const md = '```typescript\nconst x = 5;\n```';
		const html = parseMarkdown(md);
		expect(html).toContain('<pre>');
		expect(html).toContain('<code');
		expect(html).toContain('const x = 5;');
	});

	it('links render as <a> tags', () => {
		const md = '[Google](https://google.com)';
		const html = parseMarkdown(md);
		expect(html).toContain('<a href="https://google.com">Google</a>');
	});

	it('empty string returns empty string', () => {
		expect(parseMarkdown('')).toBe('');
	});

	it('null/undefined returns empty string', () => {
		expect(parseMarkdown(null)).toBe('');
		expect(parseMarkdown(undefined)).toBe('');
	});

	it('GFM tables render correctly', () => {
		const md = `| Col 1 | Col 2 |
| --- | --- |
| Val 1 | Val 2 |`;
		const html = parseMarkdown(md);
		expect(html).toContain('<table>');
		expect(html).toContain('<thead>');
		expect(html).toContain('<tbody>');
		expect(html).toContain('Col 1');
		expect(html).toContain('Val 1');
	});
});
