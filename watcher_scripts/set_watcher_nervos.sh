#!/bin/bash

source /home/pebblerye/crypto_scripts/set_heights.sh

echo "Copying from nervos template"

nervos_height=$((nervos_height - 10))

echo "Setting nervos height to local.yaml: $nervos_height"

cp local.yaml local.yaml.prev
cp ../../config_templates/local.yaml.nervos local.yaml

# Use double quotes to allow variable expansion in sed
sed -i "s/#NERVOS_HEIGHT#/$nervos_height/g" local.yaml

set_watcher_generic.sh
