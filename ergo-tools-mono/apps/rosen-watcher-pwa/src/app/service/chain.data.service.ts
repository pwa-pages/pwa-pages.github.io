import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

import { Input } from '@ergo-tools/service';
import { Address } from '@ergo-tools/service';
import { EventService, EventType } from './event.service';
import { DateUtils } from '../statistics/date.utils';
import { ChainTypeHelper } from '../imports/imports';

export function initializeDataService(dataService: ChainDataService) {
  return (): Promise<void> => {
    return dataService.initialize();
  };
}

@Injectable({
  providedIn: 'root',
})
export class ChainDataService {
  public rsnInputs: Input[] = [];
  private addressCharts: Record<
    string,
    { chainType: string | null; charts: Record<number, number> }
  > = {};
  private chainChart: Record<string, { chart: number }> =
    ChainTypeHelper.getAllChainTypes().reduce(
      (acc, chainType) => {
        acc[chainType] = { chart: 0 };
        return acc;
      },
      {} as Record<string, { chart: number }>,
    );
  busyCounter = 0;

  constructor(
    private storageService: StorageService,
    private eventService: EventService,
  ) { }

  public async initialize() {
    this.eventService.subscribeToEvent(
      EventType.InputsChanged,
      async (i: Input[]) => {
        this.rsnInputs = i;

        this.eventService.sendEvent(EventType.RefreshInputs);
      },
    );

    this.eventService.subscribeToEvent(
      EventType.PerfChartChanged,
      async (
        a: Record<string, { chainType: string | null; chart: number }>,
      ) => {
        this.chainChart = a;
        this.eventService.sendEvent(EventType.RefreshInputs);
      },
    );

    this.eventService.subscribeToEvent(
      EventType.AddressChartChanged,
      async (
        a: Record<
          string,
          { chainType: string | null; charts: Record<number, number> }
        >,
      ) => {
        this.addressCharts = Object.keys(a).reduce(
          (acc, key) => {
            acc[key] = a[key];
            return acc;
          },
          {} as Record<
            string,
            { chainType: string | null; charts: Record<number, number> }
          >,
        );
        this.eventService.sendEvent(EventType.RefreshInputs);
      },
    );
  }

  async getInputs(): Promise<Input[]> {
    return this.storageService.getInputs();
  }

  async getAddresses(): Promise<string[]> {
    return (await this.storageService.getAddressData()).map((a) => a.address);
  }

  public getInputsPart(
    size: number | null,
    fromDate: Date | null,
    toDate: Date | null,
    addresses: Address[] | null,
  ): Input[] {
    const addressStrings: string[] = addresses
      ? addresses.map((a) => a.address)
      : [];
    let result = this.getSortedInputs(false, addressStrings, fromDate, toDate);

    if (result && addresses && addresses.length > 0) {
      const activeAddresses = addresses
        .filter((address) => address.active)
        .map((address) => address.address);

      result = result.filter((input) =>
        activeAddresses.includes(input.outputAddress),
      );
    }

    if (size) {
      result = result.slice(0, size);
    }

    return result;
  }

  getSortedInputs(
    ascending: boolean,
    addresses: string[],
    fromDate: Date | null,
    toDate: Date | null,
  ): Input[] {
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

    result = result.filter((input) => addresses.includes(input.outputAddress));
    return result;
  }

  getAddressCharts(): Record<
    string,
    { chainType: string | null; charts: Record<number, number> }
  > {
    return this.addressCharts;
  }

  getChainChart(): Record<string, { chart: number }> {
    const activeChainTypes = ChainTypeHelper.getActiveChainTypes() as string[];
    const result = {} as Record<string, { chart: number }>;
    for (const ct of activeChainTypes) {
      if (this.chainChart[ct]) {
        result[ct] = this.chainChart[ct];
      }
    }
    return result;
  }

  async getFullAddresses(): Promise<Address[]> {
    return this.storageService.getAddressData();
  }

  getAddressesForDisplay(inputs: Input[]): Address[] {
    const addresses = this.getAddressesFromInputs(inputs);

    addresses.sort((a, b) =>
      (a.chainType ?? '').localeCompare(b.chainType ?? ''),
    );

    return addresses;
  }

  getAddressesFromInputs(inputs: Input[]): Address[] {
    const addresses: Address[] = [];

    const existingAddresses = new Set(addresses.map((a) => a.address));

    inputs.forEach((input: Input) => {
      if (!existingAddresses.has(input.outputAddress)) {
        const newAddress = new Address(
          input.outputAddress,
          input.chainType ?? null,
        );
        addresses.push(newAddress);
        existingAddresses.add(input.outputAddress);
      }
    });

    return addresses;
  }
}
