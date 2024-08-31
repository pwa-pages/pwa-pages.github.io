import { Component, OnInit, HostListener } from '@angular/core';
import { EventService, EventType } from './service/event.service';
import { SwipeService } from './service/swipe.service';

@Component({
  selector: 'app-root',
  template: '',
})
export class BaseWatcherComponent implements OnInit {
  public busyCounter: number = 1;
  private quadrants = '';
  loaderLogs: string[] = [];
  private leftAction = '';
  private rightAction = '';

  constructor(
    public eventService: EventService,
    public swipeService: SwipeService,
  ) {}

  resetHeight(): void {
    document.body.style.height = window.innerHeight + 'px';
    document.documentElement.style.height = window.innerHeight + 'px';
  }

  initSwipe(left: string, right: string) {
    this.leftAction = left;
    this.rightAction = right;

    this.swipeService.swipeDetect(left, right);
  }

  swipeRight(): void {
    this.swipeService.swipe('right', this.rightAction);
  }

  swipeLeft(): void {
    this.swipeService.swipe('left', this.leftAction);
  }

  async ngOnInit(): Promise<void> {
    this.eventService.sendEvent(EventType.SwipeActivated);

    var me = this;
    await this.subscribeToEvent(EventType.StartFullDownload, function () {
      me.busyCounter = 1;
    });
    var me = this;
    await this.subscribeToEvent(EventType.EndFullDownload, function () {
      me.busyCounter = 0;
    });

    window.addEventListener('resize', this.resetHeight);

    this.resetHeight();

    await this.subscribeToEvent(EventType.StartDownload, async function (url) {
      me.loaderLogs.push('Downloading ' + me.getScreenLogurl(url));
      me.loaderLogs = me.loaderLogs.slice(-5);
    });

    await this.subscribeToEvent(EventType.EndFullDownload, async function () {
      me.loaderLogs = [];
    });
  }


  private getScreenLogurl(url: string): string {
    return url.substring(0, 10) + ' ... ' + url.slice(-40);
  }

  async ngOnDestroy(): Promise<void> {
    this.eventService.sendEvent(EventType.SwipeDeActivated);
    await this.eventService.unSubscribeAll([
      EventType.EndFullDownload,
      EventType.StartFullDownload,
      EventType.InputsStoredToDb,
    ]);
  }

  async subscribeToEvent(eventType: EventType, callback: (...args: any[]) => void) {
    await this.eventService.subscribeToEvent(eventType, callback);
  }

  async subscribeToEvents(eventTypes: EventType[], callback: () => void) {
    eventTypes.forEach(async (eventType) => {
      await this.eventService.subscribeToEvent(eventType, callback);
    });
  }
}
