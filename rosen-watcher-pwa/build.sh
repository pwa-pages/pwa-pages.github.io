./clean.sh
npm install
npm run build
ng build rosen-web-component --configuration production
npm run prep_web_component
cp dist/rosen-watcher-pwa/browser/ngsw-worker.js ./src/shared/js/
