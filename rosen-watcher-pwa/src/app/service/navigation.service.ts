import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import '../../shared/ts/constants';
import { SwUpdate } from '@angular/service-worker';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  public currentNavigationIndex = 0;

  navigationItems: NavigationItem[] = [];

  constructor(
    private router: Router,
    private swUpdate: SwUpdate,
  ) {
    this.navigationItems.push({ route: '/statistics' });
    this.navigationItems.push({ route: '/performance' });
    this.navigationItems.push({ route: '/watchers' });

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd), // Type guard for NavigationEnd
      )
      .subscribe((event) => {
        const url = event.urlAfterRedirects;
        this.updateCurrentNavigationIndex(url);
      });
  }

  private updateCurrentNavigationIndex(url: string): void {
    const index = this.navigationItems.findIndex((item) => url.startsWith(item.route));
    if (index !== -1) {
      this.currentNavigationIndex = index;

      if (this.swUpdate.isEnabled) {
        this.swUpdate.checkForUpdate().then((isUpdateAvailable) => {
          if (isUpdateAvailable) {
            console.log('Application has been updated, reloading screen.');
            // window.location.reload();
          }
        });
      }
    }
  }

  public getCurrentNavigationItem(): NavigationItem {
    return this.navigationItems[this.currentNavigationIndex];
  }

  public getNavigationItems(): NavigationItem[] {
    return this.navigationItems;
  }

  public getLeftItem(): NavigationItem {
    return this.navigationItems[
      (this.currentNavigationIndex - 1 + this.navigationItems.length) % this.navigationItems.length
    ];
  }

  public getRightItem(): NavigationItem {
    return this.navigationItems[(this.currentNavigationIndex + 1) % this.navigationItems.length];
  }

  public navigateTo(to: number): NavigationItem {
    this.currentNavigationIndex = to;
    return this.getCurrentNavigationItem();
  }

  public navigateRight(): NavigationItem {
    const l = this.navigationItems.length;
    this.currentNavigationIndex = (this.currentNavigationIndex + 1) % l;
    return this.getCurrentNavigationItem();
  }

  public navigateLeft(): NavigationItem {
    const l = this.navigationItems.length;
    this.currentNavigationIndex = (this.currentNavigationIndex - 1 + l) % l;
    return this.getCurrentNavigationItem();
  }
}
export class NavigationItem {
  route!: string;
}
