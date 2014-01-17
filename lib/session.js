function Session(nick) {
	if (nick.length > 50) {
		return;
	}

	if (!/^[a-zA-Z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF\u4E00-\u9FA5]+$/.test(unescape(nick.replace(/\\/g, "%")))) {

		return;
	}
	
	this.nick = nick;
	// this.id = Math.floor(Math.random() * 1e10).toString();
	this.id= this.UUID();
	this.timestamp = new Date();
}

Session.prototype.poke = function() {
	this.timestamp = new Date();
};
Session.prototype.UUID = function(length) {
	// body...
	var id = (+(Date.now())).toString(16);
	length= length && length-id.length || 32-id.length;
	while(length--)
		id +=Math.round(Math.random()*16).toString(16);
	return id;
};

exports.Session = Session;
