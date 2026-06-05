const CACHE_NAME = "recipes-74823dc55f3f";
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./search.js",
  "./share.js",
  "./recipes.json",
  "./search-index.json",
  "./banana-bread.html",
  "./bechamel-sauce.html",
  "./beef-bourguignon.html",
  "./boiled-eggs.html",
  "./bread-and-butter-pudding.html",
  "./british-curry.html",
  "./caesar-salad.html",
  "./chana-masala.html",
  "./chicken-tikka-masala.html",
  "./chocolate-chip-cookies.html",
  "./choux-pastry.html",
  "./christmas-cake.html",
  "./christmas-pudding.html",
  "./classic-pancakes.html",
  "./cottage-pie.html",
  "./crumpets.html",
  "./cupcakes.html",
  "./custard.html",
  "./dal-tadka.html",
  "./eccles-cakes.html",
  "./english-breakfast.html",
  "./fairy-cakes.html",
  "./filo-pastry.html",
  "./fish-chips.html",
  "./french-toast.html",
  "./fried-rice.html",
  "./fruit-crumble.html",
  "./ginger-beer.html",
  "./gingerbread.html",
  "./gluten-free-pizza-dough.html",
  "./greek-moussaka.html",
  "./green-curry.html",
  "./grilled-cheese.html",
  "./hot-cross-buns.html",
  "./ice-cream.html",
  "./instant-pot-baked-potatoes.html",
  "./jalfrezi.html",
  "./kedgeree.html",
  "./korma.html",
  "./lamb-nihari.html",
  "./milk-blancmange.html",
  "./mince-pies.html",
  "./omelette.html",
  "./onion-butty.html",
  "./perfect-sandwich.html",
  "./ploughmans-lunch.html",
  "./puff-pastry.html",
  "./quiche.html",
  "./ramen.html",
  "./ratatouille.html",
  "./red-curry.html",
  "./rice-pudding.html",
  "./rogan-josh.html",
  "./sausage-rolls.html",
  "./scones.html",
  "./shepherds-pie.html",
  "./shortcrust-pastry.html",
  "./snishers.html",
  "./sourdough-bread.html",
  "./spaghetti-bolognese.html",
  "./spanish-tortilla.html",
  "./spotted-dick.html",
  "./stir-fry.html",
  "./thai-curry.html",
  "./toad-in-the-hole.html",
  "./tomato-soup.html",
  "./trifle.html",
  "./vanilla-biscuits.html",
  "./victoria-sponge.html",
  "./welsh-cakes.html",
  "./welsh-rarebit.html",
  "./yorkshire-pudding.html"
];

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
