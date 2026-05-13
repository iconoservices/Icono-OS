export function generateSlug(name: string, existingProjects: { slug: string }[]): string {
  let slug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Trim hyphens

  if (!slug) slug = 'project';

  let originalSlug = slug;
  let counter = 2;

  while (existingProjects.some(p => p.slug === slug)) {
    slug = `${originalSlug}-${counter}`;
    counter++;
  }

  return slug;
}
