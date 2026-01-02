"use strict";
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// dist/service/commonjs/src/lib/data.service.js
var require_data_service = __commonJS({
  "dist/service/commonjs/src/lib/data.service.js"() {
  }
});

// dist/service/commonjs/src/lib/activepermits.data.service.js
var require_activepermits_data_service = __commonJS({
  "dist/service/commonjs/src/lib/activepermits.data.service.js"() {
    var ActivePermitsDataService2 = class extends DataService {
      async getExistingData(transaction, address) {
        for (const input of transaction.inputs) {
          if (input.boxId) {
            const data = await this.storageService.getDataById(rs_ActivePermitTxStoreName, this.createUniqueId(input.boxId, transaction.id, address));
            if (data) {
              return data;
            }
          }
        }
        for (const output of transaction.outputs) {
          if (output.boxId) {
            const data = await this.storageService.getDataById(rs_ActivePermitTxStoreName, this.createUniqueId(output.boxId, transaction.id, address));
            if (data) {
              return data;
            }
          }
        }
        return null;
      }
      constructor(db) {
        super(db);
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
        const permitsPromise = this.storageService.getData(rs_ActivePermitTxStoreName);
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
          await this.saveOpenBoxes(address, await response.json());
        });
        await Promise.all(downloadPromises);
      }
      async saveOpenBoxes(address, openBoxesJson) {
        const boxes = {
          address,
          openBoxesJson
        };
        await this.storageService.addData(rs_OpenBoxesStoreName, [boxes]);
      }
      async getOpenBoxesMap() {
        const openBoxesMap = {};
        const boxes = this.storageService.getData(rs_OpenBoxesStoreName);
        for (const [, address] of Object.entries(permitBulkAddresses)) {
          if (address) {
            var json = (await boxes).filter((ob) => ob.address === address);
            if (json.length != 0) {
              openBoxesMap[address] = JSON.stringify(json);
            } else {
              openBoxesMap[address] = null;
            }
          }
        }
        return openBoxesMap;
      }
      shouldAddInputToDb(address, assets) {
        return address != null && address.length <= 100 && assets.length > 0 || Object.values(permitTriggerAddresses).includes(address);
      }
      shouldAddOutputToDb(address) {
        return Object.values(permitBulkAddresses).includes(address) || Object.values(permitTriggerAddresses).includes(address) || Object.values(rewardAddresses).includes(address);
      }
      async getAdressActivePermits(addresses = null) {
        const permits = await this.getWatcherPermits();
        const openBoxesMap = await this.getOpenBoxesMap();
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
        const seen = /* @__PURE__ */ new Set();
        const filteredResult = result.filter((r) => {
          if (seen.has(r.transactionId))
            return false;
          seen.add(r.transactionId);
          return true;
        });
        return filteredResult;
      }
      async addData(address, transactions) {
        const tempData = [];
        const now = Date.now();
        let maxDiff = this.getMaxDownloadDateDifference();
        transactions.forEach((item) => {
          item.inputs.forEach((input) => {
            if (this.shouldAddInputToDb(input.address, input.assets) === false) {
              return;
            }
            input.inputDate = new Date(item.timestamp);
            input.assets = input.assets.filter((a) => a.tokenId != null && a.tokenId in rwtTokenIds);
            const permitTx = {
              id: this.createUniqueId(input.boxId, item.id, address),
              address: input.address,
              date: input.inputDate,
              boxId: input.boxId,
              assets: input.assets || [],
              wid: "",
              chainType: getChainTypeForPermitAddress(address),
              transactionId: item.id
            };
            if (permitTx != null && permitTx.date && now - new Date(permitTx.date).getTime() <= maxDiff * 2) {
              tempData.push(permitTx);
            }
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
            const permitTx = {
              id: this.createUniqueId(output.boxId, item.id, address),
              address: output.address,
              date: output.outputDate,
              boxId: output.boxId,
              assets: output.assets || [],
              wid: "",
              chainType: getChainTypeForPermitAddress(address),
              transactionId: item.id
            };
            if (permitTx != null && permitTx.date && now - new Date(permitTx.date).getTime() <= maxDiff * 2) {
              tempData.push(permitTx);
            }
          });
        });
        await this.storageService.addData(rs_ActivePermitTxStoreName, tempData);
      }
      async purgeData() {
        let permitTxs = await this.storageService.getData(rs_ActivePermitTxStoreName);
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
        var purgePermitTxs = [];
        for (const permitTx2 of permitTxs) {
          if (permitTx2.date && now - new Date(permitTx2.date).getTime() > maxDiff) {
            purgePermitTxs.push(permitTx2);
          }
        }
        await this.storageService.deleteData(rs_ActivePermitTxStoreName, purgePermitTxs.map((pt) => pt.id));
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
    };
  }
});

// dist/service/commonjs/src/lib/chain.performance.data.service.js
var require_chain_performance_data_service = __commonJS({
  "dist/service/commonjs/src/lib/chain.performance.data.service.js"() {
    var ChainPerformanceDataService2 = class extends DataService {
      db;
      eventSender;
      async getExistingData(transaction) {
        return await this.storageService.getDataById(rs_PerfTxStoreName, transaction.id);
      }
      async addData(_address, transactions) {
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
        await this.storageService.addData(rs_PerfTxStoreName, tempData);
        const perfTxs = await this.getPerfTxs();
        this.eventSender.sendEvent({
          type: "PerfChartChanged",
          data: perfTxs
        });
      }
      async getPerfTxs() {
        const perfTxsPromise = this.storageService.getData(rs_PerfTxStoreName);
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
    };
  }
});

// dist/service/commonjs/src/lib/chain.service.js
var require_chain_service = __commonJS({
  "dist/service/commonjs/src/lib/chain.service.js"() {
    var ChainType2;
    (function(ChainType3) {
      ChainType3["Ergo"] = "Ergo";
      ChainType3["Cardano"] = "Cardano";
      ChainType3["Bitcoin"] = "Bitcoin";
      ChainType3["Ethereum"] = "Ethereum";
      ChainType3["Binance"] = "Binance";
      ChainType3["Doge"] = "Doge";
      ChainType3["Runes"] = "Runes";
      ChainType3["Nervos"] = "Nervos";
      ChainType3["Handshake"] = "Handshake";
      ChainType3["Firo"] = "Firo";
      ChainType3["Monero"] = "Monero";
    })(ChainType2 || (ChainType2 = {}));
    function getChainTypes() {
      return Object.values(ChainType2);
    }
    function getActiveChainTypes() {
      const active = /* @__PURE__ */ new Set();
      const addIfPresent = (map) => {
        for (const [k, v] of Object.entries(map)) {
          if (v) {
            active.add(k);
          }
        }
      };
      addIfPresent(permitAddresses2);
      addIfPresent(permitTriggerAddresses2);
      addIfPresent(permitBulkAddresses2);
      addIfPresent(rewardAddresses2);
      for (const ct of Object.values(rwtTokenIds2)) {
        if (ct)
          active.add(ct);
      }
      return Array.from(active);
    }
    var chainTypeTokens = Object.fromEntries(Object.values(ChainType2).map((chain) => chain === ChainType2.Runes ? [chain, `rspv2BitcoinRunesRWT`] : [chain, `rspv2${chain}RWT`]));
    var chainTypeWatcherIdentifier = Object.fromEntries(Object.values(ChainType2).map((chain) => chain === ChainType2.Runes ? [chain, `rspv2BitcoinRunesAWC`] : [chain, `rspv2${chain}AWC`]));
    var rwtTokenIds2 = {
      "8a94d71b4a08058327fa8372aa69d95c337536c6577c31c8d994169a041e5fc0": ChainType2.Ergo,
      ddb335d2b4f3764ddeae8411a14bec97f94d0057628bb96f98da9d95e74d02bc: ChainType2.Cardano,
      "30e4392fc439fce9948da124efddb8779fe179eef5a5d6196e249b75ee64defc": ChainType2.Bitcoin,
      f5985c64c1aa8f08569dc77a046f65f92947abaa9ccd530aead033eece23496e: ChainType2.Ethereum,
      "33477693d6be5bbd3a4cd786fbff5e6444449c191ab08e681aaaa87fc192772c": ChainType2.Binance,
      "5d727b722fb72aa02257d987970c68aeda41614518bab9f0d8a21bbc75b7a3b0": ChainType2.Doge,
      "8bde33c8654ddb525b4db4842dd959e592c3847eabe40383af09a76be36379c4": ChainType2.Runes
    };
    var permitAddresses2 = {
      [ChainType2.Bitcoin]: "NY4PEzZ7VfjtnTN697R7my9uAVkCYb6N71J2RSmJCFSdDqVf9aPvFQqKXujYDBtSA8hxYVUgkGgU9SP2Ss7JDUkHkdGLBqZwH4yDcPyVvbVbcre3o7nR59wiFDVtjzCjfZmVvMVJD9HiW4GKqVuZGTQCKns8tDe3sJoDNTL3VmhzRUPZf9JCN4TNji1ruXf5CxqWtDrCfoxE4xfbRWGmtBMdLMoRdL85V7z1fP5KxroWX5YgZQo28nTCU3WjPuY2YrjqYYGNHXvFZ9G8E85kCcseNtRWqViXGFzmwqHWKaYe4AdJzBbMKzJWYszsbiemNvisPtT2Yj3FjAmAErpW3gMeWyH3WtbipaAu9D31ggpLeLkLTGscJ9HB2oExpGWvv6u9mGdkTJMHYUuZJUGrcJPE3m7ZTEFxwkbeR9oD8nHHgW4SB46kHFbxzNoUksGPZQnxf95J3e5PUnhYgg7mrQLNpq6pphgGukFcHDgAN2rgFmUSDVsuzomhP735SMiveXSPzx6PZeP7CmrEHyXN6mFbBJuY17kvzzix1w9eFwryZDuZqnAANkYhF3TLkLyGZfSC4o9iAGynpivuNMUgbKAuj6D116tKoCq9PHELL8eTefmXNLFuhauQuKRjmWQKj9zYSd7qi6Zf49KX25PnWHkC3REc4abYpjtiQFefT2HkWRwneTCkJ8uMvoHs6kJzLg8NVzH8XwEZhTM2tNSDhBKZaURpYiQcHwLDgv5uFiwhasLAdZi2EJywBYX51NKc6m4MEsTiAJC9jkEydWcwyDzSHN18yEr4rvEgMNkUhLHJokgV2v3BNFhUTJqe58e2QXAmx9MytUDqzg3vwexEpMhueC2roYA27P1mmb85HKEz15a8LnuUT8ZjmG8kDbHuPYFyxcATytVuDrFDzqKBt9X36bocip4ZU4RRY8JcWjJvMcrBCjV3EhDVQ4it8bhoZnn79PsXazvDteua1NEYEJniPnNrRaiKTUWrseEUQ2vVjWy134jMxRbeiARhoj7MDxug2kFP8jRGSsxWt3Qqbv2SezT3xZ8jYxTyQ2CiyJ61CvUQwPtmoY3XKjrgrJKwnSzJRs4egKPYZKoSiSy6UdHMKuNDmys8wYo3Gi2EgVdUYRLLWcHh5Z2H91odSbTW2h5e6pZeY4a45TgihE6ZnZBhHGc75zJjukhPgP1wEp8GrreHA7ejvTEmpwNgj571x5JrvRD5TxWaFuZKBonGexovAK2L5v",
      [ChainType2.Cardano]: "NY4PEzZ7VfjqPk9gZSNS6ERoYyYBEBebyeXUPs1sjEfdenV3Kq1QKWBSQ1Gfem47fPVRw5UXcYNXtgXNGqsD4DedukcYv5c5kviu94yWpyrh2tbXHea1tyfuEcb8njgvXkAxrXkjvgcPEQqy7BsR3KQPe8vzSaBG5V8WFHQqvHmpMXXYMvKDZzRbNjZUgYvVinGq6qx9hct1fFG15nFdcWZkzhBcu8ytydt3MmnkYEyL4L2rLD8Jp2Q16DfeaBBqmuyxpMoVxPrQzbPjq5GKTKrqnpisWVrubpAy5dg1oQ6tVZompLpwTWvX1xWspA9tWPmc3MCV2e6y313KzSosGLi2Sdv2ptDgJpKamQv6fNKmj3TWkNbPCDfjp2KXYcfYE1vQ5prRZCPCDhVgWP7bqpF3SeUTMJmvBaXjd1tBavjanquQDkYU4n5XBwJPvUa5kCAP1USTgP4cgPA6SzB8hg2RXmB4PmEWM2RWv2mrirYeTdZrzXCbpGCd9B9GK7bNknnYz1X8wVqyYxxQMZ7Rort4BVRNPNKzEMtdGKSmQpiWitfoAfphXL3SGMfwMT3sspgDcD93Ftiq9gf6kgawpFBKWJmV5jXmfiSCWkPW5x56L5hcc3NwJLYYjcMh81aXQBP4HguyudttZcF8QiDa6Ae3idS1BTegArbhZBFn1TQJGgWtuCubLC5Ja71FadEN1G1s4Uz4BapDu3WpNH4NJn3UeWavLd1EytGjevyJu8XjziAMYr6cPZsyhb95aj7LAHgwJ8YT42zWYoDxqhEzbuderVtfauVJxEo2Rt7p83hMtkFS8Dy3vNbdmGEhWEFfDEyquEHTLsYkehRMWTeTeoDpRhKpeXoDxTNriR6Fz6y3Koxwzg281gYhxxvew7TpvSa3cLvjBpNxuoUfhyT645u51cBsQzden3RB5LjJeToSctrx74nNGCm9sR7fQgzno2pETeit1mykq4eocy93EoTcypKitcbfhgAYwXrGcGUQyhsupFgPZMnms5VnWhCsGKkK93uy7z4BRgi9y2aU7zMUxPJN6q3kYhjcdgYhcgqLLmWo5pBRSxcuq3p3NhPnd2Tps5RztjtUS5ZkbRVsTri8Sy2J5xPLir6VB7uxcPCSYYGJaaVfENJ8tYLYH3m3TUoxRipyjNDDBmsRdujqFQvFoYiCyaPFgu9iqzMvuPDM7FDPAKV8V7A895N9SMMZkG7uAzVvLgrU8Wrxdby2CAX9ttmPJn",
      [ChainType2.Ergo]: "NY4PEzZ7Vfjvo3AYu7dBh4ziatarsMAVPnwtHZL6BfoKeaots7P629HvVAmDZNdiVNUitWMqVJhgphUregwCXnhVNRddztP93qbtSWCMzVk1UQmCVUpvQyb25nyH1PrpRSjpFewJWeN3bjiVF6bTAm2t11X4d2fKGnAo3PX2BFVeyAUre7T5CZs2uikxZisyrJ1djE4UY1uwpTFkJv3RzZ3JMugNDeicf7qWqtCtNH8E9uG56VD2dMvmsr5YHQbrKgxa5foyA4K8cD59o2ub9ezbhjSgfXbc6VLaXmp5SzdP6n61MaePNexedifBWwAsHFcaaVXf7oUkePp5dDpc5mBbaAuidBAwH4SaxnUNjPw2bHVSXEk3ZJwwBrZRG7CYBCvEN6wFuPyzuhGsJQwdCtvUqxViGhxWrhRYKwixLhScVdGwCFCF9HjuCXt92FkEZKRk1kJuNzMUuc9AUbafbwhi8RC96TVQrtnsajhomptLKFmQXg4nZQao3jwHV8kfZeyF9BX5kiWUnC83Wa7X7seGUcECHRPLAapk7Lr1kUQ6Q62RpBKeGUsfmPcyNhaZ2bmdxMxxHAhdZdKVr78R5ch2BvG7ZtV6wkHB1hcVJGJmU4dskPPR5EFd8gED72eeUnNAsTknW7ePfNMj4DYWGqf2QhPHDZXsyRN2Mczv4tgyRsNA2HR3U9oZikejcuYhha9yNsXEdNn23B8wa5aDZwR6hwZ9hQ74yv29sbfBAfe9XWT2UZAVaeZeazQSSrvAhicEKnwmCAvfwcZNS57SHJ1EfZf1oEt66S6mGFdBzcKPLZzmJmCgMiBmMThqMemT1XS1ovES76LVcpXSkyiEdA17htR5HuPWdDVfWNQAK2jAM8BjKGtvsh93oMFGvMaBVBAvj1QcfTr17LdeeT7h78bKzyF5SQWuyu46xtDbmTZVrR1ZSpnffiD8TbWnae85Bw1VfttScQ8yfa26dsc9pwLrHhYhC4XKEVPWYUxLHZd959tLA2kGNkJBJR8PPThR8PugaUTq1sQpLg4ezPPUjYyWFvhFf6Rcw5rcJAwj99AUwoEhPaUnxT3TxiEJBbD3Zsna33mQD9Zg69Zzr9xiLA7GzhhA998dwkpbbgqFxyASwH6yav5qDbXPZH7GPtt3nTjUfRs87SGYgVGHoGhqaVUAfQKW4TtvFicdpvQws5kg1nZthd7WkWcR7HqLc1R4wBPFynFVGc457vhQwaP78yQsQDHq86",
      [ChainType2.Ethereum]: "NY4PEzZ7Vfju59RSazdQK92s7PaLrnCh5D9yZBZx7fptQjQZ7Ra2Xiz1PFusrkij3YamVoqXNqoUzazpjnzwmX4zKvPwWGLdqk1RXvp82m7Km2nwtvL2d6tVVCfgiVzA392JszEtNDh9hNXn6wk8eXjXwUg1q1w4UJi6XzmscSH6iZ1BR6ghCp5fyrZBeUfnvbPsfgHmmoVQzmDJ5E9KjmCg53detrDH29gyZUKyqjC5ddnCKG5cvVmoZ7D2ix9KFa9RuLcpVTxnVnuoJnHL1yoGog11TB3eT5hRyiUzeBU688pMb1xyUaCw8bjh5wSsBRAWQnDiAaGuj6zsJEnKeMW94XLeaTASw4K2bwyWHr4BVN9XNSeopFoj6mXPrD2ZhGgPV4HeQp1qEQ2pemMiSecXYkghfnk1t8hnfDNMfXoyKXxEmN8Cf1p7M8pqtgo7H9uUi6xsfotsB2uHVSoT21nzERYMaej9YuYwgC2iUzrzeZNFu7LbMqBErDgHn4wfgppRnF6axDca7QJGNv3q7E2q1DGRpzmTXPfr9FeFxki9geAwsTAy1KTqU2u6TY2wcRC3GzQz83x6LatZLhf9HZnVWZ3SRWQ5AmKUfxhHVxVC9Hwiraqb7ciZBsrnXHWmFaHHHYxafZwoLUBqxeWnHNM211MUwJ2rD9pvrqREfYs4CKYJNDxe5nezL11TnsLyt6p6XkKgHXvvqnk9HQ27pMbpNVX33Y8iQpznFvL2YBCn6Dw9hBDgb8thcYkkAXyLRZskEmhXQFL9evXTstNoeJVJp7NAo7dejZRaKHzTvZnZpkybJGks44qFbGSuSXGegN1V1HWyYGnGSgEJm3yrapNC5tdTvHWXVDxjw1G2TwqKL8D4HZVsyWsu8PEErsaf593jscXKTRn2uqvdhp29rJKGV4v2Cfd8DDXzwhmVxcVFyUiXg9JDe8fCi2rxmFai7a6P6vTJrUkJRtKYBt5RUY3uzKXpX4J4fBWMHmnM2yTSgdaXb9MYULmsbWitqpxiTWh1iMQdXNHxU1A2hHvsqogqEhrG9bGmMU1m1EFSFAPocv3KUf5bPYUWmVUFaxa2MLmE4fs1EC3kCJz8434NrxD1YVA1iosiv5f2tDM8E3w15VRik2a3R1Y6C1D9uHAAT1XK1A27dnx6e586eghm5BuvCY9Di89bdYH5KX3sg4NzWAAJYd5DLZbtdXxzRrKiKwMcPjskhwyQRcv3qstVzPDfJdE8Ej",
      [ChainType2.Binance]: "NY4PEzZ7VfjvyhUfALrnVnmbCo79cESCRMoD4m6TNTRdUnGR3B7EM3KRKxPh6BmdAsdArGV8DgAanEjs4QLYzYTBPGexkgMBPaRwAMSuVAG5rtzuN5qNmyAZsfdrR3cnBuspTqRkBQFp1oczXkCVNFdjpPwAFYLZgnnJFJVnZbp5TQSECTioxM1oJSKm7LBnEbPNrVWFqcShvqAjoyie7Bd471mNEq8y3mEeV7FH3AQCm4fKQgyfwYkRBC4jvFjWDaMshpFbV325g7n5rcyRsbXJ8EGMC2pKVGEbkx2JCgX4ba5dxx1uGibiHnuHiTNXLmrbEJ6BFtBFZB69Ye7U1C23uBEEvTRLteSbKzKAaGv7UbhVtvcgX91muR3sy7jXTW5FszKWej7knHLWJhbUf47fCVvmbXWEx6rHu3fj5hEqQyfVuER3J54yQAtP9ertP9hQX6GQ7mXfyUwmxTYiJS4GxLzeWZGwfSfRUDe6GN7qurja8kVeMrTwdo835yt4XUcemLK53TCkTLe61Bev6NtiUCSuNrhddXcdfMzqk1DWZCXhkcm51pnGmbmAntwC6AF7rL2LHtHi4et2edKAJHkYUp6t9a8Q57eL6fX3Q4JSfDrjfgn4x2fJaF1APdwbBVKoJyhDUkmV6xAaANYZifq54eFg1qBh54F6mu61U3Df5sZqsepzQJNYp6Y95afLuHGmG97mxhmmRsecKbamu4p6P3TPZEs5eYfHspVf85GNh2BztxxYn5hSsR9c8VRJjBhHR1qGHzX4mbRKWn2D41L7AHPnapSQyHCAPdhSbaAV3b6eLqLvc9QrFBAdnsHqN4NauYDPZc6sSrFuLEwNKFbjefc7pBDnA2pfTUUVqCTFuuaM8VmLKFxG2oVsi1k8GD5moSzQbEphVfWTjE9kTZR35oArptsctXGXRT6MXToom6m4cj465Xs9nsRY8t7FgSHsxetJafgogRjo8NRpgFkBpRgf69QuZbqYkrFMTsoDRkLYCLTF4XZwYzu3tqrzLkSZPKDzK1x7pySFdB56vAstU8HPHLqtzduvHt8Gvrkh1mAYQ1cEphCF1jfs5vZUDifLQYnZ2JiJeMdFZu8RhssWvwU2oL6wqx4Ey2iRaSrLSadYnWx47QvGZeZ8M5gupYMNiL7tTkpCjMjbuetqGcpQrtiwuBJ25DqfnWeLN2K6LS49Fb7GjW6Y3fMgdDYVhh7MFpLiyHMcC7wzdBJSMEcE1VNvo2",
      [ChainType2.Doge]: "NY4PEzZ7VfjpDKVcQkzdi4CLcgbMvUX53reQKShv8wRAJ8cRsEi4zV8VwevNM5JPxi5UA77685CKHAQAEkE5HUX2jv5HoMoaZFqcYNBQmHxLA86pS3fHDhg6GvJ8SHssoUZX4uGcgEcRt118Bz8bR8sVAGC23UcafXEwmhfCRfrijjPxDx9ZLHN14uuCU9Gv8Upta65PkzbE3oTD3XDuq7RicN59bz8o6eHef9MfxZetNXrgGTkCJJVJrQ5ahqPLmCzkwv5iXLvRjebbPcen8FxPJ7RDE9rG5BW4uuyroqH6nsNcQKRDnvvnrt5PjghRfss4EswpEJXoxxf7VxYUxx2KgHy8W865bjV5Gvmd9nLPnRStwDV7t7HP2U98fMH3Qdp8PS2Vew5edCjjZTiu2k5kB8frNwSdhGvu91TpAhen474RoxWeoZErNRPpkBH3MN4vHo7EZYiJPjsYtLctVEDWZkvFuaFCYQbuF73JqT7673erYxjRu5o3bCHMgNLYPYuriHLyWtpAJvkFa2Xir54tNfMFyEcvPEWYWaB7J8JsBa8E1b6v9x3VsDyNrU3bGXz52Ax7dG5ziTX1DG2bZuRvGSejjeP8GVgUXTBvRARs8t4wKwdicHkZVie2zGBR5w6Ajo1wK8hNHi2ANYSX5VEFEAFgjwo8DNMUTXbyreeKTcJgcntoc1CbNaiDUvJEyRYaAS7mncPsAiuMjTiFUAzRU5gWdtgRTrkVfi638QrvsvKQgKNPxvGBQpEWtSnmDfRhFifDT716wZ22rca55i9V2ArmDRVZG966MSTYNewX96iwndT8PDhhR4xfysMrTdQMPBzFXGoaAyV54rZ37G1JHQjKQLdMXLP67wjqFMNDRjBUsUYpBYVgj4XpvA1nik8UDqGW5zHoEszpjFJNCSzoexM1zLk8q5vk73dfQ3zaME7tTjp7rdAH3tPtWVkrFSWyDe3rw4zZpSHE2iqH8dDvTVuS1QYsJ6G3iqE8nQbg9FipofqTEjihP9ojvcXgKa9ASce5JNsRKHUSeYkAtDs561sZyf5uY626GcsvMYKGHjEjxCYJUYfrDTFz8v14dNAzVAiYQS7M32otTzKeXhB6ZNSRsErvMfrjgW6Rc7joCL1umHo8c3n3nqxLjZqxnzTgBAXnUNDY2g6LLdVRbj41hxTmvVkwV8MV5N1tvTAALAiagxDKu5bWsfTYFHbiiA7tLxqhsUvATorTzU7nrN1hjpQT3i",
      [ChainType2.Runes]: "NY4PEzZ7Vfjp4L3K8LAKgrXaevRJNJDddHuZ2FcRv9FeWQcLP58p1JLoCk4zzVGBa19a7ozPRiC9xF5bvSWpLofsEEhZFaFY7NtsinQv7foN52JJpGqdxYws76BkTPCKScdfAahJfmx9dobR43MqQoegvmVx7D4yS9K8SLQLPdrehd3wAuqpK1ZfC8wAMXGixXZDkuKEQfQn2UBuMzzY8s3dcPeomgLq6aKRMzNn8FkxMqsuV8hTsot37rUMJLu3LAbMAvqinCBD2wLiZFvfY9qCUqwWzZK6AwF1qoScYvbhx2rZuiogfKapSKTqaA48KWCQrfgfSmzgsjahEWohvPVhZ1dP1CwBrCM25iPUFsWZ2KFrCGxU8NA3kT5F26QbrxUS2Ay8WNFpFTTkdM92RR6jpoZRkwwdLVXZpNVqcFdjnENj6XCqE6Gmbm7MkaaNwnPPqw2oqXg92THYshruGZUWMLm95ogrQE2vFhRGaPfNuQSLDF54A8pMsJjbysQYTHF1vUEs8uaGDBQUuKMsiy2g1cKLfQcUNyms2dEwta4pQm2s7M8jwQQ14YjcUQ2Es8AQihj7GRzwtC84eHQK3BqFSVCX8MpaqUL8DTbuBoj5TgQKqZtMWHEMuXdJNm46TooiQgdSB2svop2q1xGS8Q5xjLVf7dVtMy1x9AKs6ZRharW9THaZjkeCRsnhdWFvnLSor8zBkdr24v3aygf6X56kkXQznRGbBx36tmFNLV9c23zBw4hUHYGV7aAPY7xeN7DuwzgtR7UtsUQVdSVp1BymTgYhmRFV3MhWm1XG3XXoh79Tmi5ca8oChVZiMXe32auJSsJoFSmqnnTmh5xFgXPJFJ41iPtrj6UbQSQdTF6tzEY3b9DpCFBYfbHkTec7Zop3ETw1zRqnMxrAg2gsGdeFAS6Dqodi2XT8EonYw5Mft6DSZeXTAjNnwXuuEU98yRZXzG45vkdGRXg94mKhdEsmeRDB5GjYwf9yd3JujfJLNAyCzGcbjkFgYYpz4ZHpQDugGKBfZDTDP3cxjKL15SAVQx9rcL5vv8uv9wmxE5PQk321SNDKowJa4o1dxLfb7YWyqJjbKxUjt8WpHtMR9RsEMy5pphNPuZ9o6RqvGKoDdPTvG1pJxUB5qHAVdhVS63oyajwT2zmVLtXBk6eFrFvUziiYuX3sdondfaPcH2f4RgivRCSC78JLQz9NgTtLE9nssi5n4p2HDCTFBbfnuxHrNbXvR3",
      [ChainType2.Nervos]: null,
      [ChainType2.Handshake]: null,
      [ChainType2.Monero]: null,
      [ChainType2.Firo]: null
    };
    var permitTriggerAddresses2 = {
      [ChainType2.Bitcoin]: "5ivrmzxYZZfH2wJRvogecZo1YYXm32CoKnSZdtwxbjNoogRakUFe56VrrcULZtCkvAzM2MNRMxPYSfZc2rB6tkLKLCirG14JPDMfqBoWMhyzzQLVsDukZupema1i8SvYUuoaiPL5rTyQmqgF3ftPbvM2dHY623B3KsKRTNDhkoMoRmKLzenNWqjXpkANpyc3TCkDuvBypXfbWVN55F2ZZUs8L3XkvaJKcb74GY7whJB8Zg31VgpmVW4uVEuqpcvPk5FYNiTdRakyYTUVFnAdCR6ZDjagBYMr3ks2uHMhQdjmoKmmwCocVm4SGZsA8rU8zj6zrEgpepLT5UPD9sZQWtvSi6C82fPEW9pvNXr4T3sFx2xNRv8meyNUhopUfiRzVoWfx6Q4ArqU3dnmRtN8pxkDfTZr7oGrzAFAb3DRhBUPhhfWY2USAw7LMqMAuW65pdUFcGnczQH3B6V4kALNaoGMD7ixKtkdMkrAPHkJmxKzeMEd6Y49PnHWxFkQbXwqGELjDppqmdbKceyrtjUp3JwcZ5qN7YcLg1yXhFUiWAHhnAwGkHsTHivXADhV81sDBVqM1GUB3piyt6gkJ5My3SaRRTsokrnJLoGL23GwjEfTzDsvXCoXww3MQcwUUCXehQConnMxYsK7HHGV4wf8kbctrFd2ekPkeHm5ksjagEVzKMraZJgrRSRWEHdYmUGkU6tLGZTUF4Xe4MkdzXC3sRtif4iUnZg6Tnt3DEx2i5fmPD4xasYkusc6thd77x5x7MZXMdkxuo9BWTG9iiYAaE4aLQ5yEbrYeVY85DCVFAKXTsiwUH1De3rDhRZfFfQRuDqiYomDFumxofAa9k89yLeCSRyQpAH55BXLqvppusJyDwYJKd5itao8z3Qi2Fsvt7oL77fDnbotPwp7EkFbQZdGi7aUU1SdyfhxNwx6dYcFe2zpj6Spj7zb98FR2HahXwXnqqZjuym7RjN55bqPt2FufJ7CwdgQmiBMid7E1sAVMxBZyAeNbhHEqRJCajpUyGXswJjQJ9S1u9c4rRHzdntMtr2RXDtdgrt6b69GpZgZNeAX3QG9W9kQK4SAHE2BULEmNSBZHHitrRYdx97AsDLFfLpzfsPa82ew9oBy3PacMAF2WP48yxQrAzSA2p5idB5QFbYoECBBLsCyApG37AMuPrr24JrWmZLqR5XEPYnKojYrMcciwkn3L6jRpC5c1D9KrsTGk5dGtqBji1FE9XAVxuVpdddJjBSjphPx2UWtvJnwcxB8CoRSsVDF8RoyPcVwMmSfL5arDGJxBUzVu",
      [ChainType2.Cardano]: "5ivrmzxYZc1s5aYrsy9uMd3wphLaHx4Kqrw7wVDwQdtj967D3qYpAw15uAr1CK4RbXKFW7kersNNe9tXu22iut2zG7tCmAP9TzSNgHMSJFBzR9y7vmqpmTGyFmn6poS81E8MzwaJ2MxkULFoS2nj7CwVsCMGweg84sJShZkGm81jxw6N65GHddQ4sJsBJb6MYFcVXeLxrgnEMPd3eFH7XoVj5uM97P6rsUAztZmeaA9hdUkc9Bz497j5BKQaiXyrFj8ghEtL1cemwfnGrsybkuq132QT9qsW7dNaG95D5wSYNUoAP7mVcziPas1PvEa5xRgMKnvE4ByYPT6BfkAMijYfXSDLzi1EbksurZGfC6jX7jfSgwuugXMNbjrUwhzj6657H9MsytUxRW8kNUKN7mwUphQGFS3nWLG4hzyas5BF8MnK7usWD7MJko7FaUWwNPVrRdatwB5uu6rUrY8UeAW9DPQMrL6VZWMKMWFmoY722pVYHdMdCsehR3CnsRDGDpZtvdqJnGgn2czeZ4AfK8o6aykw3HMTvNP2e6pxNt6FYgr2WZhbXsmeqA6bG7t9JNCw6H7tA8KJPAN1X6CYeZMitX5RWCrMtrSy2NEDepNvMgH3n4GD3tvS5Rs94gFVWHfLu4JM5BaTwfRTcdfirnwPQhYhtH6SEc8b5SgGkraojn4JgkKGp2ftszDUNyaKrY8XJQusuMG64Aoe96wr2AaRKKtUhAKfk7kUXHtGoV3h4MhDy5Wnbgb6hXcmQoMQ8HnT7JMAFWUUeWyveNn3hdNucDf2WtmXBsRpwUidapBJPD9Xukw6uEsWdkzsCNcdhZM4EqnkadRKziCubVx52TYoxDYqupyLssPc6JdaLUWny1Nh2vsEdnuNYXj82iX7AeJRaHJeyn8wytA7G8NwQXp2THTniwF6hPCWTub5khfdJ2g4VDTv14GRL88NA6w49N5FaG2ZWxqgRKYxbEJqgBE91KWHoXfsB4qvo6cGfMwpeJU5g6FTiexmXZqrNpRwmnnx1NTGK4TdqnksfaXZPMfPBbdJnQu1vfGwLuMkP5f5EvyfQ4KzazA67AxoabFYkKJk4pvVkRqaWUps9b3nkZhErUMAgxYR4raNtKHSUT13c9RMaGQmtV8viR4b7Z2JoKjqiEP9xGVoZBANhDpJ3EpihvRmDuy7MAZfy1qEm59spvdgdPPEiffw8GBv9MyDfsAGNSzsMhiP1f8WKXduWy7AdEJZTrBJkLZFPTaRHHyU9XvbRyzrxhV87thVrfRhv88hN6Viw2CyRdMJUPmVt",
      [ChainType2.Ergo]: "5ivrmzxYZTDDDoKD1urVYrXZG96ijTUYXQJzE6SCRJ2RR6Kj1UPWL1iN1xeHgYJEQjnQ7m3Ld9tBRRYqjzrAVAqHyGbZB3otUWZW4sUxN4E11fNUZEMQ3kVwnZxFmeSaxcXhQiTFH1cvBYWuFMRRFfaA2UMfpEgm2WoqeiJxPCojp9D7h6yMV4br5EtWTQJKRtcopBRoUgDg9mrKPAXGPZZKTZbYotgLKQ4nzD8QB5hjYJswhLmePaY3zK5eJq7NTcdoAgbNPK9nQ9UpBUgrc8RB76P8evPHMXg6HrVdQ2z3rkvYFVZqH9SmCkE8KGiLYGX7hwaXYGvPExdoVDp7qsSctsPjwgt9Vts2G76dzJzfBhEunJ33vdTEkEXX3wkjK4ZE8g5YKCwGpcED5PhtRQQtJZaZMYTZV3TpbPWy57U49cD3HVeUGR7efxUHZxYybWJ7q8i6NDm3PUwKFN63HmPYQn7TMYGkvSoizTuTAUJomiKgSnvoz2DSUzukRSRmUFA1cLqdR6s7FbeJfpbaKWX4kUGM2Xh38FdqNE94SjkQMY9bv3H5N8MgwGL2La12e1GXAdMCKJCWKRe27vjdaHJWmsKrBLuXQegGN8BaqNuvJbhrmreHAjR9tVwVkxcTUsr8u8TGUzkzN7coV8HiQV9KBMVgQ24NXPYyoCuedwfCiNwYX7PSSbvve7Dgyy5e1S6qbVpEpVtjy9NzWfRaqr5CyGDqhkfjizNG71NZu543vkacjXrrfPWqtNoXMtTRyM1pzwW9ze9aoRX6e92mVaCUB8hTnfH3Q8EstRLDJygLmp63y45tKwBVBDjog7Z6pWhTfBapMBz8Q28pMfPAR8ywfz8qvtkyQcv9SuEZWfvpZREaS5PGhBuqU79eR9bwNwS6TLu9BZV5Y1ahVFA1fMUxhXTvX69hKnNHFgZ35fZdrVrSeU4U5yGvYX7ViTqL2oFk16HLoTXgNs6KQz7PPZr373gDeRh7PfXpX5jWyxw6SRreE3jB5SUiQnZxmAbpJNVkPzFbZXcrsrS3JHSfiVeqp1tk5uNaZcX39tQTXtu4bGrpv6EiMvYPkiDhCiKd5oAVeZ8VxEGN7SP94vF9WhS2oWUMCVLU1XW2DDHejZ36Zo1Ho8fHbUEaKNbRBozY3HYnkYyJuF4wer8xJ6q4KcPppDrS5jqfAaZF6YWsdtqgse7qMeWVUPj23Vr5XG2S9sYmWA7femKuZki71S6BqZGNfit7F4vrzqNZd1L5oyLSVCtuiv3DybRnu2YEaUtrmCphsmrpAFSEwJWtFKqcC",
      [ChainType2.Ethereum]: "5ivrmzxYZsMEcMTZnZnsQm6jutdmSRzVW7WZoqN2c82khPoBUwF6GRVZdd6XhnNf9gbi3fsoZRM3cHmvz3sgJEJmy61cRxTKrM4q9ZfxYKBtyfNXLwD4CCeMedd6pxYDbgT6h3W5Qce2DZX51sw7aP6hu73HxJvcAirXLCYdZxi1nnGUbZYd8WNkU9zZ5ZGLVasrL49hVLNoJsP3ZYLpqzXchCL8RKv42qnLJ2kHc9BZJyv3QAYqMZTZSHQyRnYj4GAbdB3aYP71ge2HXCb6Arc6upjU4cWJPrPY4f8QcMdhXTrUtWp9u443Ekqdd3S2y2jfWLjDLsd7S9y7ASHPqx3GnCcPK4i9YnCQhdM8i5f59nA5ENgo24BTJvyQiRssDrCPpHxeTUp5ae2E5D4vyAnFfWCFfD6f5Z6DEDQvFnu1JLjjLcunp3rehGTSNgjyNNzGkjf6GF2y6enPuNcfpyNWsY2QJot4r1yZWqzeHvMgjbhnjpcManj1ikT1FFeg1oKZCCNBUbed4jYnmM1qFFmTYaovRUuEFXKFU2fhpz3EfEB79PUd5g5YMu1MTkKdUzLrEnoTxz9GKNpXCsoFvwC82hEuwXPcPFuMHdBFa4jtqSueVFgCPHHiXMz2koe6FGmCzY67q8215taocoiEC8NjGNTJ6Bzz3apbT5JP2hLVi6z11kNDQgtTA4gNRoftjZBBNVaFFj1DwURqEBzdawony7FvSpQYzgFEz5PKN7rAAr8Dsd4phbesmeASSph4aQLzB7iuibFSZXxyBm1w8GUEodaWEhh2UeTCJx2XtocU9aLYrUSgA6PgBF5NWzWwXDihESwyboSKnDb2mfHeGyjkjKSfQP2oP8Las1CeMXPdnwXUggckB44f82qjE5ENnqYhah4s5WkgPzzSvx42uhxc8VTbySPgiDefVGuFCEATX6fgAs5ikKh38TYWzLbUi9qM5Ncz9G7Z7Mc8RTdKtRLSxLUoPpiabXtyfdBkNr5PYhznMd3TPy9EHKinSzPV3GiJHGEkfYAbGmf2imbG2LrGtCEnyft3vBXYVocEnAXZsVKSRMPvkWsA7J2LRuQHrZCbVwY4LBDpfrHriEGUnAd168HB7DKPqRtCsVLgd2h6JgSHS4xXvfSwhG371VfTxJgAAtHUgKttcZfpZGXffLCwP7zmQGNVz6FJLsTEN3VXaQMQ7ooCeGHFdL7nbB7ejitfnWzWqgwqi5kv3nZEcmx4YfcnyvAjBosChtBMNfkMSVqa42Mx1xat4eJvHD5Jm1AwYijVqQjcXYh1ZzHqD",
      [ChainType2.Binance]: "5ivrmzxYZw1LAT2rQQY7Gkiuo36J5uzCTyMRoqee9QDzT4Wa1NnZaQ6zVLw3yw4ksfRCdfKiCYfjyiaJuAvdwi8WfVd2VJZo5VfoX7qNEELk34ZdvjCGsSdA3AWVfqSPy8NxPqm41xeccezcgRCVmyTHJa4pu38vtBvTZsnV4jzGTZsSstTQPGZMUUTys6VSBRUGqQjFpjVty3jTFudfJ4rRgyuGhyA1A3jgzY6wPSBXHniAi3c9rQLVEGNzpuyjXD1bFVemGdEmZp5tYLKb5BMsasJr6fa3P4xdyWryg6uUrxGiPZCRT4Z9DMmSyJdfVBFtnLaL7abqN3evRuHrGMn3KVVSFocUM9dLGZpU3XzzvWkgjwxB99FVJ4TzCSKphSgh3gPuCnwQWFhpuRuJJzV8je2jtYguEMNzcygK8WkvkuTsniW3zqJdGpHEqSKcQwnR7a5nP8yVyRRi26aYrNDjuJ2XoqnpLSSNAPmFZNApWcXGRqsqdaJBLsKPkkFXNYfcpwPNcpuExuFaeLhUaCbxdjWKBWMHPxqEhvK2dcs6uXhPjp4QX9XoMSiRqBGC7YAxhZkChKaxmBM3y2sTsyfW69LFM2VKs84FF7tXCGKPomVABQCgVbt5p9BKyPcL8ERa2LJrzfKJwfoXSAPrrK2QEd5zaDi7g6tSVy5QBFzrYARnncF2ZCuGR9Nmh6VAWumXpHfVq83iVVBWHKjSvKJuBEFUzg3G1dWmtwxqRZYFgdgd5FAZp5M6Nj6x4VMi4qcJe9S1exhMHKTDmKnmsJ7AX4YA4MdRGYXGJHRSUb842gqEYbqjjTSu8xRghbuxg9ghnr8NVx4uxwE56zJUMzhP4bVftTH6XhS1MDoRUPi451LcAbRr7QLR7gq8FS4H73FtJN4cni5mURRpNAnzEYFWcjmqaUuC9VSfkuD3Aqk7vSKpbJoSkcaZMXdqb9G4x6SGxjphx8kvxQDTJkmjkxNB5bADpRA7rfkSjRX9zekM8rb7NKu5doxYovb1qPgDuPPbD2eA279btntL8xzqTW2JWQdTPqdHG1ezxBsSWqWdFzzJYFh2VWuYB59A38EB9Mcihj995Y1DGfLt9vHMaw92ERCeqtk4MqX6WSBYc9QzTEA7wUtdYGXLydyRRxbLpYTfTX4sUvhCvg2YGix1L1G4nFaNRq28jiZjfKTCLr2TWDzFvX4jVWhFjFsBVRSCQhiKfDRpsUXm9CYXuk9tvnoVj2NN3e3SLyiWjCEUap84EhdyZn1zHHQSXnsSoSynR1kiWSDCuJCBcyM2MQ8wR",
      [ChainType2.Doge]: "5ivrmzxYa3qBuYZ3teFTEJP1ziojbVZAYdZF528CNfT5tiycZoiqXfZEqgud81sBrXGyGoanY95RS1xwRSzc4nSGhvhg9Awr23q8vde4k7PWrErq42DeCwborsxAwKm1YrWJEwD8KZiKmSMR9jCD3pTxfsvoq4yMJeh4bscJKRj9iuy79tzWT3NU4L1vrVNjQd9ksz8V2mUeU7EXouDTHxAM5Vci3HgeC2CBqY23J3mpXryfb3UPha7a4zf2eF7Tv5viA7ayrGgu582W2ZttnLFHQTRn3gnTU715qzjk7NMer98y528FxXNZsjSFs72tZm4kL6zMthigXX1yNBtr5vXmYKcHUyAeRWuX2CK8jAFWYF4cJeceCN5E2KjoTK47Ge7q8B9MNZBVU83HPGzjVkqjvFDQsDZyt7hyCRhguwKibwyw1Y76ceNXrhzwPgukP6PsCWyipqSMVTAxB3QNR46mGi1v2S3MNKR9bThJU98yQntABweyLuqHVmALaU5s971p9SPi25gVnLsFD2FQnczLpHR2g8iJ2PcUZageyVyCxKbX3EvUoyQTymeaQuSwNgySKAs67YgUPFGcmXD33Fbs7vQvkrDbqUVprE2igGNZvCmStypiqZA6ijDzbaTX1XwFAehFT39WyGQ9NXzCtYn35fj95NLkDWugvEmqL5to8JFbCcHbV13WCJaVgvcerLKU922nuM54QXYNoSQHYdCypp3PXwaWBbsemt1cbH9mGM5JnYuhAm2gKctu7rUwCQ9P6qx7k4nC6ycUWLPsYeaYt23RXxF9cx31A9nUqSW4n4j46j3fVTkBX47C7X2TFF2VgHFJky4d3etKp5EQodYs2caNLgmmACErMCtJ1GuamHCfSEg3iLyLaPAmtRM9HFUVCsMEL3GwLzqEasH3fy9dpUrAh8FqAHPT16gAx7ePEPU8k9obwUyYqkxMBuyaMonoy37GejLXzpzM9DTacEuNCBKw9hVHnDCB5Zxkhuj5kkaH3794qur5GCF3XKFnWNuKf35DBwVeEq3SMMsWmcBB6ZqfJJxa4vCLS6aEhtDxnSxw1TS8T9bvu91dXLH6HoAfK5vnoGHKP387yTuJmcbacFtvBoT6EWDS6DvXQx9FptRgojeF9T1ZjCChE6igPL9WhWPvvCEm6BMR2Jtsxw16JJzqMW33W5CBJstoi8oSKE2yrw7i2hxsyY6UPDWZUe4Cex2tSfWSzSS3tXo5ahVMfoVHxUmmKJoE6St16U58ETVipwqU6WLJT6BGYboueetYfbzL37FPgQEruWWNT",
      [ChainType2.Runes]: "5ivrmzxYZwTAiTX9sPndhvFogPtijgcySCRKTQBJwcgHkKVsM9Chqog7YhdVDbf7AH9Z2PgYmjMrWbPgDDCHLDANY9RyY22DvgyS3P4XmuD1YptEBLveRbcQGJjeLmxF5HzmQePE9MtFC2foD2e7gWBqqSuhcSQMWtWZXrsWzEgbtvvQP1UYsW3DHaXa89oQzxiLq7bGPrVqvxEK3fHS7onA6MZo7bf2UxJE7zqnbvq91CLZCAcp33VM48vTmwq5X27URUV81iJdpqES3JSVdAdDqrMXGiqCh8rB8mJsVqfmUy66nYmK5QVSu11N23pELKWotBnoN5WxZuHugeytjkFRtFMpwuowE2tmrkJ6NXF4BBe3hAh162o6b4zVUpbkhsjg59HkaSeFAhQScYYQdcJf6uZoA8cF7JHya1QEuVzeG5esubZjDx7MSPrEL42Gehvbt6QZ6R1QYK6gZSFB7twXHWWgcX2VzjofWtbAJkN69JbaWh2W54PQ4x8JZdUTWQcUQUTbPd6T8Wj8xuuXWfGLsadY8CJ9y1Nojctupz9MxzkZZQZnqtuwnNU6w15CP5MGskSbpF4U6Ha6mSnjQzWRGTjZTS73nof3Rr3QcJzpMbT18GQCoZnkUXJ19ch5Ub62pBhSc7gUaed1vxMfyfHBpnviCMwyTA91MWCjajbMzZyEzbrGz47xFW3VuPkTqtyNTFbue8pgouvoDC7vu7haTQWyjQXQ4UmVN6cWNzxKW81JhUSUWPXy9spJcH1ESXwtgJPGPfGwdmCPkJogdrZvPZcrPpDEE3U2UWVKHwHPVgGj1iDdXDxCaht4AdHus2sJhtC2P3N4gsP2RFbkecSMZii6ZB5R3n58qzq3xnCeHbvCu22Xdkao7jFPkEjDqdsbLVkwK85dTVHcybB1xV2Cgvv4YDjaHemfAwUrWEfELi2MgJeRxrA3bPPT8PsAh1uSMMEL598EijK2Psn8YwmwZFTMoigWEAfr1PzvisDZjYAH6ofrt95jFHuT1XKFy3wT5uhveGWjqFjhJpV4XvvRf9qLBiv6XRTqimK3AQUR1URog9fkfVd6u9spDUTkX1tWMTXRTPnrCPkWmkjY9K8PdSsY9YsbTv6YQ8HzeeiHTa18uPhy99bd4k3bubL1zuAmPMoNDUKm2m9d3xmMB6soNS849xt1LS7EeXRzvkqEY2kU75QSDSrqhaMPr4iGYkd2JBjyQohbCMsWNdsjWqxQjgCc7cyTWQngrtLaFRXdLbVNKCzHvTzCnWqpa8xNZB9ecsrcbno13jrAKzHhx",
      [ChainType2.Nervos]: null,
      [ChainType2.Handshake]: null,
      [ChainType2.Monero]: null,
      [ChainType2.Firo]: null
    };
    var permitBulkAddresses2 = {
      [ChainType2.Bitcoin]: "ZsPNMsGz8D8y11MAneZTVjJndCjgTUrBWezH77jKWr2KXMVRgs4gRkDdTLoUQq8xqtGoESTa7r3zr5E3SxQkE5CM2PaPDSHb5bQWeRtaL9eikJWw95bx4DSjCDcsECpjLxbEfahCHy2sDuXQg6potLhwVVADP5TNUxEDgWPR27x658qcHA54TPRhybb6z67cdmkPrQNXwumoGvoPNnqVcXsdXS71KpQViuk4wXBT156Nd7Tt9b3Dvx827QiLbjJXuajydCDFC6yp2sj5dk7uA5ArNfViybrVQaf71GNGwyh6USgVKBpTurrRBtxeGWNzXi4krd7XbseaU5Crnauk9fj5jEbVH88sPzuD6o4XReNW3odcKDkvqgUh9Vu6b2uGLJsV5wY44Kk3bf8PJmkTc6vQE7Mprkdi2jBfZrzffqoKC6hWLfSZNcUWFV821L43VkJbsaYLukMq1SBJ7y7rsnWcct1U8owQbDpboysHrxfeE84JMTterx8E8sxJqwQRRTxT7M",
      [ChainType2.Cardano]: "ZsPNMsGz8D8y11MAneZTVjJndCjgTUnjAi7MBVhohaELkSWjyWJLdqw9DFRK5XJ5mS3TnP1cxLsjn38fsQ1FKDfXpczKLF38JVqUcTgTz4vWuQ3moQtya1Yb85tJXVnq2NgvDcuWJsRXQWyqBABL93WEFwT6TWiZeXVAQ7x3EhJGmFvUkbZqbtkHvbYACQ7PZVwVNXn44saome9v7QrCMqvxHHrdqaSc13dHXx2MGVut22sVvMsNXT5ody7hoAqmhfioxM6Yw238jUyturCgtbWdVr42Qv5t2aZ8YCdz6ifvqSbKmnNUBSiccfxr2G9Y4eceJ5jv7iJEaf3RAoYH9vTP1yiacpmFZLjtT38FUz5n95ubWfNg5kZAiefzyaFRpV8sRH147FoaQKFRUQRACivsVvXRBhZWYeA57VZ65E7E6d5RU4JJewNiQ5de5daAQXnC9aV2diVXw9obFC2aBYqHz3U14gHss9xvcVPuqFsJdQRLsejtnYxuoZcJF18vohmNKb",
      [ChainType2.Ergo]: "ZsPNMsGz8D8y11MAneZTVjJndCjgTUjPFBh5wF6ZNmMySHVDcBmMx2VxGFNCcMxCKDPkdPEzZp4bt5pgwrpZyKV6nmzCAh6SaX5ZnN2fL2X2UTuLvmuk6t8BqrxoiKHmqASttYk6xJPNabuF9ZNMYQBikFWDmq2jrxZS1MG6gQQ2Mx1MgXVvPs9ZkDTe8TykK4MuvQwtjaatjugK3FC5gsB4e4KiTcMPzreUkHvC8mZQGTtGkmHSbq8hkUDfa8MUMAka4oV3unyhgvx9MHjSDNaKWtqrWJpHCsQqPxvzPKohoYSNQt6H3V6ddw1dzGbBz8eKSbno5tEaLSryLDeMAbXhivALPZ3uCyWvx9BKFxSpuqCuQs9aXH7zKedvxzE6XRrrC2TZcWn5UinvbMNu3S4i5oTK2Y8WeVfoy5XHRbK7AL9w9pimJBp5Dx2UnhhHrWbeg9XyVZP7uCEqcUK3iVFmdG2euUa84Jbr7XVaE8v3sBa8LvYdxc6wAVfgPNNbQNxK7Y",
      [ChainType2.Ethereum]: "ZsPNMsGz8D8y11MAneZTVjJndCjgTUoSPbApCbagsfJ9WvbzbsgAbzHGNF5aNaoR2AyxnrCBH68d5TDEc8aBhVRBT4Q5UC5tdqi9JpMqC8CYFja9PYqMj7KZDjPyMHPxbqUSrq8pGVwe7f8dCV5brNYBCrNqcrC5TmYvp2HpoEUXVb7JsxCuPWQFJgXqYhzEbySQyZQGCdVX6XtjU7aQZK5bzijsXDJhuntTM7ntmdSBJjEhtkMrvrBH8RtTW2JHZw5ZW5QamM3MJbfYDExepJQeJtACiz5n36piDgebfWgjAgibjz6oXsky3mJk2rAETx25AMQSAkHz3cYnH5Gs6BorBka9qXK3U47Dk4tobZGbEZqVeFvuaoRb7VcGUvX8L4rQf72gXzVVCVvY9YEzVoFEfFGe392S5e7X6QpdBuap8maYY4RygToFx6fLeUggDP1gEQ2ptDXZoCcthQPR6ey1GtEju8jqujt2VvJ6A8VjCbU3JYvozB6kqGxLCLKHaN1zm1",
      [ChainType2.Binance]: "ZsPNMsGz8D8y11MAneZTVjJndCjgTUmenzfjjRBRRAo2DZVkwmBZxuHGoNTFLLrmFhsvuagJbFxBVLFW2nnoSuDHhNckxkJhBKNVhfPghWoKTuCHsEdJcJ1RD6XTT2aWbGPwHkja29mj2RibYNyCqjkPWEmbRJhVvfN2DUZ9pExxBPTmghNa6tFQyLkkfHdmuXEXLdpmWndfdknawDuojQPGjx3p42ewB4eeV8Zs7dDCDLdUUghTcczqJAadPMroUpmifMTw1FrpU3jC3kMaSzYpcpPu4e44xEni3E9hrenfQePbFVe9Jq9bVyjsQBF8vC8UxqefzEFmMoHT9xkdRNsFmfLMAximM3nyNhTMgLimWvLcNddW11jK1FFPumgKRUUeRivjtnXiRsNedXpmHKhvSVvpS8wAJbuySw3bHqkrpgQHqAr6vUiXj5McjsYzVh7PZxrUgEGNe8uLk4UpxJGhW3TVLNcPHdEbq2AoyabVkK2ChbE9KZ2JJBdHah93VgZSVG",
      [ChainType2.Doge]: "ZsPNMsGz8D8y11MAneZTVjJndCjgTUn38JxZpW4EiZgEoHt1Juw2od5nVwwx23kjav2ZzWjZAYrjAQnGwskZjCxmVagr3o3d8AfdQZySQigfqzTFjekNSHeQBuQPQ1y3ry6fN4w5ECxn9jrmho9pZFkBddZ2QLbAhvZVt8WrpduXniFkG27KsYo6ikCtgRsJyvzjE7kubBpsYfRf7tV8ZT2RyZaSGJp8Lo6SbrAMdDA1mke93sDDkP6B1cXi1UdSSg8nAi68b2HLJEdnw52KES4Xnh3Dg3s3n9Ur1mGf6WJ44oVVxwsBHoXWLhoAXJ6v6XSnX1rxBcqT344WHLrezqdGwzYAbKYqGtUiEZq6fcHVhL3Wu3pxkv2WbupVFpVAeFPxYzcwwf7vtibL7KG5RDuZ3rziqCgLC5jL9ckTS4KkZXH6YEJktNnUmULpcBdpGUHWzeea2SLMeiNYw1aoZ1k9QfmVK7TjxKJ5g8gSrSTwmfZHMPD5v6EBYyu4gBe31WXWVz",
      [ChainType2.Runes]: "ZsPNMsGz8D8y11MAneZTVjJndCjgTUm8aRdfPdTL96n8TUczBDtarP8o5pFfx1VTt8SLmb8khLsa8Jg34fMWSUnTroano5tp9vHvj3M1sPbbr3gw3jZGae5LUk1gAj1G7ytudoGXtvoDjNtrpfhwQBVat6xHLuyE8vHQ7CaaToTn5MTFdeYg5u8P5XSMHtb37j4ZjfVu7H5SrMDMaGkNUqRiwvU4ABYUQEc6qNqE3XqhVY32EerjQwB4vGQwPyy71CerANA8TVcj2sqERsXdVwvR2zdWoL9cv3vc1MwVnMMpeAw6Tuh9NcwmYHPcgrxPvZGwn7Xcd8BMFfSDwDGxKjEctFfH816Ba5sZKV32wwLHbACLniA5MhojHNzjAWuPjHCGeR3VF4iqW54kDwuk3vqbHqM28j9JeSwGjYaYYz87tnfhFchAAgYqmoCFZQvAUJo8SZThNTmTrDZvWeS5BPSYNQiLTMgqAnFpVmsMN8EqEnQ1ggHdLqWQT8bmMWd3UTTwqs",
      [ChainType2.Nervos]: null,
      [ChainType2.Handshake]: null,
      [ChainType2.Monero]: null,
      [ChainType2.Firo]: null
    };
    var rewardAddresses2 = {
      [ChainType2.Bitcoin]: "2Eit2LFRqu2Mo33z3pYTJRHNCPYS33MrU9QgeNcRsF9359pYMahqnLvKsHwwH72C6WDSZRj7G7WC5heVyUEawcSLSx821iJXT4xWf2F5fjVWDUpyGNdkxhFwQMhPKpx85Uu16put68V837wxDx19LRJ5uqi7xBa7EDFRU79Grzk8HDrfpUF3qct4xrQUvDofDroRQTuKueAbwybAfGDhNqG3jzKQchgjedBkbPAuDuNunehW4ZXUBLRSfqy3xofV76bxT5zpZjZcKud4XaRQvXUAVGunJzAs7RNZD5WZxenhmKzhiyuzWiq5QkWqxFw2h9vQ6Dd5PdYsWP3dPtaDC8WUjGz8tQ1tU9LuhqZ8QThQA5zBfoPFrk2iJ1repUuwZPjWnDRHLfWppqDQJGm2GEWHmYTQAfCJQFChUtSNstSATxw37xXjziKkPQRRVPr3VPapbHtGSoQyygzTHgcjxv3HSzwXkD7DScyA2iGDsd4B4WeXo4a6nM4CYpxa9f9FvabbNByhKsgq3ZoCsbUVXN99Pet93MFdxVmBBEsGYEYvtmMEDZEGb5z3JZDtVSdudFcm3bij82bdFzKSmmxxWZhscmLYpGGq1J5geqTiyTCgsmksAHumPFBmLkz8v843Jc3z5b6dwFgyXuBmQPTq6Nf8t95y1UYe8UYx3qNVfrHSGbToSgvCQyLKVv5ns8T2SZRWWr",
      [ChainType2.Cardano]: "2Eit2LFRqu2Mo33z3pYTJRHNCPYS33MrU9QgeNcRsF9359pYMahqnLvKsHwwH72C6WDSZRj7G7WC5heVyUEawcSLSx821iJXT4xWf2F5fjVWDUskGdVdyYY5RBJnp3dfYC7iPoRNeopAFQWFwEbTieow347UhRyqvo2LntFpXzomvGwVTfq9YXS8Z1GGW5mUEioD5xC17Sz72NLbQrskSx7QZAxQTbMGh6vwM9J4q7NzRmQeHmWaHLpUHMU4Jdd5ccKumMvAY8d5C8RxB4iATySLY2N1wY84qNsWNaqkNofbUebf6LgmU9HTKAmU3nDoBfX7mhCjH8kXDhZeYdRsuLVFEYu83TkpwgHAYGmUoemxWAeA2BKMx8CBAy9jxbCyUjdnk9i7sLxuejrwLLh8W4tP81YkESjZ8BV65BhzPdvCaiX8vBSorgFfnvGKVzwfhhsSDwLY1GUwLTMLwTUTjSzEjsMX9hzsEEEmhxLsekabLmK3HZ1jssLrFryNuE59uS51hazJsi3gsT8SBk1J9YV6Dq6xto28nLqrMqK6raqLcAm2iU8hBtqdoSXqWzsrZHpqc2uLGhY52ee4k9TpFBvN1RovYUtY6KS4FncT4UgnbEFkzsnWYKX3CDn16tJs5CyZ97gKcvUonZ5EqTwabzni14CcQsTtKtEAqj1odvSyfJ94NnEjuiVPC3VmZbQvveN3bQ",
      [ChainType2.Ergo]: "2Eit2LFRqu2Mo33z3pYTJRHNCPYS33MrU9QgeNcRsF9359pYMahqnLvKsHwwH72C6WDSZRj7G7WC5heVyUEawcSLSx821iJXT4xWf2F5fjVWDUmvtxr3QSv1aLwThLXxeqYCCc34xjxZDPqPyNGYvWLNeBZxATvBeDuQ6pSiiRFknqmvYVsm9eH4Et3eRHCyxDJEoqZsAahwfVSya34dZNHmjaPQkwWo3Coc17pxiEnWuWmG38wSJz1awE6cymzhojnjxDTbbXgjR1yfYU3AU2v9zttnT8Gz3gUzZNSwjiXSPu3G9zkDaFZVKqb5QwTWY3Pp6SFJgBQfx3C3sp4a9d3n9c98pfWFWAGQN5EfkoHosF8BQTDuzXG3NU8gVCNeNPXYA8iWCbvY3XpxQMvQUxqkjDv9VQfUNvAKVHLW43chi2rdBrQ7Teu6NnesLRWUKXpzSxpByWftkCCdBppjZtYmhhCHqpQGkQyTcMRoP2krFKe7xKbfnFkdkhaYH9TTdKuTuKtGb265RXxiqrc34KvkZpaBBQB5UvoCU4iLSDngNTjqkNPnWekDahzNHLd6CtcdC1B19jdGEXWeNADemDtdK4zrMNg7U8iVpyGYhLDnkeLVrcbhoxkHxrFwfrN19XvitDosQqmt9dseR6SWHBCDZJdmJecCiEwd2wBiwN5N5umEy3Dd4Hznv7kDr6eX7KtYxp",
      [ChainType2.Ethereum]: "2Eit2LFRqu2Mo33z3pYTJRHNCPYS33MrU9QgeNcRsF9359pYMahqnLvKsHwwH72C6WDSZRj7G7WC5heVyUEawcSLSx821iJXT4xWf2F5fjVWDUpPyXf9D8PFkALkfhCu47xSApej3a8VHFCfLuQoMFV2LgTs6hEqRf2XQkDHzn3KYbGJ9b6gs2XcYf3ZQA2gJaWJXFErT11uifohMFFRJV7cb1eECubCbHCib3A434SJVrZee18QTRECrDirtC2GdZK6fiKGbGcKFTZWK4f3ChgnuZFCjRoCX2UquL25b2zkev34shFCspbYwYcyKmc5xxrvssUHgQmUZy7yu3RKJPXYuwH7SiittGsJ946spWJEp3cuBiMcpRvwbiCyrQqM1FtK3wZJKqy95bVDfj9zXwFfR1rE9wZADPs6xcJxi9P1z2iBXqPXGQHnKVaHJWEwNZfP2KAZeUi8etKnYSib68e5cuif3YNRVFdNtKAT2SJEsJCDmnUecmdCwvzMeH2EtNYsRBWVeTV4RBypRPi243qkFrct41bz6WZ8FhLFXU1tnExucXvQ48ZoQ4RQpNorEcGNDY8MC52yhkofS5b9wy6AYYjpQyTMmhD1QZF3VcQgPNT6x4yxPXYsjohYZh96h6M8T7m9gfVV3w8xowtVQVAB1kvJHMuZXxBkBNLwFbhxKuMwC2Dje3LZmuH9mhg94f7Uoe",
      [ChainType2.Binance]: "2Eit2LFRqu2Mo33z3pYTJRHNCPYS33MrU9QgeNcRsF9359pYMahqnLvKsHwwH72C6WDSZRj7G7WC5heVyUEawcSLSx821iJXT4xWf2F5fjVWDUmAMWiE8WncsqsSRhckGHa5xwdGj7fCkypvX2Q9ypun1tUfQ8YwoXYgYCSF1M2t7WaUb2ZZzY9yETrdm8ywS3VzDFpirFEiLLgjE5vhsLkcW2PtiChF5npL3SFsxnSY92ZMmSw2U9GzhwDwTKXpPUD17dydf4CTbLATnCdiTkEYxCzVqh3XnBebDhEFSHWhCWVtqRniJJRqpRaAsv64qtBPabPG8HNRHT9TXFR4a58wH8VqdNuUSKHx1NQahaXTPYHfQX7H4mAzYU6fbH5uryhxqSh5HTBmCB8XrJcXCR41FeqjwrkwTiEHJkkyHVTeLdpyaUcHJ9M9nEsTbGbxMBLEc6CLtzRA5bDwFAKXN3i2mo86wUghaPMd72nd3pLDbhGYRntgYMrVWuVDzMhdJamVvFPbiEWiCs1BJ9NgJzasvJpJQxm1uBYskrWnULHQaJf8Kfoixaqcz6mcp2aAEAkoAmd3CcAddM4X1vCuapWeyaxLD7kXrHaafMsatugqJP4JQGFKEkXXBhthKScGLq5wcbYb2cVv6HuzyxyMg92UiLzTyFDB8QG2NwKgTfLGJ5iLDzzsFkPGtkxECDMVmiw21E",
      [ChainType2.Doge]: "2Eit2LFRqu2Mo33z3pYTJRHNCPYS33MrU9QgeNcRsF9359pYMahqnLvKsHwwH72C6WDSZRj7G7WC5heVyUEawcSLSx821iJXT4xWf2F5fjVWDUkje1kCt7DSEufp9kN95BRzhkMTmgY2jmZ3gPH7hjfNkbPBkjLNifx5iH8wZ1EmiMFiWKozc1ZeT3QdnRhCtLZwHo5sBTek83753eK8YZNVgtykvcdLDbsgGyfCXZtJ2zxbNK7522JRormkeNkhLFBxC9u2tQ11EHyvcg8qHUhPA1GCXALUdtB1FkV2chfgewbDmtrpn7tqC7o3eaxQs3Ted3mo3TKmckYVWca7TqHnBCYGE1GRH2X3ZuWuSJXyi1AxKCyRi9JucVAGwpBhQPNR4viEZe5fo6kBiChWriCKmr7pti8685xoAz1ycFnLPKhbgdkwXmZtoLbYYrirEifkMJ1QXtaJStb86NQLQU2ThhqTzEkP22D8sRZ3Ud2b83KcxVvzzCvGeDRK7SkfjbmfhTCazJwwXiFTHBgT2tzfJvQTazwP6czcVC4taS55Ts2uKB4Z9Eu5MeWEvbBLBis8KxnkZkdMecxcBjRdAojCwyMBJUz8EPYo6x659TzbSJhjJiFaQ9f4kanVBV7nC9gK1rq5oY7bFH9MUcwGeu38HQk62kUbv7Q2dYx56CBVw6cHzdRJu6AXHY8dAy3BLqvHCV",
      [ChainType2.Runes]: "2Eit2LFRqu2Mo33z3pYTJRHNCPYS33MrU9QgeNcRsF9359pYMahqnLvKsHwwH72C6WDSZRj7G7WC5heVyUEawcSLSx821iJXT4xWf2F5fjVWDUkvTLn8ZxbjUxBUfbKqvX55KDzYAKYt3ZKbqRCPuqoyroFuZ7Trm66GMmStkANyvdxLpKBNo93c6zjtuWAiV6NDw5hxCj1DJE8trc6nfcnKoeF3jvMyn8RxWxFiRKtShRsRZ84y5FKRgAwhwDWqw57qsNQ3WfPFwnP3F8XWa2sUYGb1ECxMTtyLNP1Tijz9L1rZYgVGrRKtdWEwkoH5GiA7xYntzevHu6ttL8dxqNzn8eHE29x1dJ32prcgGRXYG4nhD5v9RV3UskZUR5EPVQLZWF623vKTU97o46qjAvv5qjDuWXnWSwv8UfeZXNhsq6GNUs4NExpR192TwNvQqGZVgwh8NTg2tj6k78qyLD3MVFn5CuLBqa8QLnS2NoYsbddgCAsFwPW4uj8sUR1hAzT3epqFssH4B4fdwwUDRqGVZfmjAuTr2uHdMThhq652v52esKvaSC43khGAW8ixmo3xkUTdqUtN9X4TRiQkw8PxuwVUxHB9Ux2JugkMKhQK1rzyUTCN9JAfU4S4hdKGKRBF3papEAuE8s76dvboioa5VANbY8JZAMpgdnECCxxtXqcRDkwvVoX9Pn1JLjtizPq4Uf",
      [ChainType2.Nervos]: null,
      [ChainType2.Handshake]: null,
      [ChainType2.Monero]: null,
      [ChainType2.Firo]: null
    };
    var hotWalletAddress2 = "nB3L2PD3J4rMmyGk7nnNdESpPXxhPRQ4t1chF8LTXtceMQjKCEgL2pFjPY6cehGjyEFZyHEomBTFXZyqfonvxDozrTtK5JzatD8SdmcPeJNWPvdRb5UxEMXE4WQtpAFzt2veT8Z6bmoWN";
    function getChainType2(address) {
      if (!address)
        return void 0;
      for (const [chain, addr] of Object.entries(rewardAddresses2)) {
        if (addr === address) {
          return chain;
        }
      }
      return null;
    }
    function getChainTypeForPermitAddress2(address) {
      if (!address)
        return void 0;
      for (const [chain, addr] of Object.entries(permitAddresses2)) {
        if (addr === address) {
          return chain;
        }
      }
      return null;
    }
    if (typeof window !== "undefined") {
      globalThis.ChainType = ChainType2;
      globalThis.getChainType = getChainType2;
      globalThis.getChainTypeForPermitAddress = getChainTypeForPermitAddress2;
      globalThis.permitAddresses = permitAddresses2;
      globalThis.rewardAddresses = rewardAddresses2;
      globalThis.permitTriggerAddresses = permitTriggerAddresses2;
      globalThis.permitBulkAddresses = permitBulkAddresses2;
      globalThis.hotWalletAddress = hotWalletAddress2;
      globalThis.rwtTokenIds = rwtTokenIds2;
      globalThis.getActiveChainTypes = getActiveChainTypes;
      globalThis.chainTypeWatcherIdentifier = chainTypeWatcherIdentifier;
      globalThis.chainTypeTokens = chainTypeTokens;
      globalThis.getChainTypes = getChainTypes;
    }
  }
});

// dist/service/commonjs/src/lib/chart.service.js
var require_chart_service = __commonJS({
  "dist/service/commonjs/src/lib/chart.service.js"() {
  }
});

// dist/service/commonjs/src/lib/constants.js
var require_constants = __commonJS({
  "dist/service/commonjs/src/lib/constants.js"() {
    var rs_DbName2 = "rosenDatabase_1.1.5";
    var rs_DbVersion = 38;
    var rs_InputsStoreName2 = "inputBoxes";
    var rs_PerfTxStoreName2 = "perfTxs";
    var rs_PermitTxStoreName2 = "permitTxs";
    var rs_ActivePermitTxStoreName2 = "activePermitTxs";
    var rs_DownloadStatusStoreName2 = "downloadStatusStore";
    var rs_OpenBoxesStoreName2 = "openBoxesStore";
    var rs_AddressDataStoreName = "addressData";
    var rs_InitialNDownloads2 = 30;
    var rs_FullDownloadsBatchSize2 = 400;
    var rs_PerfInitialNDownloads2 = 10;
    var rs_PerfFullDownloadsBatchSize2 = 40;
    var rs_StartFrom = /* @__PURE__ */ new Date("2024-01-01");
    var rs_Input_Key = ["boxId", "outputAddress"];
    var rs_Permit_Key = "id";
    var rs_ActivePermit_Key = "id";
    var rs_PerfTx_Key = "id";
    var rs_Address_Key = "address";
    var rs_PermitCost2 = 3e3;
    var rs_WatcherCollateralRSN = (chainType) => {
      if (chainType === ChainType.Runes) {
        return 5e4;
      } else {
        return 3e4;
      }
    };
    var rs_WatcherCollateralERG = (chainType) => {
      if (chainType === ChainType.Runes) {
        return 10;
      } else {
        return 800;
      }
    };
    var rs_ErgoExplorerHost = "api.ergoplatform.com";
    var rs_ErgoNodeHost = "node-p2p.ergoplatform.com";
    var rs_RSNTokenId2 = "8b08cdd5449a9592a9e79711d7d79249d7a03c535d17efaee83e216e80a44c4b";
    var rs_eRSNTokenId2 = "dede2cf5c1a2966453ffec198a9b97b53d281e548903a905519b3525d59cdc3c";
    var rs_TokenIdMap2 = {
      [rs_RSNTokenId2]: "RSN",
      [rs_eRSNTokenId2]: "eRSN"
    };
    var rs_RSNDecimals2 = 3;
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
      globalThis.rs_DbName = rs_DbName2;
      globalThis.rs_DbVersion = rs_DbVersion;
      globalThis.rs_InputsStoreName = rs_InputsStoreName2;
      globalThis.rs_PerfTxStoreName = rs_PerfTxStoreName2;
      globalThis.rs_PermitTxStoreName = rs_PermitTxStoreName2;
      globalThis.rs_ActivePermitTxStoreName = rs_ActivePermitTxStoreName2;
      globalThis.rs_DownloadStatusStoreName = rs_DownloadStatusStoreName2;
      globalThis.rs_OpenBoxesStoreName = rs_OpenBoxesStoreName2;
      globalThis.rs_AddressDataStoreName = rs_AddressDataStoreName;
      globalThis.rs_InitialNDownloads = rs_InitialNDownloads2;
      globalThis.rs_FullDownloadsBatchSize = rs_FullDownloadsBatchSize2;
      globalThis.rs_StartFrom = rs_StartFrom;
      globalThis.rs_Input_Key = rs_Input_Key;
      globalThis.rs_PerfTx_Key = rs_PerfTx_Key;
      globalThis.rs_Permit_Key = rs_Permit_Key;
      globalThis.rs_ActivePermit_Key = rs_ActivePermit_Key;
      globalThis.rs_Address_Key = rs_Address_Key;
      globalThis.rs_PermitCost = rs_PermitCost2;
      globalThis.rs_WatcherCollateralRSN = rs_WatcherCollateralRSN;
      globalThis.rs_WatcherCollateralERG = rs_WatcherCollateralERG;
      globalThis.rs_PerfInitialNDownloads = rs_PerfInitialNDownloads2;
      globalThis.rs_PerfFullDownloadsBatchSize = rs_PerfFullDownloadsBatchSize2;
      globalThis.rs_ErgoExplorerHost = rs_ErgoExplorerHost;
      globalThis.rs_ErgoNodeHost = rs_ErgoNodeHost;
      globalThis.rs_RSNTokenId = rs_RSNTokenId2;
      globalThis.rs_eRSNTokenId = rs_eRSNTokenId2;
      globalThis.rs_TokenIdMap = rs_TokenIdMap2;
      globalThis.rs_RSNDecimals = rs_RSNDecimals2;
      globalThis.currencies = Object.values(Currency);
      window.Period = Period;
      window.Currency = Currency;
    }
  }
});

// dist/service/commonjs/src/lib/download.status.indexeddb.service.js
var require_download_status_indexeddb_service = __commonJS({
  "dist/service/commonjs/src/lib/download.status.indexeddb.service.js"() {
  }
});

// dist/service/commonjs/src/lib/i-db-databasestorage.service.js
var require_i_db_databasestorage_service = __commonJS({
  "dist/service/commonjs/src/lib/i-db-databasestorage.service.js"() {
  }
});

// dist/service/commonjs/src/lib/memory.storage.service.js
var require_memory_storage_service = __commonJS({
  "dist/service/commonjs/src/lib/memory.storage.service.js"() {
  }
});

// dist/service/commonjs/src/lib/mywatcher.data.service.js
var require_mywatcher_data_service = __commonJS({
  "dist/service/commonjs/src/lib/mywatcher.data.service.js"() {
    var MyWatcherDataService2 = class extends DataService {
      db;
      activePermitsDataService;
      async getExistingData(transaction, address) {
        for (const input of transaction.inputs) {
          if (input.boxId) {
            const data = await this.storageService.getDataById(rs_PermitTxStoreName, this.createUniqueId(input.boxId, transaction.id, address));
            if (data) {
              return data;
            }
          }
        }
        for (const output of transaction.outputs) {
          if (output.boxId) {
            const data = await this.storageService.getDataById(rs_PermitTxStoreName, this.createUniqueId(output.boxId, transaction.id, address));
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
        const permitsPromise = this.storageService.getData(rs_PermitTxStoreName);
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
      async addData(address, transactions) {
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
        await this.storageService.addData(rs_PermitTxStoreName, tempData);
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
    };
  }
});

// dist/service/commonjs/src/lib/process.event.service.js
var require_process_event_service = __commonJS({
  "dist/service/commonjs/src/lib/process.event.service.js"() {
    var ProcessEventService2 = class {
      eventSender;
      services = null;
      constructor(eventSender) {
        this.eventSender = eventSender;
      }
      async initServices() {
        const db = await this.initIndexedDB();
        const chartService = new ChartService();
        const rewardDataService = new RewardDataService(db, chartService, this.eventSender);
        const activepermitsDataService = new ActivePermitsDataService(db);
        const myWatcherDataService = new MyWatcherDataService(db, activepermitsDataService);
        const chainPerformanceDataService = new ChainPerformanceDataService(db, this.eventSender);
        const downloadStatusIndexedDbRewardDataService = new DownloadStatusIndexedDbService(rewardDataService, db);
        const downloadStatusIndexedDbMyWatcherDataService = new DownloadStatusIndexedDbService(myWatcherDataService, db);
        const downloadStatusIndexedDbActivePermitsDataService = new DownloadStatusIndexedDbService(activepermitsDataService, db);
        const downloadStatusIndexedDbChainPerformanceDataService = new DownloadStatusIndexedDbService(chainPerformanceDataService, db);
        const downloadService = new DownloadService(rs_FullDownloadsBatchSize, rs_InitialNDownloads, rewardDataService, this.eventSender, downloadStatusIndexedDbRewardDataService);
        const downloadMyWatchersService = new DownloadService(rs_FullDownloadsBatchSize, rs_InitialNDownloads, myWatcherDataService, this.eventSender, downloadStatusIndexedDbMyWatcherDataService);
        const downloadActivePermitsService = new DownloadService(rs_FullDownloadsBatchSize, rs_InitialNDownloads, activepermitsDataService, this.eventSender, downloadStatusIndexedDbActivePermitsDataService);
        const downloadPerfService = new DownloadService(rs_PerfFullDownloadsBatchSize, rs_PerfInitialNDownloads, chainPerformanceDataService, this.eventSender, downloadStatusIndexedDbChainPerformanceDataService);
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
            await this.downloadForChainPermitAddresses(addresses, downloadMyWatchersService, myWatcherDataService);
            permits = await this.sendPermitChangedEvent(myWatcherDataService, addresses);
            let chainTypes2 = this.extractChaintTypes(permits, addresses);
            await this.processActivePermits(chainTypes2, activePermitsDataService, myWatcherDataService, addresses, downloadActivePermitsService);
          } else {
            await this.processActivePermits(chainTypes, activePermitsDataService, myWatcherDataService, addresses, downloadActivePermitsService);
            await this.downloadForChainPermitAddresses(addresses, downloadMyWatchersService, myWatcherDataService);
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
          await this.downloadForActivePermitAddresses(addresses, chainType, downloadActivePermitsService, myWatcherDataService);
        }));
      }
      async downloadForChainPermitAddresses(addresses, downloadMyWatchersService, myWatcherDataService) {
        try {
          const downloadPromises = Object.entries(permitAddresses).filter(([, address]) => address != null).map(async ([chainType, address]) => {
            await downloadMyWatchersService.downloadForAddress(address, true);
            const permits = await myWatcherDataService.getAdressPermits(addresses);
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
      async downloadForActivePermitAddresses(allAddresses, chainType, downloadActivePermitsService, myWatcherDataService) {
        try {
          let addresses = [];
          Object.entries(permitTriggerAddresses).forEach(([key, address]) => {
            if (key === chainType && address != null) {
              addresses.push(address);
            }
          });
          const downloadPromises = addresses.map(async (address) => {
            await downloadActivePermitsService.downloadForAddress(address, true, async () => {
              try {
                const permits = await myWatcherDataService.getAdressPermits(allAddresses);
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
    };
    if (typeof window !== "undefined") {
      window.ProcessEventService = ProcessEventService2;
      globalThis.CreateProcessEventService = (eventSender) => {
        return new ProcessEventService2(eventSender);
      };
    }
  }
});

// dist/service/commonjs/src/lib/reward.data.service.js
var require_reward_data_service = __commonJS({
  "dist/service/commonjs/src/lib/reward.data.service.js"() {
    var RewardDataService2 = class extends DataService {
      db;
      chartService;
      eventSender;
      async getExistingData(transaction, address) {
        for (const input of transaction.inputs) {
          if (input.boxId && getChainType(input.address)) {
            const data = await this.getDataByBoxId(input.boxId, address);
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
        const inputsPromise = this.storageService.getData(rs_InputsStoreName);
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
      async addData(address, transactions) {
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
        await this.storageService.addData(rs_InputsStoreName, tempData);
        const inputs = await this.getSortedInputs();
        this.eventSender.sendEvent({
          type: "InputsChanged",
          data: inputs
        });
        this.eventSender.sendEvent({
          type: "AddressChartChanged",
          data: await this.chartService.getAddressCharts(inputs)
        });
      }
      // Get Data by BoxId from IndexedDB
      async getDataByBoxId(boxId, addressId) {
        return await this.storageService.getDataById(rs_InputsStoreName, [
          boxId,
          addressId
        ]);
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
    };
  }
});

// dist/service/commonjs/src/lib/rosen-db-worker.js
var require_rosen_db_worker = __commonJS({
  "dist/service/commonjs/src/lib/rosen-db-worker.js"() {
    self.addEventListener("message", async (event) => {
      const data = event.data;
      console.log(`Rosen service worker received event of type ${data.type}`);
    });
  }
});

// dist/service/commonjs/src/lib/rosen-download-worker.js
var require_rosen_download_worker = __commonJS({
  "dist/service/commonjs/src/lib/rosen-download-worker.js"() {
    var processEventServiceSingleton = (() => {
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
  }
});

// dist/service/commonjs/src/lib/services.js
Object.defineProperty(exports, "__esModule", { value: true });
require_data_service();
require_activepermits_data_service();
require_chain_performance_data_service();
require_chain_service();
require_chart_service();
require_constants();
require_data_service();
require_download_status_indexeddb_service();
require_i_db_databasestorage_service();
require_memory_storage_service();
require_mywatcher_data_service();
require_process_event_service();
require_reward_data_service();
require_rosen_db_worker();
require_rosen_download_worker();
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// dist/service/commonjs/src/exports/address.js
var require_address = __commonJS({
  "dist/service/commonjs/src/exports/address.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Address = void 0;
    var Address = class {
      address;
      Address;
      active = true;
      chainType;
      smallAddressForDisplay;
      largeAddressForDisplay;
      constructor(address, chainType, active = true) {
        this.address = address;
        this.Address = address;
        this.smallAddressForDisplay = address.substring(0, 6) + "...";
        this.largeAddressForDisplay = address.substring(0, 6) + "..." + address.substring(address.length - 6, address.length);
        this.chainType = chainType;
        this.active = active;
      }
    };
    exports2.Address = Address;
  }
});

// dist/service/commonjs/src/exports/asset.js
var require_asset = __commonJS({
  "dist/service/commonjs/src/exports/asset.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Asset = void 0;
    var Asset = class {
      amount;
      name;
      decimals;
      type;
      tokenId;
      constructor(amount, name, decimals, type, tokenId) {
        this.amount = amount;
        this.name = name;
        this.decimals = decimals;
        this.type = type;
        this.tokenId = tokenId;
      }
    };
    exports2.Asset = Asset;
  }
});

// dist/service/commonjs/src/exports/chainperf.chart.point.js
var require_chainperf_chart_point = __commonJS({
  "dist/service/commonjs/src/exports/chainperf.chart.point.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ChainPerfChartPoint = void 0;
    var ChainPerfChartPoint = class {
      x;
      y;
      constructor(x, y) {
        this.x = x;
        this.y = y;
      }
    };
    exports2.ChainPerfChartPoint = ChainPerfChartPoint;
  }
});

// dist/service/commonjs/src/exports/chart.dataset.js
var require_chart_dataset = __commonJS({
  "dist/service/commonjs/src/exports/chart.dataset.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ChainPerfChartDataSet = exports2.ChartDataSet = void 0;
    var ChartDataSet = class {
      label;
      data;
      backgroundColor;
      pointBackgroundColor;
      borderColor;
      borderWidth;
      borderSkipped;
      constructor(chartColor) {
        this.label = "";
        this.data = [];
        this.backgroundColor = chartColor;
        this.pointBackgroundColor = chartColor;
        this.borderColor = chartColor;
        this.borderWidth = 0;
        this.borderSkipped = false;
      }
    };
    exports2.ChartDataSet = ChartDataSet;
    var ChainPerfChartDataSet = class {
      label;
      data;
      backgroundColor;
      pointBackgroundColor;
      borderColor;
      borderWidth;
      borderSkipped;
      constructor(chartColor) {
        this.label = "";
        this.data = [];
        this.backgroundColor = chartColor;
        this.pointBackgroundColor = chartColor;
        this.borderColor = chartColor;
        this.borderWidth = 0;
        this.borderSkipped = false;
      }
    };
    exports2.ChainPerfChartDataSet = ChainPerfChartDataSet;
  }
});

// dist/service/commonjs/src/exports/chart.performance.js
var require_chart_performance = __commonJS({
  "dist/service/commonjs/src/exports/chart.performance.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ChainChartPerformance = exports2.ChartPerformance = void 0;
    var ChartPerformance = class {
      address;
      addressForDisplay;
      chart;
      chainType;
      color;
      constructor(address, addressForDisplay, chart, color, chainType) {
        this.address = address;
        this.addressForDisplay = addressForDisplay;
        this.chart = chart;
        this.chainType = chainType;
        this.color = color;
      }
    };
    exports2.ChartPerformance = ChartPerformance;
    var ChainChartPerformance = class {
      address;
      addressForDisplay;
      chart;
      chainType;
      color;
      constructor(address, addressForDisplay, chart, color, chainType) {
        this.address = address;
        this.addressForDisplay = addressForDisplay;
        this.chart = chart;
        this.chainType = chainType;
        this.color = color;
      }
    };
    exports2.ChainChartPerformance = ChainChartPerformance;
  }
});

// dist/service/commonjs/src/exports/chart.point.js
var require_chart_point = __commonJS({
  "dist/service/commonjs/src/exports/chart.point.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ChartPoint = void 0;
    var ChartPoint = class {
      x;
      y;
      constructor(x, y) {
        this.x = x;
        this.y = y;
      }
    };
    exports2.ChartPoint = ChartPoint;
  }
});

// dist/service/commonjs/src/exports/input.js
var require_input = __commonJS({
  "dist/service/commonjs/src/exports/input.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Input = void 0;
    var Input = class {
      outputAddress;
      inputDate;
      boxId;
      assets;
      outputCreatedAt;
      address;
      accumulatedAmount;
      amount;
      chainType;
      constructor(inputDate, address, outputCreatedAt, assets, outputAddress, boxId, accumulatedAmount, amount, chainType) {
        this.outputAddress = outputAddress;
        this.inputDate = inputDate;
        this.assets = assets;
        this.boxId = boxId;
        this.outputCreatedAt = outputCreatedAt;
        this.address = address;
        this.accumulatedAmount = accumulatedAmount;
        this.amount = amount;
        this.chainType = chainType;
      }
    };
    exports2.Input = Input;
  }
});

// dist/service/commonjs/src/exports/output.js
var require_output = __commonJS({
  "dist/service/commonjs/src/exports/output.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Output = void 0;
    var Output = class {
      outputAddress;
      outputDate;
      boxId;
      assets;
      constructor(boxId, outputDate, assets, outputAddress) {
        this.outputAddress = outputAddress;
        this.outputDate = outputDate;
        this.assets = assets;
        this.boxId = boxId;
      }
    };
    exports2.Output = Output;
  }
});

// dist/service/commonjs/src/exports/token.js
var require_token = __commonJS({
  "dist/service/commonjs/src/exports/token.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Token = void 0;
    var Token = class {
      tokenId;
      amount;
      decimals;
      name;
      tokenType;
      constructor(tokenId, amount, decimals, name, tokenType) {
        this.tokenId = tokenId;
        this.amount = amount;
        this.decimals = decimals;
        this.name = name;
        this.tokenType = tokenType;
      }
    };
    exports2.Token = Token;
  }
});

// dist/service/commonjs/src/exports/transaction.js
var require_transaction = __commonJS({
  "dist/service/commonjs/src/exports/transaction.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Transaction = void 0;
    var Transaction = class {
      timestamp;
      inputs;
      id;
      outputs;
      constructor(timestamp, inputs, id, outputs) {
        this.timestamp = timestamp;
        this.inputs = inputs;
        this.id = id;
        this.outputs = outputs;
      }
    };
    exports2.Transaction = Transaction;
  }
});

// dist/service/commonjs/src/exports/watcher.info.js
var require_watcher_info = __commonJS({
  "dist/service/commonjs/src/exports/watcher.info.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.MyWatchersStats = exports2.WatcherInfo = void 0;
    var WatcherInfo = class {
      tokens;
      constructor(tokens) {
        this.tokens = tokens;
      }
    };
    exports2.WatcherInfo = WatcherInfo;
    var MyWatchersStats = class {
      activePermitCount;
      permitCount;
      wid;
      chainType;
      address;
    };
    exports2.MyWatchersStats = MyWatchersStats;
  }
});

// dist/service/commonjs/src/exports/index.js
var require_exports = __commonJS({
  "dist/service/commonjs/src/exports/index.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p))
          __createBinding(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ErgSettings = void 0;
    exports2.getAllChainTypes = getAllChainTypes;
    exports2.getCurrencyValues = getCurrencyValues;
    exports2.getPermitAddressesByChainType = getPermitAddressesByChainType;
    exports2.getPermitBulkAddressesByChainType = getPermitBulkAddressesByChainType;
    exports2.getPermitTriggerAddressesByChainType = getPermitTriggerAddressesByChainType;
    exports2.getChainTypeTokensByChainType = getChainTypeTokensByChainType;
    exports2.getChainTypeWatcherIdentifiersByChainType = getChainTypeWatcherIdentifiersByChainType;
    exports2.getActivatedChainTypes = getActivatedChainTypes;
    exports2.getChainTypeForAddress = getChainTypeForAddress;
    exports2.getRewardAddressForChainType = getRewardAddressForChainType;
    exports2.createProcessEvtService = createProcessEvtService;
    exports2.GetDownloadService = GetDownloadService2;
    __exportStar(require_address(), exports2);
    __exportStar(require_asset(), exports2);
    __exportStar(require_chainperf_chart_point(), exports2);
    __exportStar(require_chart_dataset(), exports2);
    __exportStar(require_chart_performance(), exports2);
    __exportStar(require_chart_point(), exports2);
    __exportStar(require_input(), exports2);
    __exportStar(require_output(), exports2);
    __exportStar(require_token(), exports2);
    __exportStar(require_transaction(), exports2);
    __exportStar(require_watcher_info(), exports2);
    function getAllChainTypes() {
      return globalThis.getChainTypes();
    }
    function getCurrencyValues() {
      return globalThis.currencies;
    }
    function getPermitAddressesByChainType() {
      return globalThis.permitAddresses;
    }
    function getPermitBulkAddressesByChainType() {
      return globalThis.permitBulkAddresses;
    }
    function getPermitTriggerAddressesByChainType() {
      return globalThis.permitTriggerAddresses;
    }
    function getChainTypeTokensByChainType() {
      return globalThis.chainTypeTokens;
    }
    function getChainTypeWatcherIdentifiersByChainType() {
      return globalThis.chainTypeWatcherIdentifier;
    }
    function getActivatedChainTypes() {
      return globalThis.getActiveChainTypes();
    }
    function getChainTypeForAddress(address) {
      return globalThis.getChainType(address);
    }
    function getRewardAddressForChainType(chainType) {
      return globalThis.rewardAddresses[chainType];
    }
    function createProcessEvtService(eventSender) {
      return globalThis.CreateProcessEventService(eventSender);
    }
    var ErgSettings = class {
      static rs_ErgoExplorerHost() {
        return globalThis.rs_ErgoExplorerHost;
      }
      static rs_ErgoNodeHost() {
        return globalThis.rs_ErgoNodeHost;
      }
      static rs_dbName() {
        return globalThis.rs_DbName;
      }
      static rs_DbVersion() {
        return globalThis.rs_DbVersion;
      }
      static rs_InputsStoreName() {
        return globalThis.rs_InputsStoreName;
      }
      static rs_PerfTxStoreName() {
        return globalThis.rs_PerfTxStoreName;
      }
      static rs_PermitTxStoreName() {
        return globalThis.rs_PermitTxStoreName;
      }
      static rs_ActivePermitTxStoreName() {
        return globalThis.rs_ActivePermitTxStoreName;
      }
      static rs_DownloadStatusStoreName() {
        return globalThis.rs_DownloadStatusStoreName;
      }
      static rs_OpenBoxesStoreName() {
        return globalThis.rs_OpenBoxesStoreName;
      }
      static rs_AddressDataStoreName() {
        return globalThis.rs_AddressDataStoreName;
      }
      static rs_InitialNDownloads() {
        return globalThis.rs_InitialNDownloads;
      }
      static rs_FullDownloadsBatchSize() {
        return globalThis.rs_FullDownloadsBatchSize;
      }
      static rs_PerfInitialNDownloads() {
        return globalThis.rs_PerfInitialNDownloads;
      }
      static rs_PerfFullDownloadsBatchSize() {
        return globalThis.rs_PerfFullDownloadsBatchSize;
      }
      static rs_StartFrom() {
        return globalThis.rs_StartFrom;
      }
      static rs_Input_Key() {
        return globalThis.rs_Input_Key;
      }
      static rs_Permit_Key() {
        return globalThis.rs_Permit_Key;
      }
      static rs_ActivePermit_Key() {
        return globalThis.rs_ActivePermit_Key;
      }
      static rs_PerfTx_Key() {
        return globalThis.rs_PerfTx_Key;
      }
      static rs_Address_Key() {
        return globalThis.rs_Address_Key;
      }
      static rs_PermitCost() {
        return globalThis.rs_PermitCost;
      }
      static rs_WatcherCollateralRSN(chainType) {
        return globalThis.rs_WatcherCollateralRSN(chainType);
      }
      static rs_WatcherCollateralERG(chainType) {
        return globalThis.rs_WatcherCollateralERG(chainType);
      }
      static rs_RSNTokenId() {
        return globalThis.rs_RSNTokenId;
      }
      static rs_eRSNTokenId() {
        return globalThis.rs_eRSNTokenId;
      }
      static rs_TokenIdMap() {
        return globalThis.rs_TokenIdMap;
      }
      static rs_RSNDecimals() {
        return globalThis.rs_RSNDecimals;
      }
    };
    exports2.ErgSettings = ErgSettings;
    function GetDownloadService2() {
      return globalThis.CreateActivePermitsDownloadService(null);
    }
  }
});

// apps/server/watcherstats/src/main.ts
var import_service = __toESM(require_exports());
console.log("Hello World");
var downloadService = (0, import_service.GetDownloadService)();
downloadService.downloadForAddress(
  "9fTbZHMsuBeWYAWsw7Nr61zNSe4i2FLrREhJcFGRkKLmNYVFwqL",
  true
);
