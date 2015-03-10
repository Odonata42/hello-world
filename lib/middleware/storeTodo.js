var db = require("../db");

// todo is a reference type, so whatever you do to it in this function will change the
// original todo that the function is called with.
/* e.g.
var a = {}
undefined
> var b = a
undefined
> b.hi = 0
0
> a
{ hi: 0 }
*/

function storeTodo(todo, userId, callback){

	db.run('INSERT INTO todos (userId, task) VALUES (?, ?)',[userId, todo.task], function(err){
		if(err){
			return callback (err);
		}
		todo.id = this.lastID;

		callback();
	});

}
module.exports = storeTodo;
