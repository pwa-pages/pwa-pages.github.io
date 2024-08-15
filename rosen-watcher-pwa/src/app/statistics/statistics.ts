import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { EventService, EventType } from '../service/event.service';
import { StorageService } from '../service/storage.service';
import { SwipeService } from '../service/swipe.service';
import { DataService } from '../service/data.service';
import { FeatureService } from '../service/featureservice';
import { BaseWatcherComponent } from '../basewatchercomponent';
import { ActivatedRoute } from '@angular/router';
import { Location, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { QRDialog } from './qrdialog';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';

@Component({
  selector: 'statistics',
  templateUrl: './statistics.html',
})
export class Statistics extends BaseWatcherComponent implements OnInit {
  data: string;
  selectedTab: string;
  rewardsChart: any[];
  sortedInputs: any[];
  addresses: any[];
  noAddresses: boolean = false;
  showPermitsLink: boolean = false;
  addressesForDisplay: any[];
  shareSupport: boolean = false;
  chart: Chart<'line', any[][], unknown> | undefined;
  @ViewChild('detailsContainer') detailsContainer!: ElementRef;

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private dataService: DataService,
    featureService: FeatureService,
    eventService: EventService,
    swipeService: SwipeService,
    private router: Router,
    private qrDialog: MatDialog,
    private datePipe: DatePipe,
  ) {
    super(eventService, featureService, swipeService);
    this.data = '';
    this.selectedTab = 'chart';
    this.addresses = [];
    this.addressesForDisplay = [];
    this.rewardsChart = [];
    this.sortedInputs = [];
  }

  showHomeLink(): boolean {
    return (window as any).showHomeLink;
  }

  selectTab(tab: string): void {
    this.selectedTab = tab;
  }

  formatDate(utcDate: string): string {
    // Convert the UTC date string to a JavaScript Date object
    const date = new Date(utcDate);

    // Format the date using the browser's locale
    return this.datePipe.transform(date, 'dd MMM yyyy') || '';
  }

  async retrieveData(): Promise<any[]> {
    this.data = await this.dataService.getTotalRewards();

    this.sortedInputs = await this.dataService.getSortedInputs();

    var newChart = this.sortedInputs.map((s) => {
      return { x: s.inputDate, y: s.accumulatedAmount };
    });
    this.sortedInputs.sort((a, b) => b.inputDate - a.inputDate);

    if (
      this.rewardsChart.length != 0 &&
      newChart.length != this.rewardsChart.length &&
      this.chart
    ) {
      this.chart.options.animation = {
        duration: 1000,
      };
    }

    this.rewardsChart = newChart;
    var result = await this.dataService.getInputs();
    this.addressesForDisplay = await this.dataService.getAddressesForDisplay();

    this.updateChart();
    return result;
  }

  updateChart(): void {
    if (!this.chart) {
      this.chart = this.createChart();
    }

    this.chart.data.datasets[0].data = this.reduceChartData(this.rewardsChart, 15);

    this.chart.update();
  }

  createChart(): Chart<'line', any[][], unknown> {
    return new Chart('RewardChart', {
      type: 'line',
      data: {
        datasets: [
          {
            label: 'Total rewards earned (RSN)',
            data: [this.rewardsChart],
            borderColor: 'rgb(138, 128, 128)',
            backgroundColor: 'rgba(138, 128, 128, 0.2)',
            borderWidth: 4,
            pointBackgroundColor: 'rgb(138, 128, 128)',
            cubicInterpolationMode: 'default',
            tension: 0.4,
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 0,
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)',
            },
            ticks: {
              callback: function (value) {
                return (value as number) / 1000;
              },
            },
          },
          x: {
            type: 'time',
            time: {
              unit: 'day',
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)',
            },
          },
        },
        plugins: {
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            bodyFont: {
              size: 14,
            },
            titleFont: {
              size: 16,
              weight: 'bold',
            },
          },
          legend: {
            labels: {
              font: {
                size: 14,
              },
            },
          },
        },
      },
    });
  }
  calculateTriangleArea(
    p1: { x: Date; y: number },
    p2: { x: Date; y: number },
    p3: { x: Date; y: number },
  ): number {
    return Math.abs(
      (p1.x.getTime() * (p2.y - p3.y) +
        p2.x.getTime() * (p3.y - p1.y) +
        p3.x.getTime() * (p1.y - p2.y)) /
        2,
    );
  }

  reduceChartData(data: any[], targetPoints: number): any[] {
    let remainingPoints = data.length - targetPoints;
    if (remainingPoints <= 0) {
      return data;
    }

    let points = data.slice();

    while (remainingPoints > 0) {
      let minArea = Infinity;
      let indexToRemove = -1;

      for (let i = 1; i < points.length - 1; i++) {
        let area = this.calculateTriangleArea(points[i - 1], points[i], points[i + 1]);
        if (area < minArea) {
          minArea = area;
          indexToRemove = i;
        }
      }

      if (indexToRemove !== -1) {
        points.splice(indexToRemove, 1);
        remainingPoints--;
      } else {
        break;
      }
    }

    return points;
  }

  installApp(): void {
    if ((window as any).deferredPrompt) {
      (window as any).deferredPrompt.prompt();

      (window as any).deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          (window as any).showHomeLink = false;
        } else {
        }
        (window as any).deferredPrompt = null;
      });
    }
  }

  showQR(): void {
    this.qrDialog.open(QRDialog, {
      data: { qrData: this.getShareUrl() },
    });
  }

  getShareUrl(): string {
    const currentUrl = window.location.pathname;
    const subdirectory = currentUrl.substring(0, currentUrl.lastIndexOf('/'));
    const urlTree = this.router.createUrlTree(['main'], {
      queryParams: { addresses: JSON.stringify(this.addresses) },
    });
    var url = window.location.origin + subdirectory + this.router.serializeUrl(urlTree);
    return url;
  }

  share(): void {
    var url = this.getShareUrl();

    console.log('share url: ' + url);

    navigator.share({
      title: 'Rosen Watcher',
      text: 'Rosen Watcher',
      url: url,
    });
  }

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();

    this.shareSupport = navigator.share != null && navigator.share != undefined;

    var me = this;
    this.initSwipe('/performance', '/watchers');

    window.addEventListener('beforeinstallprompt', (event) => {
      (window as any).showHomeLink = true;
      event.preventDefault();

      (window as any).deferredPrompt = event;
    });

    this.showPermitsLink = this.featureService.hasPermitScreen();

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
    });

    this.route.queryParams.subscribe(async (params) => {
      var hasAddressParams = await this.checkAddressParams(params);

      var storageService = this.storageService;

      await this.retrieveData().then((inputs) => {
        this.addresses.forEach(async (address) => {
          await this.dataService.downloadForAddress(
            address.address,
            inputs,
            storageService,
            hasAddressParams,
          );
          await this.retrieveData();
        });
      });
    });

    var me = this;
    await this.subscribeToEvent(EventType.InputsStoredToDb, async function () {
      await me.retrieveData();
    });

    await this.subscribeToEvent(EventType.EndFullDownload, async function () {
      await me.retrieveData();
    });
  }

  title = 'rosen-watcher-pwa';

  private async checkAddressParams(params: any): Promise<boolean> {
    if (params['addresses']) {
      const addressesParam = params['addresses'];
      console.log(addressesParam);

      this.addresses = JSON.parse(decodeURIComponent(addressesParam));
      let currentPath = this.location.path();

      if (currentPath.includes('?')) {
        let parts = currentPath.split('?');
        let newPath = parts[0];
        this.location.replaceState(newPath);
      }

      await this.storageService.clearInputsStore();
      if (this.addresses.length == 0) {
        this.noAddresses = true;
      }
      return true;
    } else {
      this.addresses = await this.dataService.getAddresses();
      if (this.addresses.length == 0) {
        this.noAddresses = true;
      }
      return false;
    }
  }
}
