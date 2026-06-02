# Project Walkthrough: SvelteKit Portfolio & Blog

This document outlines the architecture, data schemas, synchronization scripts, and rendering pipelines of this SvelteKit project.

---

## 🏗 System Architecture

The project is structured as a static portfolio website combined with an automated synchronization pipeline that pulls repository details and markdown documentation directly from GitHub.

```mermaid
graph TD
    GH[GitHub API] -->|sync-projects.mjs| JSON[src/data/projects.json]
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
│   │   ├── github-client.mjs # Wrapper for GitHub API (paginated repos and files)
│   │   └── merge-projects.mjs# Merges API data
│   ├── sync-projects.mjs     # The main sync entry point (requires GH_PAT env var)
│   └── generate-profile-readme.mjs # Generates a customized GitHub profile README
├── src/
│   ├── content/              # Blog posts authored in Markdown
│   │   └── posts/            # Dynamic markdown files parsed via MDSvex
│   ├── data/                 # Data files driving the application
│   │   └── projects.json     # Auto-generated project list from sync pipeline
│   ├── lib/                  # Reusable utilities, types, and assets
│   │   └── utils/            # Markdown parser using Marked
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
2. **Repository Fetching:** Queries all repositories from the GitHub API.
3. **Opt-in Filtering:** 
   - Attempts to download `portfolio.md` from the root of each repository.
   - **Important:** Repositories without a `portfolio.md` file are automatically skipped. This eliminates the need for hardcoded project lists or exclusion files.
4. **Data Simplification:**
   - Strips frontmatter headers so that only the raw markdown body is preserved.
   - Restricts the cached project data inside `src/data/projects.json` strictly to:
     * `name` (string) - Repository name (used for display and routing).
     * `url` (string) - GitHub URL.
     * `portfolioContent` (string) - Raw Markdown body content.
5. **Sorting:** Projects are sorted in descending order based on the `pushed_at` timestamp from the GitHub API (most recently pushed repository first).
