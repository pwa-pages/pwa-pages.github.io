import assert from 'node:assert/strict';
import test from 'node:test';
import { firstValueFrom, lastValueFrom, Subject } from 'rxjs';
import { PriceService } from '../src/lib/price.service.ts';

const prices = (eur) => ({
  ergo: { eur, usd: eur * 2 },
  'rosen-bridge': { eur: eur * 3, usd: eur * 4 },
});

test('shares a refresh and uses its result for one minute after completion', async () => {
  const originalNow = Date.now;
  let now = 1_000;
  Date.now = () => now;
  const requests = [];
  const service = new PriceService({
    downloadStream: () => {
      const request = new Subject();
      requests.push(request);
      return request;
    },
  });

  try {
    const conversion = service.convert(2, 'ERG', 'EUR');
    const first = [];
    const second = [];
    conversion.subscribe((value) => first.push(value));
    service.convert(1, 'RSN', 'USD').subscribe((value) => second.push(value));
    assert.equal(requests.length, 1);

    requests[0].next(prices(1));
    requests[0].next(prices(2));
    now = 5_000;
    requests[0].complete();
    assert.deepEqual(first, [2, 4]);
    assert.deepEqual(second, [4, 8]);

    now = 64_999;
    assert.equal(await lastValueFrom(conversion), 4);
    assert.equal(requests.length, 1);

    now = 65_000;
    const refreshed = lastValueFrom(conversion);
    assert.equal(requests.length, 2);
    requests[1].next(prices(3));
    requests[1].complete();
    assert.equal(await refreshed, 6);
  } finally {
    Date.now = originalNow;
  }
});

test('a cached emission does not prevent completion or hide a failed refresh', async () => {
  const requests = [];
  const service = new PriceService({
    downloadStream: () => {
      const request = new Subject();
      requests.push(request);
      return request;
    },
  });
  const conversion = service.convert(1, 'ERG', 'EUR');

  const cached = firstValueFrom(conversion);
  requests[0].next(prices(1));
  assert.equal(await cached, 1);

  const waiting = lastValueFrom(conversion);
  assert.equal(requests.length, 1);
  const failure = new Error('refresh failed');
  requests[0].error(failure);
  await assert.rejects(waiting, failure);

  const retry = lastValueFrom(conversion);
  assert.equal(requests.length, 2);
  requests[1].next(prices(2));
  requests[1].complete();
  assert.equal(await retry, 2);
});
