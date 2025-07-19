import { Component, Inject, Input } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { IS_ELEMENTS_ACTIVE } from '../service/tokens';
import { CommonModule } from '@angular/common';
import { WatchersComponent } from './watchers.component';
import { ChainPerformanceComponent } from './chain.performance.component';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-rosen-component',
  templateUrl: './rosen.component.html',
  standalone: true,
  imports: [NgFor, NgIf, CommonModule, WatchersComponent, ChainPerformanceComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class RosenComponent {
  private _renderHtml = true;
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

  constructor(@Inject(IS_ELEMENTS_ACTIVE) public isElementsActive: boolean) {}
}
