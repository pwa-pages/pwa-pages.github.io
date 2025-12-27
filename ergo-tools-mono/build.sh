./clean.sh
npm install
#nx build service
#nx build rosen-watcher-pwa --configuration production
#nx build rosen-watcher-elements --configuration production
nx run-many --target=build,build-common --all --configuration=production --parallel=false

./prep_web_component.sh


rm -rf ../rosen-watcher-pwa/web-component/
mv web-component/ ../rosen-watcher-pwa/

./clean.sh
cp -R dist/apps/rosen-watcher-pwa/browser/* ../rosen-watcher-pwa

npm install
#nx build service
#nx build rosen-watcher-pwa --configuration production
#nx build rosen-watcher-elements --configuration production
nx run-many --target=build,build-common --all --configuration=production --parallel=false

