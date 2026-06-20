import {
  Component,
  Injector,
  OnInit,
} from '@angular/core';
import { EventType } from '../service/event.service';
import { BaseComponent } from '../basecomponent';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationService } from '../service/navigation.service';
import { HeaderComponent } from './header.component';
import { ChessBoardComponent } from './chessboard.component';

@Component({
  selector: 'app-antichessguide',
  templateUrl: './antichessguide.html',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, ChessBoardComponent],
})
export class AntichessGuideComponent extends BaseComponent implements OnInit {


  constructor(
    injector: Injector,
    navigationService: NavigationService,
  ) {
    super(injector, navigationService);


  }



  selectTab(): void {
    this.navigationService.navigate('/antichessguide');
  }

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();


    this.eventService.sendEvent(EventType.AntichessScreenLoaded);
  }
}
