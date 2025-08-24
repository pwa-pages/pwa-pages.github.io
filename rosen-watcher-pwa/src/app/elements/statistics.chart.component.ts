import { Component, OnInit, Input as AngularInput, OnChanges, Injector } from '@angular/core';
import { EventType } from '../service/event.service';
import 'chartjs-adapter-date-fns';
import { Input } from '../../service/ts/models/input';
import { DateUtils } from '../statistics/date.utils';
import { RewardChartComponent } from '../statistics/reward.chart.component';
import { ChainDataService } from '../service/chain.data.service';
import { BaseEventAwareComponent } from '../baseeventawarecomponent';

@Component({
  selector: 'app-statistics-chart',
  templateUrl: './statistics.chart.html',
  standalone: true,
  imports: [RewardChartComponent],
})
export class StatisticsChartComponent extends BaseEventAwareComponent implements OnInit, OnChanges {
  DateUtils = DateUtils;
  sortedInputs: Input[];
  detailInputs: Input[];
  @AngularInput() period?: Period;
  previousPeriod?: Period;
  @AngularInput() chartTitle?: string;
  chartFullTitle?: string;
  downloadInProgress: Record<string, boolean> = {};
  @AngularInput()
  filledAddresses: string[] = [];
  prevFilledAddresses: string[] = [];
  @AngularInput()
  chartColor?: string;
  @AngularInput()
  accentChartColor?: string;

  amounts: DateNumberPoint[] = [];

  constructor(
    protected override injector: Injector,
    private dataService: ChainDataService,
  ) {
    super(injector);
    this.sortedInputs = [];
    this.detailInputs = [];
  }

  ngOnChanges(): void {
    console.log('StatisticsChartComponent ngOnChanges called with period:', this.period);

    if (this.previousPeriod !== this.period) {
      this.previousPeriod = this.period;

      this.retrieveData();
      return;
    }

    if (
      !this.prevFilledAddresses ||
      this.filledAddresses.length !== this.prevFilledAddresses.length ||
      !this.filledAddresses.every((addr, i) => addr === this.prevFilledAddresses![i])
    ) {
      this.prevFilledAddresses = JSON.parse(JSON.stringify(this.filledAddresses));
      this.retrieveData();
    }
  }

  async retrieveData(): Promise<void> {
    this.sortedInputs = DateUtils.filterByPeriod(
      this.dataService.getSortedInputs(true, null, null) ?? [],
      this.period || Period.All,
    );

    this.amounts = this.sortedInputs
      .filter((s) => this.filledAddresses.includes(s.outputAddress))
      .map((s) => {
        return { x: s.inputDate, y: s.amount } as DateNumberPoint;
      });

    this.eventService.sendEventWithData(EventType.StatisticsChartChanged, this.amounts);
  }

  async ngOnInit(): Promise<void> {
    this.chartFullTitle = this.chartTitle;
    await this.subscribeToEvent<Input[]>(EventType.RefreshInputs, async () => {
      await this.retrieveData();
    });

    await this.eventService.sendEvent(EventType.StatisticsScreenLoaded);

    for (const address of this.filledAddresses) {
      await this.eventService.sendEventWithData(EventType.RequestInputsDownload, address);
    }
    /*
    await this.eventService.subscribeToEvent(EventType.StartFullDownload, (address: string) => {
      console.log('Starting full download for statistics chart for address:', address);
      this.downloadInProgress[address] = true;
      this.chartFullTitle = this.chartTitle + ' (Downloading...)';
    });

    await this.eventService.subscribeToEvent(EventType.EndFullDownload, (address: string) => {
      console.log('Ending full download for statistics chart for address:', address);
      this.downloadInProgress[address] = false;

      if (Object.values(this.downloadInProgress).some((inProgress) => inProgress)) {
        return;
      }
      this.chartFullTitle = this.chartTitle;
    });*/
  }
}
