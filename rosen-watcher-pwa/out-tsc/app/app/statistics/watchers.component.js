import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { BaseWatcherComponent } from '../basewatchercomponent';
import { EMPTY } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChainType } from '../../models/chaintype';
import { AsyncPipe } from '@angular/common';
let WatchersComponent = class WatchersComponent extends BaseWatcherComponent {
    constructor(watchersDataService, eventService, swipeService) {
        super(eventService, swipeService);
        this.watchersDataService = watchersDataService;
        this.watcherCount = EMPTY;
        this.bitcoinWatcherCount = EMPTY;
        this.cardanoWatcherCount = EMPTY;
        this.ergoWatcherCount = EMPTY;
        this.bitcoinPermitCount = EMPTY;
        this.cardanoPermitCount = EMPTY;
        this.ergoPermitCount = EMPTY;
    }
    async ngOnInit() {
        super.ngOnInit();
        this.initSwipe('/statistics', '/performance');
        const watcherInfo$ = this.watchersDataService.getWatchersInfo();
        // Assign observables
        this.watcherCount = watcherInfo$.pipe(map((watcherInfo) => watcherInfo.tokens
            .filter((token) => token.name !== 'RSN')
            .reduce((sum, token) => sum + token.amount, 0)));
        this.cardanoWatcherCount = watcherInfo$.pipe(map((watcherInfo) => watcherInfo.tokens.find((token) => token.name === 'rspv2CardanoAWC')?.amount));
        this.bitcoinWatcherCount = watcherInfo$.pipe(map((watcherInfo) => watcherInfo.tokens.find((token) => token.name === 'rspv2BitcoinAWC')?.amount));
        this.ergoWatcherCount = watcherInfo$.pipe(map((watcherInfo) => watcherInfo.tokens.find((token) => token.name === 'rspv2ErgoAWC')?.amount));
        let permitsInfo$ = this.watchersDataService.getPermitsInfo(ChainType.Cardano);
        this.cardanoPermitCount = permitsInfo$.pipe(map((permitsInfo) => permitsInfo?.amount));
        permitsInfo$ = this.watchersDataService.getPermitsInfo(ChainType.Bitcoin);
        this.bitcoinPermitCount = permitsInfo$.pipe(map((permitsInfo) => permitsInfo?.amount));
        permitsInfo$ = this.watchersDataService.getPermitsInfo(ChainType.Ergo);
        this.ergoPermitCount = permitsInfo$.pipe(map((permitsInfo) => permitsInfo?.amount));
    }
};
WatchersComponent = __decorate([
    Component({
        selector: 'app-watchers',
        templateUrl: './watchers.html',
        standalone: true,
        imports: [AsyncPipe],
    })
], WatchersComponent);
export { WatchersComponent };
//# sourceMappingURL=watchers.component.js.map