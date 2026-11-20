Retrieve the latest Rosen Bridge watcher statistics across supported blockchains.

This tool provides detailed information about watcher activity, permit distribution, collateral requirements, and locked assets across the Rosen Bridge network.

Returned statistics include:
- Watcher counts and permit counts per blockchain.
- Active, bulk, and trigger permit counts per blockchain.
- Total ERG and RSN locked per blockchain.
- Permit cost in RSN and watcher collateral requirements in ERG and RSN.
- Watcher and permit valuations in EUR, USD, ERG, and RSN.
- Aggregated network-wide watcher statistics.

Response fields:

Chain statistics:
- activePermitCount: Object mapping blockchain names to active permit counts.
- bulkPermitCount: Object mapping blockchain names to bulk permit counts.
- chainLockedERG: Object mapping blockchain names to total ERG locked.
- chainLockedRSN: Object mapping blockchain names to total RSN locked.
- chainPermitCount: Object mapping blockchain names to total permit counts.
- chainWatcherCount: Object mapping blockchain names to watcher counts.
- triggerPermitCount: Object mapping blockchain names to trigger permit counts.

Permit and collateral:
- permitCost: Cost of one permit in RSN.
- watcherCollateralERG: Required ERG collateral per watcher.
- watcherCollateralRSN: Required RSN collateral per watcher.

Currency valuations:
- watchersAmountsPerCurrency: Object containing watcher-related valuations in EUR, USD, ERG, and RSN.

Each currency contains:
- watcherValue: Total value associated with one watcher in the specified currency.
- permitValue: Value of one permit in the specified currency.
- rsnCollateral: RSN collateral value per watcher in the specified currency.
- ergCollateral: ERG collateral value per watcher in the specified currency.
- totalLockedERG: Total ERG locked, expressed in the specified currency.
- totalLockedRSN: Total RSN locked, expressed in the specified currency.
- totalLocked: Combined value of locked ERG and RSN in the specified currency.

Aggregated network statistics:
- totalWatcherCount: Total watchers across all chains.
- totalPermitCount: Total permits across all chains.
- totalActivePermitCount: Total active permits across all chains.
- totalLockedRSN: Total RSN locked across all chains.
- totalLockedERG: Total ERG locked across all chains.

Use this tool when users ask about:
- Rosen Bridge watcher statistics or network participation.
- Watcher counts on specific blockchains.
- Permit distribution, active permits, or permit costs.
- ERG and RSN collateral requirements.
- Total value locked in Rosen Bridge watchers.
- Monetary valuations of watcher-related assets.

No input parameters are required.

The server maintains a cached snapshot of watcher statistics, automatically updated through WatchersStatsChanged events.

The tool returns the latest available statistics as both structured JSON and serialized JSON text.

If statistics have not yet been received, the tool returns an error indicating that watcher statistics are unavailable.
