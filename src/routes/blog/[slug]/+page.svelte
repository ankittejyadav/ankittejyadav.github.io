<script>
  let { data } = $props();
  let Content = $derived(data.content);
  let metadata = $derived(data.metadata);
</script>

<svelte:head>
  <title>{metadata.title}</title>
</svelte:head>

<article class="blog-post">
  <a href="/blog" class="back-link">&larr; back</a>

  <header class="post-header">
    <time class="post-date">
      {new Date(metadata.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
    </time>
    <h1 class="post-title">
      {metadata.title}
    </h1>
  </header>

  <div class="prose max-w-none post-body">
    <Content />
  </div>

  <div class="post-footer">
    <a href="/blog" class="back-link">&larr; all posts</a>
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

  .post-header {
    margin-top: 2rem;
    margin-bottom: 2.5rem;
  }

  .post-date {
    color: var(--text-muted);
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .post-title {
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1.3;
    margin-top: 0.5rem;
    margin-bottom: 0;
    letter-spacing: -0.02em;
  }

  .post-body {
    font-size: 0.95rem;
  }

  .post-footer {
    margin-top: 3rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border);
  }
</style>
