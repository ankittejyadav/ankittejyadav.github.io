export async function load() {
  const postFiles = import.meta.glob('/src/content/posts/*.md', { eager: true });
  
  const posts = Object.entries(postFiles).map(([path, module]) => {
    const slug = path.split('/').pop()?.replace('.md', '') ?? '';
    const { metadata } = /** @type {any} */ (module);
    return {
      slug,
      title: metadata?.title ?? 'Untitled',
      date: metadata?.date ?? '',
      excerpt: metadata?.excerpt ?? '',
      tags: metadata?.tags ?? []
    };
  });

  // Sort by date descending
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return { posts };
}
