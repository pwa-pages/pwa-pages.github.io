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
  selector: 'app-titles',
  templateUrl: './titles.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class TitlesComponent extends BaseWatcherComponent implements OnInit {


  constructor(
    injector: Injector,
    navigationService: NavigationService
  ) {
    super(injector, navigationService);


  }



  selectTab(): void {
    this.navigationService.navigate('/rank');
  }

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();





    this.eventService.sendEvent(EventType.AntichessScreenLoaded);
  }
}
