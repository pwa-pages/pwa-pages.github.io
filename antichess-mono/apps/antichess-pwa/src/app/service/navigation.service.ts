import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { EventService, EventType } from './event.service';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  public currentNavigationIndex = 0;

  private readonly STORAGE_KEY = 'antichess.navigation.lastRoutes';

  navigationItems: NavigationItem[] = [];
  latestVersionUpdate: string | null = null;

  constructor(
    private router: Router,
    private eventService: EventService,
  ) {
    
    this.navigationItems.push({ route: '/main' });
    this.navigationItems.push({ route: '/events' });
    this.navigationItems.push({ route: '/antichess' });
    this.navigationItems.push({ route: '/players' });

    
    const saved = this.loadSavedRoutes();
    Object.keys(saved).forEach((k) => {
      const idx = Number(k);
      if (!Number.isNaN(idx) && idx >= 0 && idx < this.navigationItems.length) {
        this.navigationItems[idx].route = saved[idx];
      }
    });

    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd,
        ),
      )
      .subscribe((event) => {
        const url = event.urlAfterRedirects;
        const index = this.getIndexFromUrl(url);
        this.updateCurrentNavigationIndex(url);
        this.saveRouteForIndex(index, url);
        if (index >= 0 && index < this.navigationItems.length) {
          this.navigationItems[index].route = url;
        }
      });

    this.eventService.subscribeToEvent<string>(
      EventType.VersionUpdated,
      (v) => {
        this.latestVersionUpdate = v;
      },
    );
  }

  private loadSavedRoutes(): Record<number, string> {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) return parsed;
    } catch {
      // ignore parse errors
    }
    return {};
  }

  private saveRouteForIndex(index: number, route: string): void {
    try {
      const map = this.loadSavedRoutes();
      map[index] = route;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(map));
    } catch {
      // ignore
    }
  }

  private getSavedRoute(index: number): string | undefined {
    const map = this.loadSavedRoutes();
    return map[index];
  }

  private getRouteForIndex(index: number): string {
    const saved = this.getSavedRoute(index);
    if (saved) return saved;
    if (index >= 0 && index < this.navigationItems.length) {
      return this.navigationItems[index].route;
    }
    return this.navigationItems[0]?.route ?? '/';
  }

  private getIndexFromUrl(url: string): number {
    if (url.startsWith('/main')) return 0;
    if (url.startsWith('/events')) return 1;
    if (url.startsWith('/antichess')) return 2;
    if (url.startsWith('/titles')) return 3;
    if (url.startsWith('/players')) return 3;
    if (url.startsWith('/rank')) return 3;

    return 0;
  }

  private updateCurrentNavigationIndex(url: string): void {
    const index = this.getIndexFromUrl(url);
    this.currentNavigationIndex = index;
  }

  public getCurrentNavigationItem(): NavigationItem {
    const idx = this.currentNavigationIndex;
    const route = this.getRouteForIndex(idx);
    return { route };
  }

  public getNavigationItems(): NavigationItem[] {
    return this.navigationItems.map((_, i) => ({ route: this.getRouteForIndex(i) }));
  }

  public getLeftItem(): NavigationItem {
    const l = this.navigationItems.length;
    const idx = (this.currentNavigationIndex - 1 + l) % l;
    return { route: this.getRouteForIndex(idx) };
  }

  public getRightItem(): NavigationItem {
    const l = this.navigationItems.length;
    const idx = (this.currentNavigationIndex + 1) % l;
    return { route: this.getRouteForIndex(idx) };
  }

  public navigate(to: string): void {
    this.router.navigate([to]);
  }

  
  public navigateTo(to: number): NavigationItem {
    if (to < 0 || to >= this.navigationItems.length) {
      to = 0;
    }
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
