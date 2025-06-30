import { readFileSync, readdirSync, mkdirSync, writeFileSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({ html: true });

const srcDir = 'recipes';
const outDir = 'dist';
const outRecipeDir = join(outDir, 'recipes');

mkdirSync(outRecipeDir, { recursive: true });

// Build recipes and collect meta
const list = [];
for (const file of readdirSync(srcDir)) {
  if (!file.endsWith('.md')) continue;
  const srcPath = join(srcDir, file);
  const src = readFileSync(srcPath, 'utf8');
  const { data, content } = matter(src);
  const slug = file.replace(/\.md$/, '');
  const htmlBody = md.render(content);
  const title = data.title || slug;

  const fullHtml = \`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>\${title}</title><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>\${htmlBody}</body></html>\`;
  writeFileSync(join(outRecipeDir, \`\${slug}.html\`), fullHtml);

  list.push({ slug, title, tags: data.tags || [] });
}

// Write listing
writeFileSync(join(outDir, 'recipes.json'), JSON.stringify(list, null, 2));

// Copy static assets
copyFileSync('src/index.html', join(outDir, 'index.html'));
copyFileSync('src/style.css', join(outDir, 'style.css'));
copyFileSync('src/app.js', join(outDir, 'app.js'));

console.log('Build complete. Recipes:', list.length);
