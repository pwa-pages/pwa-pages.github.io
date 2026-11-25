# Get Watcher Statistics

Retrieve the latest Rosen Bridge watcher and permit statistics across all
supported blockchains. The tool returns the current network-wide
`WatchersStats` snapshot. No input parameters are required, and the response is
not specific to an address.

## Response structure

- `chainWatcherCount`, `chainPermitCount`, `bulkPermitCount`,
  `triggerPermitCount`, and `activePermitCount`: counts grouped by chain.
  Active permits are the sum of bulk and trigger permits.
- `totalWatcherCount`, `totalPermitCount`, and `totalActivePermitCount`: totals
  across chains.
- `chainLockedRSN` and `chainLockedERG`: estimated RSN and ERG collateral
  locked by watchers and permits, grouped by chain. `totalLockedRSN` and
  `totalLockedERG` provide the corresponding totals.
- `watcherCollateralRSN`, `watcherCollateralERG`, and `permitCost`: configured
  collateral and permit-cost amounts.
- `watchersAmountsPerCurrency`: collateral and total locked-value figures
  converted into each supported currency. Each currency entry may include
  `rsnCollateral`, `ergCollateral`, `permitValue`, `watcherValue`,
  `totalLockedRSN`, `totalLockedERG`, and `totalLocked`.

## Estimated reward per watcher

Combine this tool with `get_chain_perf` to estimate the eRSN reward for a single
watcher on a chain over the last seven days:

`get_chain_perf[chain].chart / get_watchers_stats.chainWatcherCount[chain]`

Use the same chain in both responses. The watcher count must be greater than
zero; otherwise the per-watcher reward cannot be calculated. This is an
average estimate, not the actual reward received by a particular watcher:
the count is a current snapshot and may have changed during the seven days.

## Data limitations

- Counts are counts, while collateral and value fields are token amounts or
  currency-converted values as indicated by their names.
- Currency-converted values depend on available price data.
- Chain fields are populated as chain statistics are downloaded and processed,
  so values may be incomplete while an update is in progress.
- The snapshot contains no update timestamp.
- The MCP response includes the snapshot as both structured JSON and serialized
  JSON text.
- If no snapshot has been received yet, the tool returns an error stating that
  watcher statistics are not available.
