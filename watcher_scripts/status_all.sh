#!/bin/bash

/home/pebblerye/crypto_scripts/status_devices.sh
# Set the locale to ensure decimal point is used (dot instead of comma)
export LC_NUMERIC=C

# Extract relevant values from vmstat -s output
total_ram=$(vmstat -s | awk '/total memory/ {print $1}')
free_ram=$(vmstat -s | awk '/free memory/ {print $1}')
inactive_ram=$(vmstat -s | awk '/inactive memory/ {print $1}')
total_cache=$(vmstat -s | awk '/cache/ {print $1}')

# Calculate used RAM (Total RAM - Free RAM)
used_ram=$((total_ram - free_ram))

# Convert values from KB to GB, limiting bc output to 1 decimal place
total_ram_gb=$(echo "scale=1; $total_ram / 1024 / 1024" | bc)
free_ram_gb=$(echo "scale=1; $free_ram / 1024 / 1024" | bc)
used_ram_gb=$(echo "scale=1; $used_ram / 1024 / 1024" | bc)
inactive_ram_gb=$(echo "scale=1; $inactive_ram / 1024 / 1024" | bc)
cache_gb=$(echo "scale=1; $total_cache / 1024 / 1024" | bc)

# Display results with 1 decimal place
printf "Total RAM: %.1f GB\n" "$total_ram_gb"
printf "Used RAM: %.1f GB\n" "$used_ram_gb"
printf "Free RAM: %.1f GB\n" "$free_ram_gb"
printf "Inactive RAM: %.1f GB\n" "$inactive_ram_gb"
printf "Cache: %.1f GB\n" "$cache_gb"
echo
echo


# Get the available disk space in bytes
available_space=$(df --block-size=1 --output=avail / | tail -n 1)

# Convert available space from bytes to TB and format to 2 decimal places
available_space_tb=$(echo "scale=2; $available_space / (1024^4)" | bc)

# Output the result
echo "Available disk space: $available_space_tb TB"

echo
echo


output=""

# Ping API to check availability of all its IPs (api.ergoplatform.com)
ping_success_count=0
ping_attempts=5  # Number of ping attempts for each IP address
ping_output=""

# Resolve the domain to get its IPs
ip_addresses=$(dig +short api.ergoplatform.com)

# Check if any IP addresses were returned by dig
if [ -z "$ip_addresses" ]; then
    output+="Ergo Platform API: Domain resolution failed, no IP addresses found for api.ergoplatform.com\n"
    ergo_api_status=false
else
    ergo_api_status=true  # Assume success until proven otherwise

    # Track whether all pings are successful
    all_ips_successful=true

    # Check each IP address returned by dig
    for ip in $ip_addresses; do
        ip_success=false
        # Perform multiple pings for each IP address
        for attempt in $(seq 1 $ping_attempts); do
            if ping -c 1 -W 1 $ip > /dev/null 2>&1; then
                ping_success_count=$((ping_success_count + 1))
                ip_success=true
                break  # Exit after the first successful ping for this IP
            fi
        done

        # Record result of each IP ping attempt
        if [ "$ip_success" = true ]; then
            ping_output+="Ping to $ip succeeded\n"
        else
            ping_output+="Ping to $ip failed after $ping_attempts attempts\n"
            all_ips_successful=false
        fi
    done

    # Update ergo_api_status based on ping results
    if [ "$all_ips_successful" = true ]; then
        ergo_api_status=true
    else
        output+="Ergo Platform API: Connectivity issues detected:\n$ping_output\n"
        ergo_api_status=false
    fi
fi

/home/pebblerye/crypto_scripts/status_ogmios.sh
/home/pebblerye/crypto_scripts/status_btc.sh
/home/pebblerye/crypto_scripts/status_ergo.sh
/home/pebblerye/crypto_scripts/status_binance.sh
/home/pebblerye/crypto_scripts/status_doge.sh
/home/pebblerye/crypto_scripts/status_watchers.sh


#!/bin/bash

echo 
echo bridge transactions:
echo 
echo 
# API URL
URL="https://app.rosen.tech/api/v1/events?offset=0&limit=100"

# Fetch the data from the API
response=$(curl -s $URL)

# Filter the data and format the output
echo "$response" | jq -r '
.items[] | 
select(.status != "successful") | 
{
    amount: .amount,
    chain: (.fromChain + "-" + .toChain),
    eventId: .eventId,
    status: .status,
    timestamp: .timestamp,
    token: .lockToken.name,
    decimals: .lockToken.significantDecimals
} | [.amount, .token, .chain, .eventId, .status, .timestamp, .decimals] | @tsv' | \
# Use awk to format and align the output
awk '
BEGIN {
    FS = "\t";
    printf "%-18s %-8s %-22s %-70s %-12s %-15s\n", "Amount", "Token", "Chain", "Event ID", "Status", "Timestamp"
    printf "%-18s %-8s %-22s %-70s %-12s %-15s\n", "------------------", "--------", "----------------------", "----------------------------------------------------------------------", "------------", "---------------"
}
{
    # Extract the fields
    full_amount = $1
    token = $2
    chain = $3
    eventId = $4
    status = $5
    timestamp = $6
    decimals = $7

    # Ensure full_amount has leading zeros if necessary
    while (length(full_amount) < decimals + 1) {
        full_amount = "0" full_amount
    }

    # Split the amount into integer and decimal parts
    integer_length = length(full_amount) - decimals
    if (integer_length > 0) {
        integer_part = substr(full_amount, 1, integer_length)
    } else {
        integer_part = "0"
    }
    decimal_part = substr(full_amount, integer_length + 1, decimals)

    # Insert commas into the integer part without using lookaheads
    formatted_integer = ""
    while (length(integer_part) > 3) {
        formatted_integer = "," substr(integer_part, length(integer_part) - 2, 3) formatted_integer
        integer_part = substr(integer_part, 1, length(integer_part) - 3)
    }
    formatted_integer = integer_part formatted_integer

    # Handle cases where integer_part is empty
    if (formatted_integer == "") {
        formatted_integer = "0"
    }

    # Format the amount
    formatted_amount = formatted_integer
    if (decimal_part != "") {
        formatted_amount = formatted_amount "." decimal_part
    }


    # Print the formatted data
    printf "%-18s %-8s %-22s %-70s %-12s %-15s\n", formatted_amount, token, chain, eventId, status, timestamp
}'
