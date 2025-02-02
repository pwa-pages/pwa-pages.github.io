
npm install
ng build --configuration=production --base-href ./ --deploy-url ./
./clean.sh
cp -R dist/rosen-watcher-pwa/browser/* .
git add .
cp index.html ../404.html
git add ../404.html

git commit -m "Automated commit $(date)"
git push origin HEAD --force

./build.sh
