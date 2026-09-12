#!/bin/bash

source /home/pebblerye/crypto_scripts/set_heights.sh


echo "Copying from cardano template"

echo "Setting cardano block hash to local.yaml: $cardano_block_hash"
echo "Setting cardano block height to local.yaml: $cardano_block_height"
echo "Setting cardano absolute slot to local.yaml: $cardano_absolute_slot"

cp local.yaml local.yaml.prev
cp ../../config_templates/local.yaml.cardano local.yaml

# Use double quotes to allow variable expansion in sed
sed -i "s/#CARDANO_HASH#/$cardano_block_hash/g" local.yaml
sed -i "s/#CARDANO_HEIGHT#/$cardano_block_height/g" local.yaml
sed -i "s/#CARDANO_SLOT#/$cardano_absolute_slot/g" local.yaml

set_watcher_generic.sh
