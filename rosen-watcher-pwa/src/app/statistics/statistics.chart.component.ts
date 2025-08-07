import { Component, OnInit, Input as AngularInput } from '@angular/core';
import { EventService, EventType } from '../service/event.service';
import 'chartjs-adapter-date-fns';
import { Input } from '../../service/ts/models/input';
import { DateUtils } from './date.utils';
import { RewardChartComponent } from './reward.chart.component';
import { ChainDataService } from '../service/chain.data.service';

@Component({
  selector: 'app-statistics-chart',
  templateUrl: './statistics.chart.html',
  standalone: true,
  imports: [RewardChartComponent],
})
export class StatisticsChartComponent implements OnInit {
  DateUtils = DateUtils;
  sortedInputs: Input[];
  detailInputs: Input[];

  @AngularInput()
  filledAddresses: string[] = [];

  amounts: DateNumberPoint[] = [];

  constructor(
    private dataService: ChainDataService,
    private eventService: EventService,
  ) {
    this.sortedInputs = [];
    this.detailInputs = [];
  }

  async retrieveData(): Promise<void> {
    this.sortedInputs = DateUtils.filterByPeriod(
      this.dataService.getSortedInputs(true, null, null) ?? [],
      Period.All,
    );

    this.amounts = this.sortedInputs.map((s) => {
      return { x: s.inputDate, y: s.amount } as DateNumberPoint;
    });
  }

  async ngOnInit(): Promise<void> {
    await this.eventService.subscribeToEvent<Input[]>(EventType.RefreshInputs, async () => {
      await this.retrieveData();
    });

    for (const address of this.filledAddresses) {
      await this.eventService.sendEventWithData(EventType.RequestInputsDownload, address);
    }
  }
}
