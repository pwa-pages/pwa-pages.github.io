// service/src/exports/index.ts
function GetActivePermitsDownloadService(maxDownloadDateDifference) {
  return globalThis.CreateActivePermitsDownloadService(maxDownloadDateDifference, null);
}

// apps/server/watcherstats/src/main.ts
async function main() {
  await downloadActivePermits();
}
main().catch(console.error);
async function downloadActivePermits() {
  var frommonth = 1;
  var fromyear = 2026;
  var tomonth = 1;
  var toyear = 2026;
  const now = /* @__PURE__ */ new Date();
  const startOfYear = new Date(fromyear, frommonth - 1, 1);
  var diff = now.getTime() - startOfYear.getTime() + 2 * 24 * 60 * 60 * 1e3;
  var downloadService = GetActivePermitsDownloadService(diff);
  await downloadService.downloadForAddress(
    "5ivrmzxYZc1s5aYrsy9uMd3wphLaHx4Kqrw7wVDwQdtj967D3qYpAw15uAr1CK4RbXKFW7kersNNe9tXu22iut2zG7tCmAP9TzSNgHMSJFBzR9y7vmqpmTGyFmn6poS81E8MzwaJ2MxkULFoS2nj7CwVsCMGweg84sJShZkGm81jxw6N65GHddQ4sJsBJb6MYFcVXeLxrgnEMPd3eFH7XoVj5uM97P6rsUAztZmeaA9hdUkc9Bz497j5BKQaiXyrFj8ghEtL1cemwfnGrsybkuq132QT9qsW7dNaG95D5wSYNUoAP7mVcziPas1PvEa5xRgMKnvE4ByYPT6BfkAMijYfXSDLzi1EbksurZGfC6jX7jfSgwuugXMNbjrUwhzj6657H9MsytUxRW8kNUKN7mwUphQGFS3nWLG4hzyas5BF8MnK7usWD7MJko7FaUWwNPVrRdatwB5uu6rUrY8UeAW9DPQMrL6VZWMKMWFmoY722pVYHdMdCsehR3CnsRDGDpZtvdqJnGgn2czeZ4AfK8o6aykw3HMTvNP2e6pxNt6FYgr2WZhbXsmeqA6bG7t9JNCw6H7tA8KJPAN1X6CYeZMitX5RWCrMtrSy2NEDepNvMgH3n4GD3tvS5Rs94gFVWHfLu4JM5BaTwfRTcdfirnwPQhYhtH6SEc8b5SgGkraojn4JgkKGp2ftszDUNyaKrY8XJQusuMG64Aoe96wr2AaRKKtUhAKfk7kUXHtGoV3h4MhDy5Wnbgb6hXcmQoMQ8HnT7JMAFWUUeWyveNn3hdNucDf2WtmXBsRpwUidapBJPD9Xukw6uEsWdkzsCNcdhZM4EqnkadRKziCubVx52TYoxDYqupyLssPc6JdaLUWny1Nh2vsEdnuNYXj82iX7AeJRaHJeyn8wytA7G8NwQXp2THTniwF6hPCWTub5khfdJ2g4VDTv14GRL88NA6w49N5FaG2ZWxqgRKYxbEJqgBE91KWHoXfsB4qvo6cGfMwpeJU5g6FTiexmXZqrNpRwmnnx1NTGK4TdqnksfaXZPMfPBbdJnQu1vfGwLuMkP5f5EvyfQ4KzazA67AxoabFYkKJk4pvVkRqaWUps9b3nkZhErUMAgxYR4raNtKHSUT13c9RMaGQmtV8viR4b7Z2JoKjqiEP9xGVoZBANhDpJ3EpihvRmDuy7MAZfy1qEm59spvdgdPPEiffw8GBv9MyDfsAGNSzsMhiP1f8WKXduWy7AdEJZTrBJkLZFPTaRHHyU9XvbRyzrxhV87thVrfRhv88hN6Viw2CyRdMJUPmVt",
    true
  );
  var permits = await downloadService.getDataService().getAdressPermits(false, frommonth, fromyear, tomonth, toyear);
  const byAddress = permits.reduce((map, p) => {
    const addr = p.address || "";
    const d = p.date ? new Date(p.date) : null;
    const assetsLen = p.assets && Array.isArray(p.assets) ? p.assets.length : 0;
    let entry = map.get(addr);
    if (!entry) {
      entry = { address: addr, count: 0, assetsCount: 0, earliest: d, latest: d };
      map.set(addr, entry);
    }
    entry.count += 1;
    entry.assetsCount += assetsLen;
    if (d) {
      if (!entry.earliest || d < entry.earliest)
        entry.earliest = d;
      if (!entry.latest || d > entry.latest)
        entry.latest = d;
    }
    return map;
  }, /* @__PURE__ */ new Map());
  const totalsPerAddress = Array.from(byAddress.values()).map((e) => ({
    address: e.address,
    totalPermits: e.count,
    totalAssets: e.assetsCount,
    earliest: e.earliest ? e.earliest.toISOString() : null,
    latest: e.latest ? e.latest.toISOString() : null
  })).sort((a, b) => b.totalPermits - a.totalPermits || a.address.localeCompare(b.address));
  console.log("totalsPerAddress:", totalsPerAddress);
}
//# sourceMappingURL=main.js.map
