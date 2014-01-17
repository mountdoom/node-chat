function User(id){

	if(id)
		this.SetCookie("uuid", id);
	else
		id= this.GetCookie("uuid");

	this.id= id;
	return this;
}

User.prototype.SetCookie = function(name,value) {
	// body...
	var Days = 1; //此 cookie 将被保存 30 天
    var exp  = new Date();    //new Date("December 31, 9998");
    exp.setTime(exp.getTime() + Days*24*60*60*1000);
    document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString();

};
User.prototype.GetCookie = function(name) {
	// body...
	var arr = document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"));
    if(arr != null) return unescape(arr[2]); return null;
};
User.prototype.DelCookie = function(name) {
	// body...
	var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval=this.GetCookie(name);
    if(cval!=null) document.cookie= name + "="+cval+";expires="+exp.toGMTString();
};

User.prototype.UUID= function(length){
	var id = (+(Date.now())).toString(16);
	length= length && length-id.length || 32-id.length;
	while(length--)
		id +=Math.round(Math.random()*16).toString(16);
	return id;
}