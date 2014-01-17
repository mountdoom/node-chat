var funnyMap = {
	'干杯': 5,
	'啥': 6,
	'我草': 53,
	'我草': 53,
	'牛逼': 67,
	'额': 108,
	'哭': 135,
	'加油': 195,
	'蛋疼': 126,
	'...': 196,
	'。。。': 196,
	'喝多了': 134,
	'醉了': 134,
	'晕': 110,
};

var secret = function(msg) {
	if (msg.indexOf(':') === 0) {
		return {
			img: 'funny/line_' + msg.substr(1) + '.png'
		};
	}

	if (funnyMap[msg]) {
		return {
			img: 'funny/line_' + funnyMap[msg] + '.png'
		};
	}

	return msg;
};