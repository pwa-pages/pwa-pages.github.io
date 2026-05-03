./clean.sh
npm install
nx run-many --target=build --all --configuration=development --parallel=false

./prep_web_component.sh


rm -rf ../antichess-pwa/web-component/
mv web-component/ ../antichess-pwa/

./clean.sh
cp -R dist/apps/antichess-pwa/browser/* ../antichess-pwa

npm install
nx run-many --target=build --all --configuration=development --parallel=false

