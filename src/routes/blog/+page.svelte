<script>
  let { data } = $props();
</script>

<svelte:head>
  <title>Blog — Ankit Yadav</title>
</svelte:head>

<div class="blog-container">
  <p class="section-title">Writing</p>

  <div class="blog-list">
    {#each data.posts as post}
      <a href="/blog/{post.slug}" class="blog-item">
        <span class="blog-title">{post.title}</span>
        <time class="blog-date">
          {new Date(post.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
        </time>
      </a>
    {/each}
  </div>
</div>

<style>
  .section-title {
    color: var(--text-muted);
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 1.5rem;
  }

  .blog-list {
    display: flex;
    flex-direction: column;
  }

  .blog-item {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--border);
    color: var(--text);
    text-decoration: none;
    transition: opacity 0.2s;
  }

  .blog-item:hover {
    opacity: 0.7;
  }

  .blog-title {
    font-weight: 500;
  }

  .blog-date {
    color: var(--text-muted);
    font-size: 0.8rem;
    flex-shrink: 0;
    margin-left: 1rem;
  }
</style>
