import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { HttpClient } from '@angular/common/http';
import { EventService, EventType } from './event.service';
import { catchError, throwError, firstValueFrom, map, Observable } from 'rxjs';
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
    private snackBar: MatSnackBar,
    private http: HttpClient,
  ) {}

  private IncreaseBusyCounter(): void {
    if (this.busyCounter == 0) {
      this.eventService.sendEvent(EventType.StartFullDownload);
    }
    this.busyCounter++;
  }

  private DecreasBusyCounter(): void {
    this.busyCounter--;
    if (this.busyCounter == 0) {
      this.eventService.sendEvent(EventType.EndFullDownload);
    }
  }

  downloadTransactions(
    address: string,
    offset = 0,
    limit = 500,
  ): Observable<{ transactions: Transaction[]; total: number }> {
    const url = `https://api.ergoplatform.com/api/v1/addresses/${address}/transactions?offset=${offset}&limit=${limit}`;

    console.log('Downloading from: ' + url);

    this.eventService.sendEventWithData(EventType.StartDownload, url);

    return this.http.get<TransactionResponse>(url).pipe(
      map((response: TransactionResponse) => {
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
      }),
      catchError((error) => {
        let errorMessage = '';
        if (error.error instanceof ErrorEvent) {
          errorMessage = `An error occurred: ${error.error.message}`;
        } else {
          errorMessage = `Server returned code: ${error.status}, error message is: ${error.message}`;
        }

        console.error(errorMessage);

        return throwError(() => new Error(errorMessage));
      }),
    );
  }

  private async downloadAllForAddress(address: string, offset: number) {
    this.IncreaseBusyCounter();
    console.log(this.busyCounter);
    const s = this.downloadTransactions(address, offset, this.fullDownloadsBatchSize + 10);

    const result = await firstValueFrom(
      s.pipe(
        catchError((e) => {
          this.DecreasBusyCounter();
          throw e;
        }),
      ),
    );

    console.log(
      'Processing all download(offset = ' +
        offset +
        ', size = ' +
        this.fullDownloadsBatchSize +
        ') for: ' +
        address,
    );

    if (!result.transactions || result.transactions.length == 0) {
      this.DecreasBusyCounter();
      console.log(this.busyCounter);
      return;
    }

    if (offset > 100000) {
      this.DecreasBusyCounter();
      console.log(this.busyCounter);
      console.log('this gets out of hand');
      return;
    }

    await this.storageService.addData(address, result.transactions);

    await this.downloadAllForAddress(address, offset + this.fullDownloadsBatchSize);
    this.DecreasBusyCounter();
    console.log(this.busyCounter);
  }
  public async downloadForAddresses(hasAddressParams: boolean) {
    const addresses = await this.storageService.getAddressData();

    addresses.forEach(async (address) => {
      await this.downloadForAddress(address.address, hasAddressParams);
    });
  }

  public async downloadForAddress(address: string, hasAddressParams: boolean) {
    this.IncreaseBusyCounter();
    console.log(this.busyCounter);

    const s = this.downloadTransactions(address, 0, this.initialNDownloads);
    const result = await firstValueFrom(
      s.pipe(
        catchError((e) => {
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

          this.DecreasBusyCounter();
          throw e;
        }),
      ),
    );

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
    }
    if (!boxId && itemsz >= this.initialNDownloads) {
      console.log("Downloading all tx's for : " + address);

      await this.downloadAllForAddress(address, 0);
    }

    this.DecreasBusyCounter();
    console.log(this.busyCounter);
  }
}
