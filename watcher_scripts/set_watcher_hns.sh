#!/bin/bash

source /home/pebblerye/crypto_scripts/set_heights.sh

echo "Copying from hns template"

hns_height=$((hns_height - 10))

echo "Setting hns height to local.yaml: $hns_height"

cp local.yaml local.yaml.prev
cp ../../config_templates/local.yaml.hns local.yaml

# Use double quotes to allow variable expansion in sed
sed -i "s/#HNS_HEIGHT#/$hns_height/g" local.yaml

set_watcher_generic.sh
