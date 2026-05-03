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

@Component({
  selector: 'app-antichess',
  templateUrl: './antichess.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class AntichessComponent extends BaseWatcherComponent implements OnInit {


  constructor(
    injector: Injector,
    private navigationService: NavigationService
  ) {
    super(injector);


  }



  selectTab(): void {
    this.navigationService.navigate('/mywatchers');
  }

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();


    this.eventService.sendEvent(EventType.AntichessScreenLoaded);
  }
}
