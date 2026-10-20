#!/bin/bash

eth_sync_result=$(curl -s --fail --connect-timeout 10 --max-time 10 \
    -X POST -H "Content-Type: application/json" \
    --data '{"jsonrpc":"2.0","method":"eth_syncing","params":[],"id":1}' \
    http://localhost:8545)

if [ $? -ne 0 ]; then
    echo "Error: Failed to connect to Ethereum node"
    exit 1
fi

sync_status=$(echo "$eth_sync_result" | jq -er '
    def hexdec:
      ltrimstr("0x") | ascii_downcase | explode
      | reduce .[] as $c (0;
          . * 16 + (if $c <= 57 then $c - 48 else $c - 87 end)
        );

    if .result == false then
      "Synced"
    elif (.result | type) == "object" then
      (.result.currentBlock | hexdec) as $current |
      (.result.highestBlock | hexdec) as $highest |
      if $highest > 0 then
        "Syncing (\(($current / $highest * 10000 | floor) / 100)%)"
      else
        "Syncing (0%)"
      end
    else
      error("Invalid Ethereum RPC response")
    end
') || {
    echo "Error: Failed to parse Ethereum sync status"
    exit 1
}

# Exit silently if fully synced
if [[ "$sync_status" == "Synced" ]]; then
    exit 0
fi

echo "Ethereum Node: $sync_status"
