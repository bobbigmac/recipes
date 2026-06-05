import { readFileSync, readdirSync, mkdirSync, writeFileSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { createHash } from 'crypto';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({ html: true });

const srcDir = 'recipes';
const outDir = 'docs';

mkdirSync(outDir, { recursive: true });

function extractBakeBadges(sectionContent) {
  const lines = sectionContent.split('\n');
  const badges = [];
  const seen = new Set();

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || !/(bake|baked|baking|oven|preheat|roast)/i.test(line)) continue;

    for (const match of line.matchAll(/\b\d{2,3}\s*°\s*[CF]\b/gi)) {
      const value = match[0].replace(/\s+/g, '').replace(/°([CF])/i, '°$1');
      if (!seen.has(value)) {
        seen.add(value);
        badges.push(value);
      }
    }

    for (const match of line.matchAll(/\b\d+\s*(?:-\s*\d+)?\s*(?:min|mins|minute|minutes|hour|hours|hr|hrs)\b/gi)) {
      const value = match[0].replace(/\s+/g, ' ').replace(/\s*-\s*/g, '-');
      if (!seen.has(value)) {
        seen.add(value);
        badges.push(value);
      }
    }
  }

  return badges;
}

// Build recipes and collect meta
const list = [];
const buildHash = createHash('sha256');

function hashFileContents(path) {
  buildHash.update(readFileSync(path));
  buildHash.update('\0');
}

for (const file of readdirSync(srcDir)) {
  if (!file.endsWith('.md')) continue;
  const srcPath = join(srcDir, file);
  const src = readFileSync(srcPath, 'utf8');
  buildHash.update(file);
  buildHash.update('\0');
  buildHash.update(src);
  buildHash.update('\0');
  const { data, content } = matter(src);
  const slug = file.replace(/\.md$/, '');
  
  // Clean up common markdown formatting issues
  let cleanedContent = content
    .replace(/^\s+##/gm, '##') // Remove leading spaces before headers
    .replace(/^\s+[-*]/gm, (match) => match.trim()) // Remove leading spaces before list items
    .replace(/^\s+\d+\./gm, (match) => match.trim()) // Remove leading spaces before numbered lists
    .trim();
  
  // Parse content into sections and create custom HTML structure
  const sections = cleanedContent.split('## ');
  let htmlBody = '';
  let recipeBadges = [];
  for (let i = 1; i < sections.length; i++) {
    const section = sections[i].trim();
    if (!section) continue;

    const lines = section.split('\n');
    const sectionTitle = lines[0].trim();
    const sectionContent = lines.slice(1).join('\n').trim();

    if (sectionTitle.toLowerCase().includes('instruction')) {
      recipeBadges = extractBakeBadges(sectionContent);
      break;
    }
  }
  
  if (sections.length > 1) {
    // Title section (first section)
    const titleSection = sections[0].trim();
    if (titleSection) {
      htmlBody += `<h1>${titleSection.replace('# ', '')}</h1>`;
    }
    if (recipeBadges.length > 0) {
      htmlBody += `<div class="recipe-badges">${recipeBadges.map(badge => `<span class="recipe-badge">${badge}</span>`).join('')}</div>`;
    }
    
    // Create two-column layout for ingredients and instructions
    htmlBody += '<div class="recipe-content">';
    
    for (let i = 1; i < sections.length; i++) {
      const section = sections[i].trim();
      if (!section) continue;
      
      const lines = section.split('\n');
      const sectionTitle = lines[0].trim();
      const sectionContent = lines.slice(1).join('\n').trim();
      
      if (sectionTitle.toLowerCase().includes('ingredient')) {
        // Support sub-sections (### ...) and '-' or '*' bullets
        const lines = sectionContent.split('\n');
        const groups = [{ title: null, items: [] }];
        for (const raw of lines) {
          const line = raw.trim();
          if (!line) continue;
          if (line.startsWith('### ')) {
            groups.push({ title: line.replace(/^###\s+/, '').trim(), items: [] });
            continue;
          }
          if (/^[-*]\s+/.test(line)) {
            groups[groups.length - 1].items.push(line.replace(/^[-*]\s+/, '').trim());
          }
        }
        let ingredientsHtml = '<div class="ingredients-section">\n  <h2>Ingredients</h2>\n';
        const hasGroups = groups.length > 1 || groups[0].title !== null;
        if (hasGroups) {
          for (const g of groups) {
            if (g.items.length === 0) continue;
            if (g.title) ingredientsHtml += `  <h3>${g.title}</h3>\n`;
            ingredientsHtml += `  <ul>${g.items.map(i => `<li>${i}</li>`).join('')}</ul>\n`;
          }
        } else {
          ingredientsHtml += `  <ul>${groups[0].items.map(i => `<li>${i}</li>`).join('')}</ul>\n`;
        }
        ingredientsHtml += '</div>';
        htmlBody += `\n${ingredientsHtml}\n`;
             } else if (sectionTitle.toLowerCase().includes('instruction')) {
         // Support sub-sections (### ...) with numbered steps
         const lines = sectionContent.split('\n');
         const groups = [{ title: null, items: [] }];
         for (const raw of lines) {
           const line = raw.trim();
           if (!line) continue;
           if (line.startsWith('### ')) {
             groups.push({ title: line.replace(/^###\s+/, '').trim(), items: [] });
             continue;
           }
           if (/^\d+\.\s+/.test(line)) {
             groups[groups.length - 1].items.push(line.replace(/^\d+\.\s+/, '').trim());
           }
         }
         let instructionsHtml = '<div class="instructions-section">\n  <h2>Instructions</h2>\n';
         const hasGroups = groups.length > 1 || groups[0].title !== null;
         if (hasGroups) {
           for (const g of groups) {
             if (g.items.length === 0) continue;
             if (g.title) instructionsHtml += `  <h3>${g.title}</h3>\n`;
             instructionsHtml += `  <ol>${g.items.map(i => `<li>${i}</li>`).join('')}</ol>\n`;
           }
         } else {
           instructionsHtml += `  <ol>${groups[0].items.map(i => `<li>${i}</li>`).join('')}</ol>\n`;
         }
         instructionsHtml += '</div>';
         htmlBody += `\n${instructionsHtml}\n`;
       } else if (sectionTitle.toLowerCase().includes('link')) {
         // Convert links list to HTML
         const links = sectionContent.split('\n').filter(line => line.trim().startsWith('-'));
         const linksHtml = links.map(link => {
           const linkText = link.replace(/^- /, '').trim();
           // Extract URL if it's in markdown link format [text](url)
           const linkMatch = linkText.match(/\[([^\]]+)\]\(([^)]+)\)/);
           if (linkMatch) {
             return `<li><a href="${linkMatch[2]}" target="_blank" rel="noopener">${linkMatch[1]}</a></li>`;
           } else {
             return `<li>${linkText}</li>`;
           }
         }).join('');
         
         htmlBody += `
           <div class="links-section">
             <h2>Related Links</h2>
             <ul>${linksHtml}</ul>
           </div>
         `;
       } else {
         // Other sections use standard markdown rendering, span full width
         const sectionHtml = md.render(`## ${section}`);
         htmlBody += `\n<div class=\"other-section\">\n${sectionHtml}\n</div>\n`;
       }
    }
    
    htmlBody += '</div>';
  } else {
    // Fallback to standard markdown rendering
    htmlBody = md.render(cleanedContent);
  }
  const title = data.title || slug;
  
  // Add DuckDuckGo links if no links section exists
  const hasLinksSection = sections.some(section => 
    section.trim().toLowerCase().includes('link')
  );
  
  if (!hasLinksSection && sections.length > 1) {
    const searchQuery = encodeURIComponent(title);
    htmlBody += `
      <div class="links-section">
        <h2>Related Links</h2>
        <ul>
          <li><a href="https://duckduckgo.com/?q=${searchQuery}+recipe" target="_blank" rel="noopener">Search for ${title} recipes</a></li>
          <li><a href="https://duckduckgo.com/?q=${searchQuery}+recipe&iax=images&ia=images" target="_blank" rel="noopener">Images of ${title}</a></li>
        </ul>
      </div>
    `;
  }

  const fullHtml = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${title}</title><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="style.css"></head><body><header><h1><a href="index.html">Recipes</a></h1><input type="search" id="filter" placeholder="Search recipes…"/></header><main id="content">${htmlBody}</main><script>window.SITE_CONFIG={basePath:'./'};</script><script type="module" src="app.js"></script></body></html>`;
  writeFileSync(join(outDir, `${slug}.html`), fullHtml);

  list.push({ slug, title, tags: data.tags || [] });
}

// Write listing
writeFileSync(join(outDir, 'recipes.json'), JSON.stringify(list, null, 2));

// Create search index
const searchIndex = list.map(recipe => {
  const recipePath = join(srcDir, `${recipe.slug}.md`);
  const recipeContent = readFileSync(recipePath, 'utf8');
  const { content } = matter(recipeContent);
  
  // Clean content for search
  const cleanContent = content
    .replace(/^\s+##/gm, '##')
    .replace(/^\s+[-*]/gm, (match) => match.trim())
    .replace(/^\s+\d+\./gm, (match) => match.trim())
    .replace(/[^\w\s]/g, ' ')
    .toLowerCase();
  
  return {
    slug: recipe.slug,
    title: recipe.title,
    tags: recipe.tags,
    content: cleanContent,
    url: `./${recipe.slug}.html`
  };
});

writeFileSync(join(outDir, 'search-index.json'), JSON.stringify(searchIndex, null, 2));

// Copy static assets
copyFileSync('src/index.html', join(outDir, 'index.html'));
copyFileSync('src/style.css', join(outDir, 'style.css'));
copyFileSync('src/app.js', join(outDir, 'app.js'));
copyFileSync('src/search.js', join(outDir, 'search.js'));
copyFileSync('src/share.js', join(outDir, 'share.js'));

hashFileContents('src/index.html');
hashFileContents('src/style.css');
hashFileContents('src/app.js');
hashFileContents('src/search.js');
hashFileContents('src/share.js');
hashFileContents('scripts/build.js');

const cacheName = `recipes-${buildHash.digest('hex').slice(0, 12)}`;
const precacheUrls = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './search.js',
  './share.js',
  './recipes.json',
  './search-index.json',
  ...list.map(recipe => `./${recipe.slug}.html`)
];

writeFileSync(join(outDir, 'sw.js'), `const CACHE_NAME = ${JSON.stringify(cacheName)};
const PRECACHE_URLS = ${JSON.stringify(precacheUrls, null, 2)};

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(PRECACHE_URLS);
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request) || await cache.match('./index.html');
    if (cached) return cached;
    throw new Error('No cached response available');
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('.json')) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  event.respondWith(cacheFirst(event.request));
});
`);

console.log('Build complete. Recipes:', list.length);
