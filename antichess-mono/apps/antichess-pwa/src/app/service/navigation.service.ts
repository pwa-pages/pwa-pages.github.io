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
        this.navigationItems[idx].route = this.cleanRoute(saved[idx]);
      }
    });

    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd,
        ),
      )
      .subscribe((event) => {
        const url = this.cleanRoute(event.urlAfterRedirects);
        const index = this.getIndexFromUrl(url);

        this.updateCurrentNavigationIndex(url);


        if (index >= 0 && index < this.navigationItems.length) {
          this.saveRouteForIndex(index, url);
          this.navigationItems[index].route = url;
        }

        this.scrollToFragment(url);


      });
    this.eventService.subscribeToEvent<string>(
      EventType.VersionUpdated,
      (v) => {
        this.latestVersionUpdate = v;
      },
    );
  }

  private cleanRoute(route: string): string {
    if (!route) return route;

    try {
      let result = route;

      while (result.includes('%23') || result.includes('%2523')) {
        const decoded = decodeURIComponent(result);

        if (decoded === result) {
          break;
        }

        result = decoded;
      }

      return result;
    } catch {
      return route;
    }
  }


  private scrollToFragment(url: string): void {
    const fragment = this.cleanRoute(url).split('#')[1];

    if (!fragment) return;

    setTimeout(() => {
      document.getElementById(fragment)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 0);
  }

  private loadSavedRoutes(): Record<number, string> {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return {};

      const parsed = JSON.parse(raw);

      if (typeof parsed === 'object' && parsed !== null) {
        const cleaned: Record<number, string> = {};

        Object.keys(parsed).forEach((k) => {
          const idx = Number(k);
          const route = parsed[k];

          if (
            !Number.isNaN(idx) &&
            idx >= 0 &&
            idx < this.navigationItems.length &&
            typeof route === 'string'
          ) {
            cleaned[idx] = this.cleanRoute(route);
          }
        });

        return cleaned;
      }
    } catch {
      // ignore parse errors
    }

    return {};
  }
  private saveRouteForIndex(index: number, route: string): void {
    if (index < 0 || index >= this.navigationItems.length) return;

    try {
      const map = this.loadSavedRoutes();
      // Clean and strip any fragment/hash before saving
      const cleaned = this.cleanRoute(route).split('#')[0];
      map[index] = cleaned;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(map));
    } catch {
      // ignore
    }
  }

  private getSavedRoute(index: number): string | undefined {
    const map = this.loadSavedRoutes();
    const route = map[index];

    return route ? this.cleanRoute(route) : undefined;
  }

  private getRouteForIndex(index: number): string {
    const saved = this.getSavedRoute(index);

    if (saved) {
      return this.cleanRoute(saved);
    }

    if (index >= 0 && index < this.navigationItems.length) {
      return this.cleanRoute(this.navigationItems[index].route);
    }

    return this.navigationItems[0]?.route ?? '/';
  }

  private getIndexFromUrl(url: string): number {
    const cleanUrl = this.cleanRoute(url);

    if (cleanUrl.startsWith('/main')) return 0;
    if (cleanUrl.startsWith('/events')) return 1;
    if (cleanUrl.startsWith('/antichess')) return 2;
    if (cleanUrl.startsWith('/titles')) return 3;
    if (cleanUrl.startsWith('/players')) return 3;
    if (cleanUrl.startsWith('/rank')) return 3;

    return 0;
  }

  private updateCurrentNavigationIndex(url: string): void {
    const index = this.getIndexFromUrl(url);
    this.currentNavigationIndex = index;
  }

  public getCurrentNavigationItem(): NavigationItem {
    const idx = this.currentNavigationIndex;
    const route = this.cleanRoute(this.getRouteForIndex(idx));

    return { route };
  }

  public getNavigationItems(): NavigationItem[] {
    return this.navigationItems.map((_, i) => ({
      route: this.cleanRoute(this.getRouteForIndex(i)),
    }));
  }

  public getLeftItem(): NavigationItem {
    const l = this.navigationItems.length;
    const idx = (this.currentNavigationIndex - 1 + l) % l;

    return { route: this.cleanRoute(this.getRouteForIndex(idx)) };
  }

  public getRightItem(): NavigationItem {
    const l = this.navigationItems.length;
    const idx = (this.currentNavigationIndex + 1) % l;

    return { route: this.cleanRoute(this.getRouteForIndex(idx)) };
  }

  public navigate(to: string): void {
    const clean = this.cleanRoute(to);
    const [path, fragment] = clean.split('#');

    this.router.navigate([path], {
      fragment: fragment || undefined,
    });
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
    this.currentNavigationIndex =
      (this.currentNavigationIndex - 1 + l) % l;

    return this.getCurrentNavigationItem();
  }
}

export class NavigationItem {
  route!: string;
}