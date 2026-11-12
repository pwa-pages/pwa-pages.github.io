
#!/bin/bash

output=""

for port in {3031..3039}; do
    response_file=$(mktemp)

    http_status=$(curl -s -w "%{http_code}" \
        -o "$response_file" \
        "http://localhost:${port}/api/health/status")

    curl_exit_status=$?
    body=$(cat "$response_file")
    rm -f "$response_file"

    if [ "$curl_exit_status" -ne 0 ]; then
        result="Connection failed"
    elif echo "$body" | grep -q "ECONNREFUSED"; then
        result="ECONNREFUSED"
    elif [[ "$http_status" =~ ^5[0-9]{2}$ ]]; then
        result="HTTP $http_status"
    else
        result=$(echo "$body" | jq -r '
            [
                .[]
                | select(.status == "Unstable" or .status == "Broken")
                | if (.title | test("Logs$"; "i")) then
                    .title
                  else
                    "\(.title): \(.status)"
                  end
            ]
            | unique
            | join(" | ")
        ' 2>/dev/null)
    fi

    if [ -n "$result" ]; then
        line="watcher $port: $result"
        echo "$line"
        output+="$line"$'\n'
    fi
done

