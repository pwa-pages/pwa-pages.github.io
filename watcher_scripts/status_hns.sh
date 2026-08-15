# HNS health check
hns_response=$(curl -sS --max-time 10 \
    --user "x:YOUR_SECRET" \
    -H "Content-Type: application/json" \
    --data '{"method":"getblockchaininfo","params":[],"id":1}' \
    -w "\n%{http_code}" \
    http://192.168.178.227:12037/)
curl_exit_code=$?

# Fail on curl error (timeout, network failure, etc.)
if [ "$curl_exit_code" -ne 0 ]; then
    echo "Error: HNS curl failed with exit code $curl_exit_code (timeout or network issue)"
    exit 1
fi

# Separate body from HTTP status
http_status=$(echo "$hns_response" | tail -n 1)
hns_body=$(echo "$hns_response" | sed '$d')

# Fail if not HTTP 200
if [ "$http_status" -ne 200 ]; then
    echo "Error: HNS health check returned HTTP status $http_status"
    exit 1
fi

# Check for JSON-RPC error
rpc_error=$(echo "$hns_body" | jq -r '.error // empty')

if [ -n "$rpc_error" ]; then
    echo "Error: HNS RPC returned an error: $rpc_error"
    exit 1
fi

# Extract current block height
hns_blocks=$(echo "$hns_body" | jq -r '.result.blocks // empty')

if ! [[ "$hns_blocks" =~ ^[0-9]+$ ]]; then
    echo "Error: HNS returned an invalid block height: $hns_blocks"
    exit 1
fi

