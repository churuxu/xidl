/* Copyright (C) 2017 churuxu 
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const fs = require('fs');
const path = require('path');
var input = "";
var output = "";
var template = "";
var xidldir = "";
function usage(){
    console.log('usage: xidl <template> <input> <output>');
}

process.argv.forEach((val, index, array) => {
    if(index == 2)xidldir = val;  
    if(index == 3)template = val;  
    if(index == 4)input = val;
    if(index == 5)output = val;
});

if(input.length == 0 ||output.length == 0 ||template.length == 0 ){
    usage();
    return;
}

var mod = null; 
if(fs.existsSync(template)){
    if(path.isAbsolute(template)){
        mod = require(template);
    }else{
        mod = require(process.cwd() + "/" + template);     
    }
}else{
    //tamplate muse be a node js module
	mod = require(template);
}

function /*String*/ readFileText(filename){
    var buf = fs.readFileSync(filename);
    if(buf[0]==0xEF && buf[1]==0xBB && buf[2]==0xBF){
        buf[0] = 0x20;
        buf[1] = 0x20;
        buf[2] = 0x20;
    }
    return buf.toString();
}

function /*void*/ saveFileText(filename, data){
    if(fs.existsSync(filename)){
        var buf = fs.readFileSync(filename);
        var str = buf.toString();
        if(data == str){
            return;
        }
    }else{
        if(!fs.existsSync(path.dirname(filename))){
            fs.mkdirSync(path.dirname(filename));
        }        
    }
    fs.writeFileSync(filename, data);
}

/*

IDLObject{
    string name;   
    string type;
    string comment;  
    string extended;    
};

IDLInterface : IDLObject{
    string superName;
    array constants; 
    array attributes;  
    array operations;
};

IDLConstant : IDLObject{
    string value;
};

IDLAttribute: IDLObject{
    boolean isStatic;
    boolean isReadonly;    
};

IDLOperation: IDLObject{
    array arguments;    
    boolean isStatic;   
};

IDLArgument: IDLObject{ 
};


WordToken{
    String word;     
    int next;
    int type;
    int curlen;    
};

*/

const CHAR_TYPE = [
//  0  1  2  3  4  5  6  7   8  9  a  b  c  d  e  f
	2, 0, 0, 0, 0, 0, 0, 0,  0, 1, 1, 0, 0, 1, 0, 0, //0
	0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, //1
	1, 0, 0, 0, 0, 0, 0, 0,  2, 2, 0, 0, 2, 0, 0, 2, //2
	0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 2, 2, 0, 2, 0, 0, //3
	0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, //4
	0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 2, 0, 2, 0, 0, //5
	0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, //6
	0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 2, 0, 2, 0, 0, //7
];

const CHAR_CODE_ENTER = 0x0A; //  \n
const CHAR_CODE_CROW = 0x0D; //  \r
const CHAR_CODE_SLASH = 0x2F; //  /
const CHAR_CODE_STAR = 0x2A;  //  *
const CHAR_CODE_LBRACKET  = 0x5B;  //  [
const CHAR_CODE_RBRACKET  = 0x5D;  //  ]
function /*boolean*/ nextWord(data, token){
    if(token.next == undefined){
        token.next = 0;
        token.word = "";
        token.curline = 1;
        token.type = "";
    }
    token.type = "";
    var next = token.next;
    var end = data.length;
    var ch = 0;
    var nch = 0;    
    var stop = false;
    var index1 = 0;

    
    //去除开头所有空格或空字符 
    while(!stop){
        ch = data.charCodeAt(next);
        if(ch == CHAR_CODE_ENTER)token.curline ++;
        if(next >= end){
           return false;
        }
        if(ch < 0xff && CHAR_TYPE[ch] == 1){
            next ++;
        }else{
            break;            
        }
    }
    
    if(stop)return false;
    index1 = next;
    nch = data.charCodeAt(next+1);

    //是[开头的，找到]为止
    if(ch == CHAR_CODE_LBRACKET){ 
        while(!stop){
			next ++;
            if(next >= end){
                stop = true;
                return false;
            }
            ch = data.charCodeAt(next);            
            if(ch == CHAR_CODE_ENTER)token.curline ++;
			if(ch == CHAR_CODE_RBRACKET){                
				token.next = next + 1;
                token.word = data.substring(index1, next + 1);
                token.type = "extended";
				return true;
			}			
        }     
    }  
    if(stop)return false;
    
    //如果是/*开头，找到*/位置
    if(ch == CHAR_CODE_SLASH && nch == CHAR_CODE_STAR){ 
        while(!stop){
            next ++;
            if(next >= end){
                stop = true;
                return false;
            } 
            ch = data.charCodeAt(next);
            nch = data.charCodeAt(next + 1);
            if(ch == CHAR_CODE_ENTER)token.curline ++;
			if(ch == CHAR_CODE_STAR && nch == CHAR_CODE_SLASH){
				token.next = next + 2;
                token.word = data.substring(index1, next + 2);
                token.type = "comment";
				return true;
			}            
        }    
    }    
    
    //如果是//开头，找到换行
    if(ch == CHAR_CODE_SLASH && nch == CHAR_CODE_SLASH){ 
        while(!stop){
            next ++;
            if(next >= end){
                token.curline ++;
				token.next = next + 1;
                token.word = data.substring(index1, next); 
                token.type = "comment";
                return true;
            } 
            ch = data.charCodeAt(next);
            if(ch == CHAR_CODE_ENTER){
                token.curline ++;
				token.next = next + 1;
                token.word = data.substring(index1, next); 
                token.type = "comment";
                return true;
            }          
        }    
    } 
    
    //是特殊字符，直接返回
    if(ch < 0xff && CHAR_TYPE[ch] == 2){        
        token.next = next + 1;
        token.word = data.charAt(next);
        return true;
    }  
    
    //普通的字符，找到空格或特殊字符为止
    while(!stop){
        next ++;
        if(next >= end){
 			token.next = next+1;
            token.word = data.substring(index1, next);
			return true;
        }
        ch = data.charCodeAt(next);	        
        if(ch < 0xff && CHAR_TYPE[ch] > 0){
 			token.next = next;
            token.word = data.substring(index1, next);
			return true;
        } 
        
    }
    return false;
};

//获取下一个非注释的词
function /*boolean*/ nextValidWord(data, token){
    while(nextWord(data, token)){
        if(token.type != "comment"){
            return true;
        }
    }
    return false;
}

//获取一组语句，直到分号;为止
function /*boolean*/ nextValidStatement(data, token, arr){
    while(nextWord(data, token)){
        if(token.word == "}")return false;
        if(token.word == ";")return true;
        if(token.type != "comment"){
            arr.push(token.word);
        }
    }
    return false;
}


//解析一个函数 int fn(int a)
function /*boolean*/ parseOperation(arr, func){    
    //func.isStatic = false;
    func.type = "";
    func.name = "";    
    func.arguments = new Array();
    var i = 0;
    while(true){
        var arg = new Object();
        i++;
        if(arr[i]=="("){            
            break;
        }        
        arg.name = arr[i];
        i++;
        arg.type = arr[i];
        i++;
        if(arr[i].charAt(0)=='['){
            arg.extended = arr[i];
            i++;
        }
        if(arr[i]==","){
            func.arguments.push(arg);
            continue;
        }
        if(arr[i]=="("){
            func.arguments.push(arg);
            break;
        }
        return false;
    }
    i++;
    func.name = arr[i];
    i++;
    func.type = arr[i];
    func.arguments.reverse();
    for(; i<arr.length; i++){        
        if(arr[i]=="static")func.isStatic = true;
        if(arr[i].charAt(0)=='[')func.extended = arr[i];
    }   
    return true;    
}

//解析一个常量 const int A = 123
function /*boolean*/ parseConstant(arr, cnst){
    cnst.type = "";
    cnst.name = "";
    if(arr.length < 5)return false;
    if(arr[1] != "=")return false;
    cnst.value = arr[0];
    cnst.name = arr[2];
    cnst.type = arr[3];
    if(arr.length>5 && arr[5].charAt(0)=='['){
        cnst.extended = arr[5];
    }
    return true;
}

//解析一个成员属性 static int a
function /*boolean*/ parseArrtibute(arr, attr){
    //attr.isReadonly = false;
    //attr.isStatic = false;
    attr.type = "";
    attr.name = "";    
    if(arr.length < 2)return false;
    attr.name = arr[0];
    attr.type = arr[1];
    for(var i=2; i<arr.length; i++){
        if(arr[i]=="readonly")attr.isReadonly = true;
        if(arr[i]=="static")attr.isStatic = true;
        if(arr[i].charAt(0)=='[')attr.extended = arr[i];
    }
    return true;
}

//解析一个成员
function /*boolean*/ parseMember(data, token, obj, member){    
    var arr = new Array();
    if(!nextValidStatement(data, token, arr))return false;    
    arr.reverse();    
    if(arr[0]==")"){        
        if(!parseOperation(arr, member))return false;
        obj.operations.push(member);
    }else if(arr.length>4 && arr[4]=="const"){
        if(!parseConstant(arr, member))return false;
        obj.constants.push(member);
    }else{
        if(!parseArrtibute(arr, member))return false;
        obj.attributes.push(member);
    } 
    return true;    
}

//解析一个interface  
function /*boolean*/ parseInterface(data, token, obj){
    obj.attributes = new Array();
    obj.operations = new Array();
    obj.constants = new Array();
    if(token.type == 'extended'){
        obj.extended = token.word;
        if(!nextValidWord(data, token))return false;
    }
    if(token.word == "interface" || token.word == "struct"){
        obj.type = token.word;
        if(!nextValidWord(data, token)){
            console.log("expect interface name");
            return false;
        }
        obj.name = token.word;
        if(!nextValidWord(data, token)){
            console.log("expect {");
            return false;
        }
        if(token.word == ":" ){
            if(!nextValidWord(data, token)){
                console.log("expect parent name");
                return false;
            }
            obj.superName = token.word;
            nextValidWord(data, token);
        }
        if(token.word != "{" ){
            console.log("expect {");
            return false;
        }
        while(true){
            var member = new Object();
            if(!parseMember(data, token, obj, member)){
                break;
            }
        }
        //console.log("w:"+token.word);
        if(token.word != "}" )return false;
        if(!nextValidWord(data, token))return true;
        if(token.word != ";")return false;
        return true;
    }
    //console.log(token.word);
    console.log("expect interface or struct");
    return false;
}


function /* array<IDLInterface> */ parseIDL(data){
    var result = new Array();  
    var token = new Object();    
    while(nextValidWord(data, token)){
        var iface = new Object();
        if(!parseInterface(data, token, iface)){
            return result;
        }
        //console.log("add iface");
        result.push(iface);        
    }
    return result;
    
}


function processFile(file, out){
	var data = readFileText(file);
	var res = parseIDL(data);
	var fdata = mod.convert(data, res);
	if(fdata.length){
		console.log(file +"\t-->\t" + out)
		saveFileText(out, fdata);
	}
}

function processDir(dir, out){
    var files = fs.readdirSync(dir);
	var outbase = path.basename(out);
	var outdir = path.dirname(out);
	files.forEach(function (filename) {
		if(path.extname(filename) == ".idl"){
			var infile = path.join(dir, filename);
		    var outfilename = outbase.replace("*", path.basename(filename,".idl"));			
			var outfile = path.join(outdir, outfilename);
			processFile(infile, outfile);
		} 
	});
}

if(fs.lstatSync(input).isDirectory()){
	processDir(input, output);
}else{
	processFile(input, output);
}


