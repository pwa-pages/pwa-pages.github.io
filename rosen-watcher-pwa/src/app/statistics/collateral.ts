import { Component, OnInit } from '@angular/core';
import { EventService } from '../service/event.service';
import { DataService } from '../service/data.service';
import { FeatureService } from '../service/featureservice';
import { SwipeService } from '../service/swipe.service';
import { BaseWatcherComponent } from '../basewatchercomponent';

import { Router } from '@angular/router';

@Component({
  selector: 'collateral',
  templateUrl: './collateral.html'
})


export class Collateral extends BaseWatcherComponent implements OnInit {


  constructor(router: Router, private dataService: DataService, featureService: FeatureService, eventService: EventService, swipeService: SwipeService) {

    super(eventService, featureService, swipeService);

  }

  swipeRight(): void {
    var me = this;
    this.swipeService.swipe('right', '/performance');
  }
  


  override async ngOnInit(): Promise<void> {
    super.ngOnInit();

    var me = this;
    this.swipeService.swipeDetect('/statistics', '/performance');

  }


}
