import { Component, OnInit } from '@angular/core';
import { EventService } from '../service/event.service';
import { WatchersDataService } from '../service/watchers.data.service';
import { FeatureService } from '../service/featureservice';
import { SwipeService } from '../service/swipe.service';
import { BaseWatcherComponent } from '../basewatchercomponent';

import { Router } from '@angular/router';

@Component({
  selector: 'watchers',
  templateUrl: './watchers.html',
})
export class Watchers extends BaseWatcherComponent implements OnInit {
  watcherCount: number;
  bitcoinWatcherCount: number;
  cardanoWatcherCount: number;
  ergoWatcherCount: number;
  bitcoinPermitCount: number;
  cardanoPermitCount: number;
  ergoPermitCount: number;

  constructor(
    private watchersDataService: WatchersDataService,
    featureService: FeatureService,
    eventService: EventService,
    swipeService: SwipeService,
  ) {
    super(eventService, featureService, swipeService);
    this.watcherCount = 0;
    this.bitcoinWatcherCount = 0;
    this.cardanoWatcherCount = 0;
    this.ergoWatcherCount = 0;
    this.bitcoinPermitCount = 0;
    this.cardanoPermitCount = 0;
    this.ergoPermitCount = 0;
  }

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();

    this.initSwipe('/statistics', '/performance');

    var watcherInfo = await this.watchersDataService.getWatchersInfo();
    var permitsInfo = await this.watchersDataService.getPermitssInfo();

    this.watcherCount = watcherInfo.tokens
      .filter((token: any) => token.name !== 'RSN')
      .reduce((sum: any, token: any) => sum + token.amount, 0);
    this.cardanoWatcherCount = watcherInfo.tokens.find(
      (token: any) => token.name === 'rspv2CardanoAWC',
    ).amount;
    this.bitcoinWatcherCount = watcherInfo.tokens.find(
      (token: any) => token.name === 'rspv2BitcoinAWC',
    ).amount;
    this.ergoWatcherCount = watcherInfo.tokens.find(
      (token: any) => token.name === 'rspv2ErgoAWC',
    ).amount;
    this.cardanoPermitCount = permitsInfo.cardanoTokenData.amount;
    this.bitcoinPermitCount = permitsInfo.bitcoinTokenData.amount;
    this.ergoPermitCount = permitsInfo.ergoTokenData.amount;
  }
}
