#!/bin/bash

# Function to delete files older than 10 days but keep the latest 5
delete_old_files() {
    local pattern=$1
    local files
    
    # List matching files sorted by modification time (newest first)
    files=($(ls -t $pattern 2>/dev/null))
    
    # Ensure we have more than 5 files before deleting old ones
    if [[ ${#files[@]} -gt 5 ]]; then
        # Select files older than 10 days (excluding the latest 5)
        find $pattern -type f -mtime +10 | grep -v -F "$(printf "%s\n" "${files[@]:0:5}")" | xargs rm -f
    fi
}

# Delete JS and CSS files conditionally
delete_old_files "main-*.js"
delete_old_files "poly-*.js"
delete_old_files "scripts-*.js"
delete_old_files "*worker*.js"
delete_old_files "styles-*.css"

