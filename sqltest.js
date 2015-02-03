var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(__dirname + "/db.sql", function(){
	db.all("SELECT * FROM users", function(err, result){
		console.log(err,result)
	});
});
