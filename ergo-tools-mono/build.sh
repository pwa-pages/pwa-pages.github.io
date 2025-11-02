./clean.sh
npm install
nx build service
nx build rosen-watcher-pwa --configuration production
nx build rosen-watcher-elements --configuration production

./prep_web_component.sh


mv web-component/* ../ergo-tools-mono-app/web-component/
./clean.sh
cp -R dist/apps/rosen-watcher-pwa/browser/* ../ergo-tools-mono-app

npm install
nx build service
nx build rosen-watcher-pwa --configuration development
nx build rosen-watcher-elements --configuration development


