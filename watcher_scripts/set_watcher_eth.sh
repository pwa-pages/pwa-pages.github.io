#!/bin/bash

source /home/youruser/crypto_scripts/set_heights.sh

echo "Extract mnemonic from local.yaml"
mnemonic=$(sed -n 's/.*mnemonic: "\([^"]*\)".*/\1/p' "local.yaml")


echo "Copying from ethereum template"

echo "Setting ethereum height to local.yaml: $eth_height"
echo "Setting ergo height to local.yaml: $ergo_height"

cp ../../config_templates/local.yaml.eth local.yaml

# Use double quotes to allow variable expansion in sed
sed -i "s/#ETH_HEIGHT#/$eth_height/g" local.yaml
sed -i "s/#ERGO_HEIGHT#/$ergo_height/g" local.yaml
sed -i "s/#MNEMONIC#/$mnemonic/g" local.yaml

