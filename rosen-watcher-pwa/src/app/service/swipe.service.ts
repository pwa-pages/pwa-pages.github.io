import { Injectable } from '@angular/core';
import { EventService, EventType } from './event.service';
import { Router } from '@angular/router';
import { NavigationService } from './navigation.service';

@Injectable({
  providedIn: 'root',
})
export class SwipeService {
  private detectHorizontal = true;
  private detectVertical = false;
  private swipeActive = false;

  constructor(
    eventService: EventService,
    private navigationService: NavigationService,
    private router: Router,
  ) {
    this.registerSwipeDetect();

    eventService.subscribeToEvent(EventType.SwipeActivated, () => {
      console.log('swipe activated');
      this.swipeActive = true;
    });

    eventService.subscribeToEvent(EventType.SwipeDeActivated, () => {
      console.log('swipe deactivated');
      this.swipeActive = false;
    });
  }

  async navigate(route: string) {
    await this.router.navigate([route]);
  }

  getTouchSurface(): HTMLElement {
    return document.body.querySelector('.screen-div') as HTMLElement;
  }

  getSpeed(): number {
    return 1;
  }

  swipe(swipedir: string, route: string) {
    const touchsurface = this.getTouchSurface();
    touchsurface.classList.add('swiping');
    const html = document.documentElement;

    touchsurface.style.position = 'fixed';
    html.style.position = 'fixed';

    if (swipedir == 'left') {
      touchsurface.classList.add('swipeleft');

      setTimeout(() => {
        touchsurface.classList.remove('swipeleft');
        touchsurface.style.left = '100vw';
        this.navigate(route);

        setTimeout(() => {
          touchsurface.classList.add('swipeleftin');
        }, 25 * this.getSpeed());

        setTimeout(() => {
          this.resetswipes(touchsurface);
        }, 250 * this.getSpeed());
      }, 250 * this.getSpeed());
    } else if (swipedir == 'right') {
      touchsurface.classList.add('swiperight');

      setTimeout(() => {
        touchsurface.classList.remove('swiperight');
        touchsurface.style.left = '-100vw';
        this.navigate(route);

        setTimeout(function () {
          touchsurface.classList.add('swiperightin');
        }, 25 * this.getSpeed());

        setTimeout(() => {
          this.resetswipes(touchsurface);
        }, 250 * this.getSpeed());
      }, 250 * this.getSpeed());
    } else if (swipedir == 'up') {
      touchsurface.classList.add('swipeup');

      setTimeout(() => {
        touchsurface.classList.remove('swipeup');
        touchsurface.style.top = '100vh';
        this.navigate(route);

        setTimeout(function () {
          touchsurface.classList.add('swipeupin');
        }, 25 * this.getSpeed());

        setTimeout(() => {
          this.resetswipes(touchsurface);
        }, 250 * this.getSpeed());
      }, 250 * this.getSpeed());
    } else if (swipedir == 'down') {
      touchsurface.classList.add('swipedown');

      setTimeout(() => {
        touchsurface.classList.remove('swipedown');
        touchsurface.style.top = '-100vh';
        this.navigate(route);

        setTimeout(function () {
          touchsurface.classList.add('swipedownin');
        }, 25 * this.getSpeed());

        setTimeout(() => {
          this.resetswipes(touchsurface);
        }, 250 * this.getSpeed());
      }, 250 * this.getSpeed());
    }
  }

  public hasVerticalScrollableContainerClass(element: HTMLElement | null) {
    while (element) {
      if (element.classList && element.classList.contains('verticalscrollablecontainer')) {
        return true;
      }
      element = element.parentElement;
    }
    return false;
  }

  public registerSwipeDetect() {
    const threshold = 10,
      touchsurface = this.getTouchSurface(),
      html = document.documentElement;

    if (!touchsurface) {
      return;
    }
    let startX: number,
      startY: number,
      distX: number,
      distY: number,
      contentLeft: number,
      contentTop: number;

    touchsurface.addEventListener(
      'touchstart',
      (e) => {
        if (!this.swipeActive) {
          return;
        }

        touchsurface.style.position = 'fixed';
        html.style.position = 'fixed';
        contentLeft = touchsurface.offsetLeft;
        contentTop = touchsurface.offsetTop;
        const touchobj = e.changedTouches[0];
        distX = 0;
        distY = 0;
        startX = touchobj.pageX;
        startY = touchobj.pageY;
      },
      { passive: false },
    );

    touchsurface.addEventListener(
      'touchmove',
      (e) => {
        if (!this.swipeActive) {
          return;
        }

        const hasVerticalScrollableParent = this.hasVerticalScrollableContainerClass(
          e.target as HTMLElement,
        );

        const touchobj = e.changedTouches[0];
        distX = touchobj.pageX - startX;
        distY = touchobj.pageY - startY;

        if (Math.abs(distX) > 20 || Math.abs(distY) > 20) {
          if (this.detectHorizontal && Math.abs(distX) > Math.abs(distY)) {
            touchsurface.style.left = (contentLeft + distX).toString() + 'px';
            touchsurface.style.top = contentTop.toString() + 'px';
          } else if (this.detectVertical) {
            touchsurface.style.top = (contentTop + distY).toString() + 'px';
            touchsurface.style.left = contentLeft.toString() + 'px';
          }
        }

        if (!(distY != 0 && hasVerticalScrollableParent)) {
          e.preventDefault();
        }
      },
      { passive: false },
    );

    touchsurface.addEventListener(
      'touchend',
      (e) => {
        if (!this.swipeActive) {
          return;
        }

        let swipedir = null;
        const touchobj = e.changedTouches[0];
        distX = touchobj.pageX - startX;
        distY = touchobj.pageY - startY;

        if (
          this.detectHorizontal &&
          Math.abs(distX) >= threshold &&
          Math.abs(distX) > Math.abs(distY)
        ) {
          swipedir = distX < 0 ? 'left' : 'right';
        } else if (
          this.detectVertical &&
          Math.abs(distY) >= threshold &&
          Math.abs(distY) > Math.abs(distX)
        ) {
          swipedir = distY < 0 ? 'up' : 'down';
        }

        if (swipedir) {
          if (swipedir == 'left') {
            this.swipe(swipedir, this.navigationService.navigateRight().route);
          } else if (swipedir == 'right') {
            this.swipe(swipedir, this.navigationService.navigateLeft().route);
          }
        } else {
          this.resetswipes(touchsurface);
        }
      },
      { passive: false },
    );
  }

  private resetswipes(el: HTMLElement) {
    el.style.position = 'inherit';
    el.style.left = 'inherit';
    el.style.top = 'inherit';
    el.classList.remove('swipeleftin');
    el.classList.remove('swiping');
    el.classList.remove('swiperightin');
    el.classList.remove('swipeupin');
    el.classList.remove('swipedownin');
    el.classList.remove('swipeleft');
    el.classList.remove('swiperight');
    el.classList.remove('swipeup');
    el.classList.remove('swipedown');

    const touchsurface = this.getTouchSurface(),
      html = document.documentElement;
    touchsurface.style.position = '';
    html.style.position = '';
  }
}
