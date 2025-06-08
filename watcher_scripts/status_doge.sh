# Dogecoin RPC health check
doge_rpc_result=$(curl -s --fail --max-time 10 \
  --user doge:doge \
  --data-binary '{"jsonrpc":"1.0","id":"curltext","method":"getblockchaininfo","params":[]}' \
  -H 'content-type: text/plain;' \
  http://192.168.178.227:22555/)

# Exit if curl failed
if [ $? -ne 0 ]; then
    echo "Error: Failed to connect to Dogecoin RPC or received non-2xx HTTP response"
    exit 1
fi

# Parse the Dogecoin RPC response using jq
doge_chain=$(echo "$doge_rpc_result" | jq -r '.result.chain')
doge_blocks=$(echo "$doge_rpc_result" | jq -r '.result.blocks')
doge_verification_progress=$(echo "$doge_rpc_result" | jq -r '.result.verificationprogress')
doge_initial_block_download=$(echo "$doge_rpc_result" | jq -r '.result.initialblockdownload')

# Check if Dogecoin RPC is healthy
if [ "$doge_initial_block_download" != "false" ] || (( $(echo "$doge_verification_progress < 0.9999" | bc -l) )); then
    echo "Dogecoin RPC: Not fully synced (chain: $doge_chain, blocks: $doge_blocks, verification progress: $doge_verification_progress)"
    exit 1
fi

