import { Component, OnDestroy, Injector } from '@angular/core';
import { EventData, EventService, EventType } from './service/event.service';

@Component({
  selector: 'app-root',
  template: '',
})
export class BaseEventAwareComponent implements OnDestroy {
  protected eventService: EventService;

  constructor(protected injector: Injector) {
    this.eventService = this.injector.get(EventService);
    this.componentId = BaseEventAwareComponent.componentCounter;
    BaseEventAwareComponent.componentCounter++;
  }
  private static componentCounter = 0;
  public readonly componentId: number;

  async subscribeToEvent<T>(
    eventType: EventType,
    callback: (...args: T[]) => void,
  ) {
    const eventCallBack: (...args: EventData[]) => void = callback as (
      ...args: EventData[]
    ) => void;
    await this.eventService.subscribeToEvent(
      eventType,
      eventCallBack,
      this.componentId,
    );
  }

  async subscribeToEvents(eventTypes: EventType[], callback: () => void) {
    eventTypes.forEach(async (eventType) => {
      await this.eventService.subscribeToEvent(
        eventType,
        callback,
        this.componentId,
      );
    });
  }

  async ngOnDestroy(): Promise<void> {
    console.log(
      `BaseEventAwareComponent with ID ${this.componentId} is being destroyed.`,
    );
    this.eventService.sendEvent(EventType.SwipeDeActivated);
    await this.eventService.unSubscribe(this.componentId);
  }
}
