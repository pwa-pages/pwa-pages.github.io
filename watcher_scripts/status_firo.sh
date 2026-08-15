# Firo health check
firo_response=$(curl -sS --max-time 10 \
    --user "myuser:mypassword" \
    -H "Content-Type: application/json" \
    --data-binary '{"jsonrpc":"1.0","id":"healthcheck","method":"getblockcount","params":[]}' \
    -w "\n%{http_code}" \
    http://127.0.0.1:8382/)
curl_exit_code=$?

if [ "$curl_exit_code" -ne 0 ]; then
    echo "Firo: ERROR - connection failed"
    exit 1
fi

http_status=$(echo "$firo_response" | tail -n 1)
firo_body=$(echo "$firo_response" | sed '$d')

if [ "$http_status" -ne 200 ]; then
    echo "Firo: ERROR - HTTP status $http_status"
    exit 1
fi

rpc_error=$(echo "$firo_body" | jq -r '.error // empty')
firo_result=$(echo "$firo_body" | jq -r '.result // empty')

if [ -n "$rpc_error" ] || [ -z "$firo_result" ]; then
    echo "Firo: ERROR - RPC issue"
    exit 1
fi

