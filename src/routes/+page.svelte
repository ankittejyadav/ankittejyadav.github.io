<script>
  let { data } = $props();
</script>

<svelte:head>
  <title>Ankit Yadav</title>
</svelte:head>

<div>
  <h1 style="font-size: 1.75rem; font-weight: 700; line-height: 1.25; letter-spacing: -0.02em; margin-bottom: 3rem;">Engineer</h1>

  <p style="color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 1.5rem;">Writing</p>

  <div style="display: flex; flex-direction: column;">
    {#each data.posts as post}
      <a href="/blog/{post.slug}" style="padding: 1rem 0; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: baseline;">
        <span style="font-weight: 500; color: var(--text);">{post.title}</span>
        <time style="color: var(--text-muted); font-size: 0.8rem;">
          {new Date(post.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
        </time>
      </a>
    {/each}
  </div>
</div>
