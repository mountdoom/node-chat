(function($) {

var nodeChat = (window.nodeChat = {
	connect: function(basePath) {
		return new Channel(basePath);
	}
});

function Channel(basePath) {
	this.basePath = basePath;
	bindAll(this);
}


$.extend(Channel.prototype, {
	pollingErrors: 0,
	lastMessageId: 0,
	id: null,
	
	request: function(url, options) {
		var channel = this;
		$.ajax($.extend({
			url: this.basePath + url,
			cache: false,
			dataType: "json"
		}, options));
	},
	
	poll: function() {
		if (this.pollingErrors > 2) {
			$(this).triggerHandler("connectionerror");
			return;
		}
		var channel = this;
		this.request("/recv", {
			data: {
				since: this.lastMessageId,
				id: this.id
			},
			success: function(data) {
				if (data) {
					channel.handlePoll(data);
				} else {
					channel.handlePollError();
				}
			},
			error: this.handlePollError
		});
	},
	
	handlePoll: function(data) {
		this.pollingErrors = 0;
		var channel = this;
		if (data && data.messages) {
			$.each(data.messages, function(i, message) {
				channel.lastMessageId = Math.max(channel.lastMessageId, message.id);
				$(channel).triggerHandler(message.type, message);
			});
		}
		this.poll();
	},
	
	handlePollError: function() {
		this.pollingErrors++;
		setTimeout(this.poll, 10*1000);
	}

});

$.extend(Channel.prototype, {
	join: function(nick, options) {
		var channel = this;
		this.request("/join", {
			data: {
				nick: nick
			},
			success: function(data) {
				if (!data) {
					(options.error || $.noop)();
					return;
				}
				channel.id = data.id;
				channel.since = data.since;
				channel.poll();
				var user= new User(channel.id);
				
				(options.success || $.noop)();
			},
			error: options.error || $.noop
		});
	},
	
	login: function(uuid, options){
		var channel = this;
		this.request("/login", {
			data: { uuid: uuid },
			success: function(data) {
				if (!data) {
					(options.error || $.noop)();
					return;
				}
				channel.id = data.id;
				channel.since = data.since;
				channel.poll();
				var user= new User(channel.id);
				
				(options.success || $.noop)();
			},
			error: options.error || $.noop
		});
	},

	logout: function(uuid, options){
		var channel = this;
		this.request("/logout", {
			data: { uuid: uuid },
			success: function(data) {
				if (!data) {
					(options.error || $.noop)();
					return;
				}
				(options.success || $.noop)();
			},
			error: options.error || $.noop
		});
	},

	part: function() {
		if (!this.id) { return; }
		this.request("/part", {
			data: { id: this.id }
		});
	},
	
	send: function(msg) {
		if (!this.id) { return; }
		// TODO: use POST
		this.request("/send", {
			data: {
				id: this.id,
				text: msg
			}
		});
	},
	
	who: function() {
		if (!this.id) { return; }
		this.request("/who", {
			success: function(data) {
				var users = $("#users");
				$.each(data.nicks, function(i, nick) {
					users.append("<li>" + nick + "</li>");
				});
			}
		});
	},

	upload: function(file){
		if (!this.id) { return; }
		this.request("/upload", {
			data: {
				id: this.id,
				file: file
			}
			, type:"POST"
		});
	}
});

function bind(fn, context) {
	return function() {
		return fn.apply(context, arguments);
	};
}
function bindAll(obj) {
	for (var prop in obj) {
		if ($.isFunction(obj[prop])) {
			obj[prop] = bind(obj[prop], obj);
		}
	}
}

})(jQuery);
