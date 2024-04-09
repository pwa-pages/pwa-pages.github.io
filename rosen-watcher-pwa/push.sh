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
sudo rm -rf node_modules
sudo rm -rf .angular
cp -R dist/rosen-watcher-pwa/browser/* .
git add .
git commit -m "Automated commit $(date)"
git push origin HEAD --force
