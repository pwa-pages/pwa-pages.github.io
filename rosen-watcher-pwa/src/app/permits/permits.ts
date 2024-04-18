import { Component, OnInit } from '@angular/core';
import { DataService } from '../service/data.service';
import { StorageService } from '../service/storage.service';
import { Router } from '@angular/router';
import { DownloadService } from '../service/download.service';

@Component({
  selector: 'permits',
  templateUrl: './permits.html'
})

export class Permits implements OnInit {
  addresses: any[];


  constructor(private router: Router, private dataService: DataService, private downloadService: DownloadService) {

    this.addresses = [

    ];
  }

  async getAddressesAndPermits(): Promise<void> {
    this.addresses =  await this.dataService.getAddressData();

    this.addresses.forEach(async address => {
      var url = address.watcherUrl
      var result = await this.downloadService.downloadPermitInfo(url);
      
      address.permitLocks = Math.floor(result.permitCount.active / result.permitsPerEvent) + ' / ' + Math.floor(result.permitCount.total / result.permitsPerEvent);
      address.network = result.network;


    });
  }
  
  async ngOnInit(): Promise<void> {
    await this.getAddressesAndPermits();
  }

  title = 'settings';
}