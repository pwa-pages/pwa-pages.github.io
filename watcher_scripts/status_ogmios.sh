#!/bin/bash

# Make the request with a 10-second timeout
response=$(curl -s --max-time 10 -w "%{http_code}" -o /tmp/ogmios_health.json "http://192.168.178.227:1337/health")
curl_exit_code=$?

# Fail on curl error (e.g., timeout, network failure)
if [ $curl_exit_code -ne 0 ]; then
    echo "Error: Ogmios curl failed with exit code $curl_exit_code (timeout or network issue)"
    exit 1
fi

# Extract HTTP status code (last 3 chars of response)
http_status=${response: -3}

# Fail if not HTTP 200
if [ "$http_status" -ne 200 ]; then
    echo "Error: Ogmios health check returned HTTP status $http_status"
    exit 1
fi

# Extract and parse the JSON
ogmios_result=$(jq -r '.networkSynchronization, .connectionStatus' < /tmp/ogmios_health.json)

if [ -n "$ogmios_result" ]; then
    sync_status=$(echo "$ogmios_result" | head -n 1)
    conn_status=$(echo "$ogmios_result" | tail -n 1)
    
    if (( $(echo "$sync_status < 1.0" | bc -l) )) || [ "$conn_status" != "connected" ]; then
        output+="Ogmios: Synchronization is not complete ($sync_status) or connection issue ($conn_status)"$'\n'
    fi
fi

