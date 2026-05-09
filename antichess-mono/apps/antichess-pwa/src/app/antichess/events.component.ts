import {
  Component,
  Injector,
  OnInit
} from '@angular/core';

import { BaseComponent } from '../basecomponent';
import { NavigationService } from '../service/navigation.service';
import { HeaderComponent } from './header.component';

@Component({
  selector: 'app-events',
  templateUrl: './events.html',
  standalone: true,
  imports: [HeaderComponent],
})
export class EventsComponent
  extends BaseComponent
  implements OnInit {
  data: string;




  constructor(
    injector: Injector,
    navigationService: NavigationService
  ) {
    super(injector, navigationService);
    this.data = '';
  }

  async retrieveData(): Promise<void> {

  }

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
    });


  }


  title = 'antichess-pwa';
}
