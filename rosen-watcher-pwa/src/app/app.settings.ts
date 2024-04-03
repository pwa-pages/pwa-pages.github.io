import { Component, OnInit } from '@angular/core';
import { DownloadService } from './download.service';
import { StorageService } from './storage.service';
import { DataService } from './data.service';

@Component({
  selector: 'app-settings',
  templateUrl: './app.settings.html',
  styleUrl: './app.settings.css'
})

export class AppSettings implements OnInit {
  
  constructor(private downloadService: DownloadService, private storageService: StorageService, private dataService: DataService) {

  
  }
  
  ngOnInit(): void {

  

  }

  title = 'settings';
}