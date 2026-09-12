#!/bin/bash

source /home/pebblerye/crypto_scripts/set_heights.sh


echo "Extract mnemonic from local.yaml"
mnemonic=$(sed -n 's/.*mnemonic: "\([^"]*\)".*/\1/p' "local.yaml.prev")
echo "Extract api key from local.yaml"
apikey=$(sed -n "s/.*apiKeyHash: '\([^']*\)'.*/\1/p" "local.yaml.prev")

echo "Setting ergo height to local.yaml: $ergo_height"

sed -i "s/#ERGO_HEIGHT#/$ergo_height/g" local.yaml
sed -i "s/#MNEMONIC#/$mnemonic/g" local.yaml
sed -i "s/#APIKEY#/$apikey/g" local.yaml

