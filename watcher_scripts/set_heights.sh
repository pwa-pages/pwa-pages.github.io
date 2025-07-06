#!/bin/bash

# Hardcoded values for block heights and information
btc_height="904222"
bsc_height="51089300"
eth_height=""
ergo_height="1562326"
doge_height="5780483"
cardano_block_hash="a86a48e71d2764767cd18ba55986935c34d832f0e5abc95f178ad1a406483dd8"
cardano_block_height="12087873"
cardano_absolute_slot="160200284"

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
