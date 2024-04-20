import { Component, OnInit, HostListener } from '@angular/core';
import { EventService, EventType } from './service/event.service';


@Component({
  selector: 'app-root',
  template: ''
})

export class BaseWatcherComponent implements OnInit {

  public busyCounter: number = 0;
  constructor(private eventService: EventService) {
  }

  ngOnInit(): void {
    var me = this;
    this.subscribeToEvent(EventType.StartDownload,
      function () {
        me.busyCounter = 1
      }
    );
    var me = this;
    this.subscribeToEvent(EventType.EndDownload,
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
    console.log('Quadrant:', quadrant);
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


  ngOnDestroy(): void {
    this.eventService.unSubscribeAll();
  }

  async subscribeToEvent(eventType: EventType, callback: () => void) {
    this.eventService.subscribeToEvent(eventType, callback);
  }

  
}