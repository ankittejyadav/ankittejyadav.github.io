<script>
  let { data } = $props();
  let Content = $derived(data.content);
</script>

<svelte:head>
  <title>{data.name} — Ankit Yadav</title>
</svelte:head>

<article>
  <a href="/projects" style="color: var(--text-muted); font-size: 0.8rem;">&larr; back</a>

  <header style="margin-top: 2rem; margin-bottom: 2.5rem; display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 1rem;">
    <h1 style="font-size: 1.5rem; font-weight: 700; line-height: 1.3; margin: 0; letter-spacing: -0.02em; color: var(--text);">
      {data.name}
    </h1>
    <a href="https://github.com/ankittejyadav/{data.name}" target="_blank" rel="noopener noreferrer" style="font-size: 0.85rem; font-weight: 500; color: var(--link);">View on GitHub &rarr;</a>
  </header>

  <div class="prose max-w-none" style="font-size: 0.95rem;">
    <Content />
  </div>

  <div style="margin-top: 3rem; padding-top: 1rem; border-top: 1px solid var(--border);">
    <a href="/projects" style="color: var(--text-muted); font-size: 0.8rem;">&larr; all projects</a>
  </div>
</article>
