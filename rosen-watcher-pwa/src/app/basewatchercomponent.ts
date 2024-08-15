import { Component, OnInit, HostListener } from '@angular/core';
import { EventService, EventType } from './service/event.service';
import { FeatureService } from './service/featureservice';
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
    public featureService: FeatureService,
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

  @HostListener('document:click', ['$event'])
  handleClick(event: MouseEvent) {
    const { clientX, clientY } = event;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const quadrant = this.calculateQuadrant(clientX, clientY, width, height);
    this.quadrants = this.quadrants + quadrant;
    this.quadrants = this.quadrants.slice(-8);
    if (this.quadrants === '01230123') {
      this.featureService.activateAllFeatures();
    }
    console.log('Quadrants:', this.quadrants);
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
