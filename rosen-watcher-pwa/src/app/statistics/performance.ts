import { Component, OnInit } from '@angular/core';
import { EventService, EventType } from '../service/event.service';
import { StorageService } from '../service/storage.service';
import { DataService } from '../service/data.service';
import { FeatureService } from '../service/featureservice';
import { BaseWatcherComponent } from '../basewatchercomponent';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'performance',
  templateUrl: './performance.html'
})


export class Performance extends BaseWatcherComponent implements OnInit {

  data: string;
  performanceChart: any[];
  addresses: string[];
  noAddresses: boolean = false;
  showPermitsLink: boolean = false;

  constructor(private location: Location, private route: ActivatedRoute, private storageService: StorageService, private dataService: DataService, private featureService: FeatureService, eventService: EventService) {

    super(eventService);
    this.data = "";
    this.addresses = [];
    this.performanceChart = [];
  }

  async retrieveData(): Promise<void>  {
    
    this.performanceChart = await this.dataService.getPerformanceChart();

  }


  override async ngOnInit(): Promise<void> {
    super.ngOnInit();

    this.showPermitsLink = this.featureService.hasPermitScreen();

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
    });

    this.route.params.subscribe(async params => {
      await this.retrieveData();
     
    });


  }

  title = 'rosen-watcher-pwa';

}