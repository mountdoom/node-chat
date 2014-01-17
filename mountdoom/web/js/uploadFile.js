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
UploadFile.prototype.writeFile= function(base64){

}

