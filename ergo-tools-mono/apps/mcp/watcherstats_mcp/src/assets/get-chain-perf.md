# Get Chain Performance

Retrieve the latest Rosen Bridge watcher performance totals, grouped by
blockchain. The tool returns the total eRSN reward amount attributed to each
supported chain from performance transactions recorded during the last seven
days. Amounts are summed from eRSN outputs sent to configured reward addresses
and are normalized using the eRSN decimal precision. A chain is attributed to
each transaction based on the RWT token types in its outputs.

## Response structure

- An object keyed by supported blockchain names.
- Each chain maps to an object with a `chart` number: the aggregated eRSN
  reward amount for that chain during the reporting period.
- Chains with no matching rewards are included with `chart: 0`.

## Data limitations

- These values are reward amounts, not transaction counts, watcher counts, or
  currency valuations.
- No input parameters are required.
- The server returns the latest available performance snapshot as structured
  JSON and serialized JSON text. The snapshot is updated as performance
  transaction data is processed.
- If no snapshot has been received yet, the tool returns an error indicating
  that chain performance statistics are unavailable.
