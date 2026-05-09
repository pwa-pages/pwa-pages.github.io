import { Component, OnInit, Injector } from '@angular/core';
import { EventType } from './service/event.service';
import { ActivatedRoute } from '@angular/router';
import { BrowserService } from './service/browser.service';
import { BaseEventAwareComponent } from './baseeventawarecomponent';
import { NavigationService } from './service/navigation.service';

@Component({
  selector: 'app-root',
  template: '',
})
export class BaseComponent
  extends BaseEventAwareComponent
  implements OnInit {
  public busyCounter = 1;
  loaderLogs: string[] = [];
  noAddresses = false;
  protected browserService: BrowserService;
  protected route: ActivatedRoute | undefined;

  constructor(protected override injector: Injector, protected navigationService: NavigationService) {
    super(injector);

    this.browserService = this.injector.get(BrowserService);
    try {
      this.route = this.injector.get(ActivatedRoute);
    } catch {
      this.route = undefined;
    }
  }

    clickTab(tab: string): void {
      this.navigationService.navigate(tab);
  }

  notifyVisible(): boolean {

    return true;
  }
  resetHeight(): void {
    document.body.style.height = window.innerHeight + 'px';
    document.documentElement.style.height = window.innerHeight + 'px';
  }

  async ngOnInit(): Promise<void> {
    this.eventService.sendEvent(EventType.SwipeActivated);

    window.addEventListener('resize', this.resetHeight);

    this.resetHeight();
  }



}
