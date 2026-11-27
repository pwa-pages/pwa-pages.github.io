# Get My Watcher Statistics

Retrieve permit statistics for one watcher address. Supply a non-empty
`address` string.

The tool requests a refresh and returns the latest `PermitsChanged` snapshot
after processing completes, filtered to the requested address. The response
contains a `permits` array in structured content and the same array as JSON
text. Each entry contains only `address`, `chainType`, `permitCount`, and
`activePermitCount`. An empty array means no permits were found for that address.

Requests are serialized because permit events do not identify their originating
request. If processing fails, no snapshot is received, or the request does not
complete within 60 seconds (including time waiting for another request), the
tool returns an error. Download services may retain cached data when an
underlying download fails, so a completed snapshot is not a guarantee of
fresh blockchain data.
