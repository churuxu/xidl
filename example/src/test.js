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

