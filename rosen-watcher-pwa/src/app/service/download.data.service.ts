import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { DownloadService } from './download.service';

import { EventService, EventType } from './event.service';
import { catchError, firstValueFrom } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class DownloadDataService {
  readonly initialNDownloads: number = 50;
  readonly fullDownloadsBatchSize: number = 200;
  busyCounter = 0;

  constructor(
    private storageService: StorageService,
    private downloadService: DownloadService,
    private eventService: EventService<string>,
    private snackBar: MatSnackBar,
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

  private async downloadAllForAddress(address: string, offset: number) {
    this.IncreaseBusyCounter();
    console.log(this.busyCounter);
    const s = this.downloadService.downloadTransactions(
      address,
      offset,
      this.fullDownloadsBatchSize + 10,
    );

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

  public async downloadForAddress(
    address: string,
    storageService: StorageService,
    hasAddressParams: boolean,
  ) {
    this.IncreaseBusyCounter();
    console.log(this.busyCounter);

    const s = this.downloadService.downloadTransactions(address, 0, this.initialNDownloads);
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
    const boxId = await storageService.getDataByBoxId(halfBoxId, address);

    console.log('add bunch of data');
    await storageService.addData(address, result.transactions);

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
