import { IDownloadService } from '@ergo-tools/service';
import { GetDownloadService } from '@ergo-tools/service';
import { GetWatcherDataService } from '@ergo-tools/service';

import { ActivePermitsDataService } from '@ergo-tools/service';
import { PermitTx } from '@ergo-tools/service';




async function main() {


//check
//https://ergexplorer.com/addresses#5ivrmzxYZTDDDoKD1urVYrXZG96ijTUYXQJzE6SCRJ2RR6Kj1UPWL1iN1xeHgYJEQjnQ7m3Ld9tBRRYqjzrAVAqHyGbZB3otUWZW4sUxN4E11fNUZEMQ3kVwnZxFmeSaxcXhQiTFH1cvBYWuFMRRFfaA2UMfpEgm2WoqeiJxPCojp9D7h6yMV4br5EtWTQJKRtcopBRoUgDg9mrKPAXGPZZKTZbYotgLKQ4nzD8QB5hjYJswhLmePaY3zK5eJq7NTcdoAgbNPK9nQ9UpBUgrc8RB76P8evPHMXg6HrVdQ2z3rkvYFVZqH9SmCkE8KGiLYGX7hwaXYGvPExdoVDp7qsSctsPjwgt9Vts2G76dzJzfBhEunJ33vdTEkEXX3wkjK4ZE8g5YKCwGpcED5PhtRQQtJZaZMYTZV3TpbPWy57U49cD3HVeUGR7efxUHZxYybWJ7q8i6NDm3PUwKFN63HmPYQn7TMYGkvSoizTuTAUJomiKgSnvoz2DSUzukRSRmUFA1cLqdR6s7FbeJfpbaKWX4kUGM2Xh38FdqNE94SjkQMY9bv3H5N8MgwGL2La12e1GXAdMCKJCWKRe27vjdaHJWmsKrBLuXQegGN8BaqNuvJbhrmreHAjR9tVwVkxcTUsr8u8TGUzkzN7coV8HiQV9KBMVgQ24NXPYyoCuedwfCiNwYX7PSSbvve7Dgyy5e1S6qbVpEpVtjy9NzWfRaqr5CyGDqhkfjizNG71NZu543vkacjXrrfPWqtNoXMtTRyM1pzwW9ze9aoRX6e92mVaCUB8hTnfH3Q8EstRLDJygLmp63y45tKwBVBDjog7Z6pWhTfBapMBz8Q28pMfPAR8ywfz8qvtkyQcv9SuEZWfvpZREaS5PGhBuqU79eR9bwNwS6TLu9BZV5Y1ahVFA1fMUxhXTvX69hKnNHFgZ35fZdrVrSeU4U5yGvYX7ViTqL2oFk16HLoTXgNs6KQz7PPZr373gDeRh7PfXpX5jWyxw6SRreE3jB5SUiQnZxmAbpJNVkPzFbZXcrsrS3JHSfiVeqp1tk5uNaZcX39tQTXtu4bGrpv6EiMvYPkiDhCiKd5oAVeZ8VxEGN7SP94vF9WhS2oWUMCVLU1XW2DDHejZ36Zo1Ho8fHbUEaKNbRBozY3HYnkYyJuF4wer8xJ6q4KcPppDrS5jqfAaZF6YWsdtqgse7qMeWVUPj23Vr5XG2S9sYmWA7femKuZki71S6BqZGNfit7F4vrzqNZd1L5oyLSVCtuiv3DybRnu2YEaUtrmCphsmrpAFSEwJWtFKqcC&offset=840
  

var frommonth = 1;
var fromyear = 2026;
var tomonth = 1;
var toyear = 2026;
 const now = new Date();
const startOfYear = new Date(fromyear, frommonth-1, 1); // January 1st
var diff = now.getTime() - startOfYear.getTime() + 2 * 24 * 60 * 60 * 1000;

var downloadService: IDownloadService<ActivePermitsDataService> = GetDownloadService(diff);

//ergo
//await downloadService.downloadForAddress<PermitTx>(
//    '5ivrmzxYZTDDDoKD1urVYrXZG96ijTUYXQJzE6SCRJ2RR6Kj1UPWL1iN1xeHgYJEQjnQ7m3Ld9tBRRYqjzrAVAqHyGbZB3otUWZW4sUxN4E11fNUZEMQ3kVwnZxFmeSaxcXhQiTFH1cvBYWuFMRRFfaA2UMfpEgm2WoqeiJxPCojp9D7h6yMV4br5EtWTQJKRtcopBRoUgDg9mrKPAXGPZZKTZbYotgLKQ4nzD8QB5hjYJswhLmePaY3zK5eJq7NTcdoAgbNPK9nQ9UpBUgrc8RB76P8evPHMXg6HrVdQ2z3rkvYFVZqH9SmCkE8KGiLYGX7hwaXYGvPExdoVDp7qsSctsPjwgt9Vts2G76dzJzfBhEunJ33vdTEkEXX3wkjK4ZE8g5YKCwGpcED5PhtRQQtJZaZMYTZV3TpbPWy57U49cD3HVeUGR7efxUHZxYybWJ7q8i6NDm3PUwKFN63HmPYQn7TMYGkvSoizTuTAUJomiKgSnvoz2DSUzukRSRmUFA1cLqdR6s7FbeJfpbaKWX4kUGM2Xh38FdqNE94SjkQMY9bv3H5N8MgwGL2La12e1GXAdMCKJCWKRe27vjdaHJWmsKrBLuXQegGN8BaqNuvJbhrmreHAjR9tVwVkxcTUsr8u8TGUzkzN7coV8HiQV9KBMVgQ24NXPYyoCuedwfCiNwYX7PSSbvve7Dgyy5e1S6qbVpEpVtjy9NzWfRaqr5CyGDqhkfjizNG71NZu543vkacjXrrfPWqtNoXMtTRyM1pzwW9ze9aoRX6e92mVaCUB8hTnfH3Q8EstRLDJygLmp63y45tKwBVBDjog7Z6pWhTfBapMBz8Q28pMfPAR8ywfz8qvtkyQcv9SuEZWfvpZREaS5PGhBuqU79eR9bwNwS6TLu9BZV5Y1ahVFA1fMUxhXTvX69hKnNHFgZ35fZdrVrSeU4U5yGvYX7ViTqL2oFk16HLoTXgNs6KQz7PPZr373gDeRh7PfXpX5jWyxw6SRreE3jB5SUiQnZxmAbpJNVkPzFbZXcrsrS3JHSfiVeqp1tk5uNaZcX39tQTXtu4bGrpv6EiMvYPkiDhCiKd5oAVeZ8VxEGN7SP94vF9WhS2oWUMCVLU1XW2DDHejZ36Zo1Ho8fHbUEaKNbRBozY3HYnkYyJuF4wer8xJ6q4KcPppDrS5jqfAaZF6YWsdtqgse7qMeWVUPj23Vr5XG2S9sYmWA7femKuZki71S6BqZGNfit7F4vrzqNZd1L5oyLSVCtuiv3DybRnu2YEaUtrmCphsmrpAFSEwJWtFKqcC', true);

//cardano
//await downloadService.downloadForAddress<PermitTx>(
    //'5ivrmzxYZc1s5aYrsy9uMd3wphLaHx4Kqrw7wVDwQdtj967D3qYpAw15uAr1CK4RbXKFW7kersNNe9tXu22iut2zG7tCmAP9TzSNgHMSJFBzR9y7vmqpmTGyFmn6poS81E8MzwaJ2MxkULFoS2nj7CwVsCMGweg84sJShZkGm81jxw6N65GHddQ4sJsBJb6MYFcVXeLxrgnEMPd3eFH7XoVj5uM97P6rsUAztZmeaA9hdUkc9Bz497j5BKQaiXyrFj8ghEtL1cemwfnGrsybkuq132QT9qsW7dNaG95D5wSYNUoAP7mVcziPas1PvEa5xRgMKnvE4ByYPT6BfkAMijYfXSDLzi1EbksurZGfC6jX7jfSgwuugXMNbjrUwhzj6657H9MsytUxRW8kNUKN7mwUphQGFS3nWLG4hzyas5BF8MnK7usWD7MJko7FaUWwNPVrRdatwB5uu6rUrY8UeAW9DPQMrL6VZWMKMWFmoY722pVYHdMdCsehR3CnsRDGDpZtvdqJnGgn2czeZ4AfK8o6aykw3HMTvNP2e6pxNt6FYgr2WZhbXsmeqA6bG7t9JNCw6H7tA8KJPAN1X6CYeZMitX5RWCrMtrSy2NEDepNvMgH3n4GD3tvS5Rs94gFVWHfLu4JM5BaTwfRTcdfirnwPQhYhtH6SEc8b5SgGkraojn4JgkKGp2ftszDUNyaKrY8XJQusuMG64Aoe96wr2AaRKKtUhAKfk7kUXHtGoV3h4MhDy5Wnbgb6hXcmQoMQ8HnT7JMAFWUUeWyveNn3hdNucDf2WtmXBsRpwUidapBJPD9Xukw6uEsWdkzsCNcdhZM4EqnkadRKziCubVx52TYoxDYqupyLssPc6JdaLUWny1Nh2vsEdnuNYXj82iX7AeJRaHJeyn8wytA7G8NwQXp2THTniwF6hPCWTub5khfdJ2g4VDTv14GRL88NA6w49N5FaG2ZWxqgRKYxbEJqgBE91KWHoXfsB4qvo6cGfMwpeJU5g6FTiexmXZqrNpRwmnnx1NTGK4TdqnksfaXZPMfPBbdJnQu1vfGwLuMkP5f5EvyfQ4KzazA67AxoabFYkKJk4pvVkRqaWUps9b3nkZhErUMAgxYR4raNtKHSUT13c9RMaGQmtV8viR4b7Z2JoKjqiEP9xGVoZBANhDpJ3EpihvRmDuy7MAZfy1qEm59spvdgdPPEiffw8GBv9MyDfsAGNSzsMhiP1f8WKXduWy7AdEJZTrBJkLZFPTaRHHyU9XvbRyzrxhV87thVrfRhv88hN6Viw2CyRdMJUPmVt', true);

//bitcoin
    await downloadService.downloadForAddress<PermitTx>(
    '5ivrmzxYZZfH2wJRvogecZo1YYXm32CoKnSZdtwxbjNoogRakUFe56VrrcULZtCkvAzM2MNRMxPYSfZc2rB6tkLKLCirG14JPDMfqBoWMhyzzQLVsDukZupema1i8SvYUuoaiPL5rTyQmqgF3ftPbvM2dHY623B3KsKRTNDhkoMoRmKLzenNWqjXpkANpyc3TCkDuvBypXfbWVN55F2ZZUs8L3XkvaJKcb74GY7whJB8Zg31VgpmVW4uVEuqpcvPk5FYNiTdRakyYTUVFnAdCR6ZDjagBYMr3ks2uHMhQdjmoKmmwCocVm4SGZsA8rU8zj6zrEgpepLT5UPD9sZQWtvSi6C82fPEW9pvNXr4T3sFx2xNRv8meyNUhopUfiRzVoWfx6Q4ArqU3dnmRtN8pxkDfTZr7oGrzAFAb3DRhBUPhhfWY2USAw7LMqMAuW65pdUFcGnczQH3B6V4kALNaoGMD7ixKtkdMkrAPHkJmxKzeMEd6Y49PnHWxFkQbXwqGELjDppqmdbKceyrtjUp3JwcZ5qN7YcLg1yXhFUiWAHhnAwGkHsTHivXADhV81sDBVqM1GUB3piyt6gkJ5My3SaRRTsokrnJLoGL23GwjEfTzDsvXCoXww3MQcwUUCXehQConnMxYsK7HHGV4wf8kbctrFd2ekPkeHm5ksjagEVzKMraZJgrRSRWEHdYmUGkU6tLGZTUF4Xe4MkdzXC3sRtif4iUnZg6Tnt3DEx2i5fmPD4xasYkusc6thd77x5x7MZXMdkxuo9BWTG9iiYAaE4aLQ5yEbrYeVY85DCVFAKXTsiwUH1De3rDhRZfFfQRuDqiYomDFumxofAa9k89yLeCSRyQpAH55BXLqvppusJyDwYJKd5itao8z3Qi2Fsvt7oL77fDnbotPwp7EkFbQZdGi7aUU1SdyfhxNwx6dYcFe2zpj6Spj7zb98FR2HahXwXnqqZjuym7RjN55bqPt2FufJ7CwdgQmiBMid7E1sAVMxBZyAeNbhHEqRJCajpUyGXswJjQJ9S1u9c4rRHzdntMtr2RXDtdgrt6b69GpZgZNeAX3QG9W9kQK4SAHE2BULEmNSBZHHitrRYdx97AsDLFfLpzfsPa82ew9oBy3PacMAF2WP48yxQrAzSA2p5idB5QFbYoECBBLsCyApG37AMuPrr24JrWmZLqR5XEPYnKojYrMcciwkn3L6jRpC5c1D9KrsTGk5dGtqBji1FE9XAVxuVpdddJjBSjphPx2UWtvJnwcxB8CoRSsVDF8RoyPcVwMmSfL5arDGJxBUzVu', true);

    



    var permits = await downloadService.getDataService().getAdressPermits(false, frommonth, fromyear, tomonth, toyear);

    // group permits by address and compute totals
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

    // convert to array and sort by count descending, then address
    const totalsPerAddress = Array.from(byAddress.values())
      .map(e => ({
        address: e.address,
        totalPermits: e.count,
        totalAssets: e.assetsCount,
        earliest: e.earliest ? e.earliest.toISOString() : null,
        latest: e.latest ? e.latest.toISOString() : null,
      }))
      .sort((a, b) => b.totalPermits - a.totalPermits || a.address.localeCompare(b.address));

    console.log('totalsPerAddress:', totalsPerAddress);

var watcherDataService = GetWatcherDataService(downloadService.getDataService());
console.log(await watcherDataService.getAdressPermits());
}

main().catch(console.error);


