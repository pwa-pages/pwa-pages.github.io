#!/bin/bash

source /home/youruser/crypto_scripts/set_heights.sh

echo "Extract mnemonic from local.yaml"
mnemonic=$(sed -n 's/.*mnemonic: "\([^"]*\)".*/\1/p' "local.yaml")


echo "Copying from binance template"

bsc_height=$((bsc_height - 10))

echo "Setting binance height to local.yaml: $bsc_height"
echo "Setting ergo height to local.yaml: $ergo_height"

cp ../../config_templates/local.yaml.bsc local.yaml

# Use double quotes to allow variable expansion in sed
sed -i "s/#BSC_HEIGHT#/$bsc_height/g" local.yaml
sed -i "s/#ERGO_HEIGHT#/$ergo_height/g" local.yaml
sed -i "s/#MNEMONIC#/$mnemonic/g" local.yaml

