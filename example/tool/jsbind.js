var conv = require("dukbind");

var mod = {

//return 
convert:function(src, idls){
	var ret = "";
	for(var i=0;i<idls.length;i++){
		var iface = idls[i]; 
		if(iface.type == "struct"){		
			ret += conv.convertDukStruct(iface);
		}else{
			ret += conv.convertDukInterface(iface);		
		}
	}
	return ret;
}

};

module.exports = mod;

