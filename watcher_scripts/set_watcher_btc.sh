#!/bin/bash

source /home/pebblerye/crypto_scripts/set_heights.sh

echo "Copying from bitcoin template"

btc_height=$((btc_height - 10))

echo "Setting bitcoin height to local.yaml: $btc_height"
echo "Setting ergo height to local.yaml: $ergo_height"

cp local.yaml local.yaml.prev
cp ../../config_templates/local.yaml.btc local.yaml

# Use double quotes to allow variable expansion in sed
sed -i "s/#BTC_HEIGHT#/$btc_height/g" local.yaml

set_watcher_generic.sh
