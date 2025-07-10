import { Injectable } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { filter } from "rxjs/operators";
import { PaintingService } from "./paintings.service";

@Injectable({
  providedIn: "root",
})
export class NavigationService {
  public currentNavigationId = 0;

  latestVersionUpdate: string | null = null;

  constructor(
    private router: Router,
    private paintingService: PaintingService,
  ) {
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd,
        ), // Type guard for NavigationEnd
      )
      .subscribe((event) => {
        const url = event.urlAfterRedirects;
        this.updatecurrentNavigationId(url);
      });
  }

  private updatecurrentNavigationId(url: string): void {
    const imageMatch = url.match(/^\/image\/(\d+)/);
    if (imageMatch) {
      this.currentNavigationId = parseInt(imageMatch[1], 10);
      return;
    }
  }

  public getCurrentNavigationItem(): number {
    return this.currentNavigationId;
  }

  public getLeftItem(): number {
    return this.currentNavigationId - 1;
  }

  public getRightItem(): number {
    return this.currentNavigationId + 1;
  }

  public navigate(to: string): void {
    this.router.navigate([to]);
  }

  public navigateTo(to: number): number {
    this.currentNavigationId = to;
    return this.currentNavigationId;
  }

  public navigateRight(): string {
    return this.paintingService.getNextImageUrl(this.currentNavigationId);
  }

  public navigateLeft(): string {
    return this.paintingService.getPrevImageUrl(this.currentNavigationId);
  }
}
