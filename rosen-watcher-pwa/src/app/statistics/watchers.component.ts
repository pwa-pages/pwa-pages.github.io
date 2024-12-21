import { Component, OnInit } from '@angular/core';
import { EventService, EventType } from '../service/event.service';
import { WatchersDataService } from '../service/watchers.data.service';
import { BaseWatcherComponent } from '../basewatchercomponent';
import { map } from 'rxjs/operators';
import { ChainType } from '../../service/ts/models/chaintype';
import { Token } from '../../service/ts/models/token';
import { CommonModule } from '@angular/common';
import { NavigationService } from '../service/navigation.service';

function createChainNumber(): Record<ChainType, number | undefined> {
  return Object.fromEntries(Object.values(ChainType).map((key) => [key, undefined])) as Record<
    ChainType,
    number | undefined
  >;
}

@Component({
  selector: 'app-watchers',
  templateUrl: './watchers.html',
  standalone: true,
  imports: [CommonModule],
})
export class WatchersComponent extends BaseWatcherComponent implements OnInit {
  chainWatcherCount = createChainNumber();
  chainPermitCount = createChainNumber();
  chainLockedRSN = createChainNumber();
  chainLockedERG = createChainNumber();

  totalWatcherCount: number | undefined;
  totalPermitCount: number | undefined;
  totalLockedRSN: number | undefined;
  totalLockedERG: number | undefined;

  constructor(
    private watchersDataService: WatchersDataService,
    eventService: EventService,
    navigationService: NavigationService,
  ) {
    super(eventService, navigationService);
  }

  setLockedAmounts(chainType: ChainType): void {
    this.chainLockedRSN[chainType] =
      (this.chainPermitCount[chainType] ?? 0) * 3000 +
      (this.chainWatcherCount[chainType] ?? 0) * 30000;
    this.chainLockedERG[chainType] = (this.chainWatcherCount[chainType] ?? 0) * 800;
    this.totalWatcherCount = Object.values(this.chainWatcherCount).reduce(
      (accumulator: number | undefined, currentValue: number | undefined) =>
        (accumulator ?? 0) + (currentValue ?? 0),
      0,
    );
    this.totalPermitCount = Object.values(this.chainPermitCount).reduce(
      (accumulator: number | undefined, currentValue: number | undefined) =>
        (accumulator ?? 0) + (currentValue ?? 0),
      0,
    );
    this.totalLockedRSN = Object.values(this.chainLockedRSN).reduce(
      (accumulator: number | undefined, currentValue: number | undefined) =>
        (accumulator ?? 0) + (currentValue ?? 0),
      0,
    );
    this.totalLockedERG = Object.values(this.chainLockedERG).reduce(
      (accumulator: number | undefined, currentValue: number | undefined) =>
        (accumulator ?? 0) + (currentValue ?? 0),
      0,
    );
  }

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();
    const watcherInfo$ = this.watchersDataService.getWatchersInfo();

    Object.values(ChainType).forEach((c) => {
      watcherInfo$
        .pipe(
          map(
            (watcherInfo) =>
              watcherInfo.tokens.find((token: Token) => token.name === 'rspv2' + c + 'AWC')?.amount,
          ),
        )
        .subscribe((amount) => {
          this.chainWatcherCount[c] = amount;
          this.setLockedAmounts(c);
        });

      this.watchersDataService
        .getPermitsInfo(c)
        .pipe(map((permitsInfo) => permitsInfo?.amount))
        .subscribe((amount) => {
          this.chainPermitCount[c] = amount;
          this.setLockedAmounts(c);
        });
    });

    this.eventService.sendEvent(EventType.WatchersScreenLoaded);
  }
}
