var secret = function(msg) {
	if (msg.indexOf('line:') === 0) {
		return {
			img: 'funny/line_' + msg.substr(5) + '.png'
		};
	}

	return msg;
};

var popBox = function(id) {

};