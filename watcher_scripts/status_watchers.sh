output=""

for port in 3031 3032 3034 3035 3036 3037 3039; do
    # Make request
    response=$(curl -s -w "%{http_code}" -o response.json "http://localhost:${port}/api/health/status")
    curl_exit_status=$?
    http_status=${response: -3}
    body=$(cat response.json)

    if [ $curl_exit_status -ne 0 ]; then
        echo "Watcher $port: Connection failed (curl exit status $curl_exit_status)"
        continue
    fi

    if echo "$body" | grep -q "ECONNREFUSED"; then
        echo "Error: watcher $port returned body with ECONNREFUSED"
        continue
    fi

    if [[ "$http_status" =~ ^5[0-9]{2}$ ]]; then
        echo "Error: watcher $port returned HTTP status $http_status"
        continue
    fi

    # Extract problems
    result=$(echo "$body" | jq -r --arg port "$port" '.[] | select(.status == "Unstable" or .status == "Broken") | "watcher \($port): \(.title): \(.status), \(.details // "No details provided")"')

    if [ -n "$result" ]; then
        echo "$result"
        output+="$result"$'\n'
    fi
done

# Optionally show collected output at the end
if [ -n "$output" ]; then
    echo -e "\nSummary of issues detected:"
    echo "$output"
    exit 1  # Fail the script if issues were found
fi

