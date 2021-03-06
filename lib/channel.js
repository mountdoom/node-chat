var EventEmitter = require("events").EventEmitter,
	sys = require("sys"),
	Session = require("./session").Session;

var UNICODE= {
	to: function(string){
		if(string)
			return escape(string).replace(/%/g,"\\").toLowerCase();
		else
			return ""
	},
	un: function(string){
		if(string)
			return unescape(string.replace(/\\/g, "%"))
		else
			return ""
	}
}

function Channel(options) {
	EventEmitter.call(this);

	if (!options || !options.basePath) {
		return false;
	}

	this.basePath = options.basePath;
	this.messageBacklog = parseInt(options.messageBacklog) || 100;
	this.sessionTimeout = (parseInt(options.sessionTimeout) || 20) * 1000;

	this.nextMessageId = 0;
	this.messages = [];
	this.callbacks = [];
	this.sessions = {};
	this.onlineNumber= 0;
	var channel = this;
	setInterval(function() {
		channel.flushCallbacks();
		channel.expireOldSessions();
		channel.appendMessage("", "online", channel.onlineNumber);
	}, 1000);
	setInterval(function() {
		channel.onlineNumber= 0;
		for(var i in channel.sessions){
			channel.onlineNumber++;
		}
	}, 60000);
}
sys.inherits(Channel, EventEmitter);

extend(Channel.prototype, {
	appendMessage: function(nick, type, text) {
		var id = ++this.nextMessageId,
			message = {
				id: id,
				nick: nick,
				type: type,
				text: text,
				timestamp: (new Date()).getTime()
			};

		if(message.nick && message.text && !/^</.test(UNICODE.un(message.text)) && !/^>/.test(UNICODE.un(message.text))){
			this.messages.push(message);
		}
		this.emit(type, message);

		while (this.callbacks.length > 0) {
			this.callbacks.shift().callback([message]);
		}

		while (this.messages.length > this.messageBacklog) {
			this.messages.shift();
		}

		return id;
	},

	query: function(since, callback) {
		var matching = [],
			length = this.messages.length;
		for (var i = 0; i < length; i++) {
			if (this.messages[i].id > since) {
				matching = this.messages.slice(i);
				break;
			}
		}

		if (matching.length) {
			callback(matching);
		} else {
			this.callbacks.push({
				timestamp: new Date(),
				callback: callback
			});
		}
	},

	flushCallbacks: function() {
		var now = new Date();
		while (this.callbacks.length && now - this.callbacks[0].timestamp > this.sessionTimeout * 0.75) {
			this.callbacks.shift().callback([]);
		}
	},

	createSession: function(nick) {
		var session = new Session(nick);
		if (!session) {
			return;
		}

		// nick = nick.toLowerCase();
		for (var i in this.sessions) {
			if (this.sessions[i].nick && this.sessions[i].nick.toLowerCase() === nick) {
				return;
			}
		}
		this.onlineNumber++;
		this.sessions[session.id] = session;
		session.since = this.appendMessage(nick, "join");

		return session;
	},

	getSession: function(uuid){
		if (!uuid || !this.sessions[uuid]) {
			return false;
		}

		return this.sessions[uuid];
	},

	destroySession: function(id) {
		if (!id || !this.sessions[id]) {
			return false;
		}
		this.onlineNumber--;
		var eventId = this.appendMessage(this.sessions[id].nick, "part");
		delete this.sessions[id];
		return eventId;
	},

	expireOldSessions: function() {
		var now = new Date();
		for (var session in this.sessions) {
			if (now - this.sessions[session].timestamp > this.sessionTimeout) {
				this.destroySession(session);
			}
		}
	},

	ForOnlineNumber: function(){
		var number = 0;
		for(var id in this.sessions){
			number++;
		}
		return number;
	}
});

exports.Channel = Channel;



function extend(obj, props) {
	for (var prop in props) {
		obj[prop] = props[prop];
	}
}
