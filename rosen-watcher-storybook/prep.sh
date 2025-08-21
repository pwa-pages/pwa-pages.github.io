#!/bin/bash

cp .storybook/preview_template.js .storybook/preview.js 

dir="./public/" 

for file in "$dir"rosen*.js "$dir"styles*.css; do
  if [[ -f "$file" ]]; then

    filename=$(basename "$file")


    
    if [[ "$filename" == styles*.css ]]; then
      sed -i "s|{{styles.css}}|$filename|g" .storybook/preview.js
      echo "Replaced {{styles.css}} with $filename"
      
    fi
    
   if [[ "$filename" == rosen*.js ]]; then
      sed -i "s|{{rosen.js}}|$filename|g" .storybook/preview.js
      echo "Replaced {{rosen.css}} with $filename"
      
    fi

  fi
done

zip -j public/rosen_components.zip public/rosen-chain-performance.html  public/rosen-statistics.html public/rosen-watchers.html public/rosen*.js public/styles*.css
