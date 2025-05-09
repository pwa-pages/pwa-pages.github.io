#!/bin/bash

# Hardcoded values for block heights and information
btc_height="895920"
bsc_height="49350283"
eth_height="22443848"
ergo_height="1521010"
cardano_block_hash="dd36700487537fd6b44e8c1375eaee425064a22b4d31dd47f73b026d5626e9ce"
cardano_block_height="11840742"
cardano_absolute_slot="155202308"

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
