
import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { EventService, EventType } from './event.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Transaction } from '../models/transaction';

interface TransactionResponse {
  items: Transaction[];
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class DownloadDataService {
  readonly initialNDownloads: number = 50;
  readonly fullDownloadsBatchSize: number = 200;
  readonly startFrom: Date = new Date('2024-01-01');
  busyCounter = 0;

  constructor(
    private storageService: StorageService,
    private eventService: EventService<string>,
    private snackBar: MatSnackBar
  ) {}

  private IncreaseBusyCounter(): void {
    if (this.busyCounter === 0) {
      this.eventService.sendEvent(EventType.StartFullDownload);
    }
    this.busyCounter++;
  }

  private DecreasBusyCounter(): void {
    this.busyCounter--;
    if (this.busyCounter === 0) {
      this.eventService.sendEvent(EventType.EndFullDownload);
    }
  }

  private async fetchTransactions(url: string): Promise<TransactionResponse> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Server returned code: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`An error occurred: ${error}`);
      throw error;
    }
  }

  private async downloadTransactions(
    address: string,
    offset = 0,
    limit = 500
  ): Promise<{ transactions: Transaction[]; total: number }> {
    const url = `https://api.ergoplatform.com/api/v1/addresses/${address}/transactions?offset=${offset}&limit=${limit}`;

    console.log('Downloading from: ' + url);

    this.eventService.sendEventWithData(EventType.StartDownload, url);

    const response = await this.fetchTransactions(url);
    const result = {
      transactions: response.items,
      total: response.total,
    };

    for (const item of response.items) {
      const inputDate = new Date(item.timestamp);
      if (inputDate < this.startFrom) {
        this.eventService.sendEventWithData(EventType.EndDownload, url);
        return result; // Return if a transaction is found before the startFrom date
      }
    }

    this.eventService.sendEventWithData(EventType.EndDownload, url);
    return result;
  }

  private async downloadAllForAddress(address: string, offset: number) {
    this.IncreaseBusyCounter();
    console.log(this.busyCounter);

    try {
      const result = await this.downloadTransactions(address, offset, this.fullDownloadsBatchSize + 10);

      console.log(
        'Processing all download(offset = ' +
        offset +
        ', size = ' +
        this.fullDownloadsBatchSize +
        ') for: ' +
        address,
      );

      if (!result.transactions || result.transactions.length === 0) {
        
        console.log(this.busyCounter);
        return;
      }

      if (offset > 100000) {

        console.log(this.busyCounter);
        console.log('this gets out of hand');
        return;
      }

      await this.storageService.addData(address, result.transactions);
      await this.downloadAllForAddress(address, offset + this.fullDownloadsBatchSize);
    } catch (e) {
      console.error(e);
    } finally {
      this.DecreasBusyCounter();
      console.log(this.busyCounter);
    }
  }

  public async downloadForAddresses(hasAddressParams: boolean) {
    try {
      const addresses = await this.storageService.getAddressData();

      // Create parallel download promises for each address
      const downloadPromises = addresses.map(async (address) => {
        await this.downloadForAddress(address.address, hasAddressParams);
      });

      // Wait for all downloads to complete
      await Promise.all(downloadPromises);
    } catch (e) {
      console.error('Error downloading for addresses:', e);
    }
  }

  public async downloadForAddress(address: string, hasAddressParams: boolean) {
    this.IncreaseBusyCounter();
    console.log(this.busyCounter);

    try {
      const result = await this.downloadTransactions(address, 0, this.initialNDownloads);

      console.log(
        'Processing initial download(size = ' + this.initialNDownloads + ') for: ' + address,
      );

      const itemsz = result.transactions.length;
      let halfBoxId = '';

      if (itemsz > this.initialNDownloads / 2) {
        for (let i = Math.floor(itemsz / 2); i < itemsz; i++) {
          const item = result.transactions[i];

          for (const input of item.inputs) {
            if (input.boxId && halfBoxId === '') {
              halfBoxId = input.boxId;
            }
          }
        }
      }
      const boxId = await this.storageService.getDataByBoxId(halfBoxId, address);

      console.log('add bunch of data');
      await this.storageService.addData(address, result.transactions);

      if (boxId) {
        console.log(
          'Found existing boxId in db for download for: ' + address + ',no need to download more.',
        );
      } else if (itemsz >= this.initialNDownloads) {
        console.log("Downloading all tx's for : " + address);
        await this.downloadAllForAddress(address, 0);
      }
    } catch (e) {
      if (hasAddressParams) {
        this.snackBar.open(
          'Some download(s) failed, check your addresses, not all of them might be correct, or service may have issues',
          'Close',
          {
            duration: 5000,
            panelClass: ['custom-snackbar'],
          },
        );
      }
      console.error(e);
    } finally {
      this.DecreasBusyCounter();
      console.log(this.busyCounter);
    }
  }
}
