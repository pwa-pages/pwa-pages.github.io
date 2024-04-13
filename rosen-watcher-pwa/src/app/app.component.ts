import { Component, OnInit } from '@angular/core';
import { DownloadService } from './service/download.service';
import { StorageService } from './service/storage.service';
import { DataService } from './service/data.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent implements OnInit {

  constructor(private downloadService: DownloadService, private storageService: StorageService, private dataService: DataService) {
  }

  ngOnInit(): void {
  }

  title = 'rosen-watcher-pwa';
}