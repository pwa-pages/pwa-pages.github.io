cd /home/pebblerye/crypto_scripts

sleep 600

# Fetch Bitcoin block height
    echo "Fetching Bitcoin block height..."
    btc_height=$(curl -s --user pebblerye:pebblerye \
        --data-binary '{"jsonrpc":"1.0","id":"curltext","method":"getblockcount","params":[]}' \
        -H 'content-type: text/plain;' \
        http://127.0.0.1:8332/ | jq -r '.result')

    if [ -n "$btc_height" ]; then
        echo "Bitcoin (BTC) Block Height: $btc_height"
    else
        echo "Bitcoin (BTC): Unable to fetch block height"
        btc_height=""
    fi
    export btc_height

    echo "Fetching Ethereum block height..."
    eth_block_hex=$(curl -s -X POST -H "Content-Type: application/json" \
        --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
        http://localhost:8545 | jq -r '.result')

    if [ -n "$eth_block_hex" ]; then
        eth_height=$(printf "%d" "$eth_block_hex")
        echo "Ethereum (ETH) Block Height: $eth_height"
    else
        echo "Ethereum (ETH): Unable to fetch block height"
        eth_height=""
    fi
    export eth_height

    echo "Fetching Ergo block height..."
    ergo_height=$(curl -s http://localhost:9053/info | jq -r '.fullHeight')

    if [ -n "$ergo_height" ]; then
        echo "Ergo (ERG) Block Height: $ergo_height"
    else
        echo "Ergo (ERG): Unable to fetch block height"
        ergo_height=""
    fi
    export ergo_height

    echo "Fetching Cardano block info..."
    health_info=$(curl -s http://192.168.178.227:1337/health)

    if [ -n "$health_info" ]; then
        cardano_block_hash=$(echo "$health_info" | jq -r '.lastKnownTip.id')
        cardano_block_height=$(echo "$health_info" | jq -r '.lastKnownTip.height')
        cardano_absolute_slot=$(echo "$health_info" | jq -r '.lastKnownTip.slot')

        echo "Cardano (ADA) Latest Block Info:"
        echo "  Block Hash: $cardano_block_hash"
        echo "  Block Height: $cardano_block_height"
        echo "  Absolute Slot: $cardano_absolute_slot"
    else
        echo "Cardano (ADA): Unable to fetch health information"
        cardano_block_hash=""
        cardano_block_height=""
        cardano_absolute_slot=""
    fi
    export cardano_block_hash
    export cardano_block_height
    export cardano_absolute_slot


    # Fetch Binance Smart Chain (BSC) block height
    echo "Fetching Binance Smart Chain (BSC) block height..."
    bsc_block_hex=$(curl -s -X POST -H "Content-Type: application/json" \
        --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
        http://192.168.178.227:8545/ | jq -r '.result')

    if [ -n "$bsc_block_hex" ]; then
        bsc_block_height=$(printf "%d" "$bsc_block_hex")
        echo "Binance Smart Chain (BSC) Block Height: $bsc_block_height"
    else
        echo "Binance Smart Chain (BSC): Unable to fetch block height"
        bsc_block_height=""
    fi
    export bsc_block_height


# Generate a new script with hardcoded values
cat <<EOF > set_heights.sh
#!/bin/bash

# Hardcoded values for block heights and information
btc_height="$btc_height"
bsc_height="$bsc_block_height"
eth_height="$eth_height"
ergo_height="$ergo_height"
cardano_block_hash="$cardano_block_hash"
cardano_block_height="$cardano_block_height"
cardano_absolute_slot="$cardano_absolute_slot"

# Export variables for usage
export btc_height
export bsc_height
export eth_height
export ergo_height
export cardano_block_hash
export cardano_block_height
export cardano_absolute_slot

# Print the hardcoded values for verification
echo "Hardcoded Bitcoin (BTC) Block Height: \$btc_height"
echo "Hardcoded Binance (BSC) Block Height: \$bsc_height"
echo "Hardcoded Ethereum (ETH) Block Height: \$eth_height"
echo "Hardcoded Ergo (ERG) Block Height: \$ergo_height"
echo "Hardcoded Cardano (ADA) Block Info:"
echo "  Block Hash: \$cardano_block_hash"
echo "  Block Height: \$cardano_block_height"
echo "  Absolute Slot: \$cardano_absolute_slot"
EOF

echo "Generated 'set_heights.sh' with hardcoded values."

