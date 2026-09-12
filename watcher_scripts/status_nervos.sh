# Nervos CKB health check
nervos_response=$(curl -sS --max-time 10 \
    -H "Content-Type: application/json" \
    --data-binary '{"jsonrpc":"2.0","id":1,"method":"get_tip_block_number","params":[]}' \
    -w "\n%{http_code}" \
    http://192.168.178.227:8114/)
curl_exit_code=$?

if [ "$curl_exit_code" -ne 0 ]; then
    echo "Nervos: ERROR - connection failed"
    exit 1
fi

http_status=$(echo "$nervos_response" | tail -n 1)
nervos_body=$(echo "$nervos_response" | sed '$d')

if [ "$http_status" -ne 200 ]; then
    echo "Nervos: ERROR - HTTP status $http_status"
    exit 1
fi

rpc_error=$(echo "$nervos_body" | jq -r '.error // empty')
nervos_result=$(echo "$nervos_body" | jq -r '.result // empty')

if [ -n "$rpc_error" ] || [ -z "$nervos_result" ]; then
    echo "Nervos: ERROR - RPC issue"
    exit 1
fi
