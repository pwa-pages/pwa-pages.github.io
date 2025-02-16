#!/bin/bash

# Script to unlock watcher permits
# This script checks for active permits and attempts to release them iteratively
# until no permits remain, unlocking the watcher.

# script uses http://localhost:$PORT/api/info as url, this should probably work
# if not change this part to match you watcher address (service container)

# Define the path to the .env file
ENV_FILE=".env"

# Ensure the .env file exists in the current directory
if [ ! -f "$ENV_FILE" ]; then
  echo "Error: The $ENV_FILE file is not found in the current directory."
  exit 1
fi

# Extract the WATCHER_PORT value from the .env file
PORT=$(grep "^WATCHER_PORT=" "$ENV_FILE" | cut -d '=' -f 2)

# Validate the WATCHER_PORT value
if [ -z "$PORT" ]; then
  echo "Error: WATCHER_PORT is not set in $ENV_FILE."
  exit 1
fi

# Obtain the API key from the first argument or prompt the user
API_KEY="$1"
if [ -z "$API_KEY" ]; then
  read -sp "Enter API Key: " API_KEY
  echo
fi

# Validate the provided API key
if [ -z "$API_KEY" ]; then
  echo "Error: API Key is required to proceed."
  exit 1
fi

# Main loop to release permits
while true; do
  # Fetch permit information from the API
  api_url="http://localhost:$PORT/api/info"
  response=$(curl -s "$api_url")
  if [ $? -ne 0 ]; then
    echo "Error: curl command failed."
    
    
    echo "Do you want to continue deploying? (yes/no)"
    read user_input

    # Check if user input is "yes"
    if [[ "$user_input" == "yes" ]]; then

      exit 0
    fi
    
    exit 1
  fi



  # Validate API response
  if [ -z "$response" ]; then
    echo "Error: Failed to fetch permit information from $api_url."
    exit 1
  fi
  
  if echo "$response" | grep -q "EAI_AGAIN"; then
    echo "Network error (EAI_AGAIN) encountered. Retrying in 10 seconds."
    sleep 10
    continue
  fi

  echo "Parsing info response to see how many permits are in total and active."
  echo " response = $response"
  # Parse the active permit count using jq
  active_permit_count=$(echo "$response" | jq '.permitCount.active' 2>/dev/null)
  total_permit_count=$(echo "$response" | jq '.permitCount.total' 2>/dev/null)

  # Check if parsing was successful
  if [ -z "$active_permit_count" ] || ! [[ "$active_permit_count" =~ ^[0-9]+$ ]]; then
    echo "Error: Unable to retrieve valid active permit count from the API response."
    echo "Actual response was: "
    echo "$response"
    
    exit 1
  fi

  if [ "$active_permit_count" -eq 0 ] && [ "$total_permit_count" -ne 0 ]; then
    echo "Active permits seems 0. Waiting 10 seconds before checking again."
    sleep 10
    continue
  fi

  echo "Active Permit Count: $active_permit_count"

  # Construct the API request to release permits
  URL="http://localhost:$PORT/api/permit/return"
  CONTENT_TYPE="application/json"
  DATA="{\"count\":\"$active_permit_count\"}"

  # Make the POST request
  RESPONSE=$(curl -s -X POST "$URL" \
    -H "Content-Type: $CONTENT_TYPE" \
    -H "Api-Key: $API_KEY" \
    -d "$DATA" \
    --write-out "\nHTTP_CODE:%{http_code}")

  # Extract the HTTP status code and response body
  HTTP_CODE=$(echo "$RESPONSE" | sed -n 's/.*HTTP_CODE:\([0-9]*\)/\1/p')
  BODY=$(echo "$RESPONSE" | sed 's/HTTP_CODE:[0-9]*//')

  echo "Response Body: $BODY"
  echo "HTTP Status Code: $HTTP_CODE"

  # Check for "No permit found" in the response body
  if echo "$BODY" | grep -q "No permit found"; then
    echo "No permits left to unlock. Watcher successfully unlocked."
    exit 0
  fi

  # Handle unexpected HTTP status codes
  if [ "$HTTP_CODE" -ne 200 ] && [ "$HTTP_CODE" -ne 400 ]; then
    echo "Error: Unexpected HTTP Status Code $HTTP_CODE. Exiting with failure."
    exit 1
  fi

  echo "Waiting 10 sec. before trying to unlock more permits or waiting until watcher is completely unlocked."
  echo
  echo
  sleep 10
done

