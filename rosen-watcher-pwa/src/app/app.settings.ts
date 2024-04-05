import { Component, OnInit } from '@angular/core';
import { DownloadService } from './download.service';
import { StorageService } from './storage.service';
import { DataService } from './data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './app.settings.html',
  styleUrl: './app.settings.css'
})

export class AppSettings implements OnInit {
  addresses: string[];


  constructor(private router: Router, private dataService: DataService) {

    this.addresses = [
    
    ];
  
  }

  trackByFn(index:any, item:any) {
    return index;  
  }
  
  addaddress(): void {
    this.addresses.push('');
  }

  deleteaddress(index : number): void {
    this.addresses.splice(index, 1);
  }

  save() : void{
    this.router.navigate(['main', { addresses: JSON.stringify(this.addresses) }]);
  }


  ngOnInit(): void {

    this.dataService.getAddresses().then(
      r => {this.addresses = r; }
      );

  }



  title = 'settings';
}