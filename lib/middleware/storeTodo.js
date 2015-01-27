var db = require("../db");

function storeTodo(todo, callback){
	var multi = db.multi();
	var key = "todo:" + todo.id;
	multi.hmset(key, todo);
	multi.rpush("currentIDs", todo.id);
	multi.exec(callback);
}
module.exports = storeTodo;
