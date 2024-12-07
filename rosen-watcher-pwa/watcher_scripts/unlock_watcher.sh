#!/bin/bash

# Script to unlock watcher
# Adapt if needed
# Script checks active permits and tries to unlock them
# Every time a permit is released, the retry of this script
# will unlock this permit until no permits are left 
# and the complete watcher is unlocked
# after that simpy stop the script

  # Ask the user for the API key
  read -p "Please enter your API key: " API_KEY

while true; do

  # Define the .env file path
  ENV_FILE=".env"

  # Check if .env file exists in the current directory
  if [ ! -f "$ENV_FILE" ]; then
    echo "Error: $ENV_FILE file not found in the current directory."
    exit 1
  fi

  # Extract the WATCHER_PORT value from the .env file
  PORT=$(grep "^WATCHER_PORT=" "$ENV_FILE" | cut -d '=' -f 2)

  # Check if WATCHER_PORT is set
  if [ -z "$PORT" ]; then
    echo "Error: WATCHER_PORT is not set in $ENV_FILE."
    exit 1
  fi



  # Fetch the JSON data from the API
  api_url="http://localhost:$PORT/api/info"
  response=$(curl -s "$api_url")

  # Extract the active permit count using jq
  active_permit_count=$(echo "$response" | jq '.permitCount.active')

  # Output the active permit count
  echo "Active Permit Count: $active_permit_count"

  # Define other constants
  URL="http://localhost:$PORT/api/permit/return"
  CONTENT_TYPE="application/json"
  DATA="{\"count\":\"$active_permit_count\"}"

  # Make the curl request
  RESPONSE=$(curl -X POST "$URL" \
    -H "Content-Type: $CONTENT_TYPE" \
    -H "Api-Key: $API_KEY" \
    -d "$DATA" \
    --write-out "\nHTTP_CODE:%{http_code}")

  # Extract HTTP code and response body separately
  HTTP_CODE=$(echo "$RESPONSE" | sed -n 's/.*HTTP_CODE:\([0-9]*\)/\1/p')
  BODY=$(echo "$RESPONSE" | sed 's/HTTP_CODE:[0-9]*//')

  # Output the body and HTTP return code
  echo "Response Body: $BODY"
  echo "HTTP Return Code: $HTTP_CODE"

  sleep 10
done

