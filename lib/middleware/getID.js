var db = require("../db");
function getID(callback){
	//SARAH CHANGES HERE?!?!??
	var token = req.cookies.userCookie; // req not available - need some other way of getting user cookie?

	if(!token){
		console.log("token not found");
		return res.status(401).end();
	}

	db.get("SELECT * FROM users WHERE token = ?", [token], callback);


	//code below could get number of IDS - do we still need this??
	//db.run('SELECT COUNT(*) FROM todos', callback);



	//original code below
	//db.incr("id", callback);

}
module.exports = getID;
