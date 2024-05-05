import { Injectable } from '@angular/core';
import { EventService, EventType } from './event.service';

@Injectable({
    providedIn: 'root'
})
export class SwipeService {

    private detectHorizontal: boolean = true;
    private detectVertical: boolean = false;

    constructor(private eventService: EventService) { }

    swipe(swipedir: any, touchsurface: any) {

        
        var me = this;
        if (swipedir == 'left') {
            
            touchsurface.classList.add("swipeleft");

            setTimeout(function () {

                touchsurface.classList.remove("swipeleft");
                touchsurface.style.left = '100vw';
                me.eventService.sendEvent(EventType.SwipeLeft);

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
                me.eventService.sendEvent(EventType.SwipeRight);

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

                setTimeout(function () {
                    touchsurface.classList.add("swipedownin");
                }, 25);

                setTimeout(function () {
                    me.resetswipes(touchsurface);
                }, 250);
            }, 250);
        }
    }

    public swipeDetect() {

        var me = this;
        var touchsurface = document.body,
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
            contentHeight: number

        touchsurface.addEventListener('touchstart', function (e) {

            contentLeft = touchsurface.offsetLeft;
            contentTop = touchsurface.offsetTop;
            contentWidth = touchsurface.offsetWidth;
            contentHeight = touchsurface.offsetHeight;
            touchsurface.style.position = 'fixed';
            var touchobj = e.changedTouches[0];
            swipedir = 'none';
            distX = 0;
            distY = 0;
            startX = touchobj.pageX;
            startY = touchobj.pageY;
            startTime = new Date().getTime(); 
        }, { passive: false })

        touchsurface.addEventListener('touchmove', function (e) {

            var touchobj = e.changedTouches[0]
            distX = touchobj.pageX - startX;
            distY = touchobj.pageY - startY; 

            if (Math.abs(distX) > 20 || Math.abs(distY) > 20) {

                if ( me.detectHorizontal &&  Math.abs(distX) > Math.abs(distY)) {
                    touchsurface.style.left = (contentLeft + distX).toString() + 'px';
                    touchsurface.style.top = contentTop.toString() + 'px';
                }
                else if(me.detectVertical){
                    touchsurface.style.top = (contentTop + distY).toString() + 'px';
                    touchsurface.style.left = contentLeft.toString() + 'px';
                }
            }
            e.preventDefault() 
        }, { passive: false })

        touchsurface.addEventListener('touchend', function (e) {
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
                me.swipe(swipedir, touchsurface);
            }
            else {
                me.resetswipes(touchsurface);
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
        el.classList.remove("swiperightin");
        el.classList.remove("swipeupin");
        el.classList.remove("swipedownin");
        el.classList.remove("swipeleft");
        el.classList.remove("swiperight");
        el.classList.remove("swipeup");
        el.classList.remove("swipedown");
    }
}