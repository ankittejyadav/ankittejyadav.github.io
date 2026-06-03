# Project Walkthrough: SvelteKit Portfolio & Blog

This document outlines the architecture, data schemas, synchronization scripts, and rendering pipelines of this SvelteKit project.

---

## 🏗 System Architecture

The project is structured as a static portfolio website combined with an automated synchronization pipeline that pulls repository details and markdown documentation directly from GitHub.

```mermaid
graph TD
    GH[GitHub API] -->|sync-projects.mjs| Files[src/content/projects/*.md]
    Files -->|import.meta.glob| ProjectsPage[src/routes/projects/+page.svelte]
    Files -->|import.meta.glob| ProjectSlug[src/routes/projects/[slug]/+page.svelte]
    Posts[src/content/posts/*.md] -->|import.meta.glob| BlogPage[src/routes/blog/+page.svelte]
    Posts -->|import.meta.glob| BlogSlug[src/routes/blog/[slug]/+page.svelte]
    Files -->|generate-profile-readme.mjs| OutputReadme[scripts/output/profile-readme.md]
    Posts -->|generate-profile-readme.mjs| OutputReadme
```

---

## 📁 File Structure

```
├── .github/                  # CI/CD Workflows for automated sync and deployment
├── scripts/                  # Synchronization and README generation scripts
│   ├── lib/                  # Helper utilities for GitHub fetch
│   │   └── github-client.mjs # Wrapper for GitHub API (paginated repos and files)
│   ├── sync-projects.mjs     # The main sync entry point (requires GH_PAT env var)
│   └── generate-profile-readme.mjs # Generates a customized GitHub profile README
├── src/
│   ├── content/              # Markdown contents directory
│   │   ├── posts/            # Dynamic markdown files parsed via MDSvex for the Blog
│   │   └── projects/         # Dynamic markdown files parsed via MDSvex for Projects
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
4. **Data Simplification & Writing (Option B):**
   - The sync script writes individual markdown files directly to **`src/content/projects/{name}.md`**.
   - Frontmatter is prepended to the top of each file containing the `pushedAt` timestamp:
     ```yaml
     ---
     pushedAt: "2026-06-02T22:33:16.000Z"
     ---
     ```
5. **Clean-up:** Any local markdown files inside `src/content/projects/` that no longer exist as repositories containing `portfolio.md` on GitHub are deleted automatically.
6. **Dynamic Link Generation:**
   - The GitHub link is dynamically resolved inside the Svelte view layer using:
     `https://github.com/ankittejyadav/{name}`
7. **Rendering & Sorting:**
   - **`src/routes/projects/+page.js`** imports the markdown files at compile-time using Vite `import.meta.glob` and sorts them in descending order based on the `pushedAt` frontmatter metadata.
   - MDSvex parses each `.md` file into a Svelte component for rendering.
