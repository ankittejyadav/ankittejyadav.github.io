import { describe, it, expect } from 'vitest';
import { loadConfig } from './config-loader';

describe('loadConfig', () => {
	it('parses a valid configuration correctly', () => {
		const validJson = JSON.stringify({
			settings: {
				showForks: true,
				showArchived: false,
				excludeRepos: ['repo-1', 'repo-2']
			},
			projects: {
				'my-repo': {
					featured: true,
					order: 1,
					tagline: 'A cool project',
					description: 'Long description override',
					demoUrl: 'https://demo.example.com',
					hide: false,
					showFork: true
				}
			}
		});

		const result = loadConfig(validJson);
		expect(result).toEqual({
			settings: {
				showForks: true,
				showArchived: false,
				excludeRepos: ['repo-1', 'repo-2']
			},
			projects: {
				'my-repo': {
					featured: true,
					order: 1,
					tagline: 'A cool project',
					description: 'Long description override',
					demoUrl: 'https://demo.example.com',
					hide: false,
					showFork: true
				}
			}
		});
	});

	it('applies default values for missing optional settings and project fields', () => {
		const minimalJson = JSON.stringify({
			projects: {
				'my-repo': {
					tagline: 'Only tagline'
				}
			}
		});

		const result = loadConfig(minimalJson);
		expect(result).toEqual({
			settings: {
				showForks: false,
				showArchived: false,
				excludeRepos: []
			},
			projects: {
				'my-repo': {
					tagline: 'Only tagline'
				}
			}
		});
	});

	it('throws a descriptive error for malformed JSON', () => {
		const malformedJson = '{ settings: { "showForks": true }'; // Missing quotes, missing brackets

		expect(() => loadConfig(malformedJson)).toThrowError(/Invalid JSON/);
	});

	it('allows an empty projects object and empty settings', () => {
		const emptyJson = JSON.stringify({});

		const result = loadConfig(emptyJson);
		expect(result).toEqual({
			settings: {
				showForks: false,
				showArchived: false,
				excludeRepos: []
			},
			projects: {}
		});
	});

	it('applies defaults to settings when fields are partially missing', () => {
		const partialSettingsJson = JSON.stringify({
			settings: {
				showForks: true
				// showArchived and excludeRepos are missing
			}
		});

		const result = loadConfig(partialSettingsJson);
		expect(result).toEqual({
			settings: {
				showForks: true,
				showArchived: false,
				excludeRepos: []
			},
			projects: {}
		});
	});

	it('throws a descriptive error when configuration is not a JSON object', () => {
		expect(() => loadConfig('null')).toThrowError('Configuration must be a JSON object');
		expect(() => loadConfig('[]')).toThrowError('Configuration must be a JSON object');
		expect(() => loadConfig('"just-a-string"')).toThrowError('Configuration must be a JSON object');
	});

	it('throws an error for incorrect types in settings', () => {
		const invalidForks = JSON.stringify({
			settings: { showForks: 'yes' }
		});
		expect(() => loadConfig(invalidForks)).toThrowError('settings.showForks must be a boolean');

		const invalidArchived = JSON.stringify({
			settings: { showArchived: 42 }
		});
		expect(() => loadConfig(invalidArchived)).toThrowError('settings.showArchived must be a boolean');

		const invalidExclude = JSON.stringify({
			settings: { excludeRepos: 'not-an-array' }
		});
		expect(() => loadConfig(invalidExclude)).toThrowError('settings.excludeRepos must be an array of strings');

		const invalidExcludeItems = JSON.stringify({
			settings: { excludeRepos: ['repo-1', 123] }
		});
		expect(() => loadConfig(invalidExcludeItems)).toThrowError('settings.excludeRepos[1] must be a string');
	});

	it('throws an error for incorrect types in projects overrides', () => {
		const invalidFeatured = JSON.stringify({
			projects: {
				'my-repo': { featured: 'true' }
			}
		});
		expect(() => loadConfig(invalidFeatured)).toThrowError('Project override "featured" for "my-repo" must be a boolean');

		const invalidOrder = JSON.stringify({
			projects: {
				'my-repo': { order: 'first' }
			}
		});
		expect(() => loadConfig(invalidOrder)).toThrowError('Project override "order" for "my-repo" must be a number');

		const invalidTagline = JSON.stringify({
			projects: {
				'my-repo': { tagline: 123 }
			}
		});
		expect(() => loadConfig(invalidTagline)).toThrowError('Project override "tagline" for "my-repo" must be a string');
	});
});
