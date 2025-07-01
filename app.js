const listEl = document.getElementById('list');
const contentEl = document.getElementById('content');
const filterEl = document.getElementById('filter');

let recipes = [];

fetch('recipes.json')
  .then(r => r.json())
  .then(data => {
    recipes = data;
    renderList();
  });

filterEl.addEventListener('input', renderList);

listEl.addEventListener('click', e => {
  const btn = e.target.closest('button.item');
  if (btn) loadRecipe(btn.dataset.slug);
});

function renderList() {
  const q = filterEl.value.toLowerCase();
  listEl.innerHTML = recipes
    .filter(r => r.title.toLowerCase().includes(q))
    .map(r => `<button class="item" data-slug="${r.slug}">${r.title}</button>`)
    .join('');
}

function loadRecipe(slug) {
  fetch(`recipes/${slug}.html`)
    .then(r => r.text())
    .then(html => {
      const bodyMatch = /<body[^>]*>([\s\S]*)<\/body>/i.exec(html);
      contentEl.innerHTML = bodyMatch ? bodyMatch[1] : html;
      const h1Match = /<h1[^>]*>(.*?)<\/h1>/i.exec(html);
      document.title = h1Match ? h1Match[1] : slug;
      window.scrollTo({ top: 0 });
    });
}
