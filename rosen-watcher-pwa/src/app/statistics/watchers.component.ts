import { Component, OnInit } from '@angular/core';
import { EventService, EventType } from '../service/event.service';
import { WatchersDataService } from '../service/watchers.data.service';
import { BaseWatcherComponent } from '../basewatchercomponent';
import { DataService } from '../service/data.service';
import { map } from 'rxjs/operators';
import { ChainType } from '../../service/ts/models/chaintype';
import { Token } from '../../service/ts/models/token';
import { Location, CommonModule } from '@angular/common';
import { StorageService } from '../service/storage.service';
import { NavigationService } from '../service/navigation.service';
import { ChainService } from '../service/chain.service';
import { FormsModule } from '@angular/forms';
import { PriceService } from '../service/price.service';

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
  imports: [CommonModule, FormsModule],
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
  totalLockedRSNConverted: number | undefined;
  totalLockedERGConverted: number | undefined;
  totalLocked: number | undefined;
  watcherValue: number | undefined;
  permitValue: number | undefined;
  rsnCollateralValue: number | undefined;
  ergCollateralValue: number | undefined;
  selectedCurrency: Currency | null = null;

  constructor(
    private watchersDataService: WatchersDataService,
    eventService: EventService,
    private priceService: PriceService,
    navigationService: NavigationService,
    chainService: ChainService,
    storageService: StorageService,
    dataService: DataService,
    location: Location,
  ) {
    super(eventService, navigationService, chainService, storageService, dataService, location);
  }

  onCurrencyChange(): void {
    localStorage.setItem('selectedCurrency', this.selectedCurrency as string);
    this.currencyUpdate();
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
    this.currencyUpdate();

  }

  currencyUpdate() {
    this.watcherValue = 0;
    this.permitValue = 0;

    this.priceService.convert(30000, "RSN", this.selectedCurrency ?? "").subscribe(c => {
      this.rsnCollateralValue = c
      this.watcherValue = (this.rsnCollateralValue ?? 0) + (this.ergCollateralValue ?? 0);
    });

    this.priceService.convert(3000, "RSN", this.selectedCurrency ?? "").subscribe(c => {
      this.permitValue = c
    });

    this.priceService.convert(800, "ERG", this.selectedCurrency ?? "").subscribe(c => {
      this.ergCollateralValue = c;
      this.watcherValue = (this.rsnCollateralValue ?? 0) + (this.ergCollateralValue ?? 0);
    });


    this.priceService.convert(this.totalLockedERG ?? 0, "ERG", this.selectedCurrency ?? "").subscribe(l => {
      this.totalLockedERGConverted = l;
      this.totalLocked = (this.totalLockedERGConverted ?? 0) + (this.totalLockedRSNConverted ?? 0);
    });
    this.priceService.convert((this.totalLockedRSN ?? 0) + (3000 * (this.totalPermitCount ?? 0) ), "RSN", this.selectedCurrency ?? "").subscribe(l => {
      this.totalLockedRSNConverted = l;
      this.totalLocked = (this.totalLockedERGConverted ?? 0) + (this.totalLockedRSNConverted ?? 0);
    });
  }

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();

    this.selectedCurrency = localStorage.getItem('selectedCurrency') as Currency;
    this.selectedCurrency = this.selectedCurrency == null ? Currency.EUR : this.selectedCurrency;
    this.currencyUpdate();



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
