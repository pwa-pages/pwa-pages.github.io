import {
  Component,
  EventEmitter,
  Inject,
  Injector,
  Input,
  OnInit,
  Output,
  ChangeDetectionStrategy
} from '@angular/core';
import { EventType } from '../service/event.service';

import { BaseWatcherComponent } from '../basewatchercomponent';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IS_ELEMENTS_ACTIVE } from '../service/tokens';
import { NavigationService } from '../service/navigation.service';
import { WatchersStats } from '../service/watchers.models';
import { ChainTypeHelper } from '../imports/imports';
import { WatchersPerformanceDataService } from '../service/watchers.performance.data.service';
import { WatcherPerformanceAddressStat } from '@ergo-tools/service';

@Component({
  selector: 'app-watchers-performance',
  templateUrl: './watchers.performance.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CommonModule, FormsModule],
})
export class WatchersPerformanceComponent extends BaseWatcherComponent implements OnInit {
  private _renderHtml = true;
  public chains: string[] = ChainTypeHelper.getActiveChainTypes();
  watcherPerformanceStats: WatcherPerformanceAddressStat[] = [];

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

  @Output() notifyWatchersStatsChanged = new EventEmitter<WatchersStats>();


  selectedChain = '';

  constructor(
    injector: Injector,
    private watchersPerformanceDataService: WatchersPerformanceDataService,
    private navigationService: NavigationService,
    @Inject(IS_ELEMENTS_ACTIVE) public isElementsActive: boolean,
  ) {
    super(injector);


  }

  async onChainChange(): Promise<void> {
    localStorage.setItem('selectedChain', this.selectedChain as string);
    await this.retrieveWatcherPerformanceStats(this.selectedChain); 
    
  }

  getChainTypes(): string[] {
    return ChainTypeHelper.getActiveChainTypes();
  }

  isChainTypeActive(chainType: string): boolean {
    return ChainTypeHelper.isChainTypeActive(chainType);
  }

  selectTab(item: string): void {
    this.navigationService.navigate(`/${item}`);
  }

  async retrieveWatcherPerformanceStats(chainType: string): Promise<void> {
    this.watcherPerformanceStats = await this.watchersPerformanceDataService.getWatchersPerformanceStats(chainType);
  }

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();


    this.selectedChain = localStorage.getItem(
      'selectedChain',
    ) as string;
    this.selectedChain =
      this.selectedChain == null ? 'Ergo' : this.selectedChain;
    this.watchersPerformanceDataService.getWatchersPerformanceStats;
    this.eventService.sendEvent(EventType.WatchersScreenLoaded);

    await this.retrieveWatcherPerformanceStats(this.selectedChain); 
  }
}
