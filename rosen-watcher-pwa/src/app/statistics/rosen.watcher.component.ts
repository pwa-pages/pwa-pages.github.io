import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';

import { IS_ELEMENTS_ACTIVE } from '../service/tokens';

import { WatchersComponent } from './watchers.component';
import { ChainPerformanceComponent } from './chain.performance.component';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { WatchersStats } from '../service/watchers.data.service';
import { EventService, EventType } from '../service/event.service';

/* eslint-disable @angular-eslint/component-selector */
@Component({
  selector: 'rosen-watcher-component',
  templateUrl: './rosen.watcher.component.html',
  standalone: true,
  imports: [WatchersComponent, ChainPerformanceComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class RosenWatcherComponent {
  private _renderHtml = true;

  @Output() notifyWatchersStatsChanged = new EventEmitter<WatchersStats>();

  @Input()
  set renderHtml(value: string | boolean) {
    this._renderHtml = value === false || value === 'false' ? false : true;
  }

  get renderHtml(): boolean {
    return this._renderHtml;
  }

  isHtmlRenderEnabled(): boolean {
    return this._renderHtml;
  }

  private _component = 'watchers';
  @Input()
  set component(value: string) {
    this._component = value;
  }
  public appWatchersActive(): boolean {
    return this._component === 'watchers';
  }

  public appChainPerformanceActive(): boolean {
    return this._component === 'chain-performance';
  }

  constructor(
    @Inject(IS_ELEMENTS_ACTIVE) public isElementsActive: boolean,
    private eventService: EventService,
  ) {
    this.eventService.subscribeToEvent(EventType.WatchersStatsChanged, (data: WatchersStats) => {
      console.log(
        'Received watchers stats changed event, sending through notifyWatchersStatsChanged',
      );
      this.notifyWatchersStatsChanged.emit(data);
    });
  }
}
