$(document).ready(function() {
	BOX_WIDTH = $('#frame').width() - 200;

	var color = new Array('#ff4d00', '#268f21', '#009cff', '#c1328e', '#006284', "#cb4b45", "#e03c8a");
	if (window.DeviceMotionEvent) {
		var speed = 30;
		var x = y = z = lastX = lastY = lastZ = 0;
		var lock= false;
		window.addEventListener('devicemotion', function() {
			var acceleration = event.accelerationIncludingGravity;
			x = acceleration.x;
			y = acceleration.y;
			if ((Math.abs(x - lastX) > speed || Math.abs(y - lastY) > speed) && !lock) {
				lock= true;
				document.body.style.backgroundColor = color[Math.floor(Math.random() * color.length)];
				// SEND COLOR
				$('[name="message"]').val(':' + parseInt(Math.random() * (209) + 1));
				$('[name="message"]').submit();
				setTimeout(function(){
					lock= false;
				}, 500)
			}
			lastX = x;
			lastY = y;
		}, false);
	}
});