#!/bin/bash

# Hardcoded values for block heights and information
btc_height=""
firo_height="1359417"
hns_height="342720"
bsc_height=""
eth_height=""
ergo_height="1413873"
doge_height=""
cardano_block_hash=""
cardano_block_height=""
cardano_absolute_slot=""

# Export variables for usage
export btc_height
export firo_height
export hns_height
export bsc_height
export eth_height
export ergo_height
export doge_height
export cardano_block_hash
export cardano_block_height
export cardano_absolute_slot

# Print the hardcoded values for verification
echo "Hardcoded Bitcoin (BTC) Block Height: $btc_height"
echo "Hardcoded FIRO Block Height: $firo_height"
echo "Hardcoded HNS Block Height: $hns_height"
echo "Hardcoded Binance (BSC) Block Height: $bsc_height"
echo "Hardcoded Ethereum (ETH) Block Height: $eth_height"
echo "Hardcoded Ergo (ERG) Block Height: $ergo_height"
echo "Hardcoded Doge Block Height: $doge_height"
echo "Hardcoded Cardano (ADA) Block Info:"
echo "  Block Hash: $cardano_block_hash"
echo "  Block Height: $cardano_block_height"
echo "  Absolute Slot: $cardano_absolute_slot"
