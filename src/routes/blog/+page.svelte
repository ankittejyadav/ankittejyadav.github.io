<script>
  let { data } = $props();
</script>

<svelte:head>
  <title>Blog — Ankit Yadav</title>
</svelte:head>

<div>
  <p style="color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 1.5rem;">Writing</p>

  {#each data.posts as post}
    <a href="/blog/{post.slug}" style="display: flex; justify-content: space-between; align-items: baseline; padding: 0.75rem 0; border-bottom: 1px solid var(--border); color: var(--text);">
      <span style="font-weight: 500;">{post.title}</span>
      <time style="color: var(--text-muted); font-size: 0.8rem; flex-shrink: 0; margin-left: 1rem;">
        {new Date(post.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
      </time>
    </a>
  {/each}
</div>
