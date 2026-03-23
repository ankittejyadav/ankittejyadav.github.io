export async function load({ params }) {
  const modules = import.meta.glob('/src/content/posts/*.md', { eager: true });
  const path = `/src/content/posts/${params.slug}.md`;
  const post = modules[path];

  if (!post) {
    throw new Error(`Post not found: ${params.slug}`);
  }

  return {
    content: /** @type {any} */ (post).default,
    metadata: /** @type {any} */ (post).metadata
  };
}
