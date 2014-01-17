(function($) {

var title = document.title,
	colors  = ["green", "orange", "yellow", "red", "fuschia", "blue"],
	channel = nodeChat.connect("/chat"),
	log,
	message;
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
// TODO: handle connectionerror

$(function() {
	log = $("#chat-log");
	message = $("#message");
	
	// Add a button that can be easily styled
	$("<a></a>", {
		id: "submit",
		text: "说",
		href: "#",
		style: "right: 15px;",
		click: function(event) {
			event.preventDefault();
			$(this).closest("form").submit();
		}
	})
	.appendTo("#entry fieldset");
	
	// Add a message indicator when a nickname is clicked
	$("#users").delegate("a", "click", function() {
		message
			.val($(this).text() + ": " + message.val())
			.focus();
	});
});

// new message posted to channel
// - add to the chat log
$(channel).bind("msg", function(event, message) {
	message.text= UNICODE.un(message.text);
	message.nick= UNICODE.un(message.nick);
	var time = formatTime(message.timestamp),
		row = $("<div></div>")
			.addClass("chat-msg");
	
	$("<span></span>")
		.addClass("chat-time")
		.text(time)
		.appendTo(row);
	
	$("<span></span>")
		.addClass("chat-nick")
		.text(message.nick)
		.appendTo(row);
	
	$("<span></span>")
		.addClass("chat-text")
		.text(message.text)
		.appendTo(row);
		
	// !NOEVIL
	row.appendTo(log);
	row.css('width', BOX_WIDTH + 'px');
	row.find('.chat-text').css('width', $('#frame').width() - 50 + 'px');

	// font-size: 20px;
	// line-height: 30px;

	var _css_font_size,
		_css_line_height;
	
	if (message.text.length < 5) {
		_css_font_size = 100; 
		_css_line_height = 110; 
	} else
	if (message.text.length < 15) {
		_css_font_size = 75; 
		_css_line_height = 85; 
	} else
	if (message.text.length < 25) {
		_css_font_size = 50; 
		_css_line_height = 60; 
	} else
	if (message.text.length < 35) {
		_css_font_size = 35; 
		_css_line_height = 45; 
	} else {
		_css_font_size = 20; 
		_css_line_height = 30;
	}

	row.find('.chat-text').css({
		'font-size': _css_font_size + 'px',
		'line-height': _css_line_height + 'px'
	});
})
.bind("file", function(event, message){
	message.nick= UNICODE.un(message.nick);
	var time = formatTime(message.timestamp),
		row = $("<div></div>")
			.addClass("chat-file");
	
	$("<span></span>")
		.addClass("chat-time")
		.text(time)
		.appendTo(row);
	
	$("<span></span>")
		.addClass("chat-nick")
		.text(message.nick)
		.appendTo(row);
	
	$("<img></img>", {
		src: message.text
	}).addClass("chat-img")
	.appendTo(row);
		
	// !NOEVIL
	row.appendTo(log);
	row.css('width', BOX_WIDTH + 'px');
	row.find('.chat-text').css('width', $('#frame').width() - 50 + 'px');

	// font-size: 20px;
	// line-height: 30px;

	var _css_font_size,
		_css_line_height;
	
	if (message.text.length < 5) {
		_css_font_size = 100; 
		_css_line_height = 110; 
	} else
	if (message.text.length < 15) {
		_css_font_size = 75; 
		_css_line_height = 85; 
	} else
	if (message.text.length < 25) {
		_css_font_size = 50; 
		_css_line_height = 60; 
	} else
	if (message.text.length < 35) {
		_css_font_size = 35; 
		_css_line_height = 45; 
	} else {
		_css_font_size = 20; 
		_css_line_height = 30;
	}

	row.find('.chat-text').css({
		'font-size': _css_font_size + 'px',
		'line-height': _css_line_height + 'px'
	});
})
// another user joined the channel
// - add to the chat log
.bind("join", function(event, message) {
	message.text= UNICODE.un(message.text);
	message.nick= UNICODE.un(message.nick);
	var time = formatTime(message.timestamp),
		row = $("<div></div>")
			.addClass("chat-msg chat-system-msg");
	
	$("<span></span>")
		.addClass("chat-time")
		.text(time)
		.appendTo(row);
	
	$("<span></span>")
		.addClass("chat-nick")
		.text(message.nick)
		.appendTo(row);
	
	$("<span></span>")
		.addClass("chat-text")
		.text("joined the room")
		.appendTo(row);
	
	// row.appendTo(log);
})
// another user joined the channel
// - add to the user list
.bind("join", function(event, message) {
	message.text= UNICODE.un(message.text);
	message.nick= UNICODE.un(message.nick);
	var added = false,
		nick  = $("<a></a>", {
			"class": colors[0]
			, text: message.nick
			, href: "javascript:void(0);"
		});
	colors.push(colors.shift());
	$("#users > a").each(function() {
		if (message.nick == this.innerHTML) {
			added = true;
			return false;
		}
		if (message.nick < this.innerHTML) {
			added = true;
			nick.insertBefore(this);
			return false;
		}
	});
	if (!added) {
		$("#users").append(nick);
	}
})
// another user left the channel
// - add to the chat log
.bind("part", function(event, message) {
	message.text= UNICODE.un(message.text);
	message.nick= UNICODE.un(message.nick);
	var time = formatTime(message.timestamp),
		row = $("<div></div>")
			.addClass("chat-msg chat-system-msg");
	
	$("<span></span>")
		.addClass("chat-time")
		.text(time)
		.appendTo(row);
	
	$("<span></span>")
		.addClass("chat-nick")
		.text(message.nick)
		.appendTo(row);
	
	$("<span></span>")
		.addClass("chat-text")
		.text("left the room")
		.appendTo(row);
	
	// row.appendTo(log);
})
// another user left the channel
// - remove from the user list
.bind("part", function(event, message) {
	message.text= UNICODE.un(message.text);
	message.nick= UNICODE.un(message.nick);
	$("#users > a").each(function() {
		if (this.innerHTML == message.nick) {
			$(this).remove();
			return false;
		}
	});
})

// Auto scroll list to bottom
.bind("join part msg", function() {
	// auto scroll if we're within 50 pixels of the bottom
	if (log.scrollTop() + 50 >= log[0].scrollHeight - log.height()) {
		window.setTimeout(function() {
			log.scrollTop(log[0].scrollHeight);
		}, 10);
	}
})

// handle login (choosing a nick)
$(function() {
	
	var login = $("#login");
	function loginError(error) {
		login
			.addClass("error")
			.find("label")
				.text(error + " Please choose another:")
			.end()
			.find("input")
				.focus();
	}
	login.submit(function() {
		var nick = $.trim($("#nick").val());
		
		// TODO: move the check into nodechat.js
		if (!nick.length || !/^[a-zA-Z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF\u4E00-\u9FA5]+$/.test(nick)) {
			loginError("Invalid Nickname.");
			return false;
		}
		nick= UNICODE.to(nick);
		channel.join(nick, {
			success: function() {
				$("body")
					.removeClass("login")
					.addClass("channel");
				message.focus();
			},
			error: function() {
				loginError("Nickname in use.");
			}
		});
		
		return false;
	});
	login.find("input").focus();
});

// handle sending a message
$(function() {
	$("#channel form").submit(function() {
		var escapeMessage = escape(message.val()).replace(/%/g,"\\").toLowerCase(); 
		message.val("").focus();
		channel.send(escapeMessage);
		
		return false;
	});
});

//user-list
$(function(){
	$("#user-list").click(function(){
		// alert("user-list")
		$("#user-div").toggle(250);
	})
})

//upload file
$(function(){
	$(".upload-file-submit").click(function(){
		$("#upload-file").click();
	})
	$("#upload-file").change(function(){
		var uploadFile= new UploadFile();
		var files= this.files;
		var url = webkitURL.createObjectURL(files[0]);

		uploadFile.readFile(files[0], function(base64){
			channel.upload(base64);
			files= [];
		})
	})
})

// login
$(function(){
	var user = new User();
	var login = $("#login");
	function loginError(error) {
		login
			.addClass("error")
			.find("label")
				.text(error + " Please choose another:")
			.end()
			.find("input")
				.focus();
	}
	if(user.id){
		channel.login(user.id, {
			success: function(json) {
				$("body")
					.removeClass("login")
					.addClass("channel");
				message.focus();
			},
			error: function() {
				// loginError("Nickname in use.");
			}
		});
	}

})

//logout
$(function(){
	$("#logout").click(function(){
		var user = new User();
		if(user.id){
			channel.logout(user.id, {
				success: function() {
					user.DelCookie("uuid");
					location.reload();
				},
				error: function() {
					// loginError("Nickname in use.");
				}
			})
		}
	})
})

// update the page title to show if there are unread messages
$(function() {
	var focused = true,
		unread = 0;
	
	$(window)
		.blur(function() {
			focused = false;
		})
		.focus(function() {
			focused = true;
			unread = 0;
			document.title = title;
		});
	
	$(channel).bind("msg", function(event, message) {
		if (!focused) {
			unread++;
			document.title = "(" + unread + ") " + title;
		}
	});
});

// notify the chat server that we're leaving if we close the window
$(window).unload(function() {
	channel.part();
});

function formatTime(timestamp) {
	var date = new Date(timestamp),
		hours = date.getHours(),
		minutes = date.getMinutes(),
		ampm = "AM";
	
	if (hours > 12) {
		hours -= 12;
		ampm = "PM";
	}
	
	if (minutes < 10) {
		minutes = "0" + minutes;
	}
	
	return hours + ":" + minutes + " " + ampm;
}

})(jQuery);
