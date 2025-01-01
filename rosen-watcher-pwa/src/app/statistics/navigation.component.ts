import { Component, OnInit } from '@angular/core';
import { NgIf, CommonModule } from '@angular/common';
import 'chartjs-adapter-date-fns';
import { FormsModule } from '@angular/forms';
import { NavigationItem, NavigationService } from '../service/navigation.service';
import { SwipeService } from '../service/swipe.service';
import { EventService, EventType } from '../service/event.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.html',
  standalone: true,
  imports: [NgIf, FormsModule, CommonModule],
})
export class NavigationComponent implements OnInit {
  private visible = true;
  public downloading = false;
  constructor(
    private navigationService: NavigationService,
    private swipeService: SwipeService,
    private eventService: EventService,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.eventService.subscribeToEvent(EventType.StatisticsScreenLoaded, () => {
      this.visible = true;
    });
    await this.eventService.subscribeToEvent(EventType.WatchersScreenLoaded, () => {
      this.visible = true;
    });
    await this.eventService.subscribeToEvent(EventType.PerformanceScreenLoaded, () => {
      this.visible = true;
    });
    await this.eventService.subscribeToEvent(EventType.SettingsScreenLoaded, () => {
      this.visible = false;
    });

    await this.eventService.subscribeToEvent(EventType.StartFullDownload, () => {
      this.downloading = true;
    });

    await this.eventService.subscribeToEvent(EventType.EndFullDownload, () => {
      this.downloading = false;
    });
  }

  isVisible(): boolean {
    return this.visible;
  }

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

  isStatisticsActive(): boolean {
    return this.navigationService.currentNavigationIndex == 0;
  }

  isPerformanceActive(): boolean {
    return this.navigationService.currentNavigationIndex == 1;
  }
  isWatchersActive(): boolean {
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
