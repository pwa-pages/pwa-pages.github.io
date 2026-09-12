#!/bin/bash

source /home/pebblerye/crypto_scripts/set_heights.sh

echo "Copying from runes template"

btc_height=$((btc_height - 10))

echo "Setting bitcoin height to local.yaml: $btc_height"

cp local.yaml local.yaml.prev
cp ../../config_templates/local.yaml.runes local.yaml

# Use double quotes to allow variable expansion in sed
sed -i "s/#BTC_HEIGHT#/$btc_height/g" local.yaml

set_watcher_generic.sh
