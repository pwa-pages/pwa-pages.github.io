import { Injectable } from '@angular/core';
import '../../shared/ts/constants';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  public currentNavigationIndex = 0;
  navigationItems: NavigationItem[] = [];

  constructor() {
    this.navigationItems.push({ route: '/statistics' });
    this.navigationItems.push({ route: '/performance' });
    this.navigationItems.push({ route: '/watchers' });
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
