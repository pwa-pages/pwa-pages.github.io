read -p "Let op! andere gebruikers gebruiken de app.... " confirm
if [[ $confirm != "yes" ]]; then
    echo "Execution aborted."
    exit 1
fi

# Prompt for confirmation again
read -p "Please confirm by typing 'yes' again: " confirm_again
if [[ $confirm_again != "yes" ]]; then
    echo "Execution aborted."
    exit 1
fi

# Your script code goes here
echo "Script execution confirmed."

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
