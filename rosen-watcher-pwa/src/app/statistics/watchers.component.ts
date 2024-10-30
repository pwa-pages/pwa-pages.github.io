import { Component, OnInit } from '@angular/core';
import { EventService } from '../service/event.service';
import { WatchersDataService } from '../service/watchers.data.service';
import { SwipeService } from '../service/swipe.service';
import { BaseWatcherComponent } from '../basewatchercomponent';
import { Observable, EMPTY } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChainType } from '../../service/ts/models/chaintype';
import { AsyncPipe } from '@angular/common';
import { Token } from '../../service/ts/models/token';
import { CommonModule } from '@angular/common'; // Import CommonModule

@Component({
  selector: 'app-watchers',
  templateUrl: './watchers.html',
  standalone: true,
  imports: [AsyncPipe, CommonModule]
})
export class WatchersComponent extends BaseWatcherComponent implements OnInit {
  watcherCount: Observable<number>;
  bitcoinWatcherCount: Observable<number | undefined>;
  cardanoWatcherCount: Observable<number | undefined>;
  ergoWatcherCount: Observable<number | undefined>;
  ethereumWatcherCount: Observable<number | undefined>;
  bitcoinPermitCount: Observable<number | undefined>;
  cardanoPermitCount: Observable<number | undefined>;
  ergoPermitCount: Observable<number | undefined>;
  ethereumPermitCount: Observable<number | undefined>;

  bitcoinLockedRSN: Observable<number | undefined>;
  bitcoinLockedERG: Observable<number | undefined>;
  cardanoLockedRSN: Observable<number | undefined>;
  cardanoLockedERG: Observable<number | undefined>;
  ergoLockedRSN: Observable<number | undefined>;
  ergoLockedERG: Observable<number | undefined>;
  ethereumLockedRSN: Observable<number | undefined>;
  ethereumLockedERG: Observable<number | undefined>;

  constructor(
    private watchersDataService: WatchersDataService,
    eventService: EventService,
    swipeService: SwipeService,
  ) {
    super(eventService, swipeService);
    this.watcherCount = EMPTY;
    this.bitcoinWatcherCount = EMPTY;
    this.cardanoWatcherCount = EMPTY;
    this.ethereumWatcherCount = EMPTY;
    this.ergoWatcherCount = EMPTY;
    this.bitcoinPermitCount = EMPTY;
    this.cardanoPermitCount = EMPTY;
    this.ergoPermitCount = EMPTY;
    this.ethereumPermitCount = EMPTY;

    this.bitcoinLockedRSN = EMPTY;
    this.bitcoinLockedERG = EMPTY;
    this.cardanoLockedRSN = EMPTY;
    this.cardanoLockedERG = EMPTY;
    this.ergoLockedRSN = EMPTY;
    this.ergoLockedERG = EMPTY;
    this.ethereumLockedRSN = EMPTY;
    this.ethereumLockedERG = EMPTY;
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

    this.cardanoWatcherCount = watcherInfo$.pipe(
      map(
        (watcherInfo) =>
          watcherInfo.tokens.find((token: Token) => token.name === 'rspv2CardanoAWC')?.amount,
      ),
    );

    this.bitcoinWatcherCount = watcherInfo$.pipe(
      map(
        (watcherInfo) =>
          watcherInfo.tokens.find((token: Token) => token.name === 'rspv2BitcoinAWC')?.amount,
      ),
    );

    this.ergoWatcherCount = watcherInfo$.pipe(
      map(
        (watcherInfo) =>
          watcherInfo.tokens.find((token: Token) => token.name === 'rspv2ErgoAWC')?.amount,
      ),
    );

    this.ethereumWatcherCount = watcherInfo$.pipe(
      map(
        (watcherInfo) =>
          watcherInfo.tokens.find((token: Token) => token.name === 'rspv2EthereumAWC')?.amount,
      ),
    );

    let permitsInfo$ = this.watchersDataService.getPermitsInfo(ChainType.Cardano);

    this.cardanoPermitCount = permitsInfo$.pipe(map((permitsInfo) => permitsInfo?.amount));

    permitsInfo$ = this.watchersDataService.getPermitsInfo(ChainType.Bitcoin);
    this.bitcoinPermitCount = permitsInfo$.pipe(map((permitsInfo) => permitsInfo?.amount));

    permitsInfo$ = this.watchersDataService.getPermitsInfo(ChainType.Ergo);

    this.ergoPermitCount = permitsInfo$.pipe(map((permitsInfo) => permitsInfo?.amount));

    permitsInfo$ = this.watchersDataService.getPermitsInfo(ChainType.Ethereum);

    this.ethereumPermitCount = permitsInfo$.pipe(map((permitsInfo) => permitsInfo?.amount));
    

    

    this.bitcoinLockedRSN = this.bitcoinWatcherCount.pipe(map((w) => (w ?? 0) * 30000));
    this.bitcoinLockedERG = this.bitcoinWatcherCount.pipe(map((w) => (w ?? 0) * 800));
    this.cardanoLockedRSN = this.cardanoWatcherCount.pipe(map((w) => (w ?? 0) * 30000));
    this.cardanoLockedERG = this.cardanoWatcherCount.pipe(map((w) => (w ?? 0) * 800));
    this.ergoLockedRSN = this.ergoWatcherCount.pipe(map((w) => (w ?? 0) * 30000));
    this.ergoLockedERG = this.ergoWatcherCount.pipe(map((w) => (w ?? 0) * 800));
    this.ethereumLockedRSN = this.ethereumWatcherCount.pipe(map((w) => (w ?? 0) * 30000));
    this.ethereumLockedERG = this.ethereumWatcherCount.pipe(map((w) => (w ?? 0) * 800));
  }
}
