import {
  Component,
  OnInit,
  Injector,} from '@angular/core';

import { BaseWatcherComponent } from '../basewatchercomponent';
import { RouterLink, RouterLinkActive } from '@angular/router';
import 'chartjs-adapter-date-fns';
import { ServiceWorkerService } from '../service/service.worker.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-main',
  templateUrl: './main.html',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    FormsModule,
  ],
})
export class MainComponent
  extends BaseWatcherComponent
  implements OnInit {
  selectedTab: string;
  window: HTMLElement = document.body;
  version: string | null;
  selectedPeriod: string | null;
  shareSupport = false;


  constructor(
    injector: Injector,
    private serviceWorkerService: ServiceWorkerService,
  ) {
    super(injector);
    this.selectedTab = 'chart';
    this.version = '';
    this.selectedPeriod = null;
  }


  showHomeLink(): boolean {
    return this.browserService.showHomeLink() ?? false;
  }

  selectTab(tab: string): void {
    this.selectedTab = tab;
  }

  installApp(): void {
    this.browserService.installApp();
  }

  showQR(): void {
   
  }

  share(): void {
   
  }

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();


   
    this.shareSupport = navigator.share != null && navigator.share != undefined;

    this.version = this.serviceWorkerService.getVersion();
   
  }

  title = 'antichess-pwa';
}
