import { Injectable } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import "../../shared/ts/constants";
import { filter } from "rxjs/operators";
import { EventService, EventType } from "./event.service";

@Injectable({
  providedIn: "root",
})
export class NavigationService {
  public currentNavigationIndex = 0;

  navigationItems: NavigationItem[] = [];
  latestVersionUpdate: string | null = null;

  constructor(
    private router: Router,
    private eventService: EventService,
  ) {
    this.navigationItems.push({ route: "/statistics" });
    this.navigationItems.push({ route: "/performance" });
    this.navigationItems.push({ route: "/watchers" });

    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd,
        ), // Type guard for NavigationEnd
      )
      .subscribe((event) => {
        const url = event.urlAfterRedirects;
        this.updateCurrentNavigationIndex(url);
      });

    this.eventService.subscribeToEvent<string>(
      EventType.VersionUpdated,
      (v) => {
        this.latestVersionUpdate = v;
        //this.checkForReload();
      },
    );
  }

  private checkForReload() {
    if (
      this.latestVersionUpdate &&
      localStorage.getItem("versionReload") != this.latestVersionUpdate
    ) {
      localStorage.setItem("versionReload", this.latestVersionUpdate);
      this.latestVersionUpdate = null;
      console.log("Application has been updated, reloading screen.");
      setTimeout(() => {
        console.log("Doing the reload...");
        window.location.reload();
      }, 1000);
    }
  }

  private updateCurrentNavigationIndex(url: string): void {
    let index = this.navigationItems.findIndex((item) =>
      url.startsWith(item.route),
    );
    if (index == -1) {
      index = 0;
    }
    this.currentNavigationIndex = index;
    this.checkForReload();
  }

  public getCurrentNavigationItem(): NavigationItem {
    return this.navigationItems[this.currentNavigationIndex];
  }

  public getNavigationItems(): NavigationItem[] {
    return this.navigationItems;
  }

  public getLeftItem(): NavigationItem {
    return this.navigationItems[
      (this.currentNavigationIndex - 1 + this.navigationItems.length) %
        this.navigationItems.length
    ];
  }

  public getRightItem(): NavigationItem {
    return this.navigationItems[
      (this.currentNavigationIndex + 1) % this.navigationItems.length
    ];
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
