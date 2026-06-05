import { loadCollection } from '$lib/utils/markdown-loader';

/** @type {import('./$types').PageLoad} */
export async function load() {
  const postFiles = import.meta.glob('/src/content/posts/*.md', { eager: true });
  
  const posts = loadCollection(
    postFiles,
    (slug, metadata) => ({
      slug,
      title: metadata?.title ?? 'Untitled',
      date: metadata?.date ?? '',
      excerpt: metadata?.excerpt ?? '',
      tags: metadata?.tags ?? []
    }),
    'date'
  );

  return { posts };
}

