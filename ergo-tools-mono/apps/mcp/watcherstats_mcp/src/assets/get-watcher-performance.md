# Get Watcher Performance

Retrieve monthly report counts for watchers on a supported chain. Supply the
chain type (for example, `Ergo` or `Cardano`). The tool requests a report refresh
and waits for the corresponding report-trigger address to finish downloading.

## Response structure

The response contains a `watcherPerformances` object keyed by chain type, then
month. Each month contains watcher entries with an `address` and a `reports`
count. The structured response and text content contain the same JSON object.
If the chain has no cached reports, its value is an empty object.

## Data limitations

- Only chain types with a configured report-trigger address are supported.
- Report counts are based on cached report transactions and may be incomplete
  when the underlying download fails.
- The tool returns an error if no matching completion event or report snapshot
  is received within 60 seconds.
