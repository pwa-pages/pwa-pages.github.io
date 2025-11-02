./build.sh

nx build rosen-watcher-pwa --configuration production
./clean.sh
cp -R dist/apps/rosen-watcher-pwa/browser/* ../ergo-tools-mono-app

git add .
#cp index.html ../404.html
#git add ../404.html

git commit -m "Automated commit $(date)"
git push origin HEAD --force

./build.sh
