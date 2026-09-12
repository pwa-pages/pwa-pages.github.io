#!/bin/bash

source /home/pebblerye/crypto_scripts/set_heights.sh

echo "Copying from binance template"
bsc_height=$((bsc_height - 10))
echo "Setting binance height to local.yaml: $bsc_height"

cp local.yaml local.yaml.prev
cp ../../config_templates/local.yaml.bsc local.yaml

sed -i "s/#BSC_HEIGHT#/$bsc_height/g" local.yaml

set_watcher_generic.sh
