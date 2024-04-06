npm install
ng build --configuration=production --base-href ./ --deploy-url ./
sudo rm -rf node_modules
sudo rm -rf .angular
cp -R dist/rosen-watcher-pwa/browser/* .
git add .
git commit -m "Automated commit $(date)"
git push origin HEAD --force
