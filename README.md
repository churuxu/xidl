XIDL
===========
idl解析和转换工具，一般用于自动生成格式比较固定的代码，如多语言互调、对象序列化等


安装说明：
-----------
  安装nodejs，添加nodejs所在目录到PATH环境变量
  添加xidl所在目录到PATH环境变量

  
使用说明：
-----------
```
  xidl <template> <input> <output>
```
  - template 表示转换模板文件
  - input 表示输入文件或目录，如果是目录会转换该目录下的.idl文件
  - output 表示输出文件，如果input是目录，则output需要是带通配符文件名
    
  - 例如 xidl "cxxhead.js" "User.idl" "./out/User.h"
  - 例如 xidl "jsbind.js" "." "./out/*.cpp"
    

xidl实现原理：
-----------
1. xidl工具解析接口描述idl文件，得到接口描述的对象(JavaScript Object)   
2. 转换模板模块将js对象，转换成最终所需文件内容


- idl文件示例
```
interface ListView : View{
    //常量
    const int FLAG_VSCROLL = 1;
    const int FLAG_HSCROLL = 2;
    
    //属性
    string name;
    string text;
    
    //方法
    void SetBounds(int left, int top, int right, int bottom);    
    void SetVisible([optional]bool visible);
};
```


- 转换模版文件
  - 转换模版文件是一个nodejs模块，需实现一个convert()函数，用于转换代码。
  - 该函数原型如String convert(String src, Object[] interfaces)
    - src: idl文件内容
    - interfaces: idl解析结果js对象，包含一个或多个IDLInterface
    - 返回值: 生成文件的内容

    
- js对象属性参考
```

//其他对象的基类
IDLObject{
    string name;  //名称
    string type;   //类型 
    string extended;  //扩展属性,括号[]里面的内容    
};

//接口 
IDLInterface : IDLObject{
    string superName; //父接口
    array constants;  //常量
    array attributes; //属性
    array operations; //方法
};

//常量
IDLConstant : IDLObject{
    string value; //常量值
};

//属性
IDLAttribute: IDLObject{
    boolean isStatic;  //是否静态
    boolean isReadonly; //是否只读 
};

//方法（type=返回值类型）
IDLOperation: IDLObject{
    array arguments; //参数列表
    boolean isStatic; //是否静态   
};

//参数 
IDLArgument: IDLObject{ 
};

```


