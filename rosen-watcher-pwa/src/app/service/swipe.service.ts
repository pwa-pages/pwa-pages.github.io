import { Injectable } from '@angular/core';
import { EventService } from './event.service';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class SwipeService {

    private detectHorizontal: boolean = true;
    private detectVertical: boolean = false;
    private currentNavigation = 'main';

    constructor(private eventService: EventService, private router: Router) {

        this.registerSwipeDetect();
    }

    async navigate(route: string) {
        await this.router.navigate([route]);
    }


    swipe(swipedir: any, route: string) {

        var me = this;
        this.currentNavigation = route;
        var touchsurface = document.body;
        touchsurface.classList.add("swiping");
        var body = document.body,
        html = document.documentElement;


        body.style.position = 'fixed';
        html.style.position = 'fixed';

        var me = this;
        if (swipedir == 'left') {

            touchsurface.classList.add("swipeleft");

            setTimeout(function () {

                touchsurface.classList.remove("swipeleft");
                touchsurface.style.left = '100vw';
                me.navigate(route);

                setTimeout(function () {
                    touchsurface.classList.add("swipeleftin");
                }, 25);

                setTimeout(function () {
                    me.resetswipes(touchsurface);
                }, 250);
            }, 250);
        }
        else if (swipedir == 'right') {

            touchsurface.classList.add("swiperight");

            setTimeout(function () {

                touchsurface.classList.remove("swiperight");
                touchsurface.style.left = '-100vw';
                me.navigate(route);

                setTimeout(function () {
                    touchsurface.classList.add("swiperightin");
                }, 25);

                setTimeout(function () {
                    me.resetswipes(touchsurface);
                }, 250);
            }, 250);
        }
        else if (swipedir == 'up') {
            touchsurface.classList.add("swipeup");

            setTimeout(function () {

                touchsurface.classList.remove("swipeup");
                touchsurface.style.top = '100vh';
                me.navigate(route);

                setTimeout(function () {
                    touchsurface.classList.add("swipeupin");
                }, 25);

                setTimeout(function () {
                    me.resetswipes(touchsurface);
                }, 250);
            }, 250);
        }
        else if (swipedir == 'down') {
            touchsurface.classList.add("swipedown");

            setTimeout(function () {

                touchsurface.classList.remove("swipedown");
                touchsurface.style.top = '-100vh';
                me.navigate(route);

                setTimeout(function () {
                    touchsurface.classList.add("swipedownin");
                }, 25);

                setTimeout(function () {
                    me.resetswipes(touchsurface);
                }, 250);
            }, 250);
        }
    }

    public swipeDetect(route: string) {
        this.currentNavigation = route;
    }

    public registerSwipeDetect() {

        var me = this;
        var body = document.body,
            html = document.documentElement,
            swipedir: any,
            startX: number,
            startY: number,
            distX: number,
            distY: number,
            threshold: any = 10,
            elapsedTime: any,
            startTime: any,
            contentLeft: number,
            contentTop: number,
            contentWidth: number,
            contentHeight: number;




        body.addEventListener('touchstart', function (e) {

            body.style.position = 'fixed';
            html.style.position = 'fixed';
            contentLeft = body.offsetLeft;
            contentTop = body.offsetTop;
            contentWidth = body.offsetWidth;
            contentHeight = body.offsetHeight;
            var touchobj = e.changedTouches[0];
            swipedir = 'none';
            distX = 0;
            distY = 0;
            startX = touchobj.pageX;
            startY = touchobj.pageY;
            startTime = new Date().getTime();
        }, { passive: false })

        body.addEventListener('touchmove', function (e) {

            var touchobj = e.changedTouches[0]
            distX = touchobj.pageX - startX;
            distY = touchobj.pageY - startY;

            if (Math.abs(distX) > 20 || Math.abs(distY) > 20) {

                if (me.detectHorizontal && Math.abs(distX) > Math.abs(distY)) {
                    body.style.left = (contentLeft + distX).toString() + 'px';
                    body.style.top = contentTop.toString() + 'px';
                }
                else if (me.detectVertical) {
                    body.style.top = (contentTop + distY).toString() + 'px';
                    body.style.left = contentLeft.toString() + 'px';
                }
            }
            e.preventDefault();
        }, { passive: false })

        body.addEventListener('touchend', function (e) {
            var swipedir = null;
            var touchobj = e.changedTouches[0]
            distX = touchobj.pageX - startX
            distY = touchobj.pageY - startY
            elapsedTime = new Date().getTime() - startTime
            if (me.detectHorizontal && Math.abs(distX) >= threshold && Math.abs(distX) > Math.abs(distY)) {
                swipedir = (distX < 0) ? 'left' : 'right'
            }
            else if (me.detectVertical && Math.abs(distY) >= threshold && Math.abs(distY) > Math.abs(distX)) {
                swipedir = (distY < 0) ? 'up' : 'down'
            }

            if (swipedir) {
                me.swipe(swipedir, me.currentNavigation);
            }
            else {
                me.resetswipes(body);
            }
        }, { passive: false })
    }

    private resetswipes(el: any) {
        el.style.position = 'inherit';
        el.style.left = 'inherit';
        el.style.top = 'inherit';
        el.style.width = 'inherit';
        el.style.height = 'inherit';
        el.classList.remove("swipeleftin");
        el.classList.remove("swiping");
        el.classList.remove("swiperightin");
        el.classList.remove("swipeupin");
        el.classList.remove("swipedownin");
        el.classList.remove("swipeleft");
        el.classList.remove("swiperight");
        el.classList.remove("swipeup");
        el.classList.remove("swipedown");

        var body = document.body,
        html = document.documentElement;
        body.style.position = '';
        html.style.position = '';
    }
}