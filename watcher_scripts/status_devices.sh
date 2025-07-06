#!/bin/sh

sensors | awk '
BEGIN {
    fallback = 15
}
{
    if ($0 ~ /^[[:space:]]*[^:]+:[[:space:]]*\+[0-9]+\.[0-9]+°C/) {
        temp_str = $0
        split(temp_str, parts, " ")
        temperature = high_threshold = crit_threshold = 0

        for (i = 1; i <= length(parts); i++) {
            if (parts[i] ~ /^\+[0-9]+\.[0-9]+°C$/) {
                temp = parts[i]
                gsub("\\+|°C", "", temp)
                temperature = temp + 0
            }

            if (parts[i] == "(high") {
                high = parts[i+2]
                gsub("\\+|°C|,", "", high)
                high_threshold = high + 0
                if (high_threshold > 150 || high_threshold < 1) {
                    high_threshold = 0
                }
            }

            if (parts[i] == "(crit") {
                crit = parts[i+2]
                gsub("\\+|°C|\\)", "", crit)
                crit_threshold = crit + 0
                if (crit_threshold > 150 || crit_threshold < 1) {
                    crit_threshold = 0
                }
            }
        }

        # Use fallback if both thresholds are invalid or missing
        if (high_threshold == 0 && crit_threshold == 0) {
            high_threshold = fallback
        }

        if ((high_threshold && temperature >= high_threshold) ||
            (crit_threshold && temperature >= crit_threshold)) {
            print $0
        }
    }
}
'

