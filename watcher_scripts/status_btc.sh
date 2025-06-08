# Check Bitcoin RPC health with fail conditions
bitcoin_rpc_result=$(curl -s --fail --max-time 10 \
    --user pebblerye:pebblerye \
    --data-binary '{"jsonrpc":"1.0","id":"curltext","method":"getblockchaininfo","params":[]}' \
    -H 'content-type: text/plain;' \
    http://127.0.0.1:8332/)

# Exit immediately if curl failed (e.g., timeout, connection error, non-2xx)
if [ $? -ne 0 ]; then
    echo "Error: Failed to connect to Bitcoin RPC or received non-2xx HTTP response"
    exit 1
fi

# Parse the Bitcoin RPC response using jq
chain=$(echo "$bitcoin_rpc_result" | jq -r '.result.chain')
blocks=$(echo "$bitcoin_rpc_result" | jq -r '.result.blocks')
verification_progress=$(echo "$bitcoin_rpc_result" | jq -r '.result.verificationprogress')
initial_block_download=$(echo "$bitcoin_rpc_result" | jq -r '.result.initialblockdownload')

# Check if Bitcoin RPC is healthy based on response values
if [ "$initial_block_download" != "false" ] || (( $(echo "$verification_progress < 0.9999" | bc -l) )); then
    output+="Bitcoin RPC: Not fully synced (chain: $chain, blocks: $blocks, verification progress: $verification_progress)"$'\n'
fi

