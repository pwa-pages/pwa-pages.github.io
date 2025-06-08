#!/bin/bash

# Hardcoded values for block heights and information
btc_height=""
bsc_height="51083316"
eth_height=""
ergo_height="1542482"
cardano_block_hash="33beeb09848f23f46b1855e7f328515afe1568d3685bf8f18d6024ea8c877160"
cardano_block_height="11969232"
cardano_absolute_slot="157802708"

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
