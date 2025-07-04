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

// Initialize search
export async function initSearch() {
  await loadSearchIndex();
  
  const filterEl = document.getElementById('filter');
  const listEl = document.getElementById('list');
  
  if (!filterEl || !listEl) return;
  
  // Initial render
  renderSearchResults(searchIndex);
  
  // Search input handler
  filterEl.addEventListener('input', (e) => {
    const query = e.target.value;
    const results = searchRecipes(query);
    renderSearchResults(results);
  });
}

// Render search results
function renderSearchResults(recipes) {
  const listEl = document.getElementById('list');
  if (!listEl) return;
  
  const recipesList = recipes
    .map(recipe => `<a href="${recipe.slug}.html" class="item" data-slug="${recipe.slug}">${recipe.title}</a>`)
    .join('');
  
  // Add close button for mobile
  listEl.innerHTML = `
    <div class="mobile-aside-header">
      <button class="close-mobile-menu" aria-label="Close menu">✕</button>
    </div>
    ${recipesList}
  `;
}

// Mobile menu toggle functions
function toggleMobileMenu() {
  document.body.classList.toggle('show-list');
}

function closeMobileMenu() {
  document.body.classList.remove('show-list');
}

// Handle recipe navigation
export function initNavigation() {
  const listEl = document.getElementById('list');
  const menuToggle = document.getElementById('menu-toggle');
  
  if (!listEl) return;
  
  // Handle recipe clicks
  listEl.addEventListener('click', e => {
    const link = e.target.closest('a.item');
    const closeBtn = e.target.closest('.close-mobile-menu');
    
    if (link) {
      e.preventDefault(); // Prevent default link behavior
      const slug = link.dataset.slug;
      navigateToRecipe(slug);
      // Close mobile menu when selecting a recipe
      closeMobileMenu();
    } else if (closeBtn) {
      e.preventDefault();
      closeMobileMenu();
    }
  });

  // Mobile menu toggle
  if (menuToggle) {
    menuToggle.addEventListener('click', toggleMobileMenu);
  }

  // Close mobile menu when clicking the overlay
  document.addEventListener('click', (e) => {
    if (document.body.classList.contains('show-list') && e.target === document.body) {
      closeMobileMenu();
    }
  });

  // Close mobile menu with escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('show-list')) {
      closeMobileMenu();
    }
  });
}

// Navigate to recipe
function navigateToRecipe(slug) {
  const currentPath = window.location.pathname;
  const isOnRecipePage = !currentPath.endsWith('index.html') && !currentPath.endsWith('/');
  
  if (isOnRecipePage) {
    // Update URL and load content
    window.history.pushState({ slug }, '', `${slug}.html`);
    loadRecipeContent(slug);
  } else {
    // Navigate to recipe page
    window.location.href = `${slug}.html`;
  }
}

// Load recipe content (for SPA behavior)
async function loadRecipeContent(slug) {
  const contentEl = document.getElementById('content');
  if (!contentEl) return;
  
  try {
    const response = await fetch(`${slug}.html`);
    const html = await response.text();
    
    // Extract content from the main element
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const mainContent = doc.querySelector('main');
    
    if (mainContent) {
      contentEl.innerHTML = mainContent.innerHTML;
      document.title = doc.title;
    }
  } catch (error) {
    console.error('Failed to load recipe:', error);
  }
}

// Handle browser back/forward
window.addEventListener('popstate', (event) => {
  if (event.state && event.state.slug) {
    loadRecipeContent(event.state.slug);
  }
}); 