# Check Ergo node health with fail conditions
ergo_result=$(curl -s --fail --max-time 10 "http://localhost:9053/info")

# Exit immediately if curl failed (e.g., timeout, connection error, non-2xx)
if [ $? -ne 0 ]; then
    echo "Error: Failed to connect to Ergo node or received non-2xx HTTP response"
    exit 1
fi

# Parse the Ergo node response using jq
full_height=$(echo "$ergo_result" | jq -r '.fullHeight')
max_peer_height=$(echo "$ergo_result" | jq -r '.maxPeerHeight')
peers_count=$(echo "$ergo_result" | jq -r '.peersCount')

# Check if the Ergo node is healthy
if [ "$full_height" -ne "$max_peer_height" ]; then
    output+="Ergo Node: Block height mismatch (local: $full_height, max peer: $max_peer_height)"$'\n'
fi

