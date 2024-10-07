import { Component, OnInit, OnDestroy } from '@angular/core';
import { EventData, EventService, EventType } from './service/event.service';
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

    await this.subscribeToEvent(EventType.StartFullDownload, () => {
      this.busyCounter = 1;
    });

    await this.subscribeToEvent(EventType.EndFullDownload, () => {
      this.busyCounter = 0;
    });

    window.addEventListener('resize', this.resetHeight);

    this.resetHeight();
  }

  async ngOnDestroy(): Promise<void> {
    this.eventService.sendEvent(EventType.SwipeDeActivated);
    await this.eventService.unSubscribeAll([
      EventType.EndFullDownload,
      EventType.StartFullDownload,
      EventType.InputsStoredToDb,
    ]);
  }

  async subscribeToEvent<T>(eventType: EventType, callback: (...args: T[]) => void) {
    var eventCallBack:  (...args: EventData[]) => void = callback as (...args: EventData[]) => void;
    await this.eventService.subscribeToEvent(eventType, eventCallBack);
  }

  async subscribeToEvents(eventTypes: EventType[], callback: () => void) {
    eventTypes.forEach(async (eventType) => {
      await this.eventService.subscribeToEvent(eventType, callback);
    });
  }
}
