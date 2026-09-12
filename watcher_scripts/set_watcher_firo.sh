#!/bin/bash

source /home/pebblerye/crypto_scripts/set_heights.sh


echo "Copying from firo template"

firo_height=$((firo_height - 10))

echo "Setting firo height to local.yaml: $firo_height"

cp local.yaml local.yaml.prev
cp ../../config_templates/local.yaml.firo local.yaml

# Use double quotes to allow variable expansion in sed
sed -i "s/#FIRO_HEIGHT#/$firo_height/g" local.yaml

set_watcher_generic.sh
