./clean.sh
npm install
nx build service
#nx build rosen-watcher-pwa --configuration production
nx build rosen-watcher-pwa --configuration development
nx build rosen-watcher-elements --configuration development
#ng build rosen-web-component --configuration production
#npm run prep_web_component
#cp dist/rosen-watcher-pwa/browser/ngsw-worker.js ./src/shared/js/
