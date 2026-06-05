import { initSearch, initNavigation } from './search.js';
import { initShare } from './share.js';

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  const basePath = window.SITE_CONFIG?.basePath || './';
  navigator.serviceWorker.register(`${basePath}sw.js`).catch((error) => {
    console.error('Failed to register service worker:', error);
  });
}

// Initialize search and navigation
initSearch();
initNavigation();
initShare();
registerServiceWorker();
