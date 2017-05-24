
function convertGetExp(typestr, index){	
	if(typestr == "int"){
		return "duk_to_int(ctx," +index+ ");";
	}else if(typestr == "bool"){
		return "(duk_to_boolean(ctx," +index+ ")?true:false);";
	}else if(typestr == "string"){
		return "duk_to_string(ctx," +index+ ");";
	}else{
		return "JsTo" +typestr+ "(ctx," +index+ ");";
	}
}

function convertPushExp(typestr, val){	
	if(typestr == "int"){
		return "duk_push_int(ctx," +val+ ");";
	}else if(typestr == "bool"){
		return "duk_push_boolean(ctx," +val+ ");";
	}else if(typestr == "string"){
		return "duk_push_string(ctx," +val+ ".c_str());";
	}else if(typestr == "void"){
		return "duk_push_undefined(ctx);";
	}else{
		return "JsPush" +typestr+ "(ctx," +val+ ");";
	}
}

function convertStruct(iface){
	var pushprops = "";
	var getprops = "";
	for(var i=0;i<iface.attributes.length; i++){
		var attr = iface.attributes[i];		
		pushprops += "    "+convertPushExp(attr.type, "arg->"+attr.name)+"\n";
        pushprops += '    duk_put_prop_string(ctx, idx, "'+attr.name+'");\n';
		
		getprops += '        if (strcmp(key, "'+attr.name+'") == 0) {\n';
		getprops += ("            result->" +attr.name +" = " + convertGetExp(attr.type, "-1")+ "\n");
		getprops += '        }else\n'
	}	
	
	var ret = "";
	ret += "#pragma once\n";
	ret += "\n";
	ret += ('#include "'+iface.name+'.h"\n');    
	ret += "\n";    
	ret += ("static void JsPush" + iface.name + "(duk_context* ctx, "+ iface.name + "Ptr arg){\n");
	ret += "    if (!arg){ duk_push_null(ctx); return; }\n";
	ret += "    duk_idx_t idx = duk_push_object(ctx);\n";	
	ret += pushprops;
	ret += "}\n";
	ret += "\n";
	ret += ("static "+iface.name+"Ptr JsTo"+iface.name+"(duk_context* ctx, int index){\n");
	ret += ("    "+iface.name+"Ptr result = std::make_shared<"+iface.name+">();\n");
	ret += ("    const char* key;\n");
	ret += ("    duk_enum(ctx, index, 0);\n");
	ret += ("    while (duk_next(ctx, -1, 1)) {\n");
	ret += ("	     key = duk_to_string(ctx, -2);\n");
	ret += getprops;	
	ret += ("	     { }\n");		
	ret += ("	     duk_pop_2(ctx);\n");
	ret += ("    }\n");
	ret += ("    duk_pop(ctx);\n");
	ret += ("    return result;\n");
	ret += "}\n";
	ret += "\n";
	
	return ret;
}

function getFuncName(ifacename, func){
	return "js_"+ ifacename + "_" + func.name;
}

function convertFunction(ifacename, func){
	var args = "(";
	var ret = "";
	ret += ("static duk_ret_t "+getFuncName(ifacename,func)+"(duk_context* ctx){\n");
	for(var i=0;i<func.arguments.length;i++){
		var arg = func.arguments[i];
		ret += ("    auto arg"+i+" = "+ convertGetExp(arg.type, i) +"\n");
		if(i>0)args += ",";
		args += ("arg" + i);
	}
	if(func.type != "void"){
		ret += ("    auto ret = ");
	}
	ret += (ifacename+"::"+func.name + args+");\n");
	if(func.type != "void"){
		ret += ("    " + convertPushExp(func.type, "ret")+"\n");
		ret += ("    return 1;\n");
	}else{
		ret += ("    return 0;\n");
	}
	ret += ("}\n");
	ret += ("\n");
	return ret;
}


function convertInterface(iface){
	var funlist = "";
	
	var ret = "";
	ret += "#pragma once\n";
	ret += "\n";
	ret += ('#include "'+iface.name+'.h"\n');    
	ret += "\n"; 
	for(var i=0;i<iface.operations.length; i++){
		var func = iface.operations[i];		
		ret += convertFunction(iface.name, func);	
		
		funlist	+= ('    {"'+func.name+'",'+getFuncName(iface.name, func)+','+func.arguments.length+'},\n');
	}
	
	ret += "\n";
	ret += ("static const duk_function_list_entry "+iface.name+"API[] = {\n");
	ret += funlist;
	ret += "	{NULL, NULL, 0}\n";
	ret += "};\n";
	ret += "\n";
	ret += ("static void Init"+iface.name+"API(duk_context* ctx) {\n");
	ret += ("    duk_push_global_object(ctx);\n");
	ret += ("    duk_push_object(ctx);\n");
	ret += ("    duk_put_function_list(ctx, -1, "+iface.name+"API);\n");
	ret += ('    duk_put_prop_string(ctx, -2, "'+iface.name+'");\n');
	ret += ("    duk_pop(ctx);\n");
	ret += ("}\n");
	ret += "\n";
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