#!/bin/bash

cp dist/rosen-web-component/browser/assets/*  dist/rosen-web-component/browser/

dir="dist/rosen-web-component/browser/" 

for file in "$dir"main*.js "$dir"runtime*.js "$dir"scripts*.js "$dir"styles*.css; do
  if [[ -f "$file" ]]; then

    filename=$(basename "$file")


    
    if [[ "$filename" == styles*.css ]]; then
      sed -i "s|{{styles.css}}|$filename|g" dist/rosen-web-component/browser/rosen-watchers.html
      echo "Replaced {{styles.css}} with $filename in dist/rosen-web-component/browser/rosen-watchers.html"
      sed -i "s|{{styles.css}}|$filename|g" dist/rosen-web-component/browser/rosen-chain-performance.html
      echo "Replaced {{styles.css}} with $filename in dist/rosen-web-component/browser/rosen-chain-performance.html"
      sed -i "s|{{styles.css}}|$filename|g" dist/rosen-web-component/browser/rosen-statistics.html
      echo "Replaced {{styles.css}} with $filename in dist/rosen-web-component/browser/rosen-statistics.html"
      sed -i "s|{{styles.css}}|$filename|g" dist/rosen-web-component/browser/rosen-performance.html
      echo "Replaced {{styles.css}} with $filename in dist/rosen-web-component/browser/rosen-performance.html"
    fi

  fi
done


rm -rf web-component/*
mkdir web-component
cp dist/rosen-web-component/browser/* web-component
cp -r dist/rosen-web-component/browser/media web-component
rm web-component/index.html

tmpfile=$(mktemp)

cat web-component/runtime*.js >> "$tmpfile"
echo "" >> "$tmpfile"

cat web-component/scripts*.js >> "$tmpfile"
echo "" >> "$tmpfile"

cat web-component/main*.js >> "$tmpfile"
echo "" >> "$tmpfile"


version=$(jq -r '.appData.version' ngsw-config.json)
dest="web-component/rosen-watcher-components.$version.js"
mv "$tmpfile" "$dest"
sed -i "s|rosen-watcher-components.js|rosen-watcher-components.$version.js|g" web-component/rosen-watchers.html
sed -i "s|rosen-watcher-components.js|rosen-watcher-components.$version.js|g" web-component/rosen-chain-performance.html
sed -i "s|rosen-watcher-components.js|rosen-watcher-components.$version.js|g" web-component/rosen-statistics.html
sed -i "s|rosen-watcher-components.js|rosen-watcher-components.$version.js|g" web-component/rosen-performance.html


