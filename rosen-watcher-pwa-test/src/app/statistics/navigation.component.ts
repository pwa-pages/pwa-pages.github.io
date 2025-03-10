import { Component, OnInit } from "@angular/core";
import { NgIf, CommonModule } from "@angular/common";
import "chartjs-adapter-date-fns";
import { FormsModule } from "@angular/forms";
import {
  NavigationItem,
  NavigationService,
} from "../service/navigation.service";
import { SwipeService } from "../service/swipe.service";
import { EventService, EventType } from "../service/event.service";

@Component({
  selector: "app-navigation",
  templateUrl: "./navigation.html",
  standalone: true,
  imports: [NgIf, FormsModule, CommonModule],
})
export class NavigationComponent implements OnInit {
  private visible = true;
  private logging = false;
  private navigationHistory = "";
  public logLines: string[] = [];
  public downloads = 0;
  constructor(
    private navigationService: NavigationService,
    private swipeService: SwipeService,
    private eventService: EventService,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.eventService.subscribeToEvent(
      EventType.StatisticsScreenLoaded,
      () => {
        this.visible = true;
      },
    );
    await this.eventService.subscribeToEvent(
      EventType.WatchersScreenLoaded,
      () => {
        this.visible = true;
      },
    );
    await this.eventService.subscribeToEvent(
      EventType.PerformanceScreenLoaded,
      () => {
        this.visible = true;
      },
    );
    await this.eventService.subscribeToEvent(
      EventType.SettingsScreenLoaded,
      () => {
        this.visible = false;
      },
    );

    await this.eventService.subscribeToEvent(
      EventType.StartFullDownload,
      () => {
        this.downloads++;
      },
    );

    await this.eventService.subscribeToEvent(EventType.EndFullDownload, () => {
      this.downloads--;
      if (this.downloads < 0) {
        this.downloads = 0;
      }
    });
    this.overrideLogging();
  }

  overrideLogging() {
    const logLines = this.logLines;
    const originalConsoleLog = console.log;

    console.log = function (...args: string[]) {
      const timestamp = new Date().toISOString();

      const logMessage = `[Intercepted] ${timestamp} - ${args.join(" ")}`;
      logLines.push(logMessage);

      originalConsoleLog.apply(console, [
        `[Intercepted] ${timestamp}`,
        ...args,
      ]);
    };
  }

  showLogging(): boolean {
    return this.logging;
  }

  isVisible(): boolean {
    return this.visible;
  }

  swipeRight(): void {
    this.swipeService.swipe(
      "right",
      this.navigationService.navigateLeft().route,
    );
  }

  swipeLeft(): void {
    this.swipeService.swipe(
      "left",
      this.navigationService.navigateRight().route,
    );
  }

  navigate(to: number) {
    if (to == this.navigationService.currentNavigationIndex) {
      return;
    }

    if (to < this.navigationService.currentNavigationIndex) {
      this.swipeService.swipe(
        "right",
        this.navigationService.navigateTo(to).route,
      );
    } else {
      this.swipeService.swipe(
        "left",
        this.navigationService.navigateTo(to).route,
      );
    }

    this.navigationHistory = this.navigationHistory + to;
    if (this.navigationHistory.indexOf("01210121012101210") >= 0) {
      this.logging = true;
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
