import type { PortfolioConfig, ProjectOverride } from '$lib/types/project';

/**
 * Parses a JSON string, validates its shape to conform to PortfolioConfig,
 * applies default values for missing optional fields, and returns a fully typed config.
 * Throws descriptive errors for invalid input or type mismatches.
 *
 * @param jsonString The raw JSON string of the configuration
 * @returns A validated, complete PortfolioConfig object
 */
export function loadConfig(jsonString: string): PortfolioConfig {
	if (typeof jsonString !== 'string') {
		throw new Error('Input to loadConfig must be a string');
	}

	let parsed: any;
	try {
		parsed = JSON.parse(jsonString);
	} catch (err: any) {
		throw new Error(`Invalid JSON: ${err.message}`);
	}

	if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
		throw new Error('Configuration must be a JSON object');
	}

	// 1. Process & Validate Settings
	let showForks = false;
	let showArchived = false;
	let excludeRepos: string[] = [];

	if ('settings' in parsed) {
		const settings = parsed.settings;
		if (settings === null || typeof settings !== 'object' || Array.isArray(settings)) {
			throw new Error('settings must be a JSON object');
		}

		if ('showForks' in settings) {
			if (typeof settings.showForks !== 'boolean') {
				throw new Error('settings.showForks must be a boolean');
			}
			showForks = settings.showForks;
		}

		if ('showArchived' in settings) {
			if (typeof settings.showArchived !== 'boolean') {
				throw new Error('settings.showArchived must be a boolean');
			}
			showArchived = settings.showArchived;
		}

		if ('excludeRepos' in settings) {
			if (!Array.isArray(settings.excludeRepos)) {
				throw new Error('settings.excludeRepos must be an array of strings');
			}
			for (let i = 0; i < settings.excludeRepos.length; i++) {
				if (typeof settings.excludeRepos[i] !== 'string') {
					throw new Error(`settings.excludeRepos[${i}] must be a string`);
				}
			}
			excludeRepos = settings.excludeRepos;
		}
	}

	// 2. Process & Validate Projects
	const validatedProjects: Record<string, ProjectOverride> = {};

	if ('projects' in parsed) {
		const projects = parsed.projects;
		if (projects === null || typeof projects !== 'object' || Array.isArray(projects)) {
			throw new Error('projects must be a JSON object mapping repository names to overrides');
		}

		for (const key of Object.keys(projects)) {
			const override = projects[key];
			if (override === null || typeof override !== 'object' || Array.isArray(override)) {
				throw new Error(`Override configuration for project "${key}" must be a JSON object`);
			}

			const validatedOverride: ProjectOverride = {};

			if ('featured' in override) {
				if (typeof override.featured !== 'boolean') {
					throw new Error(`Project override "featured" for "${key}" must be a boolean`);
				}
				validatedOverride.featured = override.featured;
			}

			if ('order' in override) {
				if (typeof override.order !== 'number') {
					throw new Error(`Project override "order" for "${key}" must be a number`);
				}
				validatedOverride.order = override.order;
			}

			if ('tagline' in override) {
				if (typeof override.tagline !== 'string') {
					throw new Error(`Project override "tagline" for "${key}" must be a string`);
				}
				validatedOverride.tagline = override.tagline;
			}

			if ('description' in override) {
				if (typeof override.description !== 'string') {
					throw new Error(`Project override "description" for "${key}" must be a string`);
				}
				validatedOverride.description = override.description;
			}

			if ('demoUrl' in override) {
				if (typeof override.demoUrl !== 'string') {
					throw new Error(`Project override "demoUrl" for "${key}" must be a string`);
				}
				validatedOverride.demoUrl = override.demoUrl;
			}

			if ('hide' in override) {
				if (typeof override.hide !== 'boolean') {
					throw new Error(`Project override "hide" for "${key}" must be a boolean`);
				}
				validatedOverride.hide = override.hide;
			}

			if ('showFork' in override) {
				if (typeof override.showFork !== 'boolean') {
					throw new Error(`Project override "showFork" for "${key}" must be a boolean`);
				}
				validatedOverride.showFork = override.showFork;
			}

			validatedProjects[key] = validatedOverride;
		}
	}

	return {
		settings: {
			showForks,
			showArchived,
			excludeRepos
		},
		projects: validatedProjects
	};
}
