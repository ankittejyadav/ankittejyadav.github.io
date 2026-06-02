# Project Walkthrough: SvelteKit Portfolio & Blog

This document outlines the architecture, data schemas, synchronization scripts, and rendering pipelines of this SvelteKit project.

---

## 🏗 System Architecture

The project is structured as a static portfolio website combined with an automated synchronization pipeline that pulls repository details, languages, and markdown documentation directly from GitHub.

```mermaid
graph TD
    GH[GitHub API] -->|sync-projects.mjs| JSON[src/data/projects.json]
    Config[src/data/portfolio-config.json] -->|sync-projects.mjs| JSON
    JSON -->|load| ProjectsPage[src/routes/projects/+page.svelte]
    JSON -->|load| ProjectSlug[src/routes/projects/[slug]/+page.svelte]
    Posts[src/content/posts/*.md] -->|import.meta.glob| BlogPage[src/routes/blog/+page.svelte]
    Posts -->|import.meta.glob| BlogSlug[src/routes/blog/[slug]/+page.svelte]
    JSON -->|generate-profile-readme.mjs| OutputReadme[scripts/output/profile-readme.md]
    Posts -->|generate-profile-readme.mjs| OutputReadme
```

---

## 📁 File Structure

```
├── .github/                  # CI/CD Workflows for automated sync and deployment
├── scripts/                  # Synchronization and README generation scripts
│   ├── lib/                  # Helper utilities for GitHub fetch and config merge
│   │   ├── github-client.mjs # Wrapper for GitHub API (paginated repos, files, languages)
│   │   └── merge-projects.mjs# Merges API data, parses YAML frontmatter, applies overrides
│   ├── sync-projects.mjs     # The main sync entry point (requires GH_PAT env var)
│   └── generate-profile-readme.mjs # Generates a customized GitHub profile README
├── src/
│   ├── content/              # Blog posts authored in Markdown
│   │   └── posts/            # Dynamic markdown files parsed via MDSvex
│   ├── data/                 # Data files driving the application
│   │   ├── portfolio-config.json # User settings and featured project overrides
│   │   └── projects.json     # Auto-generated project list from sync pipeline
│   ├── lib/                  # Reusable utilities, types, and assets
│   │   └── utils/            # Markdown parser using Marked & configuration loaders
│   └── routes/               # SvelteKit application routes (Svelte 5 Runes)
│       ├── blog/             # Blog index and dynamic blog post reader
│       └── projects/         # Projects showcase and detailed project views
├── package.json              # Scripts and devDependencies
├── svelte.config.js          # SvelteKit configuration with adapter-static for SSG
└── vite.config.ts            # Vite configuration with Svelte compilation settings
```

---

## 🔄 Project Synchronization Pipeline

The project pulls metadata from GitHub via the `sync-projects.mjs` script:

1. **Authentication:** Uses the `GH_PAT` (GitHub Personal Access Token) environment variable.
2. **Configuration Reading:** Loads [portfolio-config.json](file:///C:/Users/ankit.yadav2/Documents/ankittejyadav.github.io/src/data/portfolio-config.json) to apply global show/hide settings and highlight specific repositories.
3. **Repository Fetching:** Queries paginated repositories from the GitHub API.
4. **Content Extraction:** 
   - Downloads the `portfolio.md` file from each repository if present.
   - Falls back to `README.md` if `portfolio.md` is not present.
   - Parses optional YAML frontmatter inside the markdown (e.g., custom tags, role, status, highlights).
   - Fetches byte-level language usage statistics.
5. **Data Merging:** Combines the GitHub data and local config to generate [projects.json](file:///C:/Users/ankit.yadav2/Documents/ankittejyadav.github.io/src/data/projects.json).

---

## 🛠 Script Details

### 1. `npm run dev`
Launches the SvelteKit development server using Vite.

### 2. `npm run build`
Runs the SvelteKit static site generator (SSG). The static output is compiled into the `build` directory.

### 3. `npm run test`
Runs the Vitest test suite. Unit tests cover:
- GitHub client request pagination and error cases
- Frontmatter parsing logic
- Portfolio configurations and metadata merging
- Marked markdown parsing utility

---

## 📊 Configuration Schema (`portfolio-config.json`)

Controls showcase display settings.

```json
{
  "settings": {
    "showForks": false,
    "showArchived": false,
    "excludeRepos": ["ankittejyadav.github.io"]
  },
  "projects": {
    "selfhost": {
      "featured": true,
      "order": 1
    }
  }
}
```

---

## 📝 Blog System

Blog posts are stored in [src/content/posts](file:///C:/Users/ankit.yadav2/Documents/ankittejyadav.github.io/src/content/posts).
- Written in standard Markdown format.
- Configured with frontmatter fields: `title`, `date`, `excerpt`, and `tags`.
- Loaded dynamically using Vite's `import.meta.glob` within SvelteKit routes.
- Preprocessed using `mdsvex` to support embedded Svelte components within markdown posts.
