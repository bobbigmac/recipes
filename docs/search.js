// Search functionality module
let searchIndex = [];

// Load search index
export async function loadSearchIndex() {
  try {
    const basePath = window.SITE_CONFIG?.basePath || './';
    const response = await fetch(`${basePath}search-index.json`);
    searchIndex = await response.json();
  } catch (error) {
    console.error('Failed to load search index:', error);
  }
}

// Search function
export function searchRecipes(query) {
  if (!query.trim()) return searchIndex.map(recipe => ({ ...recipe, score: 0 }));
  
  const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
  
  return searchIndex
    .map(recipe => {
      let score = 0;
      const searchableText = `${recipe.title} ${recipe.content} ${recipe.tags.join(' ')}`.toLowerCase();
      
      searchTerms.forEach(term => {
        // Title matches get highest score
        if (recipe.title.toLowerCase().includes(term)) score += 10;
        // Tag matches get medium score
        if (recipe.tags.some(tag => tag.toLowerCase().includes(term))) score += 5;
        // Content matches get lower score
        if (searchableText.includes(term)) score += 1;
      });
      
      return { ...recipe, score };
    })
    .filter(recipe => recipe.score > 0)
    .sort((a, b) => b.score - a.score);
}

// Get query parameter from URL
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Update URL with query parameter
function updateUrlWithQuery(query) {
  const url = new URL(window.location.href);
  if (query.trim()) {
    url.searchParams.set('q', query);
  } else {
    url.searchParams.delete('q');
  }
  window.history.replaceState({}, '', url);
}

// Initialize search
export async function initSearch() {
  await loadSearchIndex();
  
  const filterEl = document.getElementById('filter');
  const recipesContainer = document.getElementById('recipes-container');
  
  if (!filterEl || !recipesContainer) return;
  
  // Check for query parameter on load
  const initialQuery = getQueryParam('q') || '';
  if (initialQuery) {
    filterEl.value = initialQuery;
    const results = searchRecipes(initialQuery);
    renderRecipes(results);
  } else {
    // Initial render - show all recipes
    renderRecipes(searchIndex);
  }
  
  // Search on Enter key
  filterEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const query = e.target.value;
      updateUrlWithQuery(query);
      const results = searchRecipes(query);
      renderRecipes(results);
    }
  });
}

// Render recipes in grid layout
function renderRecipes(recipes) {
  const recipesContainer = document.getElementById('recipes-container');
  if (!recipesContainer) return;
  
  if (recipes.length === 0) {
    recipesContainer.innerHTML = `
      <div class="no-results">
        <p>No recipes found. Try a different search term.</p>
        <p><small>Or <a href="https://github.com/bobbigmac/recipes/recipes">add your own via Pull Request</a>.</small></p>
      </div>
    `;
    return;
  }
  
  const recipesHtml = recipes
    .map(recipe => `
      <div class="recipe-card">
        <a href="${recipe.slug}.html">
          <h3>${recipe.title}</h3>
          <div class="tags">
            ${recipe.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
        </a>
      </div>
    `)
    .join('');
  
  recipesContainer.innerHTML = `
    <div class="recipes-grid">
      ${recipesHtml}
    </div>
    <div style="text-align: center; margin-top: 2rem; padding: 1rem; color: #7f8c8d;">
      <p><small>Can't find what you're looking for? <a href="https://github.com/bobbigmac/recipes/recipes">Add your own recipe via Pull Request</a>.</small></p>
      <p><small>No ads, no life stories, just recipes. Because I'm tired of scrolling through SEO-stuffed pages when all I need is an ingredients list and cooking method.</small></p>
    </div>
  `;
}

// Initialize navigation (simplified for new layout)
export function initNavigation() {
  // Handle recipe clicks (handled by normal links now)
  // No special navigation needed for the new layout
  
  // Handle search form on recipe pages
  const filterEl = document.getElementById('filter');
  if (filterEl && !document.getElementById('recipes-container')) {
    // We're on a recipe page, redirect to homepage on search
    filterEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const query = e.target.value;
        if (query.trim()) {
          window.location.href = `/?q=${encodeURIComponent(query)}`;
        } else {
          window.location.href = '/';
        }
      }
    });
  }
} 