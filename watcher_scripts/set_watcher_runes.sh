#!/bin/bash

source /home/pebblerye/crypto_scripts/set_heights.sh

echo "Extract mnemonic from local.yaml"
mnemonic=$(sed -n 's/.*mnemonic: "\([^"]*\)".*/\1/p' "local.yaml")


echo "Copying from runes template"

btc_height=$((btc_height - 10))

echo "Setting bitcoin height to local.yaml: $btc_height"
echo "Setting ergo height to local.yaml: $ergo_height"

cp ../../config_templates/local.yaml.runes local.yaml

# Use double quotes to allow variable expansion in sed
sed -i "s/#BTC_HEIGHT#/$btc_height/g" local.yaml
sed -i "s/#ERGO_HEIGHT#/$ergo_height/g" local.yaml
sed -i "s/#MNEMONIC#/$mnemonic/g" local.yaml

