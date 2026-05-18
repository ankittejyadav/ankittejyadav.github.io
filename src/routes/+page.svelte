<script>
  let { data } = $props();
</script>

<svelte:head>
  <title>Ankit Yadav</title>
</svelte:head>

<div>
  <h1 style="font-size: 1.75rem; font-weight: 700; line-height: 1.25; letter-spacing: -0.02em; margin-bottom: 3rem;">Engineer</h1>

  <!-- Projects Section -->
  <p style="color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 1.5rem;">Projects</p>

  <div style="display: flex; flex-direction: column; margin-bottom: 1rem;">
    {#each data.featuredProjects as project}
      <a href="/projects/{project.slug}" style="padding: 1rem 0; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: baseline; text-decoration: none;">
        <div style="display: flex; flex-direction: column; gap: 0.15rem; min-width: 0; flex-grow: 1;">
          <span style="font-weight: 500; color: var(--text);">{project.name}</span>
          {#if project.tagline || project.description}
            <span style="color: var(--text-muted); font-size: 0.8rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              {project.tagline || project.description}
            </span>
          {/if}
        </div>
        {#if project.language}
          <span style="color: var(--text-muted); font-size: 0.8rem; flex-shrink: 0; margin-left: 1rem;">
            {project.language}
          </span>
        {/if}
      </a>
    {/each}
  </div>

  <div style="margin-bottom: 3.5rem;">
    <a href="/projects" style="color: var(--text-muted); font-size: 0.85rem; font-weight: 500;">View all →</a>
  </div>

  <!-- Writing Section -->
  <p style="color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 1.5rem;">Writing</p>

  <div style="display: flex; flex-direction: column;">
    {#each data.posts as post}
      <a href="/blog/{post.slug}" style="padding: 1rem 0; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: baseline; text-decoration: none;">
        <span style="font-weight: 500; color: var(--text);">{post.title}</span>
        <time style="color: var(--text-muted); font-size: 0.8rem;">
          {new Date(post.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
        </time>
      </a>
    {/each}
  </div>
</div>
