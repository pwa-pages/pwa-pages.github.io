import { Component, OnInit, Injector } from '@angular/core';
import { EventData, EventType } from './service/event.service';
import { ActivatedRoute, Params } from '@angular/router';
import { ChainService } from './service/chain.service';
import { Address } from '@ergo-tools/service';
import { StorageService } from './service/storage.service';
import { ChainDataService } from './service/chain.data.service';
import { BrowserService } from './service/browser.service';
import { BaseEventAwareComponent } from './baseeventawarecomponent';

@Component({
  selector: 'app-root',
  template: '',
})
export class BaseWatcherComponent
  extends BaseEventAwareComponent
  implements OnInit
{
  public busyCounter = 1;
  loaderLogs: string[] = [];
  addresses: Address[] = [];
  noAddresses = false;
  protected chainService: ChainService;
  protected storageService: StorageService;
  protected dataService: ChainDataService;
  protected browserService: BrowserService;
  protected route: ActivatedRoute | undefined;

  constructor(protected override injector: Injector) {
    super(injector);

    this.chainService = this.injector.get(ChainService);
    this.storageService = this.injector.get(StorageService);
    this.dataService = this.injector.get(ChainDataService);
    this.browserService = this.injector.get(BrowserService);
    try {
      this.route = this.injector.get(ActivatedRoute);
    } catch {
      this.route = undefined;
    }
  }

  resetHeight(): void {
    document.body.style.height = window.innerHeight + 'px';
    document.documentElement.style.height = window.innerHeight + 'px';
  }

  async ngOnInit(): Promise<void> {
    this.eventService.sendEvent(EventType.SwipeActivated);

    window.addEventListener('resize', this.resetHeight);

    this.resetHeight();
  }

  protected SetupRoute() {
    this.route?.queryParams.subscribe(async (params) => {
      await this.checkAddressParams(params);
    });
  }

  public async checkAddressParams(params: Params): Promise<boolean> {
    if (
      params['addresses'] ||
      Object.keys(params).some((key) => key.startsWith('address'))
    ) {
      const addressesParam = params['addresses'];
      console.log(addressesParam);

      this.addresses = [];

      if (addressesParam != null) {
        this.addresses = JSON.parse(decodeURIComponent(addressesParam));
      }

      const individualAddresses = Object.keys(params)
        .filter(
          (key) => key.startsWith('address') && !key.startsWith('addresses'),
        )
        .map(
          (key) =>
            new Address(
              params[key],
              this.chainService.getChainType(params[key]),
            ),
        )
        .filter((addr) => addr !== undefined && addr !== null);

      individualAddresses.forEach((i) => this.addresses.push(i));

      this.browserService.replacePath();

      await this.storageService.putAddressData(this.addresses);

      await this.storageService.clearInputsStore();
      if (this.addresses.length == 0) {
        this.noAddresses = true;
      }
      await this.eventService.sendEventWithData(
        EventType.StatisticsScreenLoaded,
        null as unknown as EventData,
      );
      return true;
    } else {
      this.addresses = await this.dataService.getFullAddresses();
      if (this.addresses.length == 0) {
        this.noAddresses = true;
      }
      await this.eventService.sendEvent(EventType.StatisticsScreenLoaded);
      return false;
    }
  }
}
