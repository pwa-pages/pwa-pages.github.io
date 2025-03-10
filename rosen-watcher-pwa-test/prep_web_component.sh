#!/bin/bash

cp dist/rosen-watchers/assets/*.html  dist/rosen-watchers/
cp dist/rosen-chain-performance/assets/*.html  dist/rosen-chain-performance/


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

for file in "$dir"main*.js "$dir"runtime*.js "$dir"styles*.css; do
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
    elif [[ "$filename" == styles*.css ]]; then
      sed -i "s|{{styles.css}}|$filename|g" dist/rosen-chain-performance/rosen-chain-performance.html
      echo "Replaced {{styles.css}} with $filename in dist/rosen-chain-performance/rosen-chain-performance.html"
    fi
  fi
done

rm web_component/*
cp dist/rosen-watchers/* web_component/
cp dist/rosen-chain-performance/* web_component/
