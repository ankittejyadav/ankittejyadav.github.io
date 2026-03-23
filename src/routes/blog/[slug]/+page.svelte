<script>
  let { data } = $props();
  let Content = $derived(data.content);
  let metadata = $derived(data.metadata);
</script>

<svelte:head>
  <title>{metadata.title}</title>
</svelte:head>

<article>
  <a href="/blog" style="color: var(--text-muted); font-size: 0.8rem;">← back</a>

  <header style="margin-top: 2rem; margin-bottom: 2.5rem;">
    <time style="color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">
      {new Date(metadata.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
    </time>
    <h1 style="font-size: 1.5rem; font-weight: 700; line-height: 1.3; margin-top: 0.5rem; letter-spacing: -0.02em;">
      {metadata.title}
    </h1>
  </header>

  <div class="prose max-w-none" style="font-size: 0.95rem;">
    <Content />
  </div>

  <div style="margin-top: 3rem; padding-top: 1rem; border-top: 1px solid var(--border);">
    <a href="/blog" style="color: var(--text-muted); font-size: 0.8rem;">← all posts</a>
  </div>
</article>
