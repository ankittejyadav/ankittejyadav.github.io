<script>
  let { data } = $props();
  let project = $derived(data.project);
  let contentHtml = $derived(data.contentHtml);

  /** @type {Record<string, string>} */
  const languageColors = {
    TypeScript: '#3178c6',
    JavaScript: '#f1e05a',
    Svelte: '#ff3e00',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Python: '#3572A5',
    Go: '#00ADD8',
    Rust: '#dea584',
    C: '#555555',
    'C++': '#f34b7d',
    'C#': '#178600',
    Java: '#b07219',
    Shell: '#89e051',
    Ruby: '#701516',
    PHP: '#4F5D95'
  };
</script>

<svelte:head>
  <title>{project.name} — Ankit Yadav</title>
</svelte:head>

<article>
  <a href="/projects" style="color: var(--text-muted); font-size: 0.8rem;">&larr; back</a>

  <header style="margin-top: 2rem; margin-bottom: 2.5rem;">
    <h1 style="font-size: 1.5rem; font-weight: 700; line-height: 1.3; margin-top: 0.5rem; letter-spacing: -0.02em; color: var(--text);">
      {project.name}
    </h1>
    
    {#if project.tagline || project.description}
      <p style="color: var(--text-secondary); font-size: 0.95rem; margin-top: 0.5rem; line-height: 1.5;">
        {project.tagline || project.description}
      </p>
    {/if}

    <div style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; font-size: 0.8rem; color: var(--text-muted); margin-top: 1.25rem; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 0.75rem 0;">
      {#if project.language}
        <div style="display: flex; align-items: center; gap: 0.35rem;">
          <span style="width: 8px; height: 8px; border-radius: 50%; background: {languageColors[project.language] || '#888888'}; display: inline-block;"></span>
          <span>{project.language}</span>
        </div>
      {/if}
      {#if project.stars > 0}
        <div>★ {project.stars} {project.stars === 1 ? 'star' : 'stars'}</div>
      {/if}
      {#if project.forks > 0}
        <div>🔀 {project.forks} {project.forks === 1 ? 'fork' : 'forks'}</div>
      {/if}
      {#if project.isPrivate}
        <span style="background: var(--border); border-radius: 4px; padding: 0.1rem 0.3rem; font-size: 0.7rem; color: var(--text-muted);">🔒 private</span>
      {/if}
      {#if project.isFork}
        <span style="background: var(--border); border-radius: 4px; padding: 0.1rem 0.3rem; font-size: 0.7rem; color: var(--text-muted);">🔀 fork</span>
      {/if}
    </div>

    {#if project.url || project.demoUrl}
      <div style="display: flex; gap: 1.5rem; margin-top: 1rem; font-size: 0.85rem;">
        {#if project.url}
          <a href={project.url} target="_blank" rel="noopener noreferrer" style="font-weight: 500; color: var(--link);">View on GitHub →</a>
        {/if}
        {#if project.demoUrl}
          <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" style="font-weight: 500; color: var(--link);">Live Demo →</a>
        {/if}
      </div>
    {/if}
  </header>

  <!-- Portfolio Metadata Section -->
  {#if project.role || (project.stack && project.stack.length > 0) || (project.highlights && project.highlights.length > 0)}
    <div style="margin-bottom: 2.5rem; padding: 1.25rem; border: 1px solid var(--border); border-radius: 8px; font-size: 0.9rem; line-height: 1.5; color: var(--text); background: rgba(var(--text-muted-rgb, 128, 128, 128), 0.03);">
      {#if project.role || project.status}
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.75rem;">
          {#if project.role}
            <div style="color: var(--text-secondary); font-weight: 500;">
              Role: <span style="color: var(--text-muted); font-weight: 400;">{project.role}</span>
            </div>
          {/if}
          {#if project.status}
            <span style="font-size: 0.75rem; color: var(--text-secondary); border: 1px solid var(--border); border-radius: 4px; padding: 0.15rem 0.4rem; background: var(--bg); font-weight: 500; text-transform: capitalize;">
              {project.status}
            </span>
          {/if}
        </div>
      {/if}

      {#if project.stack && project.stack.length > 0}
        <div style="margin-bottom: 0.75rem;">
          <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.35rem; font-weight: 600;">Stack</div>
          <div style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
            {#each project.stack as tech}
              <span style="font-size: 0.75rem; color: var(--text-secondary); background: var(--border); border-radius: 6px; padding: 0.2rem 0.5rem;">
                {tech}
              </span>
            {/each}
          </div>
        </div>
      {/if}

      {#if project.highlights && project.highlights.length > 0}
        <div>
          <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.35rem; font-weight: 600;">Highlights</div>
          <ul style="margin: 0; padding-left: 1.25rem; color: var(--text-secondary); font-size: 0.85rem;">
            {#each project.highlights as highlight}
              <li style="margin-bottom: 0.25rem;">{highlight}</li>
            {/each}
          </ul>
        </div>
      {/if}
    </div>
  {/if}

  {#if contentHtml}
    <div class="prose max-w-none" style="font-size: 0.95rem;">
      {@html contentHtml}
    </div>
  {:else}
    <p style="color: var(--text-muted); font-size: 0.9rem; font-style: italic;">No project documentation available.</p>
  {/if}

  <div style="margin-top: 3rem; padding-top: 1rem; border-top: 1px solid var(--border);">
    <a href="/projects" style="color: var(--text-muted); font-size: 0.8rem;">&larr; all projects</a>
  </div>
</article>
