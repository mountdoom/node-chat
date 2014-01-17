$(document).ready(function() {
	BOX_WIDTH = $('#frame').width() - 200;

	var color = new Array('#ff0', '#f00', '#000', '#00f', '#0ff');
	if(window.DeviceMotionEvent) {
		var speed = 25;
		var x = y = z = lastX = lastY = lastZ = 0;
		window.addEventListener('devicemotion', function(){
			var acceleration =event.accelerationIncludingGravity;
			x = acceleration.x;
			y = acceleration.y;
			if(Math.abs(x-lastX) > speed || Math.abs(y-lastY) > speed) {
				document.body.style.backgroundColor = color[Math.round(Math.random()*10)%6];

				// SEND COLOR
				$('[name="message"]').val(':' + parseInt(Math.random()*(209)+1));
				$('[name="message"]').submit();
			}
			lastX = x;
			lastY = y;
		}, false);
	}
});