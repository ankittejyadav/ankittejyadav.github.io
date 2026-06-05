/**
 * Loads, parses, and sorts a collection of markdown files.
 * 
 * @template T
 * @param {Record<string, any>} files - The object returned by import.meta.glob with { eager: true }
 * @param {(slug: string, metadata: any) => T} mapFn - Mapper function to extract and shape fields
 * @param {keyof T & string} sortByField - The date-parseable field name to sort descending by
 * @returns {T[]}
 */
export function loadCollection(files, mapFn, sortByField) {
  const items = Object.entries(files).map(([path, module]) => {
    const slug = path.split('/').pop()?.replace('.md', '') ?? '';
    const metadata = module.metadata || {};
    return mapFn(slug, metadata);
  });

  if (sortByField) {
    items.sort((a, b) => {
      const valA = a[sortByField];
      const valB = b[sortByField];
      const timeA = valA ? new Date(valA).getTime() : 0;
      const timeB = valB ? new Date(valB).getTime() : 0;
      return timeB - timeA;
    });
  }

  return items;
}
