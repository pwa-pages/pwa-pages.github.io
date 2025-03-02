importScripts('./shared/js/chart.service.js');
importScripts('./shared/js/data.service.js');
importScripts('./shared/js/chain.performance.data.service.js');
importScripts('./shared/js/reward.data.service.js');
importScripts('./shared/js/download.service.js');
importScripts('./shared/js/constants.js');
importScripts('./shared/js/chain.service.js');
importScripts('./shared/js/rosen-download-worker.js');
importScripts('./shared/js/ngsw-worker.js');

self.addEventListener('install', (_) => {
  console.log('[Service Worker] Installing new version...calling skipWaiting()');
  self.skipWaiting();
  console.log('[Service Worker] Installing new version...done skipWaiting()');
});

self.addEventListener('activate', (_) => {
  console.log('[Service Worker] Activated new version!');
});
