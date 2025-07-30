import { Component, OnInit, OnDestroy, Injector } from '@angular/core';
import { EventData, EventService, EventType } from './service/event.service';
import { ActivatedRoute, Params } from '@angular/router';
import { ChainService } from './service/chain.service';
import { Address } from '../service/ts/models/address';
import { StorageService } from './service/storage.service';
import { ChainDataService } from './service/chain.data.service';
import { BrowserService } from './service/browser.service';

@Component({
  selector: 'app-root',
  template: '',
})
export class BaseWatcherComponent implements OnInit, OnDestroy {
  public busyCounter = 1;
  loaderLogs: string[] = [];
  profile: string | null = null;
  addresses: Address[] = [];
  noAddresses = false;
  protected eventService: EventService;
  protected chainService: ChainService;
  protected storageService: StorageService;
  protected dataService: ChainDataService;
  protected browserService: BrowserService;
  protected route: ActivatedRoute | undefined;

  constructor(protected injector: Injector) {
    this.eventService = this.injector.get(EventService);
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

  async ngOnDestroy(): Promise<void> {
    this.eventService.sendEvent(EventType.SwipeDeActivated);
    await this.eventService.unSubscribeAll([EventType.RefreshInputs]);
  }

  public async checkProfileParams(params: Params): Promise<void> {
    if (params['profile']) {
      const profileParam = params['profile'];
      this.profile = profileParam;
      console.log(profileParam);

      this.storageService.initIndexedDB(profileParam);
    }
  }

  protected SetupRoute() {
    this.route?.queryParams.subscribe(async (params) => {
      await this.checkProfileParams(params);
      await this.checkAddressParams(params);
    });
  }

  public async checkAddressParams(params: Params): Promise<boolean> {
    if (params['addresses'] || Object.keys(params).some((key) => key.startsWith('address'))) {
      const addressesParam = params['addresses'];
      console.log(addressesParam);

      this.addresses = [];

      if (addressesParam != null) {
        this.addresses = JSON.parse(decodeURIComponent(addressesParam));
      }

      const individualAddresses = Object.keys(params)
        .filter((key) => key.startsWith('address') && !key.startsWith('addresses'))
        .map((key) => new Address(params[key], this.chainService.getChainType(params[key])))
        .filter((addr) => addr !== undefined && addr !== null);

      individualAddresses.forEach((i) => this.addresses.push(i));

      this.browserService.replacePath();

      await this.storageService.putAddressData(this.addresses);

      await this.storageService.clearInputsStore();
      if (this.addresses.length == 0) {
        this.noAddresses = true;
      }

      return true;
    } else {
      this.addresses = await this.dataService.getAddresses();
      if (this.addresses.length == 0) {
        this.noAddresses = true;
      }
      return false;
    }
  }

  async subscribeToEvent<T>(eventType: EventType, callback: (...args: T[]) => void) {
    const eventCallBack: (...args: EventData[]) => void = callback as (
      ...args: EventData[]
    ) => void;
    await this.eventService.subscribeToEvent(eventType, eventCallBack);
  }

  async subscribeToEvents(eventTypes: EventType[], callback: () => void) {
    eventTypes.forEach(async (eventType) => {
      await this.eventService.subscribeToEvent(eventType, callback);
    });
  }
}
