import { Component, OnInit } from '@angular/core';
import { EventService } from '../service/event.service';
import { WatchersDataService } from '../service/watchers.data.service';
import { SwipeService } from '../service/swipe.service';
import { BaseWatcherComponent } from '../basewatchercomponent';
import { Observable, EMPTY } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChainType } from '../service/chain.service';
import { AsyncPipe } from '@angular/common';
import { Token } from '../models/token';

@Component({
  selector: 'app-watchers',
  templateUrl: './watchers.html',
  standalone: true,
  imports: [AsyncPipe],
})
export class WatchersComponent extends BaseWatcherComponent implements OnInit {
  watcherCount: Observable<number>;
  bitcoinWatcherCount: Observable<number | undefined>;
  cardanoWatcherCount: Observable<number | undefined>;
  ergoWatcherCount: Observable<number | undefined>;
  bitcoinPermitCount: Observable<number>;
  cardanoPermitCount: Observable<number>;
  ergoPermitCount: Observable<number>;

  constructor(
    private watchersDataService: WatchersDataService,
    eventService: EventService,
    swipeService: SwipeService,
  ) {
    super(eventService, swipeService);
    this.watcherCount = EMPTY;
    this.bitcoinWatcherCount = EMPTY;
    this.cardanoWatcherCount = EMPTY;
    this.ergoWatcherCount = EMPTY;
    this.bitcoinPermitCount = EMPTY;
    this.cardanoPermitCount = EMPTY;
    this.ergoPermitCount = EMPTY;
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

    let permitsInfo$ = this.watchersDataService.getPermitsInfo(ChainType.Cardano);

    this.cardanoPermitCount = permitsInfo$.pipe(map((permitsInfo) => permitsInfo.tokenData.amount));

    permitsInfo$ = this.watchersDataService.getPermitsInfo(ChainType.Bitcoin);
    this.bitcoinPermitCount = permitsInfo$.pipe(map((permitsInfo) => permitsInfo.tokenData.amount));

    permitsInfo$ = this.watchersDataService.getPermitsInfo(ChainType.Ergo);

    this.ergoPermitCount = permitsInfo$.pipe(map((permitsInfo) => permitsInfo.tokenData.amount));
  }
}
