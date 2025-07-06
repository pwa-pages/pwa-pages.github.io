import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

import { Input } from '../../service/ts/models/input';
import { Address } from '../../service/ts/models/address';
import { EventService, EventType } from './event.service';
import { DateUtils } from '../statistics/date.utils';

export function initializeDataService(dataService: DataService) {
  return (): Promise<void> => {
    return dataService.initialize();
  };
}

@Injectable({
  providedIn: 'root',
})
export class DataService {
  public rsnInputs: Input[] = [];
  private addressCharts: Record<
    string,
    { chainType: ChainType | null; charts: Record<number, number> }
  > = {};
  private chainChart: Record<ChainType, { chart: number }> = {
    [ChainType.Bitcoin]: {
      chart: 0,
    },
    [ChainType.Cardano]: {
      chart: 0,
    },
    [ChainType.Ergo]: {
      chart: 0,
    },
    [ChainType.Ethereum]: {
      chart: 0,
    },
    [ChainType.Binance]: {
      chart: 0,
    },
    [ChainType.Doge]: {
      chart: 0,
    },
  };
  busyCounter = 0;

  constructor(
    private storageService: StorageService,

    private eventService: EventService,
  ) {}

  public async initialize() {
    this.eventService.subscribeToEvent(EventType.InputsChanged, async (i: Input[]) => {
      this.rsnInputs = i;
      this.eventService.sendEvent(EventType.RefreshInputs);
    });

    this.eventService.subscribeToEvent(
      EventType.PerfChartChanged,
      async (a: Record<string, { chainType: ChainType | null; chart: number }>) => {
        this.chainChart = a;
        this.eventService.sendEvent(EventType.RefreshInputs);
      },
    );

    this.eventService.subscribeToEvent(
      EventType.AddressChartChanged,
      async (
        a: Record<string, { chainType: ChainType | null; charts: Record<number, number> }>,
      ) => {
        this.addressCharts = a;
        this.eventService.sendEvent(EventType.RefreshInputs);
      },
    );
  }

  async getInputs(): Promise<Input[]> {
    return this.storageService.getInputs();
  }

  public getInputsPart(
    size: number | null,
    fromDate: Date | null,
    toDate: Date | null,
    addresses: Address[] | null,
  ): Input[] {
    let result = this.getSortedInputs(false, fromDate, toDate);

    if (result && addresses && addresses.length > 0) {
      const activeAddresses = addresses
        .filter((address) => address.active)
        .map((address) => address.address);

      result = result.filter((input) => activeAddresses.includes(input.outputAddress));
    }

    if (size) {
      result = result.slice(0, size);
    }

    return result;
  }

  getSortedInputs(ascending: boolean, fromDate: Date | null, toDate: Date | null): Input[] {
    this.rsnInputs.sort((a, b) => {
      const aTime = Math.round(a.inputDate.getTime() / 1000) * 1000;
      const bTime = Math.round(b.inputDate.getTime() / 1000) * 1000;

      if (aTime !== bTime) {
        return !ascending ? bTime - aTime : aTime - bTime;
      }

      return (b.amount ?? 0) - (a.amount ?? 0);
    });

    let result = this.rsnInputs;
    const stripTimeUTC = DateUtils.StripTimeUTC();
    const fromDateUTC = DateUtils.convertToUTCWithSameFields(fromDate);
    const toDateUTC = DateUtils.convertToUTCWithSameFields(toDate);

    result = result.filter((i) => {
      const inputDateStripped = stripTimeUTC(i.inputDate);
      return (
        (!fromDateUTC || inputDateStripped! >= fromDateUTC) &&
        (!toDateUTC || inputDateStripped! <= toDateUTC)
      );
    });
    return result;
  }

  getAddressCharts(): Record<
    string,
    { chainType: ChainType | null; charts: Record<number, number> }
  > {
    return this.addressCharts;
  }

  getChainChart(): Record<ChainType, { chart: number }> {
    return this.chainChart;
  }

  async getAddresses(): Promise<Address[]> {
    return await this.storageService.getAddressData();
  }

  getAddressesForDisplay(inputs: Input[]): Address[] {
    const addresses = this.getAddressesFromInputs(inputs);

    addresses.sort((a, b) => (a.chainType ?? '').localeCompare(b.chainType ?? ''));

    return addresses;
  }

  getAddressesFromInputs(inputs: Input[]): Address[] {
    const addresses: Address[] = [];

    const existingAddresses = new Set(addresses.map((a) => a.address));

    inputs.forEach((input: Input) => {
      if (!existingAddresses.has(input.outputAddress)) {
        const newAddress = new Address(input.outputAddress, input.chainType ?? null);
        addresses.push(newAddress);
        existingAddresses.add(input.outputAddress);
      }
    });

    return addresses;
  }
}
