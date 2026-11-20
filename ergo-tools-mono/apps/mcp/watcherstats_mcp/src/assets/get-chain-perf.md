Retrieve the latest Rosen Bridge chain performance statistics across supported blockchains.

This tool provides a comparison of watcher reward performance across different blockchain networks in the Rosen Bridge ecosystem.

The statistics represent the amount of rewards earned by a watcher on each supported blockchain during the last week, expressed in RSN (Rosen Token).

Returned statistics include:
- Weekly watcher rewards for each supported blockchain.
- Chain-specific performance values expressed in RSN.
- Performance comparisons between supported blockchains.

Response structure:
The response is a JSON object mapping blockchain names to their performance data.

Each blockchain contains:
- chart: Number representing the amount of rewards earned by a watcher on that blockchain during the last week, expressed in RSN.

Example response:
{
  "Bitcoin": { "chart": 0 },
  "Cardano": { "chart": 2160.976 },
  "Ergo": { "chart": 6442.441 },
  "Ethereum": { "chart": 0 },
  "Binance": { "chart": 0 },
  "Doge": { "chart": 0 }
}

Field explanations:
- Blockchain name: Identifies the blockchain network.
- chart: Weekly watcher rewards in RSN for the corresponding blockchain.
- A chart value of 0 indicates that no rewards are represented for that blockchain in the returned data.
- Additional blockchain networks may be included in future versions.

Use this tool when users ask about:
- Rosen Bridge chain performance.
- Weekly watcher rewards across supported blockchains.
- How much RSN a watcher earns on a specific blockchain.
- Comparing watcher reward performance between blockchains.
- Which blockchain has the highest or lowest weekly watcher rewards.
- Watcher reward statistics over the last week.

No input parameters are required.

The server maintains a cached snapshot of chain performance statistics, automatically updated through PerfChartChanged events.

The tool returns the latest available statistics as both structured JSON and serialized JSON text.

The tool does not initiate a new data fetch when called. It returns the most recently received statistics.

If chain performance statistics have not yet been received, the tool returns an error indicating that data is unavailable.
