import { Component, OnInit } from '@angular/core';
import { EventService } from '../service/event.service';
import { WatchersDataService } from '../service/watchers.data.service';
import { SwipeService } from '../service/swipe.service';
import { BaseWatcherComponent } from '../basewatchercomponent';
import { Observable, EMPTY, combineLatest, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChainType } from '../../service/ts/models/chaintype';
import { AsyncPipe } from '@angular/common';
import { Token } from '../../service/ts/models/token';
import { CommonModule } from '@angular/common'; // Import CommonModule

function createChainObservable<T>(): { [key in ChainType]: Observable<T | undefined> } {
  return Object.fromEntries(
    Object.values(ChainType).map((key) => [key, of(undefined)])
  ) as { [key in ChainType]: Observable<T | undefined> };
}
@Component({
  selector: 'app-watchers',
  templateUrl: './watchers.html',
  standalone: true,
  imports: [AsyncPipe, CommonModule],
})
export class WatchersComponent extends BaseWatcherComponent implements OnInit {
  watcherCount: Observable<number>;

  chainWatcherCount = createChainObservable<number>();
  chainPermitCount = createChainObservable<number>();
  chainLockedRSN = createChainObservable<number>();
  chainLockedERG = createChainObservable<number>();

  totalWatcherCount: Observable<number | undefined>;
  totalPermitCount: Observable<number | undefined>;
  totalLockedRSN: Observable<number | undefined>;
  totalLockedERG: Observable<number | undefined>;

  constructor(
    private watchersDataService: WatchersDataService,
    eventService: EventService,
    swipeService: SwipeService,
  ) {
    super(eventService, swipeService);
    this.watcherCount = EMPTY;
    this.totalWatcherCount = EMPTY;
    this.totalPermitCount = EMPTY;
    this.totalLockedRSN = EMPTY;
    this.totalLockedERG = EMPTY;
  }

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();

    this.initSwipe('/statistics', '/performance');

    const watcherInfo$ = this.watchersDataService.getWatchersInfo();

    // Assign observables
    this.watcherCount = watcherInfo$.pipe(
      map((watcherInfo) =>
        watcherInfo.tokens
          .filter((token: Token) => token.name !== 'RSN')
          .reduce((sum: number, token: Token) => sum + token.amount, 0),
      ),
    );

    Object.values(ChainType).forEach(c => {
      this.chainWatcherCount[c] = watcherInfo$.pipe(
        map(
          (watcherInfo) =>
            watcherInfo.tokens.find((token: Token) => token.name === 'rspv2' + c + 'AWC')?.amount,
        ),
      );

      this.chainPermitCount[c] = this.watchersDataService.getPermitsInfo(c).pipe(map((permitsInfo) => permitsInfo?.amount));

      this.chainLockedRSN[c] = combineLatest([this.chainPermitCount[c], this.chainWatcherCount[c]]).pipe(
        map(([p, w]) => (p ?? 0) * 3000 + (w ?? 0) * 30000),
      );

      this.chainLockedERG[c] = this.chainWatcherCount[c].pipe(
        map(w => (w ?? 0) * 800),
      );

    });

    this.totalWatcherCount = combineLatest(Object.values(this.chainWatcherCount)).pipe(map(([eth, btc, ada, erg]) => (eth ?? 0) + (btc ?? 0) + (ada ?? 0) + (erg ?? 0)));
    this.totalPermitCount = combineLatest(Object.values(this.chainPermitCount)).pipe(map(([eth, btc, ada, erg]) => (eth ?? 0) + (btc ?? 0) + (ada ?? 0) + (erg ?? 0)));
    this.totalLockedRSN = combineLatest(Object.values(this.chainLockedRSN)).pipe(map(([eth, btc, ada, erg]) => (eth ?? 0) + (btc ?? 0) + (ada ?? 0) + (erg ?? 0)));
    this.totalLockedERG = combineLatest(Object.values(this.chainLockedERG)).pipe(map(([eth, btc, ada, erg]) => (eth ?? 0) + (btc ?? 0) + (ada ?? 0) + (erg ?? 0)));
  }
}
