./clean.sh
npm install
npm run build
ng build rosen-watchers --configuration production
ng build rosen-chain-performance --configuration production
npm run prep_web_component
cp dist/rosen-watcher-pwa/browser/ngsw-worker.js ./src/shared/js/



