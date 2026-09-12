#!/bin/bash

source /home/pebblerye/crypto_scripts/set_heights.sh


echo "Copying from ergo template"

echo "Setting ergo height to local.yaml: $ergo_height"

cp local.yaml local.yaml.prev
cp ../../config_templates/local.yaml.ergo local.yaml

set_watcher_generic.sh
