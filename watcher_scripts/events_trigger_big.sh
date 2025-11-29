#!/bin/bash

echo
echo "Bridge Transactions:"
echo
echo

# API URL
URL="https://app.rosen.tech/api/v1/events?offset=0&limit=100"

# Fetch the data from the API
response=$(curl -s $URL)

# Get the current timestamp in seconds
current_time=$(date +%s)

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
# Use awk to format, align, and apply the additional logic
awk -v current_time="$current_time" '
BEGIN {
    FS = "\t";
    printf "%-18s %-8s %-22s %-70s %-12s %-15s %-10s\n", "Amount", "Token", "Chain", "Event ID", "Status", "Timestamp", "Elapsed(s)"
    printf "%-18s %-8s %-22s %-70s %-12s %-15s %-10s\n", "------------------", "--------", "----------------------", "----------------------------------------------------------------------", "------------", "---------------", "----------"
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

    # Extract the first part of the chain (before the hyphen)
    split(chain, chain_parts, "-")
    first_part = chain_parts[1]  # This is the part before the hyphen

    # Calculate elapsed time
    elapsed_time = current_time - timestamp

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
    formatted_amount = formatted_integer "." decimal_part

#    printf "%-18s %-8s %-22s %-70s %-12s %-15s %-10d\n", formatted_amount, token, first_part, eventId, status, timestamp, elapsed_time

    if (elapsed_time < 1500) {
        # Convert formatted_amount to a numeric value
        numeric_amount = (full_amount / (10 ^ decimals)) + 0

        # Combine all high-value transaction checks into one condition
        if ((numeric_amount > 40000 && (token == "ERG" || token == "rsERG")) ||
            (numeric_amount > 40000 && (token == "ADA" || token == "rsADA")) ||
            (numeric_amount > 10000000 && (token == "SUGAR" || token == "rsSUGAR")) ||
            (numeric_amount > 5 && (token == "ETH" || token == "rsETH")) ||
            (numeric_amount > 100 && (token == "BNB" || token == "rsBNB")) ||
            (numeric_amount > 250000 && (token == "DOGE" || token == "rsDOGE")) ||
            (numeric_amount > 200000 && (token == "RSN" || token == "rsRSN")) ||
            (numeric_amount > 5000000 && (token == "PALM" || token == "rsPALM")) ||
            (numeric_amount > 100000000000 && (token == "GIF" || token == "rsGIF")) ||
            (numeric_amount > 0.49999 && (token == "BTC" || token == "rsBTC"))) {
            # Trigger the appropriate script based on token type
            if (first_part == "ergo") {
                # Trigger for high-value ERG transactions
                print "High-value ERG transaction detected for " token " " numeric_amount  > "/dev/stderr"
                system("trigger.sh ergo")
            }
            if (first_part == "cardano") {
                # Trigger for high-value ADA transactions
                print "High-value ADA transaction detected for " token " " numeric_amount  > "/dev/stderr"
                system("trigger.sh cardano")
            }
            if (first_part == "ethereum") {
                # Trigger for high-value ETH transactions
                print "High-value ETH transaction detected for " token " " numeric_amount  > "/dev/stderr"
                system("trigger.sh eth")
            }
            if (first_part == "bitcoin") {
                # Trigger for high-value BTC transactions
               print "High-value BTC transaction detected for " token " " numeric_amount  > "/dev/stderr"
               system("trigger.sh btc")
            }
            if (first_part == "bitcoin-runes") {
                # Trigger for high-value RUNES transactions
               print "High-value RUNES transaction detected for " token " " numeric_amount  > "/dev/stderr"
               system("trigger.sh runes")
            }
            if (first_part == "binance") {
                # Trigger for high-value BSC transactions
               print "High-value BSC transaction detected for " token " " numeric_amount  > "/dev/stderr"
               system("trigger.sh bsc")
            }
        }
    }
}'

