import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Local target path inside the repository
const targetLocalDir = path.resolve(__dirname, '../.agents/artifacts');
// Optional session override config file
const sessionConfigPath = path.resolve(__dirname, '../.agents/session.json');

/**
 * Dynamically discovers the active conversation directory for this repository.
 * 
 * @returns {string | null} Path to the source artifact directory, or null if not found
 */
function discoverSourceDir() {
	try {
		// 1. Check for manual override in session.json first
		if (fs.existsSync(sessionConfigPath)) {
			const sessionData = JSON.parse(fs.readFileSync(sessionConfigPath, 'utf8'));
			if (sessionData.artifactDir && fs.existsSync(sessionData.artifactDir)) {
				console.log(`Found manual session override in session.json`);
				return sessionData.artifactDir;
			}
		}

		// 2. Resolve default global brain directory
		const homeDir = process.env.USERPROFILE || process.env.HOME || process.env.HOMEPATH;
		if (!homeDir) {
			console.warn('Warning: Could not determine home directory from environment variables.');
			return null;
		}

		const brainParentDir = path.join(homeDir, '.gemini/antigravity-cli/brain');
		if (!fs.existsSync(brainParentDir)) {
			console.warn(`Warning: Global brain directory does not exist at: ${brainParentDir}`);
			return null;
		}

		// 3. Scan conversation directories and sort by modification time (most recent first)
		const conversationIds = fs.readdirSync(brainParentDir).filter((item) => {
			const dirPath = path.join(brainParentDir, item);
			return fs.statSync(dirPath).isDirectory();
		});

		const candidates = [];
		for (const id of conversationIds) {
			const dirPath = path.join(brainParentDir, id);
			const transcriptPath = path.join(dirPath, '.system_generated/logs/transcript.jsonl');
			if (fs.existsSync(transcriptPath)) {
				const stat = fs.statSync(transcriptPath);
				candidates.push({
					path: dirPath,
					transcriptPath,
					mtime: stat.mtimeMs
				});
			}
		}

		// Sort by mtime descending (most recently active conversation first)
		candidates.sort((a, b) => b.mtime - a.mtime);

		// 4. Resolve current repository absolute path
		const currentRepoPath = path.resolve(__dirname, '..');
		const currentRepoPathLower = currentRepoPath.toLowerCase();

		console.log(`Searching active chat sessions for workspace: "${currentRepoPath}"`);

		// 5. Look for the first (most recent) session transcript containing this repo's path
		for (const candidate of candidates) {
			const transcriptContent = fs.readFileSync(candidate.transcriptPath, 'utf8').toLowerCase();
			
			// Match workspace path inside transcript (handles windows backslash escaping as well)
			const matchesPath = transcriptContent.includes(currentRepoPathLower) || 
				transcriptContent.includes(currentRepoPathLower.replace(/\\/g, '\\\\'));

			if (matchesPath) {
				console.log(`Discovered active session matches current workspace: "${candidate.path}"`);
				return candidate.path;
			}
		}

		console.warn('Warning: No recent conversation matching this workspace path was discovered.');
		return null;
	} catch (err) {
		console.error('Error during dynamic session discovery:', err.message || err);
		return null;
	}
}

function main() {
	try {
		console.log('Starting dynamic conversation artifacts synchronization...');

		// 1. Discover the active artifact source directory
		const sourceArtifactDir = discoverSourceDir();
		if (!sourceArtifactDir) {
			console.error('Error: Could not dynamically resolve or discover artifact source directory.');
			console.error('Ensure that you have run a chat session in this repository and created artifacts.');
			process.exit(1);
		}

		console.log(`Source Artifact Folder: ${sourceArtifactDir}`);
		console.log(`Target Repository Folder: ${targetLocalDir}`);

		// 2. Ensure the local target directory exists
		if (!fs.existsSync(targetLocalDir)) {
			fs.mkdirSync(targetLocalDir, { recursive: true });
		}

		// 3. Scan global artifact directory and copy files
		const items = fs.readdirSync(sourceArtifactDir);
		let copiedCount = 0;

		for (const item of items) {
			const sourcePath = path.join(sourceArtifactDir, item);
			const stat = fs.statSync(sourcePath);

			// Copy files (skip subdirectories like .system_generated and system metadata files)
			if (stat.isFile() && !item.startsWith('.') && !item.endsWith('.metadata.json')) {
				const destPath = path.join(targetLocalDir, item);
				fs.copyFileSync(sourcePath, destPath);
				console.log(`Copied: ${item}`);
				copiedCount++;
			}
		}

		console.log(`Artifact synchronization complete. Copied ${copiedCount} files.`);
		process.exit(0);
	} catch (error) {
		console.error('Fatal error during artifact synchronization:', error.message || error);
		process.exit(1);
	}
}

main();
