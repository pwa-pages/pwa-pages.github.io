sudo rm -rf node_modules
sudo rm -rf .angular
git add .
git commit -m "Automated commit $(date)"
git push origin HEAD --force
