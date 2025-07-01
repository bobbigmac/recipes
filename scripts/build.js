import { readFileSync, readdirSync, mkdirSync, writeFileSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({ html: true });

const srcDir = 'recipes';
const outDir = 'docs';
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
  
  // Clean up common markdown formatting issues
  let cleanedContent = content
    .replace(/^\s+##/gm, '##') // Remove leading spaces before headers
    .replace(/^\s+[-*]/gm, (match) => match.trim()) // Remove leading spaces before list items
    .replace(/^\s+\d+\./gm, (match) => match.trim()) // Remove leading spaces before numbered lists
    .trim();
  
  // Parse content into sections and create custom HTML structure
  const sections = cleanedContent.split('## ');
  let htmlBody = '';
  
  if (sections.length > 1) {
    // Title section (first section)
    const titleSection = sections[0].trim();
    if (titleSection) {
      htmlBody += `<h1>${titleSection.replace('# ', '')}</h1>`;
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
        // Convert ingredients list to HTML
        const ingredients = sectionContent.split('\n').filter(line => line.trim().startsWith('-'));
        const ingredientsHtml = ingredients.map(ingredient => 
          `<li>${ingredient.replace(/^- /, '').trim()}</li>`
        ).join('');
        
        htmlBody += `
          <div class="ingredients-section">
            <h2>Ingredients</h2>
            <ul>${ingredientsHtml}</ul>
          </div>
        `;
             } else if (sectionTitle.toLowerCase().includes('instruction')) {
         // Convert instructions list to HTML
         const instructions = sectionContent.split('\n').filter(line => /^\d+\./.test(line.trim()));
         const instructionsHtml = instructions.map((instruction, index) => 
           `<li>${instruction.replace(/^\d+\.\s*/, '').trim()}</li>`
         ).join('');
         
         htmlBody += `
           <div class="instructions-section">
             <h2>Instructions</h2>
             <ol>${instructionsHtml}</ol>
           </div>
         `;
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
         // Other sections use standard markdown rendering
         const sectionHtml = md.render(`## ${section}`);
         htmlBody += sectionHtml;
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

  const fullHtml = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${title}</title><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="../style.css"></head><body><header><h1><a href="/">Recipes</a></h1><input type="search" id="filter" placeholder="Filter recipes…"/></header><aside id="list"></aside><main id="content">${htmlBody}</main><script type="module" src="../app.js"></script></body></html>`;
  writeFileSync(join(outRecipeDir, `${slug}.html`), fullHtml);

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
    url: `recipes/${recipe.slug}.html`
  };
});

writeFileSync(join(outDir, 'search-index.json'), JSON.stringify(searchIndex, null, 2));

// Copy static assets
copyFileSync('src/index.html', join(outDir, 'index.html'));
copyFileSync('src/style.css', join(outDir, 'style.css'));
copyFileSync('src/app.js', join(outDir, 'app.js'));
copyFileSync('src/search.js', join(outDir, 'search.js'));
copyFileSync('src/share.js', join(outDir, 'share.js'));

console.log('Build complete. Recipes:', list.length);
