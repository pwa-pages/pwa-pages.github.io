if (typeof importScripts === 'function') {
  importScripts('./ngsw-worker.js');

  self.addEventListener('install', (_) => {
    console.log(
      '[Service Worker] Installing new version...calling skipWaiting()',
    );
    self.skipWaiting();
    console.log('[Service Worker] Installing new version...done skipWaiting()');
  });

  self.addEventListener('activate', (_) => {
    console.log('[Service Worker] Activated new version!');
  });
}
