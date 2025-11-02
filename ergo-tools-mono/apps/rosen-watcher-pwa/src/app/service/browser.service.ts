import { Injectable } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { QRDialogComponent } from '../statistics/qrdialog.component';
import { Router } from '@angular/router';
import { Address } from '../../service/ts/models/address';
import { Location } from '@angular/common';
import { EventService, EventType } from './event.service';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export interface WindowWithPrompt extends Window {
  showHomeLink?: boolean;
  deferredPrompt?: BeforeInstallPromptEvent;
}

@Injectable({
  providedIn: 'root',
})
export class BrowserService {
  constructor(
    private qrDialog: MatDialog,
    private router: Router,
    private location?: Location,
    private eventService?: EventService,
  ) {
    window.addEventListener('beforeinstallprompt', (event: Event) => {
      (window as WindowWithPrompt).showHomeLink = true;
      event.preventDefault();

      (window as WindowWithPrompt).deferredPrompt =
        event as BeforeInstallPromptEvent;
    });

    window.addEventListener('resize', () => {
      this.eventService?.sendEvent(EventType.WindowResized);
    });
  }

  showQR(addresses: Address[]): void {
    this.qrDialog.open(QRDialogComponent, {
      data: { qrData: this.getShareUrl(addresses) },
    });
  }

  getShareUrl(addresses: Address[]): string {
    const currentUrl = window.location.pathname;
    const subdirectory = currentUrl.substring(0, currentUrl.lastIndexOf('/'));
    const urlTree = this.router.createUrlTree(['main'], {
      queryParams: { addresses: JSON.stringify(addresses) },
    });
    const url =
      window.location.origin + subdirectory + this.router.serializeUrl(urlTree);
    return url;
  }

  replacePath() {
    const currentPath = this.location?.path();

    if (!currentPath) {
      return;
    }

    if (currentPath.includes('?')) {
      const parts = currentPath.split('?');
      const newPath = parts[0];
      this.location?.replaceState(newPath);
    }
  }

  share(addresses: Address[]): void {
    const url = this.getShareUrl(addresses);

    console.log('share url: ' + url);

    navigator.share({
      title: 'Rosen Watcher',
      text: 'Rosen Watcher',
      url: url,
    });
  }

  showHomeLink(): boolean {
    return (window as WindowWithPrompt).showHomeLink == true;
  }

  installApp(): void {
    if ((window as WindowWithPrompt).deferredPrompt) {
      (window as WindowWithPrompt).deferredPrompt?.prompt();

      (window as WindowWithPrompt).deferredPrompt?.userChoice.then(
        (choiceResult: {
          outcome: 'accepted' | 'dismissed';
          platform: string;
        }) => {
          if (choiceResult.outcome === 'accepted') {
            (window as WindowWithPrompt).showHomeLink = false;
          }
          (window as WindowWithPrompt).deferredPrompt = undefined;
        },
      );
    }
  }
}
