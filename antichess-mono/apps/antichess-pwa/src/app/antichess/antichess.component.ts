import {
  Component,
  Injector,
  OnInit,
  signal,
} from '@angular/core';
import { EventType } from '../service/event.service';
import { BaseComponent } from '../basecomponent';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationService } from '../service/navigation.service';
import { HeaderComponent } from './header.component';
import { Chessground } from 'chessground'
import { Api } from 'chessground/api';
import { ChessBoardComponent } from './chessboard.component';


@Component({
  selector: 'app-antichess',
  templateUrl: './antichess.html',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, ChessBoardComponent],
})
export class AntichessComponent extends BaseComponent implements OnInit {


  constructor(
    injector: Injector,
    navigationService: NavigationService
  ) {
    super(injector, navigationService);


  }

  groundApi = signal<Api | null>(null);

  myFn = signal<(el: HTMLElement) => Api>((el) => {
    const api = Chessground(el, {
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      orientation: 'white',
      movable: { free: true, color: 'both' }
    });
    this.groundApi.set(api);
    return api;
  });

  selectTab(): void {
    this.navigationService.navigate('/antichess');
  }

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();


    this.eventService.sendEvent(EventType.AntichessScreenLoaded);
  }
}
