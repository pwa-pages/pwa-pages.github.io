#!/bin/bash

# Set locale for consistent decimal output
export LC_NUMERIC=C

# JSON-RPC endpoint of the BSC node (local or remote)
RPC_URL="http://192.168.178.227:8545"

# Send request to BSC node to check syncing status
response=$(curl -s --fail --max-time 10 -X POST \
  --data '{"jsonrpc":"2.0","method":"eth_syncing","params":[],"id":1}' \
  -H "Content-Type: application/json" \
  "$RPC_URL")

# Exit if the curl request failed
if [ $? -ne 0 ]; then
    echo "Error: Failed to connect to BSC node or received non-2xx HTTP response"
    exit 1
fi

# Determine if the node is syncing
is_syncing=$(echo "$response" | jq -r '.result')

# If syncing is false, the node is healthy
if [ "$is_syncing" == "false" ]; then
    exit 0
fi

# Otherwise, the node is syncing – do further checks
current_hex=$(echo "$response" | jq -r '.result.currentBlock')
highest_hex=$(echo "$response" | jq -r '.result.highestBlock')

# Fallback if missing data
if [ -z "$current_hex" ] || [ -z "$highest_hex" ]; then
    echo "BSC, Error: Missing currentBlock or highestBlock in sync response"
    exit 1
fi

current_dec=$((16#${current_hex#0x}))
highest_dec=$((16#${highest_hex#0x}))

# Prevent division by zero
if [ "$highest_dec" -eq 0 ]; then
    echo "BSC, Error: highestBlock is zero, cannot evaluate sync status"
    exit 1
fi

# Calculate sync progress (optional)
progress=$(echo "scale=2; $current_dec * 100 / $highest_dec" | bc)
echo "BSC Node is syncing: $current_dec/$highest_dec ($progress%)"
exit 1

