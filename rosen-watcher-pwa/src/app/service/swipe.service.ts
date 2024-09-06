import { Injectable } from '@angular/core';
import { EventService, EventType } from './event.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class SwipeService {
  private detectHorizontal = true;
  private detectVertical = false;
  private currentNavigationLeft = 'main';
  private currentNavigationRight = 'main';
  private swipeActive = false;

  constructor(
    eventService: EventService,
    private router: Router,
  ) {
    this.registerSwipeDetect();


    eventService.subscribeToEvent(EventType.SwipeActivated,  () => {
      console.log('swipe activated');
      this.swipeActive = true;
    });

    eventService.subscribeToEvent(EventType.SwipeDeActivated,  () =>  {
      console.log('swipe deactivated');
      this.swipeActive = false;
    });
  }

  async navigate(route: string) {
    await this.router.navigate([route]);
  }

  swipe(swipedir: string, route: string) {
    
    this.currentNavigationLeft = route;
    this.currentNavigationRight = route;
    const touchsurface = document.body;
    touchsurface.classList.add('swiping');
    const body = document.body,
      html = document.documentElement;

    body.style.position = 'fixed';
    html.style.position = 'fixed';

    
    if (swipedir == 'left') {
      touchsurface.classList.add('swipeleft');

      setTimeout( () => {
        touchsurface.classList.remove('swipeleft');
        touchsurface.style.left = '100vw';
        this.navigate(route);

        setTimeout(() => {
          touchsurface.classList.add('swipeleftin');
        }, 25);

        setTimeout(() => {
          this.resetswipes(touchsurface);
        }, 250);
      }, 250);
    } else if (swipedir == 'right') {
      touchsurface.classList.add('swiperight');

      setTimeout(() => {
        touchsurface.classList.remove('swiperight');
        touchsurface.style.left = '-100vw';
        this.navigate(route);

        setTimeout(function () {
          touchsurface.classList.add('swiperightin');
        }, 25);

        setTimeout(() => {
          this.resetswipes(touchsurface);
        }, 250);
      }, 250);
    } else if (swipedir == 'up') {
      touchsurface.classList.add('swipeup');

      setTimeout(() => {
        touchsurface.classList.remove('swipeup');
        touchsurface.style.top = '100vh';
        this.navigate(route);

        setTimeout(function () {
          touchsurface.classList.add('swipeupin');
        }, 25);

        setTimeout(() => {
          this.resetswipes(touchsurface);
        }, 250);
      }, 250);
    } else if (swipedir == 'down') {
      touchsurface.classList.add('swipedown');

      setTimeout(() => {
        touchsurface.classList.remove('swipedown');
        touchsurface.style.top = '-100vh';
        this.navigate(route);

        setTimeout(function () {
          touchsurface.classList.add('swipedownin');
        }, 25);

        setTimeout(() => {
          this.resetswipes(touchsurface);
        }, 250);
      }, 250);
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

  public swipeDetect(routeleft: string, routeRight: string) {
    this.currentNavigationLeft = routeleft;
    this.currentNavigationRight = routeRight;
  }

  public registerSwipeDetect() {
    const threshold = 10,
      body = document.body,
      html = document.documentElement;
    let startX: number,
      startY: number,
      distX: number,
      distY: number,
      contentLeft: number,
      contentTop: number;

    body.addEventListener(
      'touchstart',
      (e) => {
        if (!this.swipeActive) {
          return;
        }

        body.style.position = 'fixed';
        html.style.position = 'fixed';
        contentLeft = body.offsetLeft;
        contentTop = body.offsetTop;
        const touchobj = e.changedTouches[0];
        distX = 0;
        distY = 0;
        startX = touchobj.pageX;
        startY = touchobj.pageY;
      },
      { passive: false },
    );

    body.addEventListener(
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
            body.style.left = (contentLeft + distX).toString() + 'px';
            body.style.top = contentTop.toString() + 'px';
          } else if (this.detectVertical) {
            body.style.top = (contentTop + distY).toString() + 'px';
            body.style.left = contentLeft.toString() + 'px';
          }
        }

        if (!(distY != 0 && hasVerticalScrollableParent)) {
          e.preventDefault();
        }
      },
      { passive: false },
    );

    body.addEventListener(
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
            this.swipe(swipedir, this.currentNavigationLeft);
          } else if (swipedir == 'right') {
            this.swipe(swipedir, this.currentNavigationRight);
          }
        } else {
          this.resetswipes(body);
        }
      },
      { passive: false },
    );
  }

  private resetswipes(el: HTMLElement) {
    el.style.position = 'inherit';
    el.style.left = 'inherit';
    el.style.top = 'inherit';
    el.style.width = 'inherit';
    el.style.height = 'inherit';
    el.classList.remove('swipeleftin');
    el.classList.remove('swiping');
    el.classList.remove('swiperightin');
    el.classList.remove('swipeupin');
    el.classList.remove('swipedownin');
    el.classList.remove('swipeleft');
    el.classList.remove('swiperight');
    el.classList.remove('swipeup');
    el.classList.remove('swipedown');

    const body = document.body,
      html = document.documentElement;
    body.style.position = '';
    html.style.position = '';
  }
}
