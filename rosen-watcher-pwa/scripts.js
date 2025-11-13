if (typeof importScripts === "function") {
  importScripts("./ngsw-worker.js");
  self.addEventListener("install", (_) => {
    console.log(
      "[Service Worker] Installing new version...calling skipWaiting()"
    );
    self.skipWaiting();
    console.log("[Service Worker] Installing new version...done skipWaiting()");
  });
  self.addEventListener("activate", (_) => {
    console.log("[Service Worker] Activated new version!");
  });
}
"use strict";
const processEventServiceSingleton = (() => {
  console.log("Initializing ProcessEventService singleton factory");
  let instance = null;
  return () => {
    if (!instance) {
      console.log("Creating new ProcessEventService instance");
      instance = new ProcessEventService(new ServiceWorkerEventSender());
    }
    return instance;
  };
})();
self.addEventListener("message", async (event) => {
  const processEventService = processEventServiceSingleton();
  const data = event.data;
  console.log(`Rosen service worker received event of type ${data.type}`);
  processEventService.processEvent({
    data: data.data,
    type: data.type
  });
});
"use strict";
self.addEventListener("message", async (event) => {
  const data = event.data;
  console.log(`Rosen service worker received event of type ${data.type}`);
});
"use strict";
var ChainType;
(function(ChainType2) {
  ChainType2["Ergo"] = "Ergo";
  ChainType2["Cardano"] = "Cardano";
  ChainType2["Bitcoin"] = "Bitcoin";
  ChainType2["Ethereum"] = "Ethereum";
  ChainType2["Binance"] = "Binance";
  ChainType2["Doge"] = "Doge";
  ChainType2["Runes"] = "Runes";
  ChainType2["Nervos"] = "Nervos";
  ChainType2["Handshake"] = "Handshake";
  ChainType2["Firo"] = "Firo";
  ChainType2["Monero"] = "Monero";
})(ChainType || (ChainType = {}));
function getActiveChainTypes() {
  const active = /* @__PURE__ */ new Set();
  const addIfPresent = (map) => {
    for (const [k, v] of Object.entries(map)) {
      if (v) {
        active.add(k);
      }
    }
  };
  addIfPresent(permitAddresses);
  addIfPresent(permitTriggerAddresses);
  addIfPresent(permitBulkAddresses);
  addIfPresent(rewardAddresses);
  for (const ct of Object.values(rwtTokenIds)) {
    if (ct)
      active.add(ct);
  }
  return Array.from(active);
}
const chainTypeTokens = Object.fromEntries(Object.values(ChainType).map((chain) => [chain, `rspv2${chain}RWT`]));
const chainTypeWatcherIdentifier = Object.fromEntries(Object.values(ChainType).map((chain) => [chain, `rspv2${chain}AWC`]));
const rwtTokenIds = {
  "8a94d71b4a08058327fa8372aa69d95c337536c6577c31c8d994169a041e5fc0": ChainType.Ergo,
  ddb335d2b4f3764ddeae8411a14bec97f94d0057628bb96f98da9d95e74d02bc: ChainType.Cardano,
  "30e4392fc439fce9948da124efddb8779fe179eef5a5d6196e249b75ee64defc": ChainType.Bitcoin,
  f5985c64c1aa8f08569dc77a046f65f92947abaa9ccd530aead033eece23496e: ChainType.Ethereum,
  "33477693d6be5bbd3a4cd786fbff5e6444449c191ab08e681aaaa87fc192772c": ChainType.Binance,
  "5d727b722fb72aa02257d987970c68aeda41614518bab9f0d8a21bbc75b7a3b0": ChainType.Doge
};
const permitAddresses = {
  [ChainType.Bitcoin]: "NY4PEzZ7VfjtnTN697R7my9uAVkCYb6N71J2RSmJCFSdDqVf9aPvFQqKXujYDBtSA8hxYVUgkGgU9SP2Ss7JDUkHkdGLBqZwH4yDcPyVvbVbcre3o7nR59wiFDVtjzCjfZmVvMVJD9HiW4GKqVuZGTQCKns8tDe3sJoDNTL3VmhzRUPZf9JCN4TNji1ruXf5CxqWtDrCfoxE4xfbRWGmtBMdLMoRdL85V7z1fP5KxroWX5YgZQo28nTCU3WjPuY2YrjqYYGNHXvFZ9G8E85kCcseNtRWqViXGFzmwqHWKaYe4AdJzBbMKzJWYszsbiemNvisPtT2Yj3FjAmAErpW3gMeWyH3WtbipaAu9D31ggpLeLkLTGscJ9HB2oExpGWvv6u9mGdkTJMHYUuZJUGrcJPE3m7ZTEFxwkbeR9oD8nHHgW4SB46kHFbxzNoUksGPZQnxf95J3e5PUnhYgg7mrQLNpq6pphgGukFcHDgAN2rgFmUSDVsuzomhP735SMiveXSPzx6PZeP7CmrEHyXN6mFbBJuY17kvzzix1w9eFwryZDuZqnAANkYhF3TLkLyGZfSC4o9iAGynpivuNMUgbKAuj6D116tKoCq9PHELL8eTefmXNLFuhauQuKRjmWQKj9zYSd7qi6Zf49KX25PnWHkC3REc4abYpjtiQFefT2HkWRwneTCkJ8uMvoHs6kJzLg8NVzH8XwEZhTM2tNSDhBKZaURpYiQcHwLDgv5uFiwhasLAdZi2EJywBYX51NKc6m4MEsTiAJC9jkEydWcwyDzSHN18yEr4rvEgMNkUhLHJokgV2v3BNFhUTJqe58e2QXAmx9MytUDqzg3vwexEpMhueC2roYA27P1mmb85HKEz15a8LnuUT8ZjmG8kDbHuPYFyxcATytVuDrFDzqKBt9X36bocip4ZU4RRY8JcWjJvMcrBCjV3EhDVQ4it8bhoZnn79PsXazvDteua1NEYEJniPnNrRaiKTUWrseEUQ2vVjWy134jMxRbeiARhoj7MDxug2kFP8jRGSsxWt3Qqbv2SezT3xZ8jYxTyQ2CiyJ61CvUQwPtmoY3XKjrgrJKwnSzJRs4egKPYZKoSiSy6UdHMKuNDmys8wYo3Gi2EgVdUYRLLWcHh5Z2H91odSbTW2h5e6pZeY4a45TgihE6ZnZBhHGc75zJjukhPgP1wEp8GrreHA7ejvTEmpwNgj571x5JrvRD5TxWaFuZKBonGexovAK2L5v",
  [ChainType.Cardano]: "NY4PEzZ7VfjqPk9gZSNS6ERoYyYBEBebyeXUPs1sjEfdenV3Kq1QKWBSQ1Gfem47fPVRw5UXcYNXtgXNGqsD4DedukcYv5c5kviu94yWpyrh2tbXHea1tyfuEcb8njgvXkAxrXkjvgcPEQqy7BsR3KQPe8vzSaBG5V8WFHQqvHmpMXXYMvKDZzRbNjZUgYvVinGq6qx9hct1fFG15nFdcWZkzhBcu8ytydt3MmnkYEyL4L2rLD8Jp2Q16DfeaBBqmuyxpMoVxPrQzbPjq5GKTKrqnpisWVrubpAy5dg1oQ6tVZompLpwTWvX1xWspA9tWPmc3MCV2e6y313KzSosGLi2Sdv2ptDgJpKamQv6fNKmj3TWkNbPCDfjp2KXYcfYE1vQ5prRZCPCDhVgWP7bqpF3SeUTMJmvBaXjd1tBavjanquQDkYU4n5XBwJPvUa5kCAP1USTgP4cgPA6SzB8hg2RXmB4PmEWM2RWv2mrirYeTdZrzXCbpGCd9B9GK7bNknnYz1X8wVqyYxxQMZ7Rort4BVRNPNKzEMtdGKSmQpiWitfoAfphXL3SGMfwMT3sspgDcD93Ftiq9gf6kgawpFBKWJmV5jXmfiSCWkPW5x56L5hcc3NwJLYYjcMh81aXQBP4HguyudttZcF8QiDa6Ae3idS1BTegArbhZBFn1TQJGgWtuCubLC5Ja71FadEN1G1s4Uz4BapDu3WpNH4NJn3UeWavLd1EytGjevyJu8XjziAMYr6cPZsyhb95aj7LAHgwJ8YT42zWYoDxqhEzbuderVtfauVJxEo2Rt7p83hMtkFS8Dy3vNbdmGEhWEFfDEyquEHTLsYkehRMWTeTeoDpRhKpeXoDxTNriR6Fz6y3Koxwzg281gYhxxvew7TpvSa3cLvjBpNxuoUfhyT645u51cBsQzden3RB5LjJeToSctrx74nNGCm9sR7fQgzno2pETeit1mykq4eocy93EoTcypKitcbfhgAYwXrGcGUQyhsupFgPZMnms5VnWhCsGKkK93uy7z4BRgi9y2aU7zMUxPJN6q3kYhjcdgYhcgqLLmWo5pBRSxcuq3p3NhPnd2Tps5RztjtUS5ZkbRVsTri8Sy2J5xPLir6VB7uxcPCSYYGJaaVfENJ8tYLYH3m3TUoxRipyjNDDBmsRdujqFQvFoYiCyaPFgu9iqzMvuPDM7FDPAKV8V7A895N9SMMZkG7uAzVvLgrU8Wrxdby2CAX9ttmPJn",
  [ChainType.Ergo]: "NY4PEzZ7Vfjvo3AYu7dBh4ziatarsMAVPnwtHZL6BfoKeaots7P629HvVAmDZNdiVNUitWMqVJhgphUregwCXnhVNRddztP93qbtSWCMzVk1UQmCVUpvQyb25nyH1PrpRSjpFewJWeN3bjiVF6bTAm2t11X4d2fKGnAo3PX2BFVeyAUre7T5CZs2uikxZisyrJ1djE4UY1uwpTFkJv3RzZ3JMugNDeicf7qWqtCtNH8E9uG56VD2dMvmsr5YHQbrKgxa5foyA4K8cD59o2ub9ezbhjSgfXbc6VLaXmp5SzdP6n61MaePNexedifBWwAsHFcaaVXf7oUkePp5dDpc5mBbaAuidBAwH4SaxnUNjPw2bHVSXEk3ZJwwBrZRG7CYBCvEN6wFuPyzuhGsJQwdCtvUqxViGhxWrhRYKwixLhScVdGwCFCF9HjuCXt92FkEZKRk1kJuNzMUuc9AUbafbwhi8RC96TVQrtnsajhomptLKFmQXg4nZQao3jwHV8kfZeyF9BX5kiWUnC83Wa7X7seGUcECHRPLAapk7Lr1kUQ6Q62RpBKeGUsfmPcyNhaZ2bmdxMxxHAhdZdKVr78R5ch2BvG7ZtV6wkHB1hcVJGJmU4dskPPR5EFd8gED72eeUnNAsTknW7ePfNMj4DYWGqf2QhPHDZXsyRN2Mczv4tgyRsNA2HR3U9oZikejcuYhha9yNsXEdNn23B8wa5aDZwR6hwZ9hQ74yv29sbfBAfe9XWT2UZAVaeZeazQSSrvAhicEKnwmCAvfwcZNS57SHJ1EfZf1oEt66S6mGFdBzcKPLZzmJmCgMiBmMThqMemT1XS1ovES76LVcpXSkyiEdA17htR5HuPWdDVfWNQAK2jAM8BjKGtvsh93oMFGvMaBVBAvj1QcfTr17LdeeT7h78bKzyF5SQWuyu46xtDbmTZVrR1ZSpnffiD8TbWnae85Bw1VfttScQ8yfa26dsc9pwLrHhYhC4XKEVPWYUxLHZd959tLA2kGNkJBJR8PPThR8PugaUTq1sQpLg4ezPPUjYyWFvhFf6Rcw5rcJAwj99AUwoEhPaUnxT3TxiEJBbD3Zsna33mQD9Zg69Zzr9xiLA7GzhhA998dwkpbbgqFxyASwH6yav5qDbXPZH7GPtt3nTjUfRs87SGYgVGHoGhqaVUAfQKW4TtvFicdpvQws5kg1nZthd7WkWcR7HqLc1R4wBPFynFVGc457vhQwaP78yQsQDHq86",
  [ChainType.Ethereum]: "NY4PEzZ7Vfju59RSazdQK92s7PaLrnCh5D9yZBZx7fptQjQZ7Ra2Xiz1PFusrkij3YamVoqXNqoUzazpjnzwmX4zKvPwWGLdqk1RXvp82m7Km2nwtvL2d6tVVCfgiVzA392JszEtNDh9hNXn6wk8eXjXwUg1q1w4UJi6XzmscSH6iZ1BR6ghCp5fyrZBeUfnvbPsfgHmmoVQzmDJ5E9KjmCg53detrDH29gyZUKyqjC5ddnCKG5cvVmoZ7D2ix9KFa9RuLcpVTxnVnuoJnHL1yoGog11TB3eT5hRyiUzeBU688pMb1xyUaCw8bjh5wSsBRAWQnDiAaGuj6zsJEnKeMW94XLeaTASw4K2bwyWHr4BVN9XNSeopFoj6mXPrD2ZhGgPV4HeQp1qEQ2pemMiSecXYkghfnk1t8hnfDNMfXoyKXxEmN8Cf1p7M8pqtgo7H9uUi6xsfotsB2uHVSoT21nzERYMaej9YuYwgC2iUzrzeZNFu7LbMqBErDgHn4wfgppRnF6axDca7QJGNv3q7E2q1DGRpzmTXPfr9FeFxki9geAwsTAy1KTqU2u6TY2wcRC3GzQz83x6LatZLhf9HZnVWZ3SRWQ5AmKUfxhHVxVC9Hwiraqb7ciZBsrnXHWmFaHHHYxafZwoLUBqxeWnHNM211MUwJ2rD9pvrqREfYs4CKYJNDxe5nezL11TnsLyt6p6XkKgHXvvqnk9HQ27pMbpNVX33Y8iQpznFvL2YBCn6Dw9hBDgb8thcYkkAXyLRZskEmhXQFL9evXTstNoeJVJp7NAo7dejZRaKHzTvZnZpkybJGks44qFbGSuSXGegN1V1HWyYGnGSgEJm3yrapNC5tdTvHWXVDxjw1G2TwqKL8D4HZVsyWsu8PEErsaf593jscXKTRn2uqvdhp29rJKGV4v2Cfd8DDXzwhmVxcVFyUiXg9JDe8fCi2rxmFai7a6P6vTJrUkJRtKYBt5RUY3uzKXpX4J4fBWMHmnM2yTSgdaXb9MYULmsbWitqpxiTWh1iMQdXNHxU1A2hHvsqogqEhrG9bGmMU1m1EFSFAPocv3KUf5bPYUWmVUFaxa2MLmE4fs1EC3kCJz8434NrxD1YVA1iosiv5f2tDM8E3w15VRik2a3R1Y6C1D9uHAAT1XK1A27dnx6e586eghm5BuvCY9Di89bdYH5KX3sg4NzWAAJYd5DLZbtdXxzRrKiKwMcPjskhwyQRcv3qstVzPDfJdE8Ej",
  [ChainType.Binance]: "NY4PEzZ7VfjvyhUfALrnVnmbCo79cESCRMoD4m6TNTRdUnGR3B7EM3KRKxPh6BmdAsdArGV8DgAanEjs4QLYzYTBPGexkgMBPaRwAMSuVAG5rtzuN5qNmyAZsfdrR3cnBuspTqRkBQFp1oczXkCVNFdjpPwAFYLZgnnJFJVnZbp5TQSECTioxM1oJSKm7LBnEbPNrVWFqcShvqAjoyie7Bd471mNEq8y3mEeV7FH3AQCm4fKQgyfwYkRBC4jvFjWDaMshpFbV325g7n5rcyRsbXJ8EGMC2pKVGEbkx2JCgX4ba5dxx1uGibiHnuHiTNXLmrbEJ6BFtBFZB69Ye7U1C23uBEEvTRLteSbKzKAaGv7UbhVtvcgX91muR3sy7jXTW5FszKWej7knHLWJhbUf47fCVvmbXWEx6rHu3fj5hEqQyfVuER3J54yQAtP9ertP9hQX6GQ7mXfyUwmxTYiJS4GxLzeWZGwfSfRUDe6GN7qurja8kVeMrTwdo835yt4XUcemLK53TCkTLe61Bev6NtiUCSuNrhddXcdfMzqk1DWZCXhkcm51pnGmbmAntwC6AF7rL2LHtHi4et2edKAJHkYUp6t9a8Q57eL6fX3Q4JSfDrjfgn4x2fJaF1APdwbBVKoJyhDUkmV6xAaANYZifq54eFg1qBh54F6mu61U3Df5sZqsepzQJNYp6Y95afLuHGmG97mxhmmRsecKbamu4p6P3TPZEs5eYfHspVf85GNh2BztxxYn5hSsR9c8VRJjBhHR1qGHzX4mbRKWn2D41L7AHPnapSQyHCAPdhSbaAV3b6eLqLvc9QrFBAdnsHqN4NauYDPZc6sSrFuLEwNKFbjefc7pBDnA2pfTUUVqCTFuuaM8VmLKFxG2oVsi1k8GD5moSzQbEphVfWTjE9kTZR35oArptsctXGXRT6MXToom6m4cj465Xs9nsRY8t7FgSHsxetJafgogRjo8NRpgFkBpRgf69QuZbqYkrFMTsoDRkLYCLTF4XZwYzu3tqrzLkSZPKDzK1x7pySFdB56vAstU8HPHLqtzduvHt8Gvrkh1mAYQ1cEphCF1jfs5vZUDifLQYnZ2JiJeMdFZu8RhssWvwU2oL6wqx4Ey2iRaSrLSadYnWx47QvGZeZ8M5gupYMNiL7tTkpCjMjbuetqGcpQrtiwuBJ25DqfnWeLN2K6LS49Fb7GjW6Y3fMgdDYVhh7MFpLiyHMcC7wzdBJSMEcE1VNvo2",
  [ChainType.Doge]: "NY4PEzZ7VfjpDKVcQkzdi4CLcgbMvUX53reQKShv8wRAJ8cRsEi4zV8VwevNM5JPxi5UA77685CKHAQAEkE5HUX2jv5HoMoaZFqcYNBQmHxLA86pS3fHDhg6GvJ8SHssoUZX4uGcgEcRt118Bz8bR8sVAGC23UcafXEwmhfCRfrijjPxDx9ZLHN14uuCU9Gv8Upta65PkzbE3oTD3XDuq7RicN59bz8o6eHef9MfxZetNXrgGTkCJJVJrQ5ahqPLmCzkwv5iXLvRjebbPcen8FxPJ7RDE9rG5BW4uuyroqH6nsNcQKRDnvvnrt5PjghRfss4EswpEJXoxxf7VxYUxx2KgHy8W865bjV5Gvmd9nLPnRStwDV7t7HP2U98fMH3Qdp8PS2Vew5edCjjZTiu2k5kB8frNwSdhGvu91TpAhen474RoxWeoZErNRPpkBH3MN4vHo7EZYiJPjsYtLctVEDWZkvFuaFCYQbuF73JqT7673erYxjRu5o3bCHMgNLYPYuriHLyWtpAJvkFa2Xir54tNfMFyEcvPEWYWaB7J8JsBa8E1b6v9x3VsDyNrU3bGXz52Ax7dG5ziTX1DG2bZuRvGSejjeP8GVgUXTBvRARs8t4wKwdicHkZVie2zGBR5w6Ajo1wK8hNHi2ANYSX5VEFEAFgjwo8DNMUTXbyreeKTcJgcntoc1CbNaiDUvJEyRYaAS7mncPsAiuMjTiFUAzRU5gWdtgRTrkVfi638QrvsvKQgKNPxvGBQpEWtSnmDfRhFifDT716wZ22rca55i9V2ArmDRVZG966MSTYNewX96iwndT8PDhhR4xfysMrTdQMPBzFXGoaAyV54rZ37G1JHQjKQLdMXLP67wjqFMNDRjBUsUYpBYVgj4XpvA1nik8UDqGW5zHoEszpjFJNCSzoexM1zLk8q5vk73dfQ3zaME7tTjp7rdAH3tPtWVkrFSWyDe3rw4zZpSHE2iqH8dDvTVuS1QYsJ6G3iqE8nQbg9FipofqTEjihP9ojvcXgKa9ASce5JNsRKHUSeYkAtDs561sZyf5uY626GcsvMYKGHjEjxCYJUYfrDTFz8v14dNAzVAiYQS7M32otTzKeXhB6ZNSRsErvMfrjgW6Rc7joCL1umHo8c3n3nqxLjZqxnzTgBAXnUNDY2g6LLdVRbj41hxTmvVkwV8MV5N1tvTAALAiagxDKu5bWsfTYFHbiiA7tLxqhsUvATorTzU7nrN1hjpQT3i",
  [ChainType.Runes]: "NY4PEzZ7Vfjp4L3K8LAKgrXaevRJNJDddHuZ2FcRv9FeWQcLP58p1JLoCk4zzVGBa19a7ozPRiC9xF5bvSWpLofsEEhZFaFY7NtsinQv7foN52JJpGqdxYws76BkTPCKScdfAahJfmx9dobR43MqQoegvmVx7D4yS9K8SLQLPdrehd3wAuqpK1ZfC8wAMXGixXZDkuKEQfQn2UBuMzzY8s3dcPeomgLq6aKRMzNn8FkxMqsuV8hTsot37rUMJLu3LAbMAvqinCBD2wLiZFvfY9qCUqwWzZK6AwF1qoScYvbhx2rZuiogfKapSKTqaA48KWCQrfgfSmzgsjahEWohvPVhZ1dP1CwBrCM25iPUFsWZ2KFrCGxU8NA3kT5F26QbrxUS2Ay8WNFpFTTkdM92RR6jpoZRkwwdLVXZpNVqcFdjnENj6XCqE6Gmbm7MkaaNwnPPqw2oqXg92THYshruGZUWMLm95ogrQE2vFhRGaPfNuQSLDF54A8pMsJjbysQYTHF1vUEs8uaGDBQUuKMsiy2g1cKLfQcUNyms2dEwta4pQm2s7M8jwQQ14YjcUQ2Es8AQihj7GRzwtC84eHQK3BqFSVCX8MpaqUL8DTbuBoj5TgQKqZtMWHEMuXdJNm46TooiQgdSB2svop2q1xGS8Q5xjLVf7dVtMy1x9AKs6ZRharW9THaZjkeCRsnhdWFvnLSor8zBkdr24v3aygf6X56kkXQznRGbBx36tmFNLV9c23zBw4hUHYGV7aAPY7xeN7DuwzgtR7UtsUQVdSVp1BymTgYhmRFV3MhWm1XG3XXoh79Tmi5ca8oChVZiMXe32auJSsJoFSmqnnTmh5xFgXPJFJ41iPtrj6UbQSQdTF6tzEY3b9DpCFBYfbHkTec7Zop3ETw1zRqnMxrAg2gsGdeFAS6Dqodi2XT8EonYw5Mft6DSZeXTAjNnwXuuEU98yRZXzG45vkdGRXg94mKhdEsmeRDB5GjYwf9yd3JujfJLNAyCzGcbjkFgYYpz4ZHpQDugGKBfZDTDP3cxjKL15SAVQx9rcL5vv8uv9wmxE5PQk321SNDKowJa4o1dxLfb7YWyqJjbKxUjt8WpHtMR9RsEMy5pphNPuZ9o6RqvGKoDdPTvG1pJxUB5qHAVdhVS63oyajwT2zmVLtXBk6eFrFvUziiYuX3sdondfaPcH2f4RgivRCSC78JLQz9NgTtLE9nssi5n4p2HDCTFBbfnuxHrNbXvR3",
  [ChainType.Nervos]: null,
  [ChainType.Handshake]: null,
  [ChainType.Monero]: null,
  [ChainType.Firo]: null
};
const permitTriggerAddresses = {
  [ChainType.Bitcoin]: "5ivrmzxYZZfH2wJRvogecZo1YYXm32CoKnSZdtwxbjNoogRakUFe56VrrcULZtCkvAzM2MNRMxPYSfZc2rB6tkLKLCirG14JPDMfqBoWMhyzzQLVsDukZupema1i8SvYUuoaiPL5rTyQmqgF3ftPbvM2dHY623B3KsKRTNDhkoMoRmKLzenNWqjXpkANpyc3TCkDuvBypXfbWVN55F2ZZUs8L3XkvaJKcb74GY7whJB8Zg31VgpmVW4uVEuqpcvPk5FYNiTdRakyYTUVFnAdCR6ZDjagBYMr3ks2uHMhQdjmoKmmwCocVm4SGZsA8rU8zj6zrEgpepLT5UPD9sZQWtvSi6C82fPEW9pvNXr4T3sFx2xNRv8meyNUhopUfiRzVoWfx6Q4ArqU3dnmRtN8pxkDfTZr7oGrzAFAb3DRhBUPhhfWY2USAw7LMqMAuW65pdUFcGnczQH3B6V4kALNaoGMD7ixKtkdMkrAPHkJmxKzeMEd6Y49PnHWxFkQbXwqGELjDppqmdbKceyrtjUp3JwcZ5qN7YcLg1yXhFUiWAHhnAwGkHsTHivXADhV81sDBVqM1GUB3piyt6gkJ5My3SaRRTsokrnJLoGL23GwjEfTzDsvXCoXww3MQcwUUCXehQConnMxYsK7HHGV4wf8kbctrFd2ekPkeHm5ksjagEVzKMraZJgrRSRWEHdYmUGkU6tLGZTUF4Xe4MkdzXC3sRtif4iUnZg6Tnt3DEx2i5fmPD4xasYkusc6thd77x5x7MZXMdkxuo9BWTG9iiYAaE4aLQ5yEbrYeVY85DCVFAKXTsiwUH1De3rDhRZfFfQRuDqiYomDFumxofAa9k89yLeCSRyQpAH55BXLqvppusJyDwYJKd5itao8z3Qi2Fsvt7oL77fDnbotPwp7EkFbQZdGi7aUU1SdyfhxNwx6dYcFe2zpj6Spj7zb98FR2HahXwXnqqZjuym7RjN55bqPt2FufJ7CwdgQmiBMid7E1sAVMxBZyAeNbhHEqRJCajpUyGXswJjQJ9S1u9c4rRHzdntMtr2RXDtdgrt6b69GpZgZNeAX3QG9W9kQK4SAHE2BULEmNSBZHHitrRYdx97AsDLFfLpzfsPa82ew9oBy3PacMAF2WP48yxQrAzSA2p5idB5QFbYoECBBLsCyApG37AMuPrr24JrWmZLqR5XEPYnKojYrMcciwkn3L6jRpC5c1D9KrsTGk5dGtqBji1FE9XAVxuVpdddJjBSjphPx2UWtvJnwcxB8CoRSsVDF8RoyPcVwMmSfL5arDGJxBUzVu",
  [ChainType.Cardano]: "5ivrmzxYZc1s5aYrsy9uMd3wphLaHx4Kqrw7wVDwQdtj967D3qYpAw15uAr1CK4RbXKFW7kersNNe9tXu22iut2zG7tCmAP9TzSNgHMSJFBzR9y7vmqpmTGyFmn6poS81E8MzwaJ2MxkULFoS2nj7CwVsCMGweg84sJShZkGm81jxw6N65GHddQ4sJsBJb6MYFcVXeLxrgnEMPd3eFH7XoVj5uM97P6rsUAztZmeaA9hdUkc9Bz497j5BKQaiXyrFj8ghEtL1cemwfnGrsybkuq132QT9qsW7dNaG95D5wSYNUoAP7mVcziPas1PvEa5xRgMKnvE4ByYPT6BfkAMijYfXSDLzi1EbksurZGfC6jX7jfSgwuugXMNbjrUwhzj6657H9MsytUxRW8kNUKN7mwUphQGFS3nWLG4hzyas5BF8MnK7usWD7MJko7FaUWwNPVrRdatwB5uu6rUrY8UeAW9DPQMrL6VZWMKMWFmoY722pVYHdMdCsehR3CnsRDGDpZtvdqJnGgn2czeZ4AfK8o6aykw3HMTvNP2e6pxNt6FYgr2WZhbXsmeqA6bG7t9JNCw6H7tA8KJPAN1X6CYeZMitX5RWCrMtrSy2NEDepNvMgH3n4GD3tvS5Rs94gFVWHfLu4JM5BaTwfRTcdfirnwPQhYhtH6SEc8b5SgGkraojn4JgkKGp2ftszDUNyaKrY8XJQusuMG64Aoe96wr2AaRKKtUhAKfk7kUXHtGoV3h4MhDy5Wnbgb6hXcmQoMQ8HnT7JMAFWUUeWyveNn3hdNucDf2WtmXBsRpwUidapBJPD9Xukw6uEsWdkzsCNcdhZM4EqnkadRKziCubVx52TYoxDYqupyLssPc6JdaLUWny1Nh2vsEdnuNYXj82iX7AeJRaHJeyn8wytA7G8NwQXp2THTniwF6hPCWTub5khfdJ2g4VDTv14GRL88NA6w49N5FaG2ZWxqgRKYxbEJqgBE91KWHoXfsB4qvo6cGfMwpeJU5g6FTiexmXZqrNpRwmnnx1NTGK4TdqnksfaXZPMfPBbdJnQu1vfGwLuMkP5f5EvyfQ4KzazA67AxoabFYkKJk4pvVkRqaWUps9b3nkZhErUMAgxYR4raNtKHSUT13c9RMaGQmtV8viR4b7Z2JoKjqiEP9xGVoZBANhDpJ3EpihvRmDuy7MAZfy1qEm59spvdgdPPEiffw8GBv9MyDfsAGNSzsMhiP1f8WKXduWy7AdEJZTrBJkLZFPTaRHHyU9XvbRyzrxhV87thVrfRhv88hN6Viw2CyRdMJUPmVt",
  [ChainType.Ergo]: "5ivrmzxYZTDDDoKD1urVYrXZG96ijTUYXQJzE6SCRJ2RR6Kj1UPWL1iN1xeHgYJEQjnQ7m3Ld9tBRRYqjzrAVAqHyGbZB3otUWZW4sUxN4E11fNUZEMQ3kVwnZxFmeSaxcXhQiTFH1cvBYWuFMRRFfaA2UMfpEgm2WoqeiJxPCojp9D7h6yMV4br5EtWTQJKRtcopBRoUgDg9mrKPAXGPZZKTZbYotgLKQ4nzD8QB5hjYJswhLmePaY3zK5eJq7NTcdoAgbNPK9nQ9UpBUgrc8RB76P8evPHMXg6HrVdQ2z3rkvYFVZqH9SmCkE8KGiLYGX7hwaXYGvPExdoVDp7qsSctsPjwgt9Vts2G76dzJzfBhEunJ33vdTEkEXX3wkjK4ZE8g5YKCwGpcED5PhtRQQtJZaZMYTZV3TpbPWy57U49cD3HVeUGR7efxUHZxYybWJ7q8i6NDm3PUwKFN63HmPYQn7TMYGkvSoizTuTAUJomiKgSnvoz2DSUzukRSRmUFA1cLqdR6s7FbeJfpbaKWX4kUGM2Xh38FdqNE94SjkQMY9bv3H5N8MgwGL2La12e1GXAdMCKJCWKRe27vjdaHJWmsKrBLuXQegGN8BaqNuvJbhrmreHAjR9tVwVkxcTUsr8u8TGUzkzN7coV8HiQV9KBMVgQ24NXPYyoCuedwfCiNwYX7PSSbvve7Dgyy5e1S6qbVpEpVtjy9NzWfRaqr5CyGDqhkfjizNG71NZu543vkacjXrrfPWqtNoXMtTRyM1pzwW9ze9aoRX6e92mVaCUB8hTnfH3Q8EstRLDJygLmp63y45tKwBVBDjog7Z6pWhTfBapMBz8Q28pMfPAR8ywfz8qvtkyQcv9SuEZWfvpZREaS5PGhBuqU79eR9bwNwS6TLu9BZV5Y1ahVFA1fMUxhXTvX69hKnNHFgZ35fZdrVrSeU4U5yGvYX7ViTqL2oFk16HLoTXgNs6KQz7PPZr373gDeRh7PfXpX5jWyxw6SRreE3jB5SUiQnZxmAbpJNVkPzFbZXcrsrS3JHSfiVeqp1tk5uNaZcX39tQTXtu4bGrpv6EiMvYPkiDhCiKd5oAVeZ8VxEGN7SP94vF9WhS2oWUMCVLU1XW2DDHejZ36Zo1Ho8fHbUEaKNbRBozY3HYnkYyJuF4wer8xJ6q4KcPppDrS5jqfAaZF6YWsdtqgse7qMeWVUPj23Vr5XG2S9sYmWA7femKuZki71S6BqZGNfit7F4vrzqNZd1L5oyLSVCtuiv3DybRnu2YEaUtrmCphsmrpAFSEwJWtFKqcC",
  [ChainType.Ethereum]: "5ivrmzxYZsMEcMTZnZnsQm6jutdmSRzVW7WZoqN2c82khPoBUwF6GRVZdd6XhnNf9gbi3fsoZRM3cHmvz3sgJEJmy61cRxTKrM4q9ZfxYKBtyfNXLwD4CCeMedd6pxYDbgT6h3W5Qce2DZX51sw7aP6hu73HxJvcAirXLCYdZxi1nnGUbZYd8WNkU9zZ5ZGLVasrL49hVLNoJsP3ZYLpqzXchCL8RKv42qnLJ2kHc9BZJyv3QAYqMZTZSHQyRnYj4GAbdB3aYP71ge2HXCb6Arc6upjU4cWJPrPY4f8QcMdhXTrUtWp9u443Ekqdd3S2y2jfWLjDLsd7S9y7ASHPqx3GnCcPK4i9YnCQhdM8i5f59nA5ENgo24BTJvyQiRssDrCPpHxeTUp5ae2E5D4vyAnFfWCFfD6f5Z6DEDQvFnu1JLjjLcunp3rehGTSNgjyNNzGkjf6GF2y6enPuNcfpyNWsY2QJot4r1yZWqzeHvMgjbhnjpcManj1ikT1FFeg1oKZCCNBUbed4jYnmM1qFFmTYaovRUuEFXKFU2fhpz3EfEB79PUd5g5YMu1MTkKdUzLrEnoTxz9GKNpXCsoFvwC82hEuwXPcPFuMHdBFa4jtqSueVFgCPHHiXMz2koe6FGmCzY67q8215taocoiEC8NjGNTJ6Bzz3apbT5JP2hLVi6z11kNDQgtTA4gNRoftjZBBNVaFFj1DwURqEBzdawony7FvSpQYzgFEz5PKN7rAAr8Dsd4phbesmeASSph4aQLzB7iuibFSZXxyBm1w8GUEodaWEhh2UeTCJx2XtocU9aLYrUSgA6PgBF5NWzWwXDihESwyboSKnDb2mfHeGyjkjKSfQP2oP8Las1CeMXPdnwXUggckB44f82qjE5ENnqYhah4s5WkgPzzSvx42uhxc8VTbySPgiDefVGuFCEATX6fgAs5ikKh38TYWzLbUi9qM5Ncz9G7Z7Mc8RTdKtRLSxLUoPpiabXtyfdBkNr5PYhznMd3TPy9EHKinSzPV3GiJHGEkfYAbGmf2imbG2LrGtCEnyft3vBXYVocEnAXZsVKSRMPvkWsA7J2LRuQHrZCbVwY4LBDpfrHriEGUnAd168HB7DKPqRtCsVLgd2h6JgSHS4xXvfSwhG371VfTxJgAAtHUgKttcZfpZGXffLCwP7zmQGNVz6FJLsTEN3VXaQMQ7ooCeGHFdL7nbB7ejitfnWzWqgwqi5kv3nZEcmx4YfcnyvAjBosChtBMNfkMSVqa42Mx1xat4eJvHD5Jm1AwYijVqQjcXYh1ZzHqD",
  [ChainType.Binance]: "5ivrmzxYZw1LAT2rQQY7Gkiuo36J5uzCTyMRoqee9QDzT4Wa1NnZaQ6zVLw3yw4ksfRCdfKiCYfjyiaJuAvdwi8WfVd2VJZo5VfoX7qNEELk34ZdvjCGsSdA3AWVfqSPy8NxPqm41xeccezcgRCVmyTHJa4pu38vtBvTZsnV4jzGTZsSstTQPGZMUUTys6VSBRUGqQjFpjVty3jTFudfJ4rRgyuGhyA1A3jgzY6wPSBXHniAi3c9rQLVEGNzpuyjXD1bFVemGdEmZp5tYLKb5BMsasJr6fa3P4xdyWryg6uUrxGiPZCRT4Z9DMmSyJdfVBFtnLaL7abqN3evRuHrGMn3KVVSFocUM9dLGZpU3XzzvWkgjwxB99FVJ4TzCSKphSgh3gPuCnwQWFhpuRuJJzV8je2jtYguEMNzcygK8WkvkuTsniW3zqJdGpHEqSKcQwnR7a5nP8yVyRRi26aYrNDjuJ2XoqnpLSSNAPmFZNApWcXGRqsqdaJBLsKPkkFXNYfcpwPNcpuExuFaeLhUaCbxdjWKBWMHPxqEhvK2dcs6uXhPjp4QX9XoMSiRqBGC7YAxhZkChKaxmBM3y2sTsyfW69LFM2VKs84FF7tXCGKPomVABQCgVbt5p9BKyPcL8ERa2LJrzfKJwfoXSAPrrK2QEd5zaDi7g6tSVy5QBFzrYARnncF2ZCuGR9Nmh6VAWumXpHfVq83iVVBWHKjSvKJuBEFUzg3G1dWmtwxqRZYFgdgd5FAZp5M6Nj6x4VMi4qcJe9S1exhMHKTDmKnmsJ7AX4YA4MdRGYXGJHRSUb842gqEYbqjjTSu8xRghbuxg9ghnr8NVx4uxwE56zJUMzhP4bVftTH6XhS1MDoRUPi451LcAbRr7QLR7gq8FS4H73FtJN4cni5mURRpNAnzEYFWcjmqaUuC9VSfkuD3Aqk7vSKpbJoSkcaZMXdqb9G4x6SGxjphx8kvxQDTJkmjkxNB5bADpRA7rfkSjRX9zekM8rb7NKu5doxYovb1qPgDuPPbD2eA279btntL8xzqTW2JWQdTPqdHG1ezxBsSWqWdFzzJYFh2VWuYB59A38EB9Mcihj995Y1DGfLt9vHMaw92ERCeqtk4MqX6WSBYc9QzTEA7wUtdYGXLydyRRxbLpYTfTX4sUvhCvg2YGix1L1G4nFaNRq28jiZjfKTCLr2TWDzFvX4jVWhFjFsBVRSCQhiKfDRpsUXm9CYXuk9tvnoVj2NN3e3SLyiWjCEUap84EhdyZn1zHHQSXnsSoSynR1kiWSDCuJCBcyM2MQ8wR",
  [ChainType.Doge]: "5ivrmzxYa3qBuYZ3teFTEJP1ziojbVZAYdZF528CNfT5tiycZoiqXfZEqgud81sBrXGyGoanY95RS1xwRSzc4nSGhvhg9Awr23q8vde4k7PWrErq42DeCwborsxAwKm1YrWJEwD8KZiKmSMR9jCD3pTxfsvoq4yMJeh4bscJKRj9iuy79tzWT3NU4L1vrVNjQd9ksz8V2mUeU7EXouDTHxAM5Vci3HgeC2CBqY23J3mpXryfb3UPha7a4zf2eF7Tv5viA7ayrGgu582W2ZttnLFHQTRn3gnTU715qzjk7NMer98y528FxXNZsjSFs72tZm4kL6zMthigXX1yNBtr5vXmYKcHUyAeRWuX2CK8jAFWYF4cJeceCN5E2KjoTK47Ge7q8B9MNZBVU83HPGzjVkqjvFDQsDZyt7hyCRhguwKibwyw1Y76ceNXrhzwPgukP6PsCWyipqSMVTAxB3QNR46mGi1v2S3MNKR9bThJU98yQntABweyLuqHVmALaU5s971p9SPi25gVnLsFD2FQnczLpHR2g8iJ2PcUZageyVyCxKbX3EvUoyQTymeaQuSwNgySKAs67YgUPFGcmXD33Fbs7vQvkrDbqUVprE2igGNZvCmStypiqZA6ijDzbaTX1XwFAehFT39WyGQ9NXzCtYn35fj95NLkDWugvEmqL5to8JFbCcHbV13WCJaVgvcerLKU922nuM54QXYNoSQHYdCypp3PXwaWBbsemt1cbH9mGM5JnYuhAm2gKctu7rUwCQ9P6qx7k4nC6ycUWLPsYeaYt23RXxF9cx31A9nUqSW4n4j46j3fVTkBX47C7X2TFF2VgHFJky4d3etKp5EQodYs2caNLgmmACErMCtJ1GuamHCfSEg3iLyLaPAmtRM9HFUVCsMEL3GwLzqEasH3fy9dpUrAh8FqAHPT16gAx7ePEPU8k9obwUyYqkxMBuyaMonoy37GejLXzpzM9DTacEuNCBKw9hVHnDCB5Zxkhuj5kkaH3794qur5GCF3XKFnWNuKf35DBwVeEq3SMMsWmcBB6ZqfJJxa4vCLS6aEhtDxnSxw1TS8T9bvu91dXLH6HoAfK5vnoGHKP387yTuJmcbacFtvBoT6EWDS6DvXQx9FptRgojeF9T1ZjCChE6igPL9WhWPvvCEm6BMR2Jtsxw16JJzqMW33W5CBJstoi8oSKE2yrw7i2hxsyY6UPDWZUe4Cex2tSfWSzSS3tXo5ahVMfoVHxUmmKJoE6St16U58ETVipwqU6WLJT6BGYboueetYfbzL37FPgQEruWWNT",
  [ChainType.Runes]: null,
  [ChainType.Nervos]: null,
  [ChainType.Handshake]: null,
  [ChainType.Monero]: null,
  [ChainType.Firo]: null
};
const permitBulkAddresses = {
  [ChainType.Bitcoin]: "ZsPNMsGz8D8y11MAneZTVjJndCjgTUrBWezH77jKWr2KXMVRgs4gRkDdTLoUQq8xqtGoESTa7r3zr5E3SxQkE5CM2PaPDSHb5bQWeRtaL9eikJWw95bx4DSjCDcsECpjLxbEfahCHy2sDuXQg6potLhwVVADP5TNUxEDgWPR27x658qcHA54TPRhybb6z67cdmkPrQNXwumoGvoPNnqVcXsdXS71KpQViuk4wXBT156Nd7Tt9b3Dvx827QiLbjJXuajydCDFC6yp2sj5dk7uA5ArNfViybrVQaf71GNGwyh6USgVKBpTurrRBtxeGWNzXi4krd7XbseaU5Crnauk9fj5jEbVH88sPzuD6o4XReNW3odcKDkvqgUh9Vu6b2uGLJsV5wY44Kk3bf8PJmkTc6vQE7Mprkdi2jBfZrzffqoKC6hWLfSZNcUWFV821L43VkJbsaYLukMq1SBJ7y7rsnWcct1U8owQbDpboysHrxfeE84JMTterx8E8sxJqwQRRTxT7M",
  [ChainType.Cardano]: "ZsPNMsGz8D8y11MAneZTVjJndCjgTUnjAi7MBVhohaELkSWjyWJLdqw9DFRK5XJ5mS3TnP1cxLsjn38fsQ1FKDfXpczKLF38JVqUcTgTz4vWuQ3moQtya1Yb85tJXVnq2NgvDcuWJsRXQWyqBABL93WEFwT6TWiZeXVAQ7x3EhJGmFvUkbZqbtkHvbYACQ7PZVwVNXn44saome9v7QrCMqvxHHrdqaSc13dHXx2MGVut22sVvMsNXT5ody7hoAqmhfioxM6Yw238jUyturCgtbWdVr42Qv5t2aZ8YCdz6ifvqSbKmnNUBSiccfxr2G9Y4eceJ5jv7iJEaf3RAoYH9vTP1yiacpmFZLjtT38FUz5n95ubWfNg5kZAiefzyaFRpV8sRH147FoaQKFRUQRACivsVvXRBhZWYeA57VZ65E7E6d5RU4JJewNiQ5de5daAQXnC9aV2diVXw9obFC2aBYqHz3U14gHss9xvcVPuqFsJdQRLsejtnYxuoZcJF18vohmNKb",
  [ChainType.Ergo]: "ZsPNMsGz8D8y11MAneZTVjJndCjgTUjPFBh5wF6ZNmMySHVDcBmMx2VxGFNCcMxCKDPkdPEzZp4bt5pgwrpZyKV6nmzCAh6SaX5ZnN2fL2X2UTuLvmuk6t8BqrxoiKHmqASttYk6xJPNabuF9ZNMYQBikFWDmq2jrxZS1MG6gQQ2Mx1MgXVvPs9ZkDTe8TykK4MuvQwtjaatjugK3FC5gsB4e4KiTcMPzreUkHvC8mZQGTtGkmHSbq8hkUDfa8MUMAka4oV3unyhgvx9MHjSDNaKWtqrWJpHCsQqPxvzPKohoYSNQt6H3V6ddw1dzGbBz8eKSbno5tEaLSryLDeMAbXhivALPZ3uCyWvx9BKFxSpuqCuQs9aXH7zKedvxzE6XRrrC2TZcWn5UinvbMNu3S4i5oTK2Y8WeVfoy5XHRbK7AL9w9pimJBp5Dx2UnhhHrWbeg9XyVZP7uCEqcUK3iVFmdG2euUa84Jbr7XVaE8v3sBa8LvYdxc6wAVfgPNNbQNxK7Y",
  [ChainType.Ethereum]: "ZsPNMsGz8D8y11MAneZTVjJndCjgTUoSPbApCbagsfJ9WvbzbsgAbzHGNF5aNaoR2AyxnrCBH68d5TDEc8aBhVRBT4Q5UC5tdqi9JpMqC8CYFja9PYqMj7KZDjPyMHPxbqUSrq8pGVwe7f8dCV5brNYBCrNqcrC5TmYvp2HpoEUXVb7JsxCuPWQFJgXqYhzEbySQyZQGCdVX6XtjU7aQZK5bzijsXDJhuntTM7ntmdSBJjEhtkMrvrBH8RtTW2JHZw5ZW5QamM3MJbfYDExepJQeJtACiz5n36piDgebfWgjAgibjz6oXsky3mJk2rAETx25AMQSAkHz3cYnH5Gs6BorBka9qXK3U47Dk4tobZGbEZqVeFvuaoRb7VcGUvX8L4rQf72gXzVVCVvY9YEzVoFEfFGe392S5e7X6QpdBuap8maYY4RygToFx6fLeUggDP1gEQ2ptDXZoCcthQPR6ey1GtEju8jqujt2VvJ6A8VjCbU3JYvozB6kqGxLCLKHaN1zm1",
  [ChainType.Binance]: "ZsPNMsGz8D8y11MAneZTVjJndCjgTUmenzfjjRBRRAo2DZVkwmBZxuHGoNTFLLrmFhsvuagJbFxBVLFW2nnoSuDHhNckxkJhBKNVhfPghWoKTuCHsEdJcJ1RD6XTT2aWbGPwHkja29mj2RibYNyCqjkPWEmbRJhVvfN2DUZ9pExxBPTmghNa6tFQyLkkfHdmuXEXLdpmWndfdknawDuojQPGjx3p42ewB4eeV8Zs7dDCDLdUUghTcczqJAadPMroUpmifMTw1FrpU3jC3kMaSzYpcpPu4e44xEni3E9hrenfQePbFVe9Jq9bVyjsQBF8vC8UxqefzEFmMoHT9xkdRNsFmfLMAximM3nyNhTMgLimWvLcNddW11jK1FFPumgKRUUeRivjtnXiRsNedXpmHKhvSVvpS8wAJbuySw3bHqkrpgQHqAr6vUiXj5McjsYzVh7PZxrUgEGNe8uLk4UpxJGhW3TVLNcPHdEbq2AoyabVkK2ChbE9KZ2JJBdHah93VgZSVG",
  [ChainType.Doge]: "ZsPNMsGz8D8y11MAneZTVjJndCjgTUn38JxZpW4EiZgEoHt1Juw2od5nVwwx23kjav2ZzWjZAYrjAQnGwskZjCxmVagr3o3d8AfdQZySQigfqzTFjekNSHeQBuQPQ1y3ry6fN4w5ECxn9jrmho9pZFkBddZ2QLbAhvZVt8WrpduXniFkG27KsYo6ikCtgRsJyvzjE7kubBpsYfRf7tV8ZT2RyZaSGJp8Lo6SbrAMdDA1mke93sDDkP6B1cXi1UdSSg8nAi68b2HLJEdnw52KES4Xnh3Dg3s3n9Ur1mGf6WJ44oVVxwsBHoXWLhoAXJ6v6XSnX1rxBcqT344WHLrezqdGwzYAbKYqGtUiEZq6fcHVhL3Wu3pxkv2WbupVFpVAeFPxYzcwwf7vtibL7KG5RDuZ3rziqCgLC5jL9ckTS4KkZXH6YEJktNnUmULpcBdpGUHWzeea2SLMeiNYw1aoZ1k9QfmVK7TjxKJ5g8gSrSTwmfZHMPD5v6EBYyu4gBe31WXWVz",
  [ChainType.Runes]: null,
  [ChainType.Nervos]: null,
  [ChainType.Handshake]: null,
  [ChainType.Monero]: null,
  [ChainType.Firo]: null
};
const rewardAddresses = {
  [ChainType.Bitcoin]: "2Eit2LFRqu2Mo33z3pYTJRHNCPYS33MrU9QgeNcRsF9359pYMahqnLvKsHwwH72C6WDSZRj7G7WC5heVyUEawcSLSx821iJXT4xWf2F5fjVWDUpyGNdkxhFwQMhPKpx85Uu16put68V837wxDx19LRJ5uqi7xBa7EDFRU79Grzk8HDrfpUF3qct4xrQUvDofDroRQTuKueAbwybAfGDhNqG3jzKQchgjedBkbPAuDuNunehW4ZXUBLRSfqy3xofV76bxT5zpZjZcKud4XaRQvXUAVGunJzAs7RNZD5WZxenhmKzhiyuzWiq5QkWqxFw2h9vQ6Dd5PdYsWP3dPtaDC8WUjGz8tQ1tU9LuhqZ8QThQA5zBfoPFrk2iJ1repUuwZPjWnDRHLfWppqDQJGm2GEWHmYTQAfCJQFChUtSNstSATxw37xXjziKkPQRRVPr3VPapbHtGSoQyygzTHgcjxv3HSzwXkD7DScyA2iGDsd4B4WeXo4a6nM4CYpxa9f9FvabbNByhKsgq3ZoCsbUVXN99Pet93MFdxVmBBEsGYEYvtmMEDZEGb5z3JZDtVSdudFcm3bij82bdFzKSmmxxWZhscmLYpGGq1J5geqTiyTCgsmksAHumPFBmLkz8v843Jc3z5b6dwFgyXuBmQPTq6Nf8t95y1UYe8UYx3qNVfrHSGbToSgvCQyLKVv5ns8T2SZRWWr",
  [ChainType.Cardano]: "2Eit2LFRqu2Mo33z3pYTJRHNCPYS33MrU9QgeNcRsF9359pYMahqnLvKsHwwH72C6WDSZRj7G7WC5heVyUEawcSLSx821iJXT4xWf2F5fjVWDUskGdVdyYY5RBJnp3dfYC7iPoRNeopAFQWFwEbTieow347UhRyqvo2LntFpXzomvGwVTfq9YXS8Z1GGW5mUEioD5xC17Sz72NLbQrskSx7QZAxQTbMGh6vwM9J4q7NzRmQeHmWaHLpUHMU4Jdd5ccKumMvAY8d5C8RxB4iATySLY2N1wY84qNsWNaqkNofbUebf6LgmU9HTKAmU3nDoBfX7mhCjH8kXDhZeYdRsuLVFEYu83TkpwgHAYGmUoemxWAeA2BKMx8CBAy9jxbCyUjdnk9i7sLxuejrwLLh8W4tP81YkESjZ8BV65BhzPdvCaiX8vBSorgFfnvGKVzwfhhsSDwLY1GUwLTMLwTUTjSzEjsMX9hzsEEEmhxLsekabLmK3HZ1jssLrFryNuE59uS51hazJsi3gsT8SBk1J9YV6Dq6xto28nLqrMqK6raqLcAm2iU8hBtqdoSXqWzsrZHpqc2uLGhY52ee4k9TpFBvN1RovYUtY6KS4FncT4UgnbEFkzsnWYKX3CDn16tJs5CyZ97gKcvUonZ5EqTwabzni14CcQsTtKtEAqj1odvSyfJ94NnEjuiVPC3VmZbQvveN3bQ",
  [ChainType.Ergo]: "2Eit2LFRqu2Mo33z3pYTJRHNCPYS33MrU9QgeNcRsF9359pYMahqnLvKsHwwH72C6WDSZRj7G7WC5heVyUEawcSLSx821iJXT4xWf2F5fjVWDUmvtxr3QSv1aLwThLXxeqYCCc34xjxZDPqPyNGYvWLNeBZxATvBeDuQ6pSiiRFknqmvYVsm9eH4Et3eRHCyxDJEoqZsAahwfVSya34dZNHmjaPQkwWo3Coc17pxiEnWuWmG38wSJz1awE6cymzhojnjxDTbbXgjR1yfYU3AU2v9zttnT8Gz3gUzZNSwjiXSPu3G9zkDaFZVKqb5QwTWY3Pp6SFJgBQfx3C3sp4a9d3n9c98pfWFWAGQN5EfkoHosF8BQTDuzXG3NU8gVCNeNPXYA8iWCbvY3XpxQMvQUxqkjDv9VQfUNvAKVHLW43chi2rdBrQ7Teu6NnesLRWUKXpzSxpByWftkCCdBppjZtYmhhCHqpQGkQyTcMRoP2krFKe7xKbfnFkdkhaYH9TTdKuTuKtGb265RXxiqrc34KvkZpaBBQB5UvoCU4iLSDngNTjqkNPnWekDahzNHLd6CtcdC1B19jdGEXWeNADemDtdK4zrMNg7U8iVpyGYhLDnkeLVrcbhoxkHxrFwfrN19XvitDosQqmt9dseR6SWHBCDZJdmJecCiEwd2wBiwN5N5umEy3Dd4Hznv7kDr6eX7KtYxp",
  [ChainType.Ethereum]: "2Eit2LFRqu2Mo33z3pYTJRHNCPYS33MrU9QgeNcRsF9359pYMahqnLvKsHwwH72C6WDSZRj7G7WC5heVyUEawcSLSx821iJXT4xWf2F5fjVWDUpPyXf9D8PFkALkfhCu47xSApej3a8VHFCfLuQoMFV2LgTs6hEqRf2XQkDHzn3KYbGJ9b6gs2XcYf3ZQA2gJaWJXFErT11uifohMFFRJV7cb1eECubCbHCib3A434SJVrZee18QTRECrDirtC2GdZK6fiKGbGcKFTZWK4f3ChgnuZFCjRoCX2UquL25b2zkev34shFCspbYwYcyKmc5xxrvssUHgQmUZy7yu3RKJPXYuwH7SiittGsJ946spWJEp3cuBiMcpRvwbiCyrQqM1FtK3wZJKqy95bVDfj9zXwFfR1rE9wZADPs6xcJxi9P1z2iBXqPXGQHnKVaHJWEwNZfP2KAZeUi8etKnYSib68e5cuif3YNRVFdNtKAT2SJEsJCDmnUecmdCwvzMeH2EtNYsRBWVeTV4RBypRPi243qkFrct41bz6WZ8FhLFXU1tnExucXvQ48ZoQ4RQpNorEcGNDY8MC52yhkofS5b9wy6AYYjpQyTMmhD1QZF3VcQgPNT6x4yxPXYsjohYZh96h6M8T7m9gfVV3w8xowtVQVAB1kvJHMuZXxBkBNLwFbhxKuMwC2Dje3LZmuH9mhg94f7Uoe",
  [ChainType.Binance]: "2Eit2LFRqu2Mo33z3pYTJRHNCPYS33MrU9QgeNcRsF9359pYMahqnLvKsHwwH72C6WDSZRj7G7WC5heVyUEawcSLSx821iJXT4xWf2F5fjVWDUmAMWiE8WncsqsSRhckGHa5xwdGj7fCkypvX2Q9ypun1tUfQ8YwoXYgYCSF1M2t7WaUb2ZZzY9yETrdm8ywS3VzDFpirFEiLLgjE5vhsLkcW2PtiChF5npL3SFsxnSY92ZMmSw2U9GzhwDwTKXpPUD17dydf4CTbLATnCdiTkEYxCzVqh3XnBebDhEFSHWhCWVtqRniJJRqpRaAsv64qtBPabPG8HNRHT9TXFR4a58wH8VqdNuUSKHx1NQahaXTPYHfQX7H4mAzYU6fbH5uryhxqSh5HTBmCB8XrJcXCR41FeqjwrkwTiEHJkkyHVTeLdpyaUcHJ9M9nEsTbGbxMBLEc6CLtzRA5bDwFAKXN3i2mo86wUghaPMd72nd3pLDbhGYRntgYMrVWuVDzMhdJamVvFPbiEWiCs1BJ9NgJzasvJpJQxm1uBYskrWnULHQaJf8Kfoixaqcz6mcp2aAEAkoAmd3CcAddM4X1vCuapWeyaxLD7kXrHaafMsatugqJP4JQGFKEkXXBhthKScGLq5wcbYb2cVv6HuzyxyMg92UiLzTyFDB8QG2NwKgTfLGJ5iLDzzsFkPGtkxECDMVmiw21E",
  [ChainType.Doge]: "2Eit2LFRqu2Mo33z3pYTJRHNCPYS33MrU9QgeNcRsF9359pYMahqnLvKsHwwH72C6WDSZRj7G7WC5heVyUEawcSLSx821iJXT4xWf2F5fjVWDUkje1kCt7DSEufp9kN95BRzhkMTmgY2jmZ3gPH7hjfNkbPBkjLNifx5iH8wZ1EmiMFiWKozc1ZeT3QdnRhCtLZwHo5sBTek83753eK8YZNVgtykvcdLDbsgGyfCXZtJ2zxbNK7522JRormkeNkhLFBxC9u2tQ11EHyvcg8qHUhPA1GCXALUdtB1FkV2chfgewbDmtrpn7tqC7o3eaxQs3Ted3mo3TKmckYVWca7TqHnBCYGE1GRH2X3ZuWuSJXyi1AxKCyRi9JucVAGwpBhQPNR4viEZe5fo6kBiChWriCKmr7pti8685xoAz1ycFnLPKhbgdkwXmZtoLbYYrirEifkMJ1QXtaJStb86NQLQU2ThhqTzEkP22D8sRZ3Ud2b83KcxVvzzCvGeDRK7SkfjbmfhTCazJwwXiFTHBgT2tzfJvQTazwP6czcVC4taS55Ts2uKB4Z9Eu5MeWEvbBLBis8KxnkZkdMecxcBjRdAojCwyMBJUz8EPYo6x659TzbSJhjJiFaQ9f4kanVBV7nC9gK1rq5oY7bFH9MUcwGeu38HQk62kUbv7Q2dYx56CBVw6cHzdRJu6AXHY8dAy3BLqvHCV",
  [ChainType.Runes]: null,
  [ChainType.Nervos]: null,
  [ChainType.Handshake]: null,
  [ChainType.Monero]: null,
  [ChainType.Firo]: null
};
const hotWalletAddress = "nB3L2PD3J4rMmyGk7nnNdESpPXxhPRQ4t1chF8LTXtceMQjKCEgL2pFjPY6cehGjyEFZyHEomBTFXZyqfonvxDozrTtK5JzatD8SdmcPeJNWPvdRb5UxEMXE4WQtpAFzt2veT8Z6bmoWN";
function getChainType(address) {
  if (!address)
    return void 0;
  for (const [chain, addr] of Object.entries(rewardAddresses)) {
    if (addr === address) {
      return chain;
    }
  }
  return null;
}
function getChainTypeForPermitAddress(address) {
  if (!address)
    return void 0;
  for (const [chain, addr] of Object.entries(permitAddresses)) {
    if (addr === address) {
      return chain;
    }
  }
  return null;
}
if (typeof window !== "undefined") {
  window.ChainType = ChainType;
  window.getChainType = getChainType;
  window.getChainTypeForPermitAddress = getChainTypeForPermitAddress;
  window.permitAddresses = permitAddresses;
  window.rewardAddresses = rewardAddresses;
  window.permitTriggerAddresses = permitTriggerAddresses;
  window.permitBulkAddresses = permitBulkAddresses;
  window.hotWalletAddress = hotWalletAddress;
  window.rwtTokenIds = rwtTokenIds;
  window.getActiveChainTypes = getActiveChainTypes;
}
"use strict";
const rs_DbName = "rosenDatabase_1.1.5";
const rs_DbVersion = 38;
const rs_InputsStoreName = "inputBoxes";
const rs_PerfTxStoreName = "perfTxs";
const rs_PermitTxStoreName = "permitTxs";
const rs_ActivePermitTxStoreName = "activePermitTxs";
const rs_DownloadStatusStoreName = "downloadStatusStore";
const rs_OpenBoxesStoreName = "openBoxesStore";
const rs_AddressDataStoreName = "addressData";
const rs_InitialNDownloads = 30;
const rs_FullDownloadsBatchSize = 400;
const rs_PerfInitialNDownloads = 10;
const rs_PerfFullDownloadsBatchSize = 40;
const rs_StartFrom = /* @__PURE__ */ new Date("2024-01-01");
const rs_Input_Key = ["boxId", "outputAddress"];
const rs_Permit_Key = "id";
const rs_ActivePermit_Key = "id";
const rs_PerfTx_Key = "id";
const rs_Address_Key = "address";
const rs_PermitCost = 3e3;
const rs_WatcherCollateralRSN = 3e4;
const rs_WatcherCollateralERG = 800;
const rs_ErgoExplorerHost = "api.ergoplatform.com";
const rs_ErgoNodeHost = "node-p2p.ergoplatform.com";
const rs_RSNTokenId = "8b08cdd5449a9592a9e79711d7d79249d7a03c535d17efaee83e216e80a44c4b";
const rs_eRSNTokenId = "dede2cf5c1a2966453ffec198a9b97b53d281e548903a905519b3525d59cdc3c";
const rs_TokenIdMap = {
  [rs_RSNTokenId]: "RSN",
  [rs_eRSNTokenId]: "eRSN"
};
const rs_RSNDecimals = 3;
var Period;
(function(Period2) {
  Period2["Day"] = "Day";
  Period2["Week"] = "Week";
  Period2["Month"] = "Month";
  Period2["Year"] = "year";
  Period2["All"] = "All";
})(Period || (Period = {}));
var Currency;
(function(Currency2) {
  Currency2["EUR"] = "EUR";
  Currency2["USD"] = "USD";
  Currency2["ERG"] = "ERG";
  Currency2["RSN"] = "RSN";
})(Currency || (Currency = {}));
if (typeof window !== "undefined") {
  globalThis.rs_DbName = rs_DbName;
  globalThis.rs_DbVersion = rs_DbVersion;
  globalThis.rs_InputsStoreName = rs_InputsStoreName;
  globalThis.rs_PerfTxStoreName = rs_PerfTxStoreName;
  globalThis.rs_PermitTxStoreName = rs_PermitTxStoreName;
  globalThis.rs_ActivePermitTxStoreName = rs_ActivePermitTxStoreName;
  globalThis.rs_DownloadStatusStoreName = rs_DownloadStatusStoreName;
  globalThis.rs_OpenBoxesStoreName = rs_OpenBoxesStoreName;
  globalThis.rs_AddressDataStoreName = rs_AddressDataStoreName;
  globalThis.rs_InitialNDownloads = rs_InitialNDownloads;
  globalThis.rs_FullDownloadsBatchSize = rs_FullDownloadsBatchSize;
  globalThis.rs_StartFrom = rs_StartFrom;
  globalThis.rs_Input_Key = rs_Input_Key;
  globalThis.rs_PerfTx_Key = rs_PerfTx_Key;
  globalThis.rs_Permit_Key = rs_Permit_Key;
  globalThis.rs_ActivePermit_Key = rs_ActivePermit_Key;
  globalThis.rs_Address_Key = rs_Address_Key;
  globalThis.rs_PermitCost = rs_PermitCost;
  globalThis.rs_WatcherCollateralRSN = rs_WatcherCollateralRSN;
  globalThis.rs_WatcherCollateralERG = rs_WatcherCollateralERG;
  globalThis.rs_PerfInitialNDownloads = rs_PerfInitialNDownloads;
  globalThis.rs_PerfFullDownloadsBatchSize = rs_PerfFullDownloadsBatchSize;
  globalThis.rs_ErgoExplorerHost = rs_ErgoExplorerHost;
  globalThis.rs_ErgoNodeHost = rs_ErgoNodeHost;
  globalThis.rs_RSNTokenId = rs_RSNTokenId;
  globalThis.rs_eRSNTokenId = rs_eRSNTokenId;
  globalThis.rs_TokenIdMap = rs_TokenIdMap;
  globalThis.rs_RSNDecimals = rs_RSNDecimals;
  window.Period = Period;
  window.Currency = Currency;
}
"use strict";
class DataService {
  constructor(db) {
    this.db = db;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async purgeData(_db) {
  }
  getMaxDownloadDateDifference() {
    return 315576e7;
  }
  async getData(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], "readonly");
      const objectStore = transaction.objectStore(storeName);
      const request = objectStore.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) => reject(event.target.error);
    });
  }
  async getDataWithCursor(storeName, filterFn) {
    return new Promise((resolve, reject) => {
      const results = [];
      const transaction = this.db.transaction([storeName], "readonly");
      const objectStore = transaction.objectStore(storeName);
      const request = objectStore.openCursor();
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          const value = cursor.value;
          if (!filterFn || filterFn(value)) {
            results.push(value);
          }
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      request.onerror = (event) => reject(event.target.error);
    });
  }
}
"use strict";
class ChainPerformanceDataService extends DataService {
  async getExistingData(transaction) {
    return new Promise((resolve, reject) => {
      const dbTtransaction = this.db.transaction([rs_PerfTxStoreName], "readonly");
      const objectStore = dbTtransaction.objectStore(rs_PerfTxStoreName);
      const request = objectStore.get(transaction.id);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result);
      };
      request.onerror = (event) => reject(event.target.error);
    });
  }
  async addData(_address, transactions, db) {
    return new Promise((resolve, reject) => {
      const tempData = [];
      transactions.forEach((item) => {
        const chainTokensCount = {};
        const eRSNTotal = item.outputs.reduce((total, output) => {
          output.assets.forEach((asset) => {
            if (asset.tokenId != null && asset.tokenId in rwtTokenIds) {
              if (!chainTokensCount[asset.tokenId]) {
                chainTokensCount[asset.tokenId] = 1;
              } else {
                chainTokensCount[asset.tokenId]++;
              }
            }
          });
          const assets = output.assets.filter((a) => a.tokenId === rs_eRSNTokenId && Object.values(rewardAddresses).includes(output.address));
          return total + assets.reduce((acc, asset) => acc + asset.amount / Math.pow(10, rs_RSNDecimals), 0);
        }, 0);
        const maxKey = Object.entries(chainTokensCount).reduce((max, [key, value]) => value > chainTokensCount[max] ? key : max, Object.keys(chainTokensCount)[0]);
        const chainType = Object.entries(rwtTokenIds).find(([key]) => key === maxKey)?.[1];
        const dbPerfTx = {
          id: item.id,
          timestamp: item.timestamp,
          amount: eRSNTotal,
          chainType
        };
        tempData.push(dbPerfTx);
      });
      const transaction = db.transaction([rs_PerfTxStoreName], "readwrite");
      const objectStore = transaction.objectStore(rs_PerfTxStoreName);
      const putPromises = tempData.map((dbPerfTx) => {
        return new Promise((putResolve, putReject) => {
          console.log("Trying to add dbPerfTx to db with id " + dbPerfTx.id);
          const request = objectStore.put(dbPerfTx);
          request.onsuccess = () => putResolve();
          request.onerror = (event) => putReject(event.target.error);
        });
      });
      Promise.all(putPromises).then(async () => {
        const perfTxs = await this.getPerfTxs();
        this.eventSender.sendEvent({
          type: "PerfChartChanged",
          data: perfTxs
        });
        resolve();
      }).catch(reject);
    });
  }
  async getPerfTxs() {
    const perfTxsPromise = this.getData(rs_PerfTxStoreName);
    console.log("Retrieving PerfTxs");
    try {
      let perfTxs = await perfTxsPromise;
      perfTxs = perfTxs.filter((p) => this.getMaxDownloadDateDifference() > (/* @__PURE__ */ new Date()).getTime() - new Date(p.timestamp).getTime());
      const result = perfTxs.reduce((acc, tx) => {
        if (tx.chainType !== void 0 && tx.chainType !== null) {
          const chainKey = tx.chainType;
          if (!acc[chainKey]) {
            acc[chainKey] = { chart: 0 };
          }
          acc[chainKey].chart += tx.amount ?? 0;
        }
        return acc;
      }, {});
      return Object.fromEntries(Object.values(ChainType).map((chain) => [
        chain,
        result[chain] || { chart: 0 }
      ]));
    } catch (error) {
      console.error(error);
      return {};
    }
  }
  constructor(db, eventSender) {
    super(db);
    this.db = db;
    this.eventSender = eventSender;
  }
  getMaxDownloadDateDifference() {
    return 6048e5;
  }
  getDataType() {
    return "performance_chart";
  }
}
"use strict";
class RewardDataService extends DataService {
  async getExistingData(transaction, address) {
    for (const input of transaction.inputs) {
      if (input.boxId && getChainType(input.address)) {
        const data = await this.getDataByBoxId(input.boxId, address, this.db);
        if (data) {
          return data;
        }
      }
    }
    return null;
  }
  constructor(db, chartService, eventSender) {
    super(db);
    this.db = db;
    this.chartService = chartService;
    this.eventSender = eventSender;
  }
  getDataType() {
    return "reward";
  }
  async getWatcherInputs() {
    const inputsPromise = this.getData(rs_InputsStoreName);
    console.log("Retrieving watcher inputs and such");
    try {
      const inputs = await inputsPromise;
      const filteredInputs = inputs.filter((i) => i.chainType != null || getChainType(i.address) != null);
      filteredInputs.forEach((input) => {
        input.assets = input.assets.filter((asset) => asset.tokenId == rs_RSNTokenId || asset.tokenId == rs_eRSNTokenId).map((asset_1) => {
          return asset_1;
        });
      });
      filteredInputs.sort((a, b) => a.inputDate.getTime() - b.inputDate.getTime());
      return await new Promise((resolve) => {
        resolve(filteredInputs);
      });
    } catch (error) {
      console.error(error);
      return [];
    }
  }
  async addData(address, transactions, db) {
    return new Promise((resolve, reject) => {
      const tempData = [];
      transactions.forEach((item) => {
        item.inputs.forEach((input) => {
          input.outputAddress = address;
          input.inputDate = new Date(item.timestamp);
          input.assets = input.assets.filter((a) => a.tokenId == rs_RSNTokenId || a.tokenId == rs_eRSNTokenId);
          input.assets.forEach((asset) => {
            if (asset.tokenId && rs_TokenIdMap[asset.tokenId]) {
              asset.name = rs_TokenIdMap[asset.tokenId];
              asset.decimals = rs_RSNDecimals;
            }
          });
          const dbInput = {
            outputAddress: input.outputAddress,
            inputDate: input.inputDate,
            boxId: input.boxId,
            assets: input.assets || [],
            chainType: getChainType(input.address)
          };
          if (dbInput.chainType && dbInput.assets.length > 0) {
            tempData.push(dbInput);
          }
        });
      });
      const transaction = db.transaction([rs_InputsStoreName], "readwrite");
      const objectStore = transaction.objectStore(rs_InputsStoreName);
      const putPromises = tempData.map((dbInput) => {
        return new Promise((putResolve, putReject) => {
          const request = objectStore.put(dbInput);
          request.onsuccess = () => putResolve();
          request.onerror = (event) => putReject(event.target.error);
        });
      });
      Promise.all(putPromises).then(async () => {
        const inputs = await this.getSortedInputs();
        this.eventSender.sendEvent({
          type: "InputsChanged",
          data: inputs
        });
        this.eventSender.sendEvent({
          type: "AddressChartChanged",
          data: await this.chartService.getAddressCharts(inputs)
        });
        resolve();
      }).catch(reject);
    });
  }
  // Get Data by BoxId from IndexedDB
  async getDataByBoxId(boxId, addressId, db) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([rs_InputsStoreName], "readonly");
      const objectStore = transaction.objectStore(rs_InputsStoreName);
      const request = objectStore.get([
        boxId,
        addressId
      ]);
      request.onsuccess = () => {
        const result = request.result;
        if (!result || result.outputAddress !== addressId) {
          resolve(null);
        } else {
          resolve(result);
        }
      };
      request.onerror = (event) => reject(event.target.error);
    });
  }
  async getSortedInputs() {
    const inputsPromise = await this.getWatcherInputs();
    let amount = 0;
    const sortedInputs = [];
    console.log("start retrieving chart from database");
    try {
      const inputs = await inputsPromise;
      inputs.forEach((input) => {
        input.assets.forEach((asset) => {
          amount += asset.amount;
          sortedInputs.push({
            inputDate: input.inputDate,
            address: input.address ?? "",
            assets: input.assets,
            outputAddress: input.outputAddress,
            boxId: input.boxId,
            accumulatedAmount: amount,
            amount: asset.amount / Math.pow(10, asset.decimals),
            chainType: input.chainType ?? getChainType(input.address)
          });
        });
      });
      console.log("done retrieving chart from database " + inputs.length + " inputs");
      return await new Promise((resolve) => {
        resolve(sortedInputs);
      });
    } catch (error) {
      console.error(error);
      return sortedInputs;
    }
  }
}
"use strict";
class ChartService {
  async getAddressCharts(inputs) {
    const addressCharts = {};
    inputs.forEach((input) => {
      input.assets.forEach((asset) => {
        if (!addressCharts[input.outputAddress]) {
          addressCharts[input.outputAddress] = { charts: {}, chainType: null };
        }
        const currentDate = /* @__PURE__ */ new Date();
        const halfYearAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 6, currentDate.getDate());
        if (input.inputDate > halfYearAgo) {
          const dt = new Date(input.inputDate.getFullYear(), input.inputDate.getMonth(), input.inputDate.getDate() - input.inputDate.getDay()).getTime();
          if (!addressCharts[input.outputAddress].charts[dt]) {
            addressCharts[input.outputAddress].charts[dt] = 0;
          }
          addressCharts[input.outputAddress].charts[dt] += asset.amount / Math.pow(10, asset.decimals);
          addressCharts[input.outputAddress].chainType = input.chainType ?? getChainType(input.address);
        }
      });
    });
    return addressCharts;
  }
  async getAmountsByDate(inputs, period) {
    const reducedInputs = this.reduceData(inputs, period);
    const amounts = reducedInputs.map((s) => {
      return { x: s.inputDate, y: s.amount };
    });
    return amounts;
  }
  reduceData(inputs, period) {
    const date = /* @__PURE__ */ new Date();
    switch (period) {
      case "Day":
        date.setDate(date.getDate() - 1);
        break;
      case "Week":
        date.setDate(date.getDate() - 7);
        break;
      case "Month":
        date.setMonth(date.getMonth() - 1);
        break;
      case "Year":
        date.setFullYear(date.getFullYear() - 1);
        break;
      default:
        date.setFullYear(date.getFullYear() - 100);
    }
    inputs = inputs.filter((r) => r.inputDate >= date);
    return inputs;
  }
}
"use strict";
class DownloadService {
  //private static addressDownloadDateMap = new Map<string, Date>();
  constructor(downloadFullSize, downloadInitialSize, dataService, myWatcherDataService, eventSender, db) {
    this.dataService = dataService;
    this.myWatcherDataService = myWatcherDataService;
    this.eventSender = eventSender;
    this.db = db;
    this.busyCounter = 0;
    this.downloadFullSize = rs_FullDownloadsBatchSize;
    this.downloadInitialSize = rs_InitialNDownloads;
    this.downloadFullSize = downloadFullSize;
    this.downloadInitialSize = downloadInitialSize;
  }
  async fetchTransactions(url) {
    try {
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`Server returned code: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`An error occurred: ${error}`);
      throw error;
    }
  }
  async downloadTransactions(address, offset = 0, limit = 500, useNode) {
    if (useNode) {
      const url = `https://${rs_ErgoNodeHost}/blockchain/transaction/byAddress?offset=${offset}&limit=${limit}`;
      console.log(`Downloading from: ${url}`);
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain"
        },
        body: address
      });
      if (!response.ok)
        throw new Error(`Server returned code: ${response.status}`);
      const data = await response.json();
      const result = {
        transactions: data.items,
        total: data.total,
        items: []
      };
      for (const item of data.items) {
        const inputDate = new Date(item.timestamp);
        if (inputDate < rs_StartFrom) {
          return result;
        }
      }
      return result;
    } else {
      const url = `https://${rs_ErgoExplorerHost}/api/v1/addresses/${address}/transactions?offset=${offset}&limit=${limit}`;
      console.log(`Downloading from: ${url}`);
      const response = await this.fetchTransactions(url);
      const result = {
        transactions: response.items,
        total: response.total,
        items: []
      };
      for (const item of response.items) {
        const inputDate = new Date(item.timestamp);
        if (inputDate < rs_StartFrom) {
          return result;
        }
      }
      return result;
    }
  }
  async downloadForAddresses() {
    console.log("Start downloading for all addresses");
    try {
      const addresses = await this.dataService.getData(rs_AddressDataStoreName);
      const downloadPromises = addresses.map(async (addressObj) => {
        await this.downloadForAddress(addressObj.address, true);
      });
      await Promise.all(downloadPromises);
    } catch (e) {
      console.error("Error downloading for addresses:", e);
    } finally {
      console.log("End downloading for all addresses");
    }
  }
  async downloadForChainPermitAddresses(addresses) {
    try {
      const downloadPromises = Object.entries(permitAddresses).filter(([, address]) => address != null).map(async ([chainType, address]) => {
        await this.downloadForAddress(address, true);
        const permits = await this.myWatcherDataService.getAdressPermits(addresses);
        await this.eventSender.sendEvent({
          type: "PermitsChanged",
          data: permits
        });
        await this.eventSender.sendEvent({
          type: "AddressPermitsDownloaded",
          data: chainType
        });
      });
      await Promise.all(downloadPromises);
    } catch (e) {
      console.error("Error downloading for addresses:", e);
    }
  }
  async downloadForActivePermitAddresses(allAddresses, chainType) {
    try {
      let addresses = [];
      Object.entries(permitTriggerAddresses).forEach(([key, address]) => {
        if (key === chainType && address != null) {
          addresses.push(address);
        }
      });
      const downloadPromises = addresses.map(async (address) => {
        await this.downloadForAddress(address, true, async () => {
          try {
            const permits = await this.myWatcherDataService.getAdressPermits(allAddresses);
            await this.eventSender.sendEvent({
              type: "PermitsChanged",
              data: permits
            });
          } catch (err) {
            console.error("Error in permits callback:", err);
          }
        });
      });
      await Promise.all(downloadPromises);
    } catch (e) {
      console.error("Error downloading for addresses:", e);
    }
  }
  // Busy Counter
  increaseBusyCounter(address) {
    if (this.busyCounter === 0) {
      this.eventSender.sendEvent({
        type: "StartFullDownload",
        data: address
      });
    }
    this.busyCounter++;
  }
  decreaseBusyCounter(address) {
    this.busyCounter--;
    if (this.busyCounter === 0) {
      this.eventSender.sendEvent({
        type: "EndFullDownload",
        data: address
      });
    }
  }
  // Download All for Address (recursive)
  async downloadAllForAddress(address, offset, db, useNode, callback) {
    this.increaseBusyCounter(address);
    console.log(this.busyCounter);
    try {
      const result = await this.downloadTransactions(address, offset, this.downloadFullSize + 10, useNode);
      console.log(`Processing full download(offset = ${offset}, size = ${this.downloadFullSize}) for: ${address}`);
      if (!result.transactions || result.transactions.length === 0 || offset > 1e5) {
        await this.setDownloadStatus(address, "true", db);
        console.log(this.busyCounter);
        return;
      }
      await this.dataService.addData(address, result.transactions, db);
      if (callback) {
        await callback?.();
      }
      if (this.dataService.getMaxDownloadDateDifference() > (/* @__PURE__ */ new Date()).getTime() - new Date(result.transactions[result.transactions.length - 1].timestamp).getTime()) {
        await this.downloadAllForAddress(address, offset + this.downloadFullSize, db, useNode);
      } else {
        await this.setDownloadStatus(address, "true", db);
      }
    } catch (e) {
      console.error(e);
    } finally {
      this.decreaseBusyCounter(address);
      console.log(this.busyCounter);
    }
  }
  // Get Download Status for Address from IndexedDB
  async getDownloadStatus(address, db) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([rs_DownloadStatusStoreName], "readonly");
      const objectStore = transaction.objectStore(rs_DownloadStatusStoreName);
      const request = objectStore.get(address + "_" + this.dataService.getDataType());
      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) => reject(event.target.error);
    });
  }
  // Set Download Status for Address in IndexedDB
  async setDownloadStatus(address, status, db) {
    let dbStatus = await this.getDownloadStatus(address, db);
    if (!dbStatus) {
      dbStatus = {
        address: address + "_" + this.dataService.getDataType(),
        Address: address,
        status,
        lastDownloadDate: void 0
      };
    } else {
      dbStatus.status = status;
      dbStatus.address = address + "_" + this.dataService.getDataType();
      dbStatus.Address = address;
    }
    await this.saveDownloadStatus(dbStatus, db);
  }
  async saveDownloadStatus(downloadStatus, db) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([rs_DownloadStatusStoreName], "readwrite");
      const objectStore = transaction.objectStore(rs_DownloadStatusStoreName);
      const request = objectStore.put(downloadStatus);
      request.onsuccess = () => resolve();
      request.onerror = (event) => reject(event.target.error);
    });
  }
  async downloadForAddress(address, useNode, callback) {
    this.increaseBusyCounter(address);
    console.log(this.busyCounter);
    try {
      const result = await this.downloadTransactions(address, 0, this.downloadInitialSize, useNode);
      console.log(`Processing initial download(size = ${this.downloadInitialSize}) for: ${address}`);
      const itemsz = result.transactions.length;
      let existingData = null;
      if (itemsz > this.downloadInitialSize / 4) {
        for (let i = Math.floor(itemsz / 4); i < itemsz - Math.floor(itemsz / 4); i++) {
          const item = result.transactions[i];
          existingData = await this.dataService.getExistingData(item, address);
          if (existingData) {
            break;
          }
        }
      }
      console.log("Add bunch of data");
      await this.dataService.addData(address, result.transactions, this.db);
      if (callback) {
        await callback?.();
      }
      const downloadStatus = (await this.getDownloadStatus(address, this.db))?.status || "false";
      if (existingData && downloadStatus === "true") {
        console.log(`Found existing boxId in db for ${address}, no need to download more.`);
      } else if (itemsz >= this.downloadInitialSize) {
        await this.setDownloadStatus(address, "false", this.db);
        console.log(`Downloading all tx's for : ${address}`);
        await this.downloadAllForAddress(address, 0, this.db, useNode, callback);
      }
    } catch (e) {
      console.error(e);
    } finally {
      this.decreaseBusyCounter(address);
      this.dataService.purgeData(this.db);
      console.log(this.busyCounter);
    }
  }
}
"use strict";
class ServiceWorkerEventSender {
  async sendEvent(event) {
    const clientsList = await self.clients.matchAll({
      type: "window",
      includeUncontrolled: true
    });
    for (const client of clientsList) {
      client.postMessage(event);
    }
  }
}
class ProcessEventService {
  constructor(eventSender) {
    this.eventSender = eventSender;
    this.services = null;
  }
  async initServices() {
    const db = await this.initIndexedDB();
    const chartService = new ChartService();
    const rewardDataService = new RewardDataService(db, chartService, this.eventSender);
    const activepermitsDataService = new ActivePermitsDataService(db);
    const myWatcherDataService = new MyWatcherDataService(db, activepermitsDataService);
    const chainPerformanceDataService = new ChainPerformanceDataService(db, this.eventSender);
    const downloadService = new DownloadService(rs_FullDownloadsBatchSize, rs_InitialNDownloads, rewardDataService, myWatcherDataService, this.eventSender, db);
    const downloadMyWatchersService = new DownloadService(rs_FullDownloadsBatchSize, rs_InitialNDownloads, myWatcherDataService, myWatcherDataService, this.eventSender, db);
    const downloadActivePermitsService = new DownloadService(rs_FullDownloadsBatchSize, rs_InitialNDownloads, activepermitsDataService, myWatcherDataService, this.eventSender, db);
    const downloadPerfService = new DownloadService(rs_PerfFullDownloadsBatchSize, rs_PerfInitialNDownloads, chainPerformanceDataService, myWatcherDataService, this.eventSender, db);
    this.services = {
      dataService: rewardDataService,
      chainPerformanceDataService,
      myWatcherDataService,
      downloadService,
      chartService,
      downloadPerfService,
      downloadMyWatchersService,
      downloadActivePermitsService,
      activePermitsDataService: activepermitsDataService
    };
    return this.services;
  }
  async processEvent(event) {
    if (event.type === "StatisticsScreenLoaded" || event.type === "PerformanceScreenLoaded" || event.type === "MyWatchersScreenLoaded" || event.type === "RequestInputsDownload") {
      const { dataService, downloadService, downloadPerfService, downloadMyWatchersService, downloadActivePermitsService, chartService, chainPerformanceDataService, myWatcherDataService, activePermitsDataService } = await this.initServices();
      if (event.type === "RequestInputsDownload") {
        await this.processRequestInputsDownload(event, chartService, dataService, downloadService);
      } else if (event.type === "StatisticsScreenLoaded") {
        await this.processStatisticsScreenLoaded(dataService, downloadService);
      } else if (event.type === "MyWatchersScreenLoaded") {
        await this.processMyWatchersScreenLoaded(event, myWatcherDataService, downloadMyWatchersService, activePermitsDataService, downloadActivePermitsService);
      } else if (event.type === "PerformanceScreenLoaded") {
        await this.processPerformanceScreenLoaded(chainPerformanceDataService, downloadPerfService);
      }
    }
  }
  async processPerformanceScreenLoaded(chainPerformanceDataService, downloadPerfService) {
    console.log("Rosen service worker received PerformanceScreenLoaded");
    try {
      console.log("Downloading perftxs.");
      const perfTxs = await chainPerformanceDataService.getPerfTxs();
      this.eventSender.sendEvent({
        type: "PerfChartChanged",
        data: perfTxs
      });
      downloadPerfService.downloadForAddress(hotWalletAddress, true);
    } catch (error) {
      console.error("Error initializing IndexedDB or downloading addresses:", error);
    }
  }
  async processMyWatchersScreenLoaded(event, myWatcherDataService, downloadMyWatchersService, activePermitsDataService, downloadActivePermitsService) {
    const addresses = event.data.addresses;
    console.log("Rosen service worker received MyWatchersScreenLoaded initiating syncing of data by downloading from blockchain");
    try {
      let permits = await myWatcherDataService.getAdressPermits(addresses);
      let chainTypes = this.extractChaintTypes(permits, addresses);
      this.sendPermitsChangedEvent(permits);
      if (chainTypes.size === 0) {
        await downloadMyWatchersService.downloadForChainPermitAddresses(addresses);
        permits = await this.sendPermitChangedEvent(myWatcherDataService, addresses);
        let chainTypes2 = this.extractChaintTypes(permits, addresses);
        await this.processActivePermits(chainTypes2, activePermitsDataService, myWatcherDataService, addresses, downloadActivePermitsService);
      } else {
        await this.processActivePermits(chainTypes, activePermitsDataService, myWatcherDataService, addresses, downloadActivePermitsService);
        await downloadMyWatchersService.downloadForChainPermitAddresses(addresses);
        await this.sendPermitChangedEvent(myWatcherDataService, addresses);
        let newChainTypes = this.extractChaintTypes(await myWatcherDataService.getAdressPermits(addresses), addresses);
        if (newChainTypes.size !== chainTypes.size || [...newChainTypes].some((ct) => !chainTypes.has(ct))) {
          await this.processActivePermits(newChainTypes, activePermitsDataService, myWatcherDataService, addresses, downloadActivePermitsService);
        }
      }
    } catch (error) {
      console.error("Error initializing IndexedDB or downloading addresses:", error);
    }
  }
  extractChaintTypes(permits, addresses) {
    let chainTypes = /* @__PURE__ */ new Set();
    for (const permit of Object.values(permits)) {
      if (permit && permit.chainType && addresses.includes(permit.address)) {
        chainTypes.add(permit.chainType);
      }
    }
    return chainTypes;
  }
  async processActivePermits(chainTypes, activePermitsDataService, myWatcherDataService, addresses, downloadActivePermitsService) {
    await Promise.all(Array.from(chainTypes).map(async (chainType) => {
      await activePermitsDataService.downloadOpenBoxes(chainType);
    }));
    await this.sendPermitChangedEvent(myWatcherDataService, addresses);
    await Promise.all(Array.from(chainTypes).map(async (chainType) => {
      await downloadActivePermitsService.downloadForActivePermitAddresses(addresses, chainType);
    }));
  }
  async sendPermitChangedEvent(myWatcherDataService, addresses) {
    let permits = await myWatcherDataService.getAdressPermits(addresses);
    this.eventSender.sendEvent({
      type: "PermitsChanged",
      data: permits
    });
    return permits;
  }
  sendPermitsChangedEvent(permits) {
    this.eventSender.sendEvent({
      type: "PermitsChanged",
      data: permits
    });
  }
  async processStatisticsScreenLoaded(dataService, downloadService) {
    console.log("Rosen service worker received StatisticsScreenLoaded initiating syncing of data by downloading from blockchain");
    try {
      const inputs = await dataService.getSortedInputs();
      this.eventSender.sendEvent({
        type: "InputsChanged",
        data: inputs
      });
      await downloadService.downloadForAddresses();
    } catch (error) {
      console.error("Error initializing IndexedDB or downloading addresses:", error);
    }
  }
  async processRequestInputsDownload(event, chartService, dataService, downloadService) {
    console.log("Rosen service worker received RequestInputsDownload initiating syncing of data by downloading from blockchain, event.data: " + event.data);
    try {
      const addressCharts = await chartService.getAddressCharts(await dataService.getSortedInputs());
      this.eventSender.sendEvent({
        type: "AddressChartChanged",
        data: addressCharts
      });
      if (event.data && typeof event.data === "string") {
        await downloadService.downloadForAddress(event.data, true);
      } else {
        await downloadService.downloadForAddresses();
      }
    } catch (error) {
      console.error("Error initializing IndexedDB or downloading addresses:", error);
    }
  }
  // IndexedDB Initialization
  async initIndexedDB() {
    return new Promise((resolve, reject) => {
      let dbName = rs_DbName;
      const request = indexedDB.open(dbName);
      request.onsuccess = (event) => {
        const db = event.target.result;
        resolve(db);
      };
      request.onerror = (event) => {
        console.error("Error opening IndexedDB:", event.target.error);
        reject(event.target.error);
      };
    });
  }
}
if (typeof window !== "undefined") {
  window.ProcessEventService = ProcessEventService;
}
"use strict";
class MyWatcherDataService extends DataService {
  async getExistingData(transaction, address) {
    for (const input of transaction.inputs) {
      if (input.boxId) {
        const data = await this.getDataById(this.createUniqueId(input.boxId, transaction.id, address), this.db);
        if (data) {
          return data;
        }
      }
    }
    for (const output of transaction.outputs) {
      if (output.boxId) {
        const data = await this.getDataById(this.createUniqueId(output.boxId, transaction.id, address), this.db);
        if (data) {
          return data;
        }
      }
    }
    return null;
  }
  constructor(db, activePermitsDataService) {
    super(db);
    this.db = db;
    this.activePermitsDataService = activePermitsDataService;
  }
  createUniqueId(boxId, transactionId, address) {
    const str = `${transactionId}_${boxId}_${address}`;
    let hash = 0, i, chr;
    for (i = 0; i < str.length; i++) {
      chr = str.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0;
    }
    return hash.toString();
  }
  getDataType() {
    return "permit";
  }
  async getWatcherPermits() {
    const permitsPromise = this.getData(rs_PermitTxStoreName);
    console.log("Retrieving watcher permits and such");
    try {
      const permits = await permitsPromise;
      permits.forEach((permit) => {
        permit.assets = permit.assets.filter((asset) => asset.tokenId == rs_RSNTokenId).map((asset_1) => {
          return asset_1;
        });
      });
      permits.sort((a, b) => b.date.getTime() - a.date.getTime());
      return await new Promise((resolve) => {
        resolve(permits);
      });
    } catch (error) {
      console.error(error);
      return [];
    }
  }
  shouldAddToDb(address, assets) {
    return address != null && address.length > 0 && address.length <= 100 && assets.some((asset) => asset.tokenId == rs_RSNTokenId);
  }
  async getAdressPermits(addresses) {
    const permits = await this.getWatcherPermits();
    const widSums = {};
    const permitInfo = [];
    for (const permit of permits) {
      const sum = permit.assets.reduce((acc, asset) => {
        if (asset.tokenId == rs_RSNTokenId) {
          return acc + asset.amount / Math.pow(10, rs_RSNDecimals);
        }
        return acc;
      }, 0);
      if (widSums[permit.wid]) {
        widSums[permit.wid] += sum;
      } else {
        widSums[permit.wid] = sum;
      }
    }
    for (const permit of permits) {
      if (!permitInfo.some((p) => p.address == permit.address)) {
        permitInfo.push({
          address: permit.address,
          wid: permit.wid,
          lockedRSN: widSums[permit.wid] || 0,
          activeLockedRSN: 0,
          chainType: permit.chainType
        });
      }
    }
    let addressActivePermits = await this.activePermitsDataService.getAdressActivePermits(addresses);
    for (const activePermit of addressActivePermits) {
      const info = permitInfo.find((p) => p.address === activePermit.address);
      if (info) {
        info.activeLockedRSN += rs_PermitCost;
      }
    }
    return permitInfo;
  }
  async addData(address, transactions, db) {
    return new Promise((resolve, reject) => {
      const tempData = [];
      transactions.forEach((item) => {
        let iwids = item.inputs.flatMap((input) => input.assets).filter((asset) => asset.amount == 2 || asset.amount == 3).flatMap((a) => a.tokenId);
        let owids = item.outputs.flatMap((output) => output.assets).filter((asset) => asset.amount == 2 || asset.amount == 3).flatMap((a) => a.tokenId);
        const allWids = Array.from(/* @__PURE__ */ new Set([...iwids, ...owids]));
        item.inputs.forEach((input) => {
          if (this.shouldAddToDb(input.address, input.assets) === false) {
            return;
          }
          input.inputDate = new Date(item.timestamp);
          input.assets = input.assets.filter((a) => a.tokenId == rs_RSNTokenId || a.amount == 2 || a.amount == 3);
          let wid;
          for (wid of allWids) {
            const PermitTx = {
              id: this.createUniqueId(input.boxId, item.id, address),
              address: input.address,
              date: input.inputDate,
              boxId: input.boxId,
              assets: input.assets || [],
              wid: wid ?? "",
              chainType: getChainTypeForPermitAddress(address),
              transactionId: item.id
            };
            if (PermitTx.assets.length > 0) {
              tempData.push(PermitTx);
            }
          }
        });
        item.outputs.forEach((output) => {
          if (this.shouldAddToDb(output.address, output.assets) === false) {
            return;
          }
          output.outputDate = new Date(item.timestamp);
          output.assets = output.assets.filter((a) => a.tokenId == rs_RSNTokenId || a.amount == 2 || a.amount == 3);
          output.assets.forEach((a) => {
            a.amount = -a.amount;
          });
          let wid;
          for (wid of allWids) {
            const PermitTx = {
              id: this.createUniqueId(output.boxId, item.id, address),
              address: output.address,
              date: output.outputDate,
              boxId: output.boxId,
              assets: output.assets || [],
              wid: wid ?? "",
              chainType: getChainTypeForPermitAddress(address),
              transactionId: item.id
            };
            if (PermitTx.assets.length > 0) {
              tempData.push(PermitTx);
            }
          }
        });
      });
      const transaction = db.transaction([rs_PermitTxStoreName], "readwrite");
      const objectStore = transaction.objectStore(rs_PermitTxStoreName);
      const putPromises = tempData.map((PermitTx) => {
        return new Promise((putResolve, putReject) => {
          const request = objectStore.put(PermitTx);
          request.onsuccess = () => putResolve();
          request.onerror = (event) => putReject(event.target.error);
        });
      });
      Promise.all(putPromises).then(async () => {
        resolve();
      }).catch(reject);
    });
  }
  // Get Data by BoxId from IndexedDB
  async getDataById(id, db) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([rs_PermitTxStoreName], "readonly");
      const objectStore = transaction.objectStore(rs_PermitTxStoreName);
      const request = objectStore.get(id);
      request.onsuccess = () => {
        const result = request.result;
        if (!result || result.id !== id) {
          resolve(null);
        } else {
          resolve(result);
        }
      };
      request.onerror = (event) => reject(event.target.error);
    });
  }
  async getSortedPermits() {
    const permitsPromise = await this.getWatcherPermits();
    const sortedPermits = [];
    console.log("start retrieving permits from database");
    try {
      const permits = await permitsPromise;
      permits.forEach((permitTx) => {
        sortedPermits.push({
          id: permitTx.id,
          date: permitTx.date,
          address: permitTx.address,
          assets: permitTx.assets,
          wid: permitTx.wid,
          boxId: permitTx.boxId,
          chainType: permitTx.chainType ?? getChainTypeForPermitAddress(permitTx.address),
          transactionId: permitTx.transactionId
        });
      });
      console.log("done retrieving permits from database " + permits.length + " permits");
      return await new Promise((resolve) => {
        resolve(sortedPermits);
      });
    } catch (error) {
      console.error(error);
      return sortedPermits;
    }
  }
}
"use strict";
class ActivePermitsDataService extends DataService {
  async getExistingData(transaction, address) {
    const dbTransaction = this.db.transaction([rs_ActivePermitTxStoreName], "readonly");
    const objectStore = dbTransaction.objectStore(rs_ActivePermitTxStoreName);
    for (const input of transaction.inputs) {
      if (input.boxId) {
        const data = await this.getDataById(this.createUniqueId(input.boxId, transaction.id, address), objectStore);
        if (data) {
          return data;
        }
      }
    }
    for (const output of transaction.outputs) {
      if (output.boxId) {
        const data = await this.getDataById(this.createUniqueId(output.boxId, transaction.id, address), objectStore);
        if (data) {
          return data;
        }
      }
    }
    return null;
  }
  constructor(db) {
    super(db);
    this.db = db;
  }
  createUniqueId(boxId, transactionId, address) {
    const str = `${transactionId}_${boxId}_${address}`;
    let hash = 0, i, chr;
    for (i = 0; i < str.length; i++) {
      chr = str.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0;
    }
    return hash.toString();
  }
  getDataType() {
    return "activepermit";
  }
  getMaxDownloadDateDifference() {
    return 2048e5;
  }
  async getWatcherPermits() {
    const permitsPromise = this.getData(rs_ActivePermitTxStoreName);
    console.log("Retrieving watcher active permits");
    try {
      const permits = await permitsPromise;
      permits.forEach((permit) => {
        permit.assets = permit.assets.filter((asset) => asset.tokenId != null && asset.tokenId in rwtTokenIds).map((asset_1) => {
          return asset_1;
        });
      });
      permits.sort((a, b) => b.date.getTime() - a.date.getTime());
      return await new Promise((resolve) => {
        resolve(permits);
      });
    } catch (error) {
      console.error(error);
      return [];
    }
  }
  async downloadOpenBoxes(chainType) {
    let addresses = [];
    Object.entries(permitBulkAddresses).forEach(([key, address]) => {
      if (key === chainType && address != null) {
        addresses.push(address);
      }
    });
    const downloadPromises = addresses.map(async (address) => {
      let url = "https://api.ergoplatform.com/api/v1/boxes/unspent/byAddress/" + address;
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`Server returned code: ${response.status}`);
      await this.saveOpenBoxes(address, await response.json(), this.db);
    });
    await Promise.all(downloadPromises);
  }
  async saveOpenBoxes(address, openBoxesJson, db) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([rs_OpenBoxesStoreName], "readwrite");
      const objectStore = transaction.objectStore(rs_OpenBoxesStoreName);
      const boxes = {
        address,
        openBoxesJson
      };
      const request = objectStore.put(boxes);
      request.onsuccess = () => resolve();
      request.onerror = (event) => reject(event.target.error);
    });
  }
  async getOpenBoxesMap(db) {
    const openBoxesMap = {};
    const transaction = db.transaction([rs_OpenBoxesStoreName], "readonly");
    const objectStore = transaction.objectStore(rs_OpenBoxesStoreName);
    for (const [, address] of Object.entries(permitBulkAddresses)) {
      if (address) {
        openBoxesMap[address] = await new Promise((resolve, reject) => {
          const request = objectStore.get(address);
          request.onsuccess = () => {
            const result = request.result;
            resolve(JSON.stringify(result?.openBoxesJson ?? null));
          };
          request.onerror = (event) => reject(event.target.error);
        });
      }
    }
    return openBoxesMap;
  }
  shouldAddInputToDb(address) {
    return address != null && address.length <= 100 || Object.values(permitTriggerAddresses).includes(address);
  }
  shouldAddOutputToDb(address) {
    return Object.values(permitBulkAddresses).includes(address) || Object.values(permitTriggerAddresses).includes(address) || Object.values(rewardAddresses).includes(address);
  }
  async getAdressActivePermits(addresses = null) {
    const permits = await this.getWatcherPermits();
    const openBoxesMap = await this.getOpenBoxesMap(this.db);
    let addressPermits = new Array();
    if (addresses != null && addresses.length > 0) {
      addressPermits = permits.filter((info) => addresses.some((addr) => addr === info.address));
    }
    let result = new Array();
    const permitsByTxId = {};
    for (const permit of permits) {
      if (!permitsByTxId[permit.transactionId]) {
        permitsByTxId[permit.transactionId] = [];
      }
      permitsByTxId[permit.transactionId].push(permit);
    }
    const boxIdMap = {};
    for (const permit of permits) {
      if (!boxIdMap[permit.boxId]) {
        boxIdMap[permit.boxId] = [];
      }
      boxIdMap[permit.boxId].push(permit);
    }
    for (const permit of addressPermits) {
      let outputs = (permitsByTxId[permit.transactionId] ?? []).filter((o) => Object.values(permitTriggerAddresses).some((address) => address === o.address));
      let foundResolved = false;
      for (const output of outputs) {
        let cnt = boxIdMap[output.boxId] ?? [];
        if (cnt.length >= 2) {
          foundResolved = true;
          for (const p of cnt) {
            let txs = permitsByTxId[p.transactionId]?.filter((t) => Object.values(permitBulkAddresses).includes(t.address)) ?? [];
            await Promise.all(txs.map(async (t) => {
              let openBoxes = openBoxesMap[t.address];
              if (openBoxes && openBoxes.indexOf(t.boxId) !== -1) {
                if (!result.some((r) => r.boxId === t.boxId)) {
                  result.push(permit);
                }
              }
            }));
          }
        }
      }
      if (foundResolved === false) {
        result.push(permit);
      }
    }
    return result;
  }
  async addData(address, transactions, db) {
    return new Promise((resolve, reject) => {
      const tempData = [];
      transactions.forEach((item) => {
        item.inputs.forEach((input) => {
          if (this.shouldAddInputToDb(input.address) === false) {
            return;
          }
          input.inputDate = new Date(item.timestamp);
          input.assets = input.assets.filter((a) => a.tokenId != null && a.tokenId in rwtTokenIds);
          const PermitTx = {
            id: this.createUniqueId(input.boxId, item.id, address),
            address: input.address,
            date: input.inputDate,
            boxId: input.boxId,
            assets: input.assets || [],
            wid: "",
            chainType: getChainTypeForPermitAddress(address),
            transactionId: item.id
          };
          tempData.push(PermitTx);
        });
        item.outputs.forEach((output) => {
          if (this.shouldAddOutputToDb(output.address) === false) {
            return;
          }
          output.outputDate = new Date(item.timestamp);
          output.assets = output.assets.filter((a) => a.tokenId != null && a.tokenId in rwtTokenIds);
          output.assets.forEach((a) => {
            a.amount = -a.amount;
          });
          const PermitTx = {
            id: this.createUniqueId(output.boxId, item.id, address),
            address: output.address,
            date: output.outputDate,
            boxId: output.boxId,
            assets: output.assets || [],
            wid: "",
            chainType: getChainTypeForPermitAddress(address),
            transactionId: item.id
          };
          tempData.push(PermitTx);
        });
      });
      const transaction = db.transaction([rs_ActivePermitTxStoreName], "readwrite");
      const objectStore = transaction.objectStore(rs_ActivePermitTxStoreName);
      const putPromises = tempData.map((PermitTx) => {
        return new Promise((putResolve, putReject) => {
          const request = objectStore.put(PermitTx);
          request.onsuccess = () => putResolve();
          request.onerror = (event) => putReject(event.target.error);
        });
      });
      Promise.all(putPromises).then(async () => {
        resolve();
      }).catch(reject);
    });
  }
  async purgeData(db) {
    let permitTxs = await this.getData(rs_ActivePermitTxStoreName);
    permitTxs = (await permitTxs).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let permitTx = null;
    if (permitTxs.length >= rs_FullDownloadsBatchSize) {
      permitTx = permitTxs[rs_FullDownloadsBatchSize - 1];
    } else {
      permitTx = permitTxs[permitTxs.length - 1];
    }
    let maxDiff = this.getMaxDownloadDateDifference();
    const now = Date.now();
    if (permitTx != null && now - permitTx.date.getTime() > maxDiff) {
      maxDiff = now - permitTx.date.getTime();
    }
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([rs_ActivePermitTxStoreName], "readwrite");
      const objectStore = transaction.objectStore(rs_ActivePermitTxStoreName);
      const request = objectStore.openCursor();
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          const permitTx2 = cursor.value;
          if (permitTx2.date && now - new Date(permitTx2.date).getTime() > maxDiff) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = (event) => reject(event.target.error);
    });
  }
  // Get Data by BoxId from IndexedDB
  async getDataById(id, objectStore) {
    return new Promise((resolve, reject) => {
      const request = objectStore.get(id);
      request.onsuccess = () => {
        const result = request.result;
        if (!result || result.id !== id) {
          resolve(null);
        } else {
          resolve(result);
        }
      };
      request.onerror = (event) => reject(event.target.error);
    });
  }
  async getSortedPermits() {
    const permitsPromise = await this.getWatcherPermits();
    const sortedPermits = [];
    console.log("start retrieving permits from database");
    try {
      const permits = await permitsPromise;
      permits.forEach((permitTx) => {
        sortedPermits.push({
          id: permitTx.id,
          date: permitTx.date,
          address: permitTx.address,
          assets: permitTx.assets,
          wid: permitTx.wid,
          boxId: permitTx.boxId,
          transactionId: permitTx.transactionId,
          chainType: permitTx.chainType ?? getChainTypeForPermitAddress(permitTx.address)
        });
      });
      console.log("done retrieving permits from database " + permits.length + " permits");
      return await new Promise((resolve) => {
        resolve(sortedPermits);
      });
    } catch (error) {
      console.error(error);
      return sortedPermits;
    }
  }
}
//# sourceMappingURL=scripts.js.map
