./clean.sh
npm install

nx run-many --target=build,build-common --all --configuration=production --parallel=false

./clean.sh
cp -R dist/apps/antichess-pwa/browser/* ../antichess-pwa

npm install
nx run-many --target=build,build-common --all --configuration=production --parallel=false



