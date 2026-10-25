import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const origin = 'https://technoplus-one.vercel.app';
const root = process.cwd();
const source = await readFile(resolve(root, 'src/data/technoplusProjects.ts'), 'utf8');
const projectSlugs = [...source.matchAll(/\bslug:\s*['"]([^'"]+)['"]/g)].map((match) => match[1]);
const staticPaths = ['/', '/projects', '/about', '/procedure', '/contact'];
const paths = [...new Set([...staticPaths, ...projectSlugs.map((slug) => `/projects/${slug}`)])];
const urls = paths.map((path) => `  <url><loc>${origin}${path === '/' ? '/' : path}</loc></url>`).join('\n');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
await writeFile(resolve(root, 'public/sitemap.xml'), sitemap, 'utf8');
console.log(`Wrote sitemap for ${paths.length} public static routes.`);
