cd /home/pebblerye/crypto_scripts




    echo "Fetching Ergo block height..."
    ergo_height=$(curl -s https://node-p2p.ergoplatform.com/info | jq -r '.fullHeight')

    if [ -n "$ergo_height" ]; then
        echo "Ergo (ERG) Block Height: $ergo_height"
    else
        echo "Ergo (ERG): Unable to fetch block height"
        ergo_height=""
    fi
    export ergo_height

# Generate a new script with hardcoded values
cat <<EOF > set_heights.sh
#!/bin/bash

# Hardcoded values for block heights and information
btc_height="$btc_height"
bsc_height="$bsc_block_height"
eth_height="$eth_height"
ergo_height="$ergo_height"
doge_height="$doge_height"
cardano_block_hash="$cardano_block_hash"
cardano_block_height="$cardano_block_height"
cardano_absolute_slot="$cardano_absolute_slot"

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
echo "Hardcoded Bitcoin (BTC) Block Height: \$btc_height"
echo "Hardcoded Binance (BSC) Block Height: \$bsc_height"
echo "Hardcoded Ethereum (ETH) Block Height: \$eth_height"
echo "Hardcoded Ergo (ERG) Block Height: \$ergo_height"
echo "Hardcoded Doge Block Height: \$doge_height"
echo "Hardcoded Cardano (ADA) Block Info:"
echo "  Block Hash: \$cardano_block_hash"
echo "  Block Height: \$cardano_block_height"
echo "  Absolute Slot: \$cardano_absolute_slot"
EOF

echo "Generated 'set_heights.sh' with hardcoded values."

