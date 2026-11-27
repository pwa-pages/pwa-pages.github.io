# Get My Watcher Statistics

Retrieve permit statistics for one or more watcher addresses. Supply a non-empty
`addresses` array of non-empty strings. For compatibility, a single non-empty
`address` string may be supplied instead, but not together with `addresses`.

The tool requests a refresh and returns the latest `PermitsChanged` snapshot
when a matching `MyWatcherStatsRequestFinished` event is received, filtered to
the requested addresses. The response
contains a `permits` array in structured content and the same array as JSON
text. Each entry contains only `address`, `chainType`, `permitCount`, and
`activePermitCount`. An empty array means no permits were found for those addresses.

Requests are serialized because permit events do not identify their originating
request. If processing fails, no matching completion or snapshot is received, or the request does not
complete within 60 seconds (including time waiting for another request), the
tool returns an error. Download services may retain cached data when an
underlying download fails, so a completed snapshot is not a guarantee of
fresh blockchain data.
