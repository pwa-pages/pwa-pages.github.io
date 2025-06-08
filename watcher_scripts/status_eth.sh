#!/bin/bash

output=""

# Check Ethereum node sync status
eth_sync_result=$(curl -s --fail --connect-timeout 10 --max-time 10 \
    -X POST -H "Content-Type: application/json" \
    --data '{"jsonrpc":"2.0","method":"eth_syncing","params":[],"id":1}' \
    http://localhost:8545)

# Exit if Ethereum RPC request fails
if [ $? -ne 0 ]; then
    echo "Error: Failed to connect to Ethereum node or received non-2xx HTTP response"
    exit 1
fi

# Parse the Ethereum sync response
eth_syncing=$(echo "$eth_sync_result" | jq -r '.result')

# Check if Ethereum node is syncing
if [ "$eth_syncing" != "false" ]; then
    starting_block=$(echo "$eth_syncing" | jq -r '.startingBlock // empty')
    current_block=$(echo "$eth_syncing" | jq -r '.currentBlock // empty')
    highest_block=$(echo "$eth_syncing" | jq -r '.highestBlock // empty')
    
    output+="Ethereum Node: Syncing in progress (starting block: $starting_block, current block: $current_block, highest block: $highest_block)"$'\n'
fi


beacon_status_code=$(curl -s -o /dev/null -w "%{http_code}" \
    --connect-timeout 10 --max-time 10 \
    http://localhost:8080/metrics)

if ! [[ "$beacon_status_code" =~ ^2[0-9]{2}$ ]]; then
    output+="Beacon Node: Unhealthy or unreachable (HTTP status: $beacon_status_code)"$'\n'
fi

# Final combined success message
if [ -z "$output" ] && [ "$ergo_api_status" = true ]; then
    echo "All watchers, Ogmios, Bitcoin RPC, Ergo, Ethereum nodes, and Ergo Platform API healthy"
else
    printf "%s" "$output"
fi

