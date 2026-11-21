Retrieve watcher reward history from Rosen Bridge transaction inputs.

Provide a watcher address to request a transaction-data download for that address. The response contains that address's chart snapshot as both structured JSON and JSON text. The object contains:
- `chainType`: the chain associated with the input, or `null` if it is unknown.
- `charts`: an object mapping Unix timestamps in milliseconds to summed asset amounts for that week. The timestamp marks the start of the week (Sunday at local midnight). Amounts are normalized using each asset's decimal precision.

The chart includes inputs from the last six months. The amounts are summed across assets, and the response does not include asset identifiers or currency conversion, so values should not be assumed to represent a particular token. The result may include other addresses present in the cached input data; it is not filtered to only the requested address.

Use this tool when asking about a watcher's recent, weekly reward history or chart data. If chart data is unavailable for the address, the tool returns an error.