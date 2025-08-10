rm -rf .public/*
cp -R ../rosen-watcher-pwa/web-component/* ./public
./prep.sh
./clean.sh
npm install
npm run build-storybook
