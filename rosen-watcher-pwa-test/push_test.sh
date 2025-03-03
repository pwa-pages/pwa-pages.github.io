rm -rf ../rosen-watcher-pwa-test/*
cp -R * ../rosen-watcher-pwa-test
cd ../rosen-watcher-pwa-test
./build.sh

ng build rosen-watcher-pwa --configuration=production --base-href ./ --deploy-url ./
./clean.sh
cp -R dist/rosen-watcher-pwa/browser/* .
git add .

git commit -m "Automated commit $(date)"
git push origin HEAD --force

./build.sh
cd ../rosen-watcher-pwa

