import {
  Component,
  Injector,
  OnInit
} from '@angular/core';

import { BaseWatcherComponent } from '../basewatchercomponent';

@Component({
  selector: 'app-events',
  templateUrl: './events.html',
  standalone: true,
  imports: [],
})
export class EventsComponent
  extends BaseWatcherComponent
  implements OnInit {
  data: string;




  constructor(
    injector: Injector,
  ) {
    super(injector);
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
