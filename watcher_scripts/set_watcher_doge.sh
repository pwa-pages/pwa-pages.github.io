#!/bin/bash

source /home/pebblerye/crypto_scripts/set_heights.sh

echo "Copying from doge template"
doge_height=$((doge_height - 10))
echo "Setting doge height to local.yaml: $doge_height"

cp local.yaml local.yaml.prev
cp ../../config_templates/local.yaml.doge local.yaml

# Use double quotes to allow variable expansion in sed
sed -i "s/#DOGE_HEIGHT#/$doge_height/g" local.yaml

set_watcher_generic.sh
