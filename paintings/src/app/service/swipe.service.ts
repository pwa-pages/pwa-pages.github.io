import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { NavigationService } from "./navigation.service";

@Injectable({
  providedIn: "root",
})
export class SwipeService {
  private detectHorizontal = true;
  private detectVertical = false;
  private swipeActive = true;

  constructor(
    private navigationService: NavigationService,
    private router: Router,
  ) {
    this.registerSwipeDetect();
  }

  async navigate(route: string) {
    await this.router.navigate([route]);
  }

  getTouchSurface(): HTMLElement {
    return document.body.querySelector(
      ".single-painting-container",
    ) as HTMLElement;
  }

  getSpeed(): number {
    return 1;
  }

  swipe(swipedir: string, route: string) {
    const touchsurface = this.getTouchSurface();
    touchsurface.classList.add("swiping");

    if (swipedir == "left") {
      touchsurface.classList.add("swipeleft");

      setTimeout(() => {
        touchsurface.classList.remove("swipeleft");
        touchsurface.style.left = "100vw";
        this.navigate(route);

        setTimeout(() => {
          touchsurface.classList.add("swipeleftin");
        }, 25 * this.getSpeed());

        setTimeout(() => {
          this.resetswipes(touchsurface);
        }, 250 * this.getSpeed());
      }, 250 * this.getSpeed());
    } else if (swipedir == "right") {
      touchsurface.classList.add("swiperight");

      setTimeout(() => {
        touchsurface.classList.remove("swiperight");
        touchsurface.style.left = "-100vw";
        this.navigate(route);

        setTimeout(function () {
          touchsurface.classList.add("swiperightin");
        }, 25 * this.getSpeed());

        setTimeout(() => {
          this.resetswipes(touchsurface);
        }, 250 * this.getSpeed());
      }, 250 * this.getSpeed());
    }
  }

  public hasVerticalScrollableContainerClass(element: HTMLElement | null) {
    while (element) {
      if (
        element.classList &&
        element.classList.contains("verticalscrollablecontainer")
      ) {
        return true;
      }
      element = element.parentElement;
    }
    return false;
  }

  public registerSwipeDetect() {
    const threshold = 10,
      touchsurface = this.getTouchSurface();

    if (!touchsurface) {
      return;
    }
    let startX: number, startY: number, distX: number, distY: number;

    touchsurface.addEventListener(
      "touchstart",
      (e) => {
        if (!this.swipeActive) {
          return;
        }

        const touchobj = e.changedTouches[0];
        distX = 0;
        startX = touchobj.pageX;
        startY = touchobj.pageY;
      },
      { passive: false },
    );

    touchsurface.addEventListener(
      "touchmove",
      (e) => {
        if (!this.swipeActive) {
          return;
        }

        const hasVerticalScrollableParent =
          this.hasVerticalScrollableContainerClass(e.target as HTMLElement);

        const touchobj = e.changedTouches[0];
        distX = touchobj.pageX - startX;
        distY = touchobj.pageY - startY;

        if (Math.abs(distX) > 20 || Math.abs(distY) > 20) {
          if (this.detectHorizontal && Math.abs(distX) > Math.abs(distY)) {
            const position =
              document.documentElement.scrollTop ||
              document.body.scrollTop ||
              0;
            touchsurface.style.transform = `translateX(${distX}px) translateY(${position}px)`;
          }
        }

        if (!(distY != 0 && hasVerticalScrollableParent)) {
          e.preventDefault();
        }
      },
      { passive: false },
    );

    touchsurface.addEventListener(
      "touchend",
      (e) => {
        if (!this.swipeActive) {
          return;
        }

        touchsurface.style.removeProperty("transform");

        let swipedir = null;
        const touchobj = e.changedTouches[0];
        distX = touchobj.pageX - startX;
        distY = touchobj.pageY - startY;

        if (
          this.detectHorizontal &&
          Math.abs(distX) >= threshold &&
          Math.abs(distX) > Math.abs(distY)
        ) {
          swipedir = distX < 0 ? "left" : "right";
        } else if (
          this.detectVertical &&
          Math.abs(distY) >= threshold &&
          Math.abs(distY) > Math.abs(distX)
        ) {
          swipedir = distY < 0 ? "up" : "down";
        }

        if (swipedir) {
          if (swipedir == "left") {
            this.swipe(swipedir, this.navigationService.navigateRight());
          } else if (swipedir == "right") {
            this.swipe(swipedir, this.navigationService.navigateLeft());
          }
        } else {
          this.resetswipes(touchsurface);
        }
      },
      { passive: false },
    );
  }

  private resetswipes(el: HTMLElement) {
    el.style.left = "inherit";
    el.style.removeProperty("transform");

    el.classList.remove("swipeleftin");
    el.classList.remove("swiping");
    el.classList.remove("swiperightin");
    el.classList.remove("swipeupin");
    el.classList.remove("swipedownin");
    el.classList.remove("swipeleft");
    el.classList.remove("swiperight");
    el.classList.remove("swipeup");
    el.classList.remove("swipedown");
  }
}
