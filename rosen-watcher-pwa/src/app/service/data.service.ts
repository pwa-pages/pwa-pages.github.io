import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { ChainService } from './chain.service';
import { Input } from '../../service/ts/models/input';
import { Address } from '../../service/ts/models/address';
import { Asset } from '../../service/ts/models/asset';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  readonly initialNDownloads: number = 50;
  readonly fullDownloadsBatchSize: number = 200;
  busyCounter = 0;

  constructor(
    private storageService: StorageService,
    private chainService: ChainService,
  ) {}

  async getWatcherInputs(): Promise<Input[]> {
    const inputsPromise = this.storageService.getInputs();

    try {
      const inputs = await inputsPromise;

      const result_1 = inputs
        .filter((i: Input) => this.chainService.getChainType(i.address) != null)
        .sort((a, b) => b.outputCreatedAt - a.outputCreatedAt);

      result_1.forEach((input: Input) => {
        input.assets = input.assets
          .filter((asset: Asset) => asset.name === 'RSN' || asset.name === 'eRSN')
          .map((asset_1: Asset) => {
            return asset_1;
          });
      });

      return await new Promise<Input[]>((resolve) => {
        resolve(result_1);
      });
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async getInputs(): Promise<Input[]> {
    return this.storageService.getInputs();
  }

  async getTotalRewards(inputs: Input[]): Promise<string> {
    try {
      const sum: number = inputs.reduce((accumulator, o) => {
        let assetAmount = 0;

        o.assets.forEach((asset: Asset) => {
          assetAmount += asset.amount / Math.pow(10, asset.decimals);
        });

        return accumulator + assetAmount;
      }, 0);

      return await new Promise<string>((resolve) => {
        resolve(sum.toFixed(3));
      });
    } catch (error) {
      console.error(error);
      return '';
    }
  }

  async getSortedInputs(): Promise<Input[]> {
    const inputsPromise = this.getWatcherInputs();
    let amount = 0;
    const sortedInputs: Input[] = [];
    console.log('start retrieving chart from database');
    try {
      const inputs = await inputsPromise;

      inputs.sort((a, b) => a.inputDate.getTime() - b.inputDate.getTime());

      inputs.forEach((input: Input) => {
        input.assets.forEach((asset: Asset) => {
          amount += asset.amount;
          sortedInputs.push(
            new Input(
              input.inputDate,
              input.address,
              input.outputCreatedAt,
              input.assets,
              input.outputAddress,
              input.boxId,
              amount,
              asset.amount / Math.pow(10, asset.decimals),
              this.chainService.getChainType(input.address),
            ),
          );
        });
      });
      console.log('done retrieving chart from database ' + inputs.length + ' inputs');
      return await new Promise<Input[]>((resolve) => {
        resolve(sortedInputs);
      });
    } catch (error) {
      console.error(error);
      return sortedInputs;
    }
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
          address: a.address.substring(0, 6) + '...',
          chainType: a.chainType,
        });
      });

      result.sort((a, b) =>
        (a.chainType != null ? a.chainType : '').localeCompare(
          b.chainType != null ? b.chainType : '',
        ),
      );

      return result;
    });
  }

  async getAddressesFromInputs(inputs: Input[]): Promise<Address[]> {
    const addresses: Address[] = [];

    try {
      inputs.forEach((input: Input) => {
        if (!addresses.some((address) => address.address == input.outputAddress)) {
          addresses.push({
            address: input.outputAddress,
            chainType: this.chainService.getChainType(input.address),
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
