<script>
  let { data } = $props();
</script>

<svelte:head>
  <title>Projects — Ankit Yadav</title>
</svelte:head>

<div class="projects-container">
  <div class="projects-header">
    <p class="section-title">Projects</p>
  </div>

  <div class="projects-list">
    {#each data.projects as project}
      <a href="/projects/{project.name}" class="project-item">
        <span class="project-name">{project.name}</span>
        <span class="view-link">view &rarr;</span>
      </a>
    {/each}
  </div>
</div>

<style>
  .projects-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 1.5rem;
  }

  .section-title {
    color: var(--text-muted);
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin: 0;
  }

  .projects-list {
    display: flex;
    flex-direction: column;
  }

  .project-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 0;
    border-bottom: 1px solid var(--border);
    color: var(--text);
    text-decoration: none;
    transition: opacity 0.2s;
  }

  .project-item:hover {
    opacity: 0.7;
  }

  .project-name {
    font-weight: 500;
  }

  .view-link {
    color: var(--text-muted);
    font-size: 0.8rem;
  }
</style>
