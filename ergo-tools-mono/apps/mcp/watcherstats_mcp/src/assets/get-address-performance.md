# Get Address Performance

Retrieve watcher reward history from Rosen Bridge transaction inputs.

Provide a watcher address to request a transaction-data download for that address.

## Response structure

The response contains the address's chart snapshot as both structured JSON and JSON text.

The object contains:

- `chainType`: The chain associated with the input, or `null` if unknown.
- `charts`: An object mapping Unix timestamps in milliseconds to summed asset amounts for each week.

### Timestamp interpretation

- Each key in `charts` is a Unix timestamp in **milliseconds**, serialized as a JSON object key string.
- Each timestamp represents the start of a week (Sunday at local midnight).
- Timestamps represent dates, **not numeric identifiers**.
- The corresponding value is the summed asset amount for that week, normalized using each asset's decimal precision.

Example:

```json
{
  "chainType": "Ethereum",
  "charts": {
    "1735516800000": 42.5,
    "1736121600000": 51.25
  }
}
```

## Output formatting requirements

When presenting chart data to the user:

- **ALWAYS convert Unix timestamps into human-readable dates.**
- **NEVER display raw Unix timestamps unless the user explicitly requests them.**
- Format dates as `YYYY-MM-DD`.
- Interpret weekly boundaries using the source timezone. Do not assume UTC calendar dates are identical to local calendar dates.
- Sort data chronologically unless the user requests a different order.
- Present weekly values alongside their corresponding dates.
- Label values as summed asset amounts, not USD or another currency.
- Do not assume the amounts represent a specific token.

For performance summaries, show the latest weekly value with its human-readable date and use readable dates for any historical data points.

## Data limitations

- The chart includes inputs from approximately the last six months.
- Amounts are summed across assets without asset identifiers or currency conversion.
- Values must not be interpreted as monetary values or amounts of a specific token.
- The underlying cached input data may include other addresses; the returned snapshot is selected by the requested address.

## When to use

Use this tool when answering questions about a watcher's recent weekly reward history, performance, or chart data.

If chart data is unavailable for the requested address, the tool returns an error.