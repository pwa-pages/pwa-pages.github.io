#!/bin/bash

# Hardcoded values for block heights and information
btc_height="884070"
bsc_height="46715971"
eth_height="21860655"
ergo_height="1462876"
cardano_block_hash="5c65c472182ca362035611828f66d0468901f244b1d55e8f1f656b8d821ef237"
cardano_block_height="11492744"
cardano_absolute_slot="148163110"

# Export variables for usage
export btc_height
export bsc_height
export eth_height
export ergo_height
export cardano_block_hash
export cardano_block_height
export cardano_absolute_slot

# Print the hardcoded values for verification
echo "Hardcoded Bitcoin (BTC) Block Height: $btc_height"
echo "Hardcoded Binance (BSC) Block Height: $bsc_height"
echo "Hardcoded Ethereum (ETH) Block Height: $eth_height"
echo "Hardcoded Ergo (ERG) Block Height: $ergo_height"
echo "Hardcoded Cardano (ADA) Block Info:"
echo "  Block Hash: $cardano_block_hash"
echo "  Block Height: $cardano_block_height"
echo "  Absolute Slot: $cardano_absolute_slot"
