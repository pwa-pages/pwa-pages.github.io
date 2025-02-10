sudo find . -type f -name "main-*.js" -mtime +10 -exec rm -f {} \;
sudo find . -type f -name "poly-*.js" -mtime +10 -exec rm -f {} \;
sudo find . -type f -name "*worker*.js" -mtime +10 -exec rm -f {} \;
sudo find . -type f -name "styles-*.css" -mtime +10 -exec rm -f {} \;
rm -rf shared
sudo rm -rf node_modules
sudo rm -rf .angular
sudo rm -rf out-tsc
