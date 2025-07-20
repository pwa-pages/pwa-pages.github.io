#!/bin/bash

cp dist/rosen-watchers/assets/*.html  dist/rosen-watchers/
cp dist/rosen-chain-performance/assets/*.html  dist/rosen-chain-performance/
cp dist/rosen-web-component/assets/*.html  dist/rosen-web-component/


dir="dist/rosen-watchers/" 

# Loop through all main*.js, runtime*.js, and styles*.css files in the directory
for file in "$dir"main*.js "$dir"runtime*.js "$dir"styles*.css; do
  if [[ -f "$file" ]]; then
    # Extract the filename without the path
    filename=$(basename "$file")

    # Replace {{main.js}} or {{runtime.js}} or {{styles.css}} with the filename in web_component.html
    if [[ "$filename" == main*.js ]]; then
      sed -i "s|{{main.js}}|$filename|g" dist/rosen-watchers/rosen_watchers.html
            echo "Replaced {{main.js}} with $filename in dist/rosen-watchers/rosen_watchers.html"
    elif [[ "$filename" == runtime*.js ]]; then
      sed -i "s|{{runtime.js}}|$filename|g" dist/rosen-watchers/rosen_watchers.html
            echo "Replaced {{runtime.js}} with $filename in dist/rosen-watchers/rosen_watchers.html"
    elif [[ "$filename" == styles*.css ]]; then
      sed -i "s|{{styles.css}}|$filename|g" dist/rosen-watchers/rosen_watchers.html
      echo "Replaced {{styles.css}} with $filename in dist/rosen-watchers/rosen_watchers.html"
    fi
  fi
done

dir="dist/rosen-chain-performance/" 

for file in "$dir"main*.js "$dir"runtime*.js "$dir"scripts*.js "$dir"styles*.css; do
  if [[ -f "$file" ]]; then
    # Extract the filename without the path
    filename=$(basename "$file")

    # Replace {{main.js}} or {{runtime.js}} or {{styles.css}} with the filename in web_component.html
    if [[ "$filename" == main*.js ]]; then
      sed -i "s|{{main.js}}|$filename|g" dist/rosen-chain-performance/rosen-chain-performance.html
      echo "Replaced {{main.js}} with $filename in dist/rosen-chain-performance/rosen-chain-performance.html"
    elif [[ "$filename" == runtime*.js ]]; then
      sed -i "s|{{runtime.js}}|$filename|g" dist/rosen-chain-performance/rosen-chain-performance.html
      echo "Replaced {{runtime.js}} with $filename in dist/rosen-chain-performance/rosen-chain-performance.html"
    elif [[ "$filename" == scripts*.js ]]; then
      sed -i "s|{{scripts.js}}|$filename|g" dist/rosen-chain-performance/rosen-chain-performance.html
      echo "Replaced {{scripts.js}} with $filename in dist/rosen-chain-performance/rosen-chain-performance.html"
    elif [[ "$filename" == styles*.css ]]; then
      sed -i "s|{{styles.css}}|$filename|g" dist/rosen-chain-performance/rosen-chain-performance.html
      echo "Replaced {{styles.css}} with $filename in dist/rosen-chain-performance/rosen-chain-performance.html"
    fi
  fi
done

dir="dist/rosen-web-component/" 

for file in "$dir"main*.js "$dir"runtime*.js "$dir"scripts*.js "$dir"styles*.css; do
  if [[ -f "$file" ]]; then
    # Extract the filename without the path
    filename=$(basename "$file")

    # Replace {{main.js}} or {{runtime.js}} or {{styles.css}} with the filename in web_component.html
    if [[ "$filename" == main*.js ]]; then
      sed -i "s|{{main.js}}|$filename|g" dist/rosen-web-component/rosen-web-component.html
      echo "Replaced {{main.js}} with $filename in dist/rosen-web-component/rosen-web-component.html"
    elif [[ "$filename" == runtime*.js ]]; then
      sed -i "s|{{runtime.js}}|$filename|g" dist/rosen-web-component/rosen-web-component.html
      echo "Replaced {{runtime.js}} with $filename in dist/rosen-web-component/rosen-web-component.html"
    elif [[ "$filename" == scripts*.js ]]; then
      sed -i "s|{{scripts.js}}|$filename|g" dist/rosen-web-component/rosen-web-component.html
      echo "Replaced {{scripts.js}} with $filename in dist/rosen-web-component/rosen-web-component.html"
    elif [[ "$filename" == styles*.css ]]; then
      sed -i "s|{{styles.css}}|$filename|g" dist/rosen-web-component/rosen-web-component.html
      echo "Replaced {{styles.css}} with $filename in dist/rosen-web-component/rosen-web-component.html"
    fi
  fi
done


rm -rf web_component/*
mkdir web_component/rosen-watchers
mkdir web_component/rosen-chain-performance
mkdir web_component/rosen-web-component
cp dist/rosen-watchers/assets/README.md web_component/rosen-watchers
cp dist/rosen-watchers/* web_component/rosen-watchers
cp dist/rosen-chain-performance/* web_component/rosen-chain-performance
cp dist/rosen-web-component/* web_component/rosen-web-component
cp web_component/rosen-watchers/rosen_watchers.html web_component/rosen-watchers/index.html
cp web_component/rosen-chain-performance/rosen-chain-performance.html web_component/rosen-chain-performance/index.html
cp web_component/rosen-web-component/rosen-web-component.html web_component/rosen-web-component/index.html

tmpfile=$(mktemp)




tmpfile=$(mktemp)

cat web_component/rosen-web-component/runtime*.js >> "$tmpfile"
echo "" >> "$tmpfile"

cat web_component/rosen-web-component/scripts*.js >> "$tmpfile"
echo "" >> "$tmpfile"

cat web_component/rosen-web-component/main*.js >> "$tmpfile"
echo "" >> "$tmpfile"


version=$(jq -r '.appData.version' ngsw-config.json)
dest="web_component/rosen-web-component/rosen-watcher-components.$version.js"
mv "$tmpfile" "$dest"
sed -i "s|rosen-watcher-components.js|rosen-watcher-components.$version.js|g" web_component/rosen-web-component/index.html


