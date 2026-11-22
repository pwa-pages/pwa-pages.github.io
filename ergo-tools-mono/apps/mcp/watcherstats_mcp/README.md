# MCP file storage

`FileStorageService` uses `WATCHERSTATS_MCP_STORAGE_DIR`, or the platform data
directory for `watcherstats-mcp` when it is unset. Each store is a JSON array in
`stores-v2/store-<SHA-256 of the UTF-8 store name>.json`. A write replaces the complete
file atomically after syncing a temporary file; on non-Windows systems the
directory is synced as well. If a directory sync fails after replacement, the
operation reports an error even though the new data may already be visible.
Malformed files and duplicate serialized keys are errors, never reset to empty.

Operations on a store are serialized across processes in the **same network
namespace on the same machine** with an exclusive IPv4 loopback listening port
derived from its canonical path. The OS releases the port if a process crashes.
All processes must resolve the data directory to the same canonical path; bind
mounts or other aliases that `realpath` cannot unify can bypass the lock.
An unrelated service or another store can hash to the same port: this causes
contention (and eventually a 120-second timeout), not data corruption. The
directory must be on a local filesystem with atomic replacement and reliable
sync; shared/network filesystems, containers in separate network namespaces,
and concurrent use by older versions do not satisfy the locking protocol.
Windows and filesystem/hardware durability guarantees vary. Power-loss
durability depends on the OS and filesystem; Windows directory sync is not
available here.

Keys support strings, numbers other than NaN, valid dates, binary buffers and
views, and recursively nested arrays of valid keys. The known IndexedDB stores
use their existing key paths if an explicit key is not provided. Other stores
use an item's `id`, or generate a UUID if it has no `id`, as the previous file
implementation did. An `id` property that is present but invalid, including
`null` or `undefined`, is rejected rather than replaced with a generated key.
An explicit key applies to every item, including in known stores, so the last
item with that key wins. Without an explicit key, invalid or missing keys for
known keyed stores fail the whole batch. `deleteData` interprets an array as a list of keys, as the existing
IndexedDB implementation does; wrap a compound key in another array to delete
it. Results retain file/insertion order, not IndexedDB key order. Values use
JSON semantics plus nested and invalid Date restoration; this is not a full
IndexedDB structured-clone implementation.

## Upgrading existing storage

1. Stop **all** old and new processes sharing the storage directory and back
   up the entire directory. Old versions must not access it after upgrading:
   they use a different lock protocol and cannot read the new date encoding.
2. Every legacy filename requires manual migration. The old sanitization and
   truncated hashes could collide, and the file does not record its owner's
   identity. If one is encountered, access fails with a manual-migration error.
   Identify its owner from a trusted backup or external knowledge, check the
   data and duplicate keys, and copy it to
   `stores-v2/store-<full SHA-256 of the exact UTF-8 store name>.json` only if that
   destination does not already exist. Never guess which store owns a file.
   For example, after verifying the source, this command copies it without
   overwriting an existing destination:

   ```sh
   node -e 'const fs=require("node:fs"); const c=require("node:crypto"); const p=require("node:path"); const [dir,name,source]=process.argv.slice(1); const hash=c.createHash("sha256").update(name,"utf8").digest("hex"); const dest=p.join(dir,"stores-v2"); fs.mkdirSync(dest,{recursive:true}); fs.copyFileSync(source,p.join(dest,`store-${hash}.json`),fs.constants.COPYFILE_EXCL)' STORAGE_DIRECTORY STORE_NAME VERIFIED_LEGACY_FILE
   ```

3. Keep the backup and legacy file until the migrated data has been verified.
   The new file, once present, is authoritative; edits to the old file will
   not be imported.
4. The old implementation generated random keys for records lacking `id`,
   including compound-key input records and address-keyed records. Those
   original keys are preserved, not silently re-keyed or deduplicated. Such
   records may require a carefully reviewed, backed-up manual reconciliation
   before keyed lookups/upserts work as intended. Duplicate keys are reported
   for manual recovery rather than discarded.
5. Old singleton date-marker objects are indistinguishable from actual old
   Date values and are interpreted as dates, matching the old implementation.
   New files use explicit date paths, so ordinary marker-shaped objects no
   longer collide.

Old `.lock` and `.lock.recovery` files belonging to dead processes are ignored
and left intact. A live or indeterminate owner blocks access instead of
guessing. Confirm all old processes have stopped before manually removing
such files. Interrupted new-format temporary files are removed under the new
lock; the last renamed JSON file remains authoritative.

## Tests

```sh
node --import tsx --test apps/mcp/watcherstats_mcp/tests/*.test.ts
./node_modules/.bin/tsc -p apps/mcp/watcherstats_mcp/tests/tsconfig.json
```

Each operation reads the entire store; writes also serialize and replace it.
This keeps the format simple but is unsuitable for very large or high-throughput
stores. Use a database when those costs become significant.
