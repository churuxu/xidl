XIDL
===========
idl������ת�����ߣ�һ�������Զ����ɸ�ʽ�ȽϹ̶��Ĵ��룬������Ի������������л���


��װ˵����
-----------
  ��װnodejs�����nodejs����Ŀ¼��PATH��������
  ���xidl����Ŀ¼��PATH��������

  
ʹ��˵����
-----------
```
  xidl <template> <input> <output>
```
  - template ��ʾת��ģ���ļ�
  - input ��ʾ�����ļ���Ŀ¼�������Ŀ¼��ת����Ŀ¼�µ�.idl�ļ�
  - output ��ʾ����ļ������input��Ŀ¼����output��Ҫ�Ǵ�ͨ����ļ���
    
  - ���� xidl "cxxhead.js" "User.idl" "./out/User.h"
  - ���� xidl "jsbind.js" "." "./out/*.cpp"
    

xidlʵ��ԭ��
-----------
1. xidl���߽����ӿ�����idl�ļ����õ��ӿ������Ķ���(JavaScript Object)   
2. ת��ģ��ģ�齫js����ת�������������ļ�����


- idl�ļ�ʾ��
```
interface ListView : View{
    //����
    const int FLAG_VSCROLL = 1;
    const int FLAG_HSCROLL = 2;
    
    //����
    string name;
    string text;
    
    //����
    void SetBounds(int left, int top, int right, int bottom);    
    void SetVisible([optional]bool visible);
};
```


- ת��ģ���ļ�
  - ת��ģ���ļ���һ��nodejsģ�飬��ʵ��һ��convert()����������ת�����롣
  - �ú���ԭ����String convert(String src, Object[] interfaces)
    - src: idl�ļ�����
    - interfaces: idl�������js���󣬰���һ������IDLInterface
    - ����ֵ: �����ļ�������

    
- js�������Բο�
```

//��������Ļ���
IDLObject{
    string name;  //����
    string type;   //���� 
    string extended;  //��չ����,����[]���������    
};

//�ӿ� 
IDLInterface : IDLObject{
    string superName; //���ӿ�
    array constants;  //����
    array attributes; //����
    array operations; //����
};

//����
IDLConstant : IDLObject{
    string value; //����ֵ
};

//����
IDLAttribute: IDLObject{
    boolean isStatic;  //�Ƿ�̬
    boolean isReadonly; //�Ƿ�ֻ�� 
};

//������type=����ֵ���ͣ�
IDLOperation: IDLObject{
    array arguments; //�����б�
    boolean isStatic; //�Ƿ�̬   
};

//���� 
IDLArgument: IDLObject{ 
};

```


