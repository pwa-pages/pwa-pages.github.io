import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf, NgStyle, NgFor, CommonModule } from '@angular/common';
import 'chartjs-adapter-date-fns';
import { FormsModule } from '@angular/forms';
import { NavigationItem, NavigationService } from '../service/navigation.service';

import { SwipeService } from '../service/swipe.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.html',
  standalone: true,
  imports: [NgIf, NgStyle, NgFor, RouterLink, RouterLinkActive, FormsModule, CommonModule],
})
export class NavigationComponent {
  constructor(
    private navigationService: NavigationService,
    private swipeService: SwipeService,
  ) {}

  swipeRight(): void {
    this.swipeService.swipe('right', this.navigationService.navigateLeft().route);
  }

  swipeLeft(): void {
    this.swipeService.swipe('left', this.navigationService.navigateRight().route);
  }

  navigate(to: number) {
    if (to == this.navigationService.currentNavigationIndex) {
      return;
    }

    if (to < this.navigationService.currentNavigationIndex) {
      this.swipeService.swipe('right', this.navigationService.navigateTo(to).route);
    } else {
      this.swipeService.swipe('left', this.navigationService.navigateTo(to).route);
    }
  }

  isStatisticsActive(): boolean{
return this.navigationService.currentNavigationIndex == 0;
  }

  isPerformanceActive(): boolean{
    return this.navigationService.currentNavigationIndex == 1;
      }
      isWatchersActive(): boolean{
        return this.navigationService.currentNavigationIndex == 2;
          }
        

  navRewards(): void {
    this.navigate(0);
  }

  navWatchers(): void {
    this.navigate(2);
  }

  navPerformance(): void {
    this.navigate(1);
  }

  public getNavigationItems(): NavigationItem[] {
    return this.navigationService.getNavigationItems();
  }
}
