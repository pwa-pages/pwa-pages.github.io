import { Component, OnInit, OnDestroy } from '@angular/core';
import { EventData, EventService, EventType } from './service/event.service';
import { Params } from '@angular/router';
import { ChainService } from './service/chain.service';
import { Location } from '@angular/common';
import { Address } from '../service/ts/models/address';
import { StorageService } from './service/storage.service';
import { DataService } from './service/data.service';

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

  constructor(
    public eventService: EventService,
    private chainService: ChainService,
    public storageService: StorageService,
    public dataService: DataService,
    private location: Location,
  ) {}

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

      const currentPath = this.location.path();

      if (currentPath.includes('?')) {
        const parts = currentPath.split('?');
        const newPath = parts[0];
        this.location.replaceState(newPath);
      }

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
