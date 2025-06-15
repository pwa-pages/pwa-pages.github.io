./build.sh
./clean.sh
cp -R dist/paintings/browser/* .
git add .
git commit -m "Automated commit $(date)"
git push origin HEAD --force
./build.sh
