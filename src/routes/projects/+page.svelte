<script>
  let { data } = $props();
</script>

<svelte:head>
  <title>Projects — Ankit Yadav</title>
</svelte:head>

<div>
  <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 1.5rem;">
    <p style="color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em;">Projects</p>
  </div>

  <div style="display: flex; flex-direction: column;">
    {#each data.projects as project}
      <a href="/projects/{project.slug}" style="display: flex; align-items: center; justify-content: space-between; padding: 1rem 0; border-bottom: 1px solid var(--border); color: var(--text); text-decoration: none; transition: opacity 0.2s;">
        <span style="font-weight: 500;">{project.name}</span>
        <span style="color: var(--text-muted); font-size: 0.8rem;">view &rarr;</span>
      </a>
    {/each}
  </div>
</div>
