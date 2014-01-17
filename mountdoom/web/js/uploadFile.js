function UploadFile(){


}
UploadFile.prototype.readFile = function(file, callback) {
	// var file = this.files[0];
	if(!/image\/\w+/.test(file.type)){ 
			alert("请确保文件为图像类型");
			return false;
	}
	var reader = new FileReader();
	reader.readAsDataURL(file);
	reader.onload = function(e){
		var base64 = e.target.result;
		return callback(base64);
	}
};
UploadFile.prototype.zip= function(base64, callback){
	var proMaxHeight=100;
	var proMaxWidth=100;
	var image=new Image();
	image.src=base64;
	image.onload = function(){
		console.log(image.width, image.height)
		if(image.width>0&&image.height>0)
		{
			var rate=(proMaxWidth/image.width<proMaxHeight/image.height)?proMaxWidth/image.width:proMaxHeight/image.height;
			if(rate<=1)
			{
				// console.log(image.width, image.height)

				image.width=image.width*rate;
				image.height=image.height*rate
			}
			else
			{
				image.width=image.width;
				image.height=image.height;
			}
		}
		callback(image);
		
	};
	// image.onload(function(){
	// 	console.log()
	// 	callback(this);
	// });
}
