var db = require("../db");
function removeTodo(id, userId,callback){
	db.run("DELETE FROM todos WHERE id = ? AND userId = ?", [id, userId], callback)
}

module.exports = removeTodo;