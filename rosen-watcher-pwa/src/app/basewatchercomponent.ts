import { Component, OnInit, OnDestroy } from '@angular/core';
import { EventService, EventType } from './service/event.service';
import { SwipeService } from './service/swipe.service';

@Component({
  selector: 'app-root',
  template: '',
})
export class BaseWatcherComponent implements OnInit, OnDestroy {
  public busyCounter = 1;
  loaderLogs: string[] = [];
  private leftAction = '';
  private rightAction = '';

  constructor(
    public eventService: EventService<string>,
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

    await this.subscribeToEvent(EventType.StartFullDownload, () => {
      this.busyCounter = 1;
    });

    await this.subscribeToEvent(EventType.EndFullDownload, () => {
      this.busyCounter = 0;
    });

    window.addEventListener('resize', this.resetHeight);

    this.resetHeight();

    await this.subscribeToEvent(EventType.StartDownload, (url) => {
      this.loaderLogs.push('Downloading ' + this.getScreenLogurl(url));
      this.loaderLogs = this.loaderLogs.slice(-5);
    });

    await this.subscribeToEvent(EventType.EndFullDownload, () => {
      this.loaderLogs = [];
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

  async subscribeToEvent(eventType: EventType, callback: (...args: string[]) => void) {
    await this.eventService.subscribeToEvent(eventType, callback);
  }

  async subscribeToEvents(eventTypes: EventType[], callback: () => void) {
    eventTypes.forEach(async (eventType) => {
      await this.eventService.subscribeToEvent(eventType, callback);
    });
  }
}
