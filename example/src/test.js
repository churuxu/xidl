var u1 = {};
u1.loginname = "zhangsan";
u1.nickname = "Zhang San";

var u2 = {};
u2.loginname = "lisi";
u2.nickname = "Li Si";

var id1 = UserManager.createUser(u1, "123456");
var id2 = UserManager.createUser(u2, "654321");
console.log("create user1 id=" + id1);
console.log("create user2 id=" + id2);

var o1 = UserManager.getUser(id1);
var o2 = UserManager.getUser(id2);

console.log(JSON.stringify(o1));
console.log(JSON.stringify(o2));

function wf(){
var f = new FileStream("test.txt", FileStream.WRITE);

var a = new Int8Array(6);
a[0] = 0x00;
a[1] = 0x01;
a[2] = 0x02;
a[3] = 0x00;
a[4] = 0x08;
a[5] = 0x00;
f.write(a);
f.write("hello world");
}

function rf(){
var f = new FileStream("test.txt", FileStream.READ);
var buf = f.read(1024);
console.log(" "+ buf.length);
console.log(" "+ buf[4]);
}

wf();
rf();
