<script>
  let { data } = $props();
  let Content = $derived(data.content);
</script>

<svelte:head>
  <title>{data.name} — Ankit Yadav</title>
</svelte:head>

<article class="project-detail">
  <a href="/projects" class="back-link">&larr; back</a>

  <header class="project-header">
    <h1 class="project-title">
      {data.name}
    </h1>
    <a href="https://github.com/ankittejyadav/{data.name}" target="_blank" rel="noopener noreferrer" class="github-link">View on GitHub &rarr;</a>
  </header>

  <div class="prose max-w-none project-body">
    <Content />
  </div>

  <div class="project-footer">
    <a href="/projects" class="back-link">&larr; all projects</a>
  </div>
</article>

<style>
  .back-link {
    color: var(--text-muted);
    font-size: 0.8rem;
    text-decoration: none;
    transition: color 0.2s;
  }

  .back-link:hover {
    color: var(--text);
  }

  .project-header {
    margin-top: 2rem;
    margin-bottom: 2.5rem;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .project-title {
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1.3;
    margin: 0;
    letter-spacing: -0.02em;
    color: var(--text);
  }

  .github-link {
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--link);
    text-decoration: none;
    transition: opacity 0.2s;
  }

  .github-link:hover {
    opacity: 0.8;
  }

  .project-body {
    font-size: 0.95rem;
  }

  .project-footer {
    margin-top: 3rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border);
  }
</style>
