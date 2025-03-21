import { Injectable } from "@angular/core";
import { StorageService } from "./storage.service";

import { Input } from "../../service/ts/models/input";
import { Address } from "../../service/ts/models/address";
import { EventService, EventType } from "./event.service";

export function initializeDataService(dataService: DataService) {
  return (): Promise<void> => {
    return dataService.initialize();
  };
}

@Injectable({
  providedIn: "root",
})
export class DataService {
  private rsnInputs: Input[] = [];
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
  };
  busyCounter = 0;

  constructor(
    private storageService: StorageService,

    private eventService: EventService,
  ) {}

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
        a: Record<string, { chainType: ChainType | null; chart: number }>,
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
          { chainType: ChainType | null; charts: Record<number, number> }
        >,
      ) => {
        this.addressCharts = a;
        this.eventService.sendEvent(EventType.RefreshInputs);
      },
    );
  }

  async getInputs(): Promise<Input[]> {
    return this.storageService.getInputs();
  }

  getSortedInputs(): Input[] {
    return this.rsnInputs;
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

  async getAddressesForDisplay(inputs: Input[]): Promise<Address[]> {
    const addresses = this.getAddressesFromInputs(inputs);

    return addresses.then((addresses) => {
      const result: Address[] = [];
      addresses.forEach((a: Address) => {
        result.push({
          address: a.address.substring(0, 6) + "...",
          Address: a.address.substring(0, 6) + "...",
          chainType: a.chainType,
        });
      });

      result.sort((a, b) =>
        (a.chainType != null ? a.chainType : "").localeCompare(
          b.chainType != null ? b.chainType : "",
        ),
      );

      return result;
    });
  }

  async getAddressesFromInputs(inputs: Input[]): Promise<Address[]> {
    const addresses: Address[] = [];

    try {
      inputs.forEach((input: Input) => {
        if (
          !addresses.some((address) => address.address == input.outputAddress)
        ) {
          addresses.push({
            address: input.outputAddress,
            Address: input.outputAddress,
            chainType: input.chainType ?? null,
          });
        }
      });

      return await new Promise<Address[]>((resolve) => {
        resolve(addresses);
      });
    } catch (error) {
      console.error(error);
      return addresses;
    }
  }
}
