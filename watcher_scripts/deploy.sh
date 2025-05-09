#!/bin/bash

# Ensure the script receives a valid 'ergo_value' as a parameter
if [ -z "$1" ]; then
  echo "Usage: $0 <ergo_value>"
  exit 1
fi

WATCHER=$1  # Assign the first argument to the WATCHER variable
COMPOSE_FILE="docker-compose.yaml"
CURRENT_DIR=$(pwd)

if ! systemctl is-active --quiet docker; then
  echo "Docker is not running. Please start Docker first."
  exit 1
fi

OUTPUT=$(docker compose -f "$CURRENT_DIR/$COMPOSE_FILE" ps --services --status running)

EXPECTED_SERVICES="db service ui"

if echo "$OUTPUT" | grep -q -E "\b(db|service|ui)\b"; then
  echo "Docker Compose services are already running for $COMPOSE_FILE in $CURRENT_DIR. Exiting."
  exit 0
fi

cd config

# Dynamically invoke the script based on the 'WATCHER' variable
set_watcher_"$WATCHER".sh

cd ..

reinstall_watcher.sh
echo "Sleeping 30 seconds..."
sleep 30
./lock.sh
echo "Sleeping another 30 seconds..."
sleep 30
./lock.sh
echo "Sleeping another 30 seconds..."
sleep 30
./lock.sh
echo "Sleeping another 30 seconds..."
sleep 30
./lock.sh
echo "Sleeping another 30 seconds..."
sleep 30
./lock.sh

