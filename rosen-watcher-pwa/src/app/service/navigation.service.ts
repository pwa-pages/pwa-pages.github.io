import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { EventService, EventType } from './event.service';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  public currentNavigationIndex = 0;

  navigationItems: NavigationItem[] = [];
  latestVersionUpdate: string | null = null;

  constructor(
    private router: Router,
    private eventService: EventService,
  ) {
    this.navigationItems.push({ route: '/statistics' });
    this.navigationItems.push({ route: '/performance' });
    this.navigationItems.push({ route: '/watchers' });
    this.navigationItems.push({ route: '/chainperformance' });

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd), // Type guard for NavigationEnd
      )
      .subscribe((event) => {
        const url = event.urlAfterRedirects;
        this.updateCurrentNavigationIndex(url);
      });

    this.eventService.subscribeToEvent<string>(EventType.VersionUpdated, (v) => {
      this.latestVersionUpdate = v;
      //this.checkForReload();
    });

    const performanceItem = localStorage.getItem('performanceScreen');
    if (performanceItem?.startsWith('/chainperformance')) {
      this.swapPerformanceItems();
    }
  }

  /*
  private checkForReload() {
    if (
      this.latestVersionUpdate &&
      localStorage.getItem('versionReload') != this.latestVersionUpdate
    ) {
      localStorage.setItem('versionReload', this.latestVersionUpdate);
      this.latestVersionUpdate = null;
      console.log('Application has been updated, reloading screen.');
      setTimeout(() => {
        console.log('Doing the reload...');
        window.location.reload();
      }, 1000);
    }
  }*/

  private updateCurrentNavigationIndex(url: string): void {
    if (url.startsWith('/chainperformance')) {
      this.currentNavigationIndex = 1;
      return;
    }

    if (url.startsWith('/mywatchers')) {
      this.currentNavigationIndex = 2;
      return;
    }

    let index = this.navigationItems.findIndex((item) => url.startsWith(item.route));
    if (index == -1) {
      index = 0;
    }
    this.currentNavigationIndex = index;
    //this.checkForReload();
  }

  public getCurrentNavigationItem(): NavigationItem {
    if (this.currentNavigationIndex == 2) {
      const watchersScreen = localStorage.getItem('watchersScreen');
      if (watchersScreen) {
        return { route: watchersScreen };
      }
    }

    return this.navigationItems[this.currentNavigationIndex];
  }

  public getNavigationItems(): NavigationItem[] {
    return this.navigationItems;
  }

  public getLeftItem(): NavigationItem {
    return this.navigationItems[
      (this.currentNavigationIndex - 1 + this.navigationItems.length) % 3
    ];
  }

  public getRightItem(): NavigationItem {
    return this.navigationItems[(this.currentNavigationIndex + 1) % 3];
  }

  public navigate(to: string): void {
    if (to.startsWith('/performance') && !this.router.url.startsWith('/performance')) {
      this.swapPerformanceItems();
    } else if (
      to.startsWith('/chainperformance') &&
      !this.router.url.startsWith('/chainperformance')
    ) {
      this.swapPerformanceItems();
    }

    if (to.endsWith('watchers')) {
      localStorage.setItem('watchersScreen', to);
    }

    localStorage.setItem('performanceScreen', this.navigationItems[1].route);

    this.router.navigate([to]);
  }

  private swapPerformanceItems() {
    const t = this.navigationItems[1];
    this.navigationItems[1] = this.navigationItems[3];
    this.navigationItems[3] = t;
  }

  public navigateTo(to: number): NavigationItem {
    this.currentNavigationIndex = to;
    return this.getCurrentNavigationItem();
  }

  public navigateRight(): NavigationItem {
    const l = 3;
    this.currentNavigationIndex = (this.currentNavigationIndex + 1) % l;
    return this.getCurrentNavigationItem();
  }

  public navigateLeft(): NavigationItem {
    const l = 3;
    this.currentNavigationIndex = (this.currentNavigationIndex - 1 + l) % l;
    return this.getCurrentNavigationItem();
  }
}
export class NavigationItem {
  route!: string;
}
