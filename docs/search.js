// Search functionality module
let searchIndex = [];
const READ_STORAGE_KEY = 'recipes:last-read:v1';

function getStoredReads() {
  try {
    const raw = window.localStorage.getItem(READ_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setStoredReads(reads) {
  try {
    window.localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(reads));
  } catch {
    // Ignore storage failures; the app still works without persistence.
  }
}

function getLastRead(slug) {
  const reads = getStoredReads();
  return Number(reads[slug] || 0);
}

export function markRecipeRead(slug) {
  if (!slug) return;
  const reads = getStoredReads();
  reads[slug] = Date.now();
  setStoredReads(reads);
}

function getCurrentRecipeSlug() {
  const pathname = window.location.pathname.replace(/\/+$/, '');
  const lastSegment = pathname.split('/').pop() || '';

  if (!lastSegment || lastSegment === 'index.html') return null;

  return lastSegment.replace(/\.html$/, '');
}

function sortByRecentRead(recipes) {
  return [...recipes].sort((a, b) => {
    const readDiff = getLastRead(b.slug) - getLastRead(a.slug);
    if (readDiff !== 0) return readDiff;
    return a.title.localeCompare(b.title);
  });
}

// Load search index
export async function loadSearchIndex() {
  try {
    const basePath = window.SITE_CONFIG?.basePath || './';
    const cached = await loadCachedJson(`${basePath}search-index.json`);
    if (cached) {
      searchIndex = cached;
      return 'cache';
    }

    const response = await fetch(`${basePath}search-index.json`, { cache: 'no-store' });
    searchIndex = await response.json();
    return 'network';
  } catch (error) {
    console.error('Failed to load search index:', error);
    return 'error';
  }
}

async function loadCachedJson(url) {
  if (!('caches' in window)) return null;

  try {
    const response = await caches.match(url);
    if (!response) return null;
    return await response.json();
  } catch {
    return null;
  }
}

async function refreshSearchIndex() {
  try {
    const basePath = window.SITE_CONFIG?.basePath || './';
    const response = await fetch(`${basePath}search-index.json`, { cache: 'no-store' });
    searchIndex = await response.json();
    return true;
  } catch (error) {
    console.error('Failed to refresh search index:', error);
    return false;
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
    .sort((a, b) => {
      const scoreDiff = b.score - a.score;
      if (scoreDiff !== 0) return scoreDiff;
      const readDiff = getLastRead(b.slug) - getLastRead(a.slug);
      if (readDiff !== 0) return readDiff;
      return a.title.localeCompare(b.title);
    });
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
  const filterEl = document.getElementById('filter');
  const recipesContainer = document.getElementById('recipes-container');
  
  if (!filterEl || !recipesContainer) return;

  const loadSource = await loadSearchIndex();
  
  // Check for query parameter on load
  const initialQuery = getQueryParam('q') || '';
  if (initialQuery) {
    filterEl.value = initialQuery;
    const results = searchRecipes(initialQuery);
    renderRecipes(results);
  } else {
    // Initial render - show all recipes, ordered by recent reads.
    renderRecipes(sortByRecentRead(searchIndex));
  }

  if (loadSource === 'cache') {
    void refreshSearchIndex().then((updated) => {
      if (updated) {
        const query = filterEl.value || '';
        const results = query.trim() ? searchRecipes(query) : sortByRecentRead(searchIndex);
        renderRecipes(results);
      }
    });
  }

  filterEl.addEventListener('input', (e) => {
    const query = e.target.value;
    updateUrlWithQuery(query);
    const results = query.trim() ? searchRecipes(query) : sortByRecentRead(searchIndex);
    renderRecipes(results);
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
    markRecipeRead(getCurrentRecipeSlug());

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
