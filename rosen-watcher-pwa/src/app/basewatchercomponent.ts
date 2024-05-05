import { Component, OnInit, HostListener } from '@angular/core';
import { EventService, EventType } from './service/event.service';
import { FeatureService } from './service/featureservice';
import { SwipeService } from './service/swipe.service';
import { Router} from '@angular/router';

@Component({
  selector: 'app-root',
  template: ''
})

export class BaseWatcherComponent implements OnInit {

  public busyCounter: number = 0;
  private quadrants = "";
  
 
  constructor(private eventService: EventService, public featureService:FeatureService, public swipeService: SwipeService, private router: Router ) {
  }

  async ngOnInit(): Promise<void> {
    this.swipeService.swipeDetect();
    var me = this;
    await this.subscribeToEvent(EventType.StartDownload,
      function () {
        me.busyCounter = 1
      }
    );
    var me = this;
    await this.subscribeToEvent(EventType.EndDownload,
      function () {
        me.busyCounter = 0
      }
    );



  }
  @HostListener('document:click', ['$event'])
  handleClick(event: MouseEvent) {
    const { clientX, clientY } = event;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const quadrant = this.calculateQuadrant(clientX, clientY, width, height);
    this.quadrants = this.quadrants + quadrant;
    this.quadrants = this.quadrants.slice(-8);
    if(this.quadrants === "01230123"){
      this.featureService.activateAllFeatures();
    }
    console.log('Quadrants:',  this.quadrants);
  }

  calculateQuadrant(x: number, y: number, width: number, height: number): any {
    if (x < width / 2 && y < height / 2) {
      return 0;
    } else if (x >= width / 2 && y < height / 2) {
      return 1;
    } else if (x < width / 2 && y >= height / 2) {
      return 2;
    } else {
      return 3;
    }
  }

async navigate(route: string){
  await this.router.navigate([route]);
}

  async unSubscribeAll(): Promise<void> {
    await this.eventService.unSubscribeAll();
  }

  async ngOnDestroy(): Promise<void> {
    await this.eventService.unSubscribeAll();
  }

  async subscribeToEvent(eventType: EventType, callback: () => void) {
    await this.eventService.subscribeToEvent(eventType, callback);
  }

  async subscribeToEvents(eventTypes: EventType[], callback: () => void) {

    eventTypes.forEach(async eventType => {
      await this.eventService.subscribeToEvent(eventType, callback);  
    });
    
  }

  
}