import assert from 'node:assert/strict';
import test from 'node:test';
import { DownloadService } from '../src/lib/download.service.ts';
import { PriceService } from '../src/lib/price.service.ts';
import { WatchersDataService } from '../src/lib/watchers.data.service.ts';

for (const lastRequest of ['price', 'balance']) {
  test(`download waits for the last ${lastRequest} HTTP response`, async () => {
    const originalFetch = globalThis.fetch;
    const originalLog = console.log;
    const requests = [];
    const messages = [];
    const prices = {
      ergo: { eur: 1, usd: 2 },
      'rosen-bridge': { eur: 3, usd: 4 },
    };
    const eventSender = { sendEvent: async () => {} };
    const storage = {
      getDataById: async (_store, key) =>
        key.includes('coingecko') ? prices : { tokens: [] },
      addData: async () => {},
    };
    globalThis.fetch = (url) =>
      new Promise((resolve) => {
        requests.push({
          url,
          finish: () =>
            resolve({
              ok: true,
              json: async () =>
                url.includes('coingecko')
                  ? prices
                  : { tokens: [{ name: 'rspv3ErgoAWC', amount: 7 }] },
            }),
        });
      });
    console.log = (...args) => messages.push(args);

    try {
      const downloads = new DownloadService(eventSender, storage);
      const service = new WatchersDataService(
        downloads,
        new PriceService(downloads),
        eventSender,
      );
      const signal = await service.download();
      assert.equal(signal, service.watchersStatsSignal);
      await new Promise((resolve) => setImmediate(resolve));

      const priceRequests = requests.filter((request) =>
        request.url.includes('coingecko'),
      );
      const balanceRequests = requests.filter(
        (request) => !request.url.includes('coingecko'),
      );
      assert.equal(priceRequests.length, 1);
      assert.ok(balanceRequests.length > 1);
      const completionMessages = () =>
        messages.filter(
          ([message]) => message === 'Watcher stats HTTP calls have finished.',
        );
      assert.equal(completionMessages().length, 0);
      assert.equal(service.watchersStats.chainWatcherCount.Ergo, 0);

      balanceRequests.slice(0, -1).forEach((request) => request.finish());
      await new Promise((resolve) => setImmediate(resolve));
      assert.equal(completionMessages().length, 0);

      const first =
        lastRequest === 'price' ? balanceRequests.at(-1) : priceRequests[0];
      const last =
        lastRequest === 'price' ? priceRequests[0] : balanceRequests.at(-1);
      first.finish();
      await new Promise((resolve) => setImmediate(resolve));
      assert.equal(completionMessages().length, 0);

      last.finish();
      await new Promise((resolve) => setImmediate(resolve));
      assert.equal(completionMessages().length, 1);
      assert.equal(service.watchersStats.chainWatcherCount.Ergo, 7);
    } finally {
      globalThis.fetch = originalFetch;
      console.log = originalLog;
    }
  });
}
