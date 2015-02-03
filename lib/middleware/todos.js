var db = require("../db");

function todos(req,res){

	db.all("SELECT * FROM todos WHERE userId = ?", [req.userId], function(err, rows){
		if(err){
			return res.status(500).end();
		}
		res.send(rows);
	});
}




module.exports = todos;
