#!/bin/bash

# Clear the terminal initially
clear
/home/pebblerye/crypto_scripts/status_all.sh

# Infinite loop to repeat every second
while true; do
    # Capture the output of the original script into a variable    

    output=$(bash /home/pebblerye/crypto_scripts/status_all.sh)

    # Clear the screen before outputting
    clear

    # Print the collected output
    echo "$output"


    # Wait for 1 second before repeating
    sleep 1
done

