Retrieve watcher reward history from Rosen Bridge transaction inputs.

Provide a watcher address to request a transaction-data download for that address. The response contains that address's chart snapshot as both structured JSON and JSON text. The object contains:
- `chainType`: the chain associated with the input, or `null` if it is unknown.
- `charts`: an object whose JSON entries map a date to the summed asset amount for that week. The date is the first field of each entry (the key), written as a decimal Unix timestamp in milliseconds and serialized as a JSON object key string (for example, `"1735516800000"`). It represents the start of the week (Sunday at local midnight). The corresponding value is a number containing the summed asset amount for that week, normalized using each asset's decimal precision. For example: `{"1735516800000": 42.5, "1736121600000": 51.25}`.

The chart includes inputs from the last six months. The amounts are summed across assets, and the response does not include asset identifiers or currency conversion, so values should not be assumed to represent a particular token. The result may include other addresses present in the cached input data; it is not filtered to only the requested address.

Use this tool when asking about a watcher's recent, weekly reward history or chart data. If chart data is unavailable for the address, the tool returns an error.