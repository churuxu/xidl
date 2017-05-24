function getDefaultValue(typestr){
	if (typestr == "int"){
		return "0";
	}else if(typestr == "bool"){
		return "false";
	}
	return "";
}

function typeToCXX(typestr,isarg){
	if (typestr == "int"){
		return "int";
	}else if(typestr == "bool"){
		return "bool";
	}else if(typestr == "string"){
		return isarg?"const char*":"std::string";
	}else if (typestr == "void"){
		return "void";
	}
	return typestr + "Ptr";
}


function convertStruct(iface){
	var defaultValue = "";	
	var memberField = "";
	
	for(var i=0;i<iface.attributes.length; i++){
		var attr = iface.attributes[i];		
		var value = getDefaultValue(attr.type);
		if(value.length){
			defaultValue += `        ${attr.name} = ${value};\n`;
		}
		memberField += `    ${typeToCXX(attr.type,false)} ${attr.name};\n`;		
	}
	
	var ret = "";
	ret += `#pragma once\n`;
	ret += `\n`;
	ret += `class ${iface.name} {\n`;
	ret += `public:\n`;
	ret += `    ${iface.name}(){\n`;
	ret += defaultValue;
	ret += `    }\n`;
	ret += `\n`;
	ret += memberField;
	ret += `};\n`;
    ret += `\n`;
	ret += `typedef std::shared_ptr<${iface.name}> ${iface.name}Ptr;\n`;		
	ret += `\n`;
	return ret;
}

function convertFunction(func){
	var hasarg = false;
	var ret = "";
	ret += "static ";
	ret += typeToCXX(func.type,false);
	ret += " ";
	ret += func.name;
	ret += "(";
	for(var i=0; i<func.arguments.length; i++){
		var arg = func.arguments[i];
		if(!hasarg){
			hasarg = true;
		}else{
			ret += ",";
		}
		ret += typeToCXX(arg.type,true);
		ret += " ";
		ret += arg.name;
	}	
	ret += ");\n";
	return ret;
}

function convertInterface(iface){
	var ret = "";
	ret += "#pragma once\n";
	ret += "\n";
	ret += ("class " + iface.name + "{\n");
	ret += "public:\n";
	
	for(var i=0;i<iface.operations.length; i++){
		var func = iface.operations[i];		
		ret += convertFunction(func);	
		ret += "\n";		
	}
	ret += "};\n";
	return ret;	
}

var mod = {

//return 
convert:function(src, idls){
	
	var iface = idls[0]; 
	if(iface.type == "struct"){		
		return convertStruct(iface);
	}else{
		return convertInterface(iface);		
	}					
}

};

module.exports = mod;

