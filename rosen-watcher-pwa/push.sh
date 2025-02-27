
npm install
npm run build
ng build rosen-watcher-pwa --configuration=production --base-href ./ --deploy-url ./
ng build rosen-watchers --configuration production
npm run prep_web_component
./clean.sh
cp -R dist/rosen-watcher-pwa/browser/* .
git add .
cp index.html ../404.html
git add ../404.html

git commit -m "Automated commit $(date)"
git push origin HEAD --force

./build.sh
