#!/bin/bash

# Hardcoded values for block heights and information
btc_height="925694"
bsc_height="69885751"
eth_height=""
ergo_height="1666717"
doge_height="5980122"
cardano_block_hash="3e7453cf67da63481e5312d7e2634f9a58e363eb2b442f9ed03172fef18edb21"
cardano_block_height="12711322"
cardano_absolute_slot="172849459"

# Export variables for usage
export btc_height
export bsc_height
export eth_height
export ergo_height
export doge_height
export cardano_block_hash
export cardano_block_height
export cardano_absolute_slot

# Print the hardcoded values for verification
echo "Hardcoded Bitcoin (BTC) Block Height: $btc_height"
echo "Hardcoded Binance (BSC) Block Height: $bsc_height"
echo "Hardcoded Ethereum (ETH) Block Height: $eth_height"
echo "Hardcoded Ergo (ERG) Block Height: $ergo_height"
echo "Hardcoded Doge Block Height: $doge_height"
echo "Hardcoded Cardano (ADA) Block Info:"
echo "  Block Hash: $cardano_block_hash"
echo "  Block Height: $cardano_block_height"
echo "  Absolute Slot: $cardano_absolute_slot"
