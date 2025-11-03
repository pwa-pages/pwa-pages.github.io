./build.sh

ng build rosen-watcher-pwa --configuration=production --base-href ./ --deploy-url ./
./clean.sh
cp -R dist/rosen-watcher-pwa/browser/* .
#cp index_dynamic.html index.html
git add .
cp index.html ../404.html
git add ../404.html

git commit -m "Automated commit $(date)"
git push origin HEAD --force

./build.sh
