#!/bin/bash

source /home/youruser/crypto_scripts/set_heights.sh

echo "Extract mnemonic from local.yaml"
mnemonic=$(sed -n 's/.*mnemonic: "\([^"]*\)".*/\1/p' "local.yaml")


echo "Copying from bitcoin template"

btc_height=$((btc_height - 10))

echo "Setting bitvoin height to local.yaml: $btc_height"
echo "Setting ergo height to local.yaml: $ergo_height"

cp ../../config_templates/local.yaml.btc local.yaml

# Use double quotes to allow variable expansion in sed
sed -i "s/#BTC_HEIGHT#/$btc_height/g" local.yaml
sed -i "s/#ERGO_HEIGHT#/$ergo_height/g" local.yaml
sed -i "s/#MNEMONIC#/$mnemonic/g" local.yaml

