import {
  Component,
  Injector,
  OnInit,
} from '@angular/core';
import { EventType } from '../service/event.service';
import { BaseWatcherComponent } from '../basewatchercomponent';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationService } from '../service/navigation.service';
import { HttpDownloadService } from '../service/http.download.service';
import { firstValueFrom } from 'rxjs';
interface AntichessPerf { rating: number; progress: number; }
interface AntichessUser {
  id: string;
  username: string;
  perfs: { antichess: AntichessPerf };
  patron?: boolean;
  patronColor?: number;
  online?: boolean;
}
interface AntichessTopResponse { users: AntichessUser[] }


@Component({
  selector: 'app-rank',
  templateUrl: './rank.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
})



export class RankComponent extends BaseWatcherComponent implements OnInit {

  topAntichessPlayers: AntichessUser[] = [];

  constructor(
    injector: Injector,
    navigationService: NavigationService,
    private httpDownloadService: HttpDownloadService
  ) {
    super(injector, navigationService);


  }



  selectTab(): void {
    this.navigationService.navigate('/rank');
  }

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();
    try {
      const result = await firstValueFrom(
        this.httpDownloadService.downloadStream<AntichessTopResponse>(
          'https://lichess.org/api/player/top/100/antichess'
        )
      );


      this.topAntichessPlayers = result?.users ?? [];
      console.log('Top antichess players:', this.topAntichessPlayers);
    } catch (error) {
      console.error('Failed to load antichess top players', error);
      this.topAntichessPlayers = [];
    }




    
    this.eventService.sendEvent(EventType.AntichessScreenLoaded);
  }
}
