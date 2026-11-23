# MCP SQLite storage

`FileStorageService` stores all records in `watcherstats-mcp.sqlite` inside
`WATCHERSTATS_MCP_STORAGE_DIR`, or in the platform data directory for
`watcherstats-mcp` when the variable is unset. SQLite transactions make each
batch atomic and coordinate concurrent processes. The database uses WAL mode
and full synchronous writes. Each service instance reuses its lazily opened
connection; call `close()` when shutting down a long-lived instance.

Store names and serialized IndexedDB keys are kept separately. Upserts retain
the record's position; new records are returned in insertion order. Known
IndexedDB stores follow their configured key paths: inline-key stores derive
keys from each item and ignore the optional explicit key, while keyless stores
require an explicit key. For other stores, an explicit key applies to every
item, so the last item with that key wins; without one, an item's `id` is used
or a UUID is generated if it has no `id`. An `id` property that is present but
invalid, including `null` or `undefined`, is rejected rather than replaced with
a generated key.

Keys support strings, finite numbers, valid dates, binary buffers and views,
and recursively nested arrays of valid keys. `deleteData` interprets an array
as a list of keys, as the existing IndexedDB implementation does; wrap a
compound key in another array to delete it. Values use JSON semantics with
nested and invalid `Date` restoration, preserve explicit `undefined` values,
and can decode the legacy date-marker format and existing SQLite rows without
undefined metadata. This is not a full IndexedDB structured-clone
implementation.

## Existing JSON storage

The SQLite implementation does not automatically import the previous JSON
files. It leaves them in place and starts with a new database. Those files
contain no store name, so importing them safely requires mapping each file to
its store using trusted external information. Back up the existing storage
directory and complete a reviewed migration before relying on data from the
new database.

## Tests

```sh
node --import tsx --test apps/mcp/watcherstats_mcp/tests/*.test.ts
./node_modules/.bin/tsc -p apps/mcp/watcherstats_mcp/tests/tsconfig.json
```
