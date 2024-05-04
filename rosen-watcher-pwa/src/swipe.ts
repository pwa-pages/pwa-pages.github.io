


function swipe(swipedir: any, touchsurface: any) {

	if (swipedir == 'left') {
		touchsurface.classList.add("swipeleft");

		setTimeout(function () {

			touchsurface.classList.remove("swipeleft");
			touchsurface.style.left = '100vw';

			setTimeout(function () {

				touchsurface.classList.add("swipeleftin");


			}, 25);


			//setPortfolioToUrl(portfolio);

			setTimeout(function () {

				resetswipes(touchsurface);


			}, 250);


		}, 250);
	}
	else if (swipedir == 'right') {
		touchsurface.classList.add("swiperight");

		setTimeout(function () {

			touchsurface.classList.remove("swiperight");
			touchsurface.style.left = '-100vw';

			setTimeout(function () {

				touchsurface.classList.add("swiperightin");


			}, 25);


			//setPortfolioToUrl(portfolio);

			setTimeout(function () {

				resetswipes(touchsurface);


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

				resetswipes(touchsurface);


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

				resetswipes(touchsurface);


			}, 250);


		}, 250);
	}

}


function swipedetect() {

	var touchsurface = document.body,
		swipedir:any,
		startX:number,
		startY:number,
		distX:number,
		distY:number,
		threshold:any = 10, //required min distance traveled to be considered swipe
		restraint:any = 10, // maximum distance allowed at the same time in perpendicular direction
		allowedTime:any = 300, // maximum time allowed to travel that distance
		elapsedTime:any,
		startTime:any,
		contentLeft:number,
		contentTop:number,
		contentWidth:number,
		contentHeight:number

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
		startTime = new Date().getTime(); // record time when finger first makes contact with surface
		//e.preventDefault();
	}, { passive: false })

	touchsurface.addEventListener('touchmove', function (e) {

		var touchobj = e.changedTouches[0]
		distX = touchobj.pageX - startX // get horizontal dist traveled by finger while in contact with surface
		distY = touchobj.pageY - startY // get vertical dist traveled by finger while in contact with surface

		if (Math.abs(distX) > 20 || Math.abs(distY) > 20) {

			if (Math.abs(distX) > Math.abs(distY)) {
				touchsurface.style.left = (contentLeft + distX).toString() + 'px';
				touchsurface.style.top = contentTop.toString() + 'px';

			}
			else {
				touchsurface.style.top = (contentTop + distY).toString() + 'px';
				console.log(distY + ' xxx ' + (contentTop + distY));
				touchsurface.style.left = contentLeft.toString() + 'px';
			}

		}






		e.preventDefault() // prevent scrolling when inside DIV
	}, { passive: false })



	touchsurface.addEventListener('touchend', function (e) {

		var swipedir = null;
		var touchobj = e.changedTouches[0]
		distX = touchobj.pageX - startX // get horizontal dist traveled by finger while in contact with surface
		distY = touchobj.pageY - startY // get vertical dist traveled by finger while in contact with surface
		elapsedTime = new Date().getTime() - startTime // get time elapsed
		if (Math.abs(distX) >= threshold && Math.abs(distX) > Math.abs(distY)) { // 2nd condition for horizontal swipe met
			swipedir = (distX < 0) ? 'left' : 'right' // if dist traveled is negative, it indicates left swipe
		}
		else if (Math.abs(distY) >= threshold && Math.abs(distY) > Math.abs(distX)) { // 2nd condition for vertical swipe met
			swipedir = (distY < 0) ? 'up' : 'down' // if dist traveled is negative, it indicates up swipe
		}

		if (swipedir) {
			swipe(swipedir, touchsurface);
		}
		else {
			resetswipes(touchsurface);
		}




		//e.preventDefault()
	}, { passive: false })
}

function resetswipes(el:any) {
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



swipedetect();