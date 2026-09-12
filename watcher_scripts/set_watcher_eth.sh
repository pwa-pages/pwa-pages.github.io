#!/bin/bash

source /home/pebblerye/crypto_scripts/set_heights.sh

echo "Copying from ethereum template"
echo "Setting ethereum height to local.yaml: $eth_height"

cp local.yaml local.yaml.prev
cp ../../config_templates/local.yaml.eth local.yaml

sed -i "s/#ETH_HEIGHT#/$eth_height/g" local.yaml

set_watcher_generic.sh
