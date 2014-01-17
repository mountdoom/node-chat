var router = require("./router"),
	url = require("url"),
	qs = require("querystring"),
	Channel = require("./channel").Channel;


var fs = require('fs'),
	gm = require('gm'),
	im = gm.subClass({ imageMagick: true }),
	fileRegexp = /^data:image\/(\w+);base64,/;


function cropImage(path, targetWidth, targetHeight, callback) {
	im(path).resize(targetWidth).autoOrient().write(path, function (err, result) {
		callback(err, result);
	});
}


function Server() {
	this.httpServer = router.createServer();
	this.channels = [];
}

extend(Server.prototype, {
	listen: function(port, host) {
		this.httpServer.listen(port, host);
	},
	
	passThru: function(path, handler) {
		this.httpServer.get(path, handler);
	},
	
	addChannel: function(options) {
		var httpServer = this.httpServer,
			channel = new Channel(options);
		
		if (!channel) {
			return false;
		}
		
		this.channels.push(channel);
		
		handlers.forEach(function(handler) {
			httpServer.get(channel.basePath + handler.path,
				handler.handler.partial(channel));
		});
		
		return channel;
	}
});

exports.createServer = function() {
	return new Server();
};



var handlers = [
	{ path: "/who", handler: function(channel, request, response) {
		var nicks = [];
		for (var id in channel.sessions) {
			nicks.push(channel.sessions[id].nick);
		}
		response.simpleJSON(200, { nicks: nicks });
	} },
	{ path: "/join", handler: function(channel, request, response) {
		var nick = qs.parse(url.parse(request.url).query).nick;
		if (!nick) {
			response.simpleJSON(400, { error: "bad nick." });
			return;
		}
		var session = channel.createSession(nick);
		if (!session) {
			response.simpleJSON(400, { error: "nick in use." });
			return;
		}
		
		response.simpleJSON(200, { id: session.id, nick: nick, since: session.since });
	} },
	{ path: "/logout", handler: function(channel, request, response){
		var uuid = qs.parse(url.parse(request.url).query).uuid;
		if (!uuid) {
			response.simpleJSON(400, { error: "no uuid." });
			return;
		}
		var session = channel.getSession(uuid);
		if (!session) {
			response.simpleJSON(400, { error: "no uuid." });
			return;
		}

		response.simpleJSON(200, { id: session.id, nick: session.nick, since: session.since });

		channel.destroySession(uuid);

	} },
	{ path: "/login", handler: function(channel, request, response){
		var uuid = qs.parse(url.parse(request.url).query).uuid;
		if (!uuid) {
			response.simpleJSON(400, { error: "no uuid." });
			return;
		}
		var session = channel.getSession(uuid);
		if (!session) {
			response.simpleJSON(400, { error: "no uuid." });
			return;
		}

		// console.log("server login", uuid)
		// var id = channel.appendMessage(session.nick, "login", text);
		response.simpleJSON(200, { id: session.id, nick: session.nick, since: session.since });

	} },
	{ path: "/part", handler: function(channel, request, response) {
		var id = qs.parse(url.parse(request.url).query).id;
		
		var eventId = channel.destroySession(id);
		response.simpleJSON(200, { id: eventId });
	} },
	{ path: "/recv", handler: function(channel, request, response) {
		var query = qs.parse(url.parse(request.url).query),
			since = parseInt(query.since, 10),
			session = channel.sessions[query.id];
		
		if (!session) {
			response.simpleJSON(400, { error: "No such session id." });
			return;
		}
		
		if (isNaN(since)) {
			response.simpleJSON(400, { error: "Must supply since parameter." });
			return;
		}
		
		session.poke();
		channel.query(since, function(messages) {
			session.poke();
			response.simpleJSON(200, { messages: messages });
		});
	} },
	{ path: "/send", handler: function(channel, request, response) {

		var query = qs.parse(url.parse(request.url).query),
			text = query.text,
			session = channel.sessions[query.id];
		
		if (!session) {
			response.simpleJSON(400, { error: "No such session id." });
			return;
		}
		
		if (!text || !text.length) {
			response.simpleJSON(400, { error: "Must supply text parameter." });
			return;
		}
		
		session.poke();
		var id = channel.appendMessage(session.nick, "msg", text);
		response.simpleJSON(200, { id: id });
	} },
	{ path: "/upload", handler: function(channel, request, response){
		var query = qs.parse(url.parse(request.url).query);
		if(request.method === "POST")
			query= request.body;
		var session = channel.sessions[query.id],
			file= query.file;
		if (!session) {
			response.simpleJSON(400, { error: "No such session id." });
			return;
		}
		
		if (!file || !file.length) {
			response.simpleJSON(400, { error: "Must supply text parameter." });
			return;
		}
		
		var filetype = fileRegexp.exec(file)[1];
		var base64Data = file.replace(/^data:image\/\w+;base64,/, "");
   	 	var dataBuffer = new Buffer(base64Data, 'base64');
		var path = __dirname+ "/../mountdoom/upload/"+ ('00000000'+(Math.random()*100000000)).slice(-8).toString()+ "."+ filetype;
		var targetWidth = 400;
		var targetHeight = 300;
		var newBase64= "data:image/"+filetype+";base64,";
   	 	fs.writeFile(path, dataBuffer, function(err){
   	 		if(!err)
			cropImage(path, targetWidth, targetHeight, function(error, result){
				// console.log(result)
				if(!error)
					fs.readFile(path, function(fsError, data){
						if(!fsError){
							newBase64+= new Buffer(data).toString('base64')
							session.poke();
							var id = channel.appendMessage(session.nick, "file", newBase64);
							response.simpleJSON(200, { id: id });
						}
					})
			})
   	 	})

		
	}}
];



var slice = [].slice;
Function.prototype.partial = function() {
	var fn = this,
		args = slice.call(arguments);
	
	return function() {
		return fn.apply(this, args.concat(slice.call(arguments)));
	};
};

function extend(obj, props) {
	for (var prop in props) {
		obj[prop] = props[prop];
	}
}
