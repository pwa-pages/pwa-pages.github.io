import { getPermitTriggerAddressesByChainType, IDownloadService, WatcherDataService } from '@ergo-tools/service';
import { GetActivePermitsDownloadService } from '@ergo-tools/service';
import { GetWatcherDownloadService } from '@ergo-tools/service';
import { ActivePermitsDataService } from '@ergo-tools/service';
import { PermitTx } from '@ergo-tools/service';




async function main() {


  //check
  //https://ergexplorer.com/addresses#5ivrmzxYZTDDDoKD1urVYrXZG96ijTUYXQJzE6SCRJ2RR6Kj1UPWL1iN1xeHgYJEQjnQ7m3Ld9tBRRYqjzrAVAqHyGbZB3otUWZW4sUxN4E11fNUZEMQ3kVwnZxFmeSaxcXhQiTFH1cvBYWuFMRRFfaA2UMfpEgm2WoqeiJxPCojp9D7h6yMV4br5EtWTQJKRtcopBRoUgDg9mrKPAXGPZZKTZbYotgLKQ4nzD8QB5hjYJswhLmePaY3zK5eJq7NTcdoAgbNPK9nQ9UpBUgrc8RB76P8evPHMXg6HrVdQ2z3rkvYFVZqH9SmCkE8KGiLYGX7hwaXYGvPExdoVDp7qsSctsPjwgt9Vts2G76dzJzfBhEunJ33vdTEkEXX3wkjK4ZE8g5YKCwGpcED5PhtRQQtJZaZMYTZV3TpbPWy57U49cD3HVeUGR7efxUHZxYybWJ7q8i6NDm3PUwKFN63HmPYQn7TMYGkvSoizTuTAUJomiKgSnvoz2DSUzukRSRmUFA1cLqdR6s7FbeJfpbaKWX4kUGM2Xh38FdqNE94SjkQMY9bv3H5N8MgwGL2La12e1GXAdMCKJCWKRe27vjdaHJWmsKrBLuXQegGN8BaqNuvJbhrmreHAjR9tVwVkxcTUsr8u8TGUzkzN7coV8HiQV9KBMVgQ24NXPYyoCuedwfCiNwYX7PSSbvve7Dgyy5e1S6qbVpEpVtjy9NzWfRaqr5CyGDqhkfjizNG71NZu543vkacjXrrfPWqtNoXMtTRyM1pzwW9ze9aoRX6e92mVaCUB8hTnfH3Q8EstRLDJygLmp63y45tKwBVBDjog7Z6pWhTfBapMBz8Q28pMfPAR8ywfz8qvtkyQcv9SuEZWfvpZREaS5PGhBuqU79eR9bwNwS6TLu9BZV5Y1ahVFA1fMUxhXTvX69hKnNHFgZ35fZdrVrSeU4U5yGvYX7ViTqL2oFk16HLoTXgNs6KQz7PPZr373gDeRh7PfXpX5jWyxw6SRreE3jB5SUiQnZxmAbpJNVkPzFbZXcrsrS3JHSfiVeqp1tk5uNaZcX39tQTXtu4bGrpv6EiMvYPkiDhCiKd5oAVeZ8VxEGN7SP94vF9WhS2oWUMCVLU1XW2DDHejZ36Zo1Ho8fHbUEaKNbRBozY3HYnkYyJuF4wer8xJ6q4KcPppDrS5jqfAaZF6YWsdtqgse7qMeWVUPj23Vr5XG2S9sYmWA7femKuZki71S6BqZGNfit7F4vrzqNZd1L5oyLSVCtuiv3DybRnu2YEaUtrmCphsmrpAFSEwJWtFKqcC&offset=840

  //var downloadService: IDownloadService<WatcherDataService> = GetWatcherDownloadService();


  await downloadActivePermits();


}

main().catch(console.error);



async function downloadActivePermits() {
  var frommonth = 9;
  var fromyear = 2026;
  var tomonth = 9;
  var toyear = 2026;
  const now = new Date();
  const startOfYear = new Date(fromyear, frommonth - 1, 1);
  var diff = now.getTime() - startOfYear.getTime() + 2 * 24 * 60 * 60 * 1000;


  var addresses = getPermitTriggerAddressesByChainType();


  for (const [chainType, addr] of Object.entries(addresses)) {


    if (addr == null) continue;

    var downloadService: IDownloadService<ActivePermitsDataService> = GetActivePermitsDownloadService(diff);


    console.log('Downloading for chainType:', chainType, 'address:', addr);
    await downloadService.downloadForAddress<PermitTx>(addr, true);


    var permits = await downloadService.getDataService().getAdressPermits(false, frommonth, fromyear, tomonth, toyear);
    permits = permits.filter(p => p.chainType === chainType);

    const byAddress = permits.reduce((map: Map<string, {
      address: string;
      count: number;
      assetsCount: number;
      earliest: Date | null;
      latest: Date | null;
    }>, p: any) => {
      const addr = p.address || '';
      const d = p.date ? new Date(p.date) : null;
      const assetsLen = (p.assets && Array.isArray(p.assets)) ? p.assets.length : 0;

      let entry = map.get(addr);
      if (!entry) {
        entry = { address: addr, count: 0, assetsCount: 0, earliest: d, latest: d };
        map.set(addr, entry);
      }

      entry.count += 1;
      entry.assetsCount += assetsLen;

      if (d) {
        if (!entry.earliest || d < entry.earliest) entry.earliest = d;
        if (!entry.latest || d > entry.latest) entry.latest = d;
      }

      return map;
    }, new Map<string, {
      address: string;
      count: number;
      assetsCount: number;
      earliest: Date | null;
      latest: Date | null;
    }>());


    const totalsPerAddress = Array.from(byAddress.values())
      .map(e => ({
        address: e.address,
        totalPermits: e.count,
        totalAssets: e.assetsCount,
        earliest: e.earliest ? e.earliest.toISOString() : null,
        latest: e.latest ? e.latest.toISOString() : null,
      }))
      .sort((a, b) => b.totalPermits - a.totalPermits || a.address.localeCompare(b.address));

      
      console.log('for chainType: ', chainType);
    console.log('totalsPerAddress: ', totalsPerAddress);
    

  }

}

