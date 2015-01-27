var db = require("../db");
function removeTodo(id,callback){
	var multi = db.multi();
	var key = "todo:" + id;
	multi.lrem('currentIDs',1,id);
	multi.del(key);
	multi.exec(callback);
}

module.exports = removeTodo;