<script>
  let { data } = $props();
  let currentFilter = $state('all');

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

  let filteredProjects = $derived(
    data.projects.filter((project) => {
      if (currentFilter === 'mine') {
        return !project.isFork;
      }
      if (currentFilter === 'forks') {
        return project.isFork;
      }
      return true;
    })
  );
</script>

<svelte:head>
  <title>Projects — Ankit Yadav</title>
</svelte:head>

<div>
  <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 1.5rem;">
    <p style="color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em;">Projects</p>
    <div style="display: flex; gap: 0.75rem; font-size: 0.75rem;">
      <button 
        onclick={() => currentFilter = 'all'} 
        style="background: none; border: none; padding: 0; cursor: pointer; font-family: var(--font); color: {currentFilter === 'all' ? 'var(--text)' : 'var(--text-muted)'}; font-weight: {currentFilter === 'all' ? '500' : '400'}; transition: color 0.2s;"
      >
        All
      </button>
      <span style="color: var(--border);">/</span>
      <button 
        onclick={() => currentFilter = 'mine'} 
        style="background: none; border: none; padding: 0; cursor: pointer; font-family: var(--font); color: {currentFilter === 'mine' ? 'var(--text)' : 'var(--text-muted)'}; font-weight: {currentFilter === 'mine' ? '500' : '400'}; transition: color 0.2s;"
      >
        Mine
      </button>
      <span style="color: var(--border);">/</span>
      <button 
        onclick={() => currentFilter = 'forks'} 
        style="background: none; border: none; padding: 0; cursor: pointer; font-family: var(--font); color: {currentFilter === 'forks' ? 'var(--text)' : 'var(--text-muted)'}; font-weight: {currentFilter === 'forks' ? '500' : '400'}; transition: color 0.2s;"
      >
        Forks
      </button>
    </div>
  </div>

  <div style="display: flex; flex-direction: column;">
    {#each filteredProjects as project}
      <a href="/projects/{project.slug}" style="display: flex; flex-direction: column; padding: 1rem 0; border-bottom: 1px solid var(--border); color: var(--text); text-decoration: none;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.25rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
            <span style="font-weight: 500;">{project.name}</span>
            {#if project.isPrivate}
              <span title="Private Repository" style="font-size: 0.7rem; color: var(--text-muted); background: var(--border); border-radius: 4px; padding: 0.1rem 0.3rem; display: inline-flex; align-items: center; gap: 0.15rem;">🔒 private</span>
            {/if}
            {#if project.isFork}
              <span title="Forked Repository" style="font-size: 0.7rem; color: var(--text-muted); background: var(--border); border-radius: 4px; padding: 0.1rem 0.3rem; display: inline-flex; align-items: center; gap: 0.15rem;">🔀 fork</span>
            {/if}
          </div>
          
          <div style="display: flex; align-items: center; gap: 1rem; flex-shrink: 0;">
            {#if project.language}
              <div style="display: flex; align-items: center; gap: 0.35rem; font-size: 0.75rem; color: var(--text-secondary);">
                <span style="width: 8px; height: 8px; border-radius: 50%; background: {languageColors[project.language] || '#888888'}; display: inline-block;"></span>
                <span>{project.language}</span>
              </div>
            {/if}
            {#if project.stars > 0}
              <div style="display: flex; align-items: center; gap: 0.2rem; font-size: 0.75rem; color: var(--text-secondary);">
                <span>★</span>
                <span>{project.stars}</span>
              </div>
            {/if}
          </div>
        </div>

        {#if project.tagline || project.description}
          <p style="color: var(--text-muted); font-size: 0.8rem; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            {project.tagline || project.description}
          </p>
        {/if}
      </a>
    {/each}
  </div>
</div>
