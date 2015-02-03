var sqlite3 = require('sqlite3');
var pathJoin = require('path').join;
var db = new sqlite3.Database(pathJoin(__dirname, '..', "db.sql"));

db.on('error',function(err){
	console.error(err);
})



module.exports = db;

