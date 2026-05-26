#!/usr/bin/env node
// scripts/bulk-portfolio-generator.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Bypass SSL certificate validation for corporate proxies/Zscaler
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Setup console colors for professional logging
function log(msg) {
    console.log(`\x1b[36m[PORTFOLIO-GEN]\x1b[0m ${msg}`);
}
function logSuccess(msg) {
    console.log(`\x1b[32m[PORTFOLIO-GEN] ✓ ${msg}\x1b[0m`);
}
function logWarn(msg) {
    console.log(`\x1b[33m[PORTFOLIO-GEN] ⚠ ${msg}\x1b[0m`);
}
function logError(msg) {
    console.error(`\x1b[31m[PORTFOLIO-GEN] ERROR: ${msg}\x1b[0m`);
}

// 1. Load Gemini API Key
function loadGeminiApiKey() {
    // Try process.env first
    if (process.env.GEMINI_API_KEY) {
        return process.env.GEMINI_API_KEY;
    }
    // Fallback to sibling selfhost/.env file
    try {
        const envPath = path.resolve(__dirname, '../../selfhost/.env');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            const match = envContent.match(/^GEMINI_API_KEY=["']?([^"'\r\n]+)["']?/m);
            if (match) return match[1];
        }
    } catch (e) {
        logWarn(`Could not read selfhost/.env: ${e.message}`);
    }
    return null;
}

// 2. Shell Command Helper utilizing the active gh CLI session
function runGhApi(endpoint, method = 'GET', bodyObj = null) {
    try {
        let cmd = `gh api "${endpoint}" -X ${method}`;
        if (bodyObj) {
            // Write payload to a temp file to avoid command line length limits or character escaping errors
            const tempFile = path.resolve(__dirname, `temp_payload_${Date.now()}.json`);
            fs.writeFileSync(tempFile, JSON.stringify(bodyObj), 'utf8');
            cmd += ` --input "${tempFile}"`;
            const result = execSync(cmd, { encoding: 'utf8' });
            try { fs.unlinkSync(tempFile); } catch (_) {}
            return JSON.parse(result.trim() || '{}');
        } else {
            const result = execSync(cmd, { encoding: 'utf8' });
            return JSON.parse(result.trim() || '{}');
        }
    } catch (e) {
        // Return null or throw structured error
        const errOutput = e.stderr ? e.stderr.toString() : e.message;
        throw new Error(errOutput);
    }
}

// 3. Call Gemini to write the recruiter portfolio
async function generatePortfolioContent(apiKey, repoName, readmeContent, languagesStr, description) {
    const systemPrompt = `You are a Principal Software Architect and elite Technical Writer.
Your goal is to write a highly professional, recruiter-centric, engineering-focused \`portfolio.md\` file for a GitHub repository.
This document is designed for recruiters, hiring managers, and senior engineers—NOT for standard users. It should demonstrate technical excellence, architectural maturity, and rigorous engineering practices.

CRITICAL INSTRUCTIONS:
- You MUST follow the standard markdown template outlined below exactly.
- DO NOT include any installation commands, user instructions, or "how to run/install" sections (no "npm install" or "git clone").
- Frame everything at a senior level. If a project is a basic utility, document vault, or learning project, frame its architectural choices, transport layers, security boundaries, and data integrity practices professionally.
- Use valid markdown formatting and a premium, clean design. Ensure all Unicode emojis (🚀, 🌟, 💻, ⚙️, 📈, 🧠) render in clean UTF-8.

Here is the exact Template format you must follow:
\`\`\`markdown
---
tagline: "A concise, active-verb tagline explaining the system's core capability (e.g., 'An AI-powered document intelligence pipeline...')"
role: "Lead Full-Stack Engineer / Solo Developer (or similar)"
status: "active / completed / production"
stack:
  - Technology 1
  - Technology 2
highlights:
  - "Architected a [Key Feature] that achieved [Performance Metric or Capability]"
  - "Designed and implemented [System component] utilizing [Design Pattern / Technology]"
description: "A professional, high-level overview of the engineering achievements in this codebase."
---

## 🌟 Architectural Vision & System Design

Describe the system architecture at a high level. Explain *why* you chose this design, how data flows through the application, and how different services interact. Highlight engineering patterns used (e.g., Modular Monolith, Microservices, Event-Driven, Serverless).

### Core Data & System Flow
*   **Ingestion / Input**: How does data enter the system?
*   **Processing / Logic**: How is business logic executed (e.g., background workers, serverless endpoints, AI pipelines)?
*   **Persistence & Caching**: Database choice, schema design, caching strategies, and performance optimizations.

---

## 💻 Tech Stack & Engineering Decisions

Provide a brief rationale for your technology choices. Focus on trade-offs (e.g., developer velocity, performance, type safety).

*   **Frontend**: (e.g., React with Next.js for SSR, Tailwind CSS for scalable layouts)
*   **Backend & APIs**: (e.g., Express.js on Node for rapid API scaffolding, FastAPI for automated documentation)
*   **Data & Middleware**: (e.g., PostgreSQL for relational integrity, Redis for query caching)

---

## ⚙️ Engineering Excellence & Best Practices

Highlight how this repository demonstrates production-grade engineering:

*   **Security & Privacy**: (e.g., Row-Level Security, token encryption, secure session boundaries, GDPR compliance)
*   **Performance & Scaling**: (e.g., DB index optimization, parallelized queries, lazy loading, compression)
*   **Quality & Reliability**: (e.g., Cascading API fallbacks, strict type-safety, automated testing suites)

---

## 📈 Technical Challenges & Resolution

### Challenge: [Identify a technical challenge relevant to the project type, or create a realistic engineering challenge solved in this codebase based on its tech stack]
*   **The Problem**: Why was this hard? What were the constraints?
*   **The Solution**: How did you engineer the fix? What patterns did you apply?
*   **The Outcome**: What was the resulting metric, speedup, or capability?

---

## 🧠 Key Engineering Takeaways

Summarize the technical growth and professional insights gained from architecting this project. Focus on senior-level engineering patterns, API lifecycle management, or performance diagnostics.
\`\`\``;

    const userPrompt = `Generate a recruiter-centric portfolio.md file matching the template for the following repository:

Repository Name: ${repoName}
Description: ${description || 'No description provided'}
Languages / Tech Stack: ${languagesStr}

Repository README / Context:
${readmeContent || 'No README details provided.'}

Remember: Focus on architecture, trade-offs, security, and senior-level technical case studies. DO NOT write installation steps or simple setup commands. Ensure all emojis like ⚙️ are valid UTF-8. Let's begin:`;

    const requestBody = {
        contents: [{
            parts: [{
                text: `${systemPrompt}\n\n${userPrompt}`
            }]
        }],
        generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2000
        }
    };

    const model = "gemini-2.5-flash";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    let retries = 5;
    let response;
    
    while (retries >= 0) {
        response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (response.status === 429) {
            logWarn(`Gemini API Rate Limit hit (429). Waiting 35 seconds to cool down... (${retries} retries left)`);
            await new Promise(resolve => setTimeout(resolve, 35000));
            retries--;
            continue;
        }
        break;
    }

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
        throw new Error("No content generated by Gemini");
    }

    // Clean up markdown block fences if Gemini wrapped it in ```markdown
    text = text.replace(/^```markdown\n/, '');
    text = text.replace(/\n```$/, '');
    return text.trim();
}

// 4. Main Script Execution
async function main() {
    log("Starting Remote Bulk Portfolio Generator...");

    // Check args
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const forceOverwrite = args.includes('--force');
    const targetRepoName = args.find(arg => !arg.startsWith('--'));

    if (dryRun) {
        logWarn("DRY RUN MODE ENABLED. Generates case studies locally without pushing to GitHub.");
    }

    // Load credentials
    const geminiApiKey = loadGeminiApiKey();
    if (!geminiApiKey) {
        logError("GEMINI_API_KEY could not be found. Please check your selfhost/.env file.");
        process.exit(1);
    }
    logSuccess("Gemini API Key successfully verified.");

    // Fetch repository list owned by the user
    log("Fetching user repositories via GitHub API...");
    let repos = [];
    try {
        // Fetch all repositories for authenticated user
        repos = runGhApi('user/repos?per_page=100&type=owner');
        logSuccess(`Fetched ${repos.length} repositories owned by your GitHub account.`);
    } catch (e) {
        logError(`Failed to fetch repositories using 'gh' CLI session: ${e.message}`);
        logWarn("Please ensure you are authenticated in the shell using: gh auth login");
        process.exit(1);
    }

    // Filters:
    // - Skip forks
    // - Skip archived
    // - Filter by specific target repo if passed
    let filteredRepos = repos.filter(repo => {
        if (repo.fork) return false;
        if (repo.archived) return false;
        if (repo.name === 'ankittejyadav.github.io') return false; // Skip the main website repo
        if (targetRepoName && repo.name.toLowerCase() !== targetRepoName.toLowerCase()) return false;
        return true;
    });

    log(`Applying boundaries: processing ${filteredRepos.length} repository targets.`);

    let processedCount = 0;
    let skippedCount = 0;

    for (const repo of filteredRepos) {
        const name = repo.name;
        log(`----------------------------------------`);
        log(`Processing repository: "${name}"`);

        // Check if portfolio.md already exists
        let portfolioSha = null;
        let hasPortfolio = false;
        try {
            const contents = runGhApi(`repos/ankittejyadav/${name}/contents/portfolio.md`);
            if (contents && contents.sha) {
                portfolioSha = contents.sha;
                hasPortfolio = true;
            }
        } catch (_) {
            // 404 error means no portfolio.md exists, which is the default expected case
        }

        const protectedRepos = new Set(['selfhost', 'calendar_sync', 'files']);
        if (protectedRepos.has(name)) {
            logWarn(`Repository "${name}" is protected. Skipping to preserve its high-fidelity custom case study.`);
            skippedCount++;
            continue;
        }

        if (hasPortfolio && !forceOverwrite) {
            logWarn(`portfolio.md already exists in remote repository "${name}". Skipping (use --force to overwrite).`);
            skippedCount++;
            continue;
        }

        // Fetch README for code analysis context
        let readmeContent = '';
        try {
            const readmeRes = runGhApi(`repos/ankittejyadav/${name}/readme`);
            if (readmeRes && readmeRes.content) {
                readmeContent = Buffer.from(readmeRes.content, 'base64').toString('utf-8');
                log("✓ Extracted remote README.md content for analysis context.");
            }
        } catch (_) {
            logWarn(`No README.md found in remote repository "${name}". Continuing with description only.`);
        }

        // Fetch languages
        let languagesStr = repo.language || 'Unknown';
        try {
            const langRes = runGhApi(`repos/ankittejyadav/${name}/languages`);
            if (langRes) {
                const totalBytes = Object.values(langRes).reduce((a, b) => a + b, 0);
                languagesStr = Object.entries(langRes)
                    .map(([lang, bytes]) => `${lang} (${Math.round((bytes / totalBytes) * 100)}%)`)
                    .join(', ');
                log(`✓ Extracted technology stats: ${languagesStr}`);
            }
        } catch (_) {
            // Fallback to primary language
        }

        // Generate portfolio using Gemini
        log("Invoking Gemini to write professional, recruiter-centric portfolio entry...");
        let portfolioContent = '';
        try {
            portfolioContent = await generatePortfolioContent(
                geminiApiKey,
                name,
                readmeContent,
                languagesStr,
                repo.description
            );
            logSuccess("Case study generation completed successfully.");
        } catch (e) {
            logError(`Failed to generate portfolio case study for "${name}": ${e.message}`);
            continue;
        }

        if (dryRun) {
            // Write to local scratch directory for inspection
            const scratchDir = path.resolve(__dirname, '../scratch/bulk_preview');
            if (!fs.existsSync(scratchDir)) {
                fs.mkdirSync(scratchDir, { recursive: true });
            }
            const previewPath = path.join(scratchDir, `${name}_portfolio.md`);
            fs.writeFileSync(previewPath, portfolioContent, 'utf8');
            logSuccess(`Dry run: Wrote generated preview locally to: ${previewPath}`);
        } else {
            // Commit and push directly to GitHub remote repository!
            log(`Pushing generated portfolio.md directly to remote branch...`);
            try {
                const base64Content = Buffer.from(portfolioContent, 'utf8').toString('base64');
                const payload = {
                    message: "docs: add recruiter-centric portfolio.md case study",
                    content: base64Content
                };
                if (portfolioSha) {
                    payload.sha = portfolioSha; // Required for overwriting existing files
                }

                runGhApi(`repos/ankittejyadav/${name}/contents/portfolio.md`, 'PUT', payload);
                logSuccess(`Successfully committed and pushed portfolio.md remotely to "ankittejyadav/${name}"!`);
            } catch (e) {
                logError(`Failed to push remotely to "${name}": ${e.message}`);
                continue;
            }
        }

        processedCount++;
        // Cool-down period between batches to respect API limits
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    log(`========================================`);
    log(`Finished bulk operations!`);
    log(`Processed: ${processedCount} repositories.`);
    log(`Skipped: ${skippedCount} repositories.`);
    log(`========================================`);
}

main().catch(err => {
    logError(err.message);
    process.exit(1);
});
