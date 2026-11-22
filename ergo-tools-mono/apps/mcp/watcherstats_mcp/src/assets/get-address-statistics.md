# Get Address Statistics

Request a transaction-data download for a watcher address and retrieve the
currently cached transaction inputs whose output address matches that address.
Optionally provide `startDate` and `endDate` in `YYYY-MM-DD` format to filter
those inputs by their UTC calendar date. Both date boundaries are inclusive;
either boundary can be omitted. Without date filters, all cached inputs for the
requested address are returned.

## Response structure

The text content is a JSON array of cached inputs. The structured content is
an object containing the same array in its `inputs` property, as required by
MCP structured output. An empty array means no inputs are currently cached.
Each entry contains `inputDate` as an ISO 8601 UTC string and `amount` as a
number in whole token units. The amount is already normalized using the
asset's decimal precision; it must not be divided by the decimal factor again.
Entries with an invalid date or amount cause an error rather than returning
incomplete data.

## Data limitations

- The download is scheduled in the background; the response does not wait for
  it and may contain older cached data.
- The cache can contain inputs for multiple addresses, but only inputs matching
  the requested address are returned. The address is omitted from each response
  entry.
- If cached input data has not been loaded yet, the tool returns an error.
- These are individual input amounts, not weekly chart data or currency values.
