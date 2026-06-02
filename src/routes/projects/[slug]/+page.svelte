<script>
  let { data } = $props();
  let project = $derived(data.project);
  let contentHtml = $derived(data.contentHtml);
</script>

<svelte:head>
  <title>{project.name} — Ankit Yadav</title>
</svelte:head>

<article>
  <a href="/projects" style="color: var(--text-muted); font-size: 0.8rem;">&larr; back</a>

  <header style="margin-top: 2rem; margin-bottom: 2.5rem; display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 1rem;">
    <h1 style="font-size: 1.5rem; font-weight: 700; line-height: 1.3; margin: 0; letter-spacing: -0.02em; color: var(--text);">
      {project.name}
    </h1>
    {#if project.url}
      <a href={project.url} target="_blank" rel="noopener noreferrer" style="font-size: 0.85rem; font-weight: 500; color: var(--link);">View on GitHub &rarr;</a>
    {/if}
  </header>

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
