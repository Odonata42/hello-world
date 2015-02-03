var db = require("../db");
//recap next week - why do we need to compare these to avoid redirect loop
function checkToken(req, res, next){
	console.log(req.url);

	var token = req.cookies.userCookie;
	if(!token){
		console.log("token not found");
		return res.status(401).end();
	}

	db.get("SELECT * FROM users WHERE token = ?", [token], function(err, row){
		if(err){
			console.log("error getting token" + err.stack);
			return res.status(500).end();
		}
		if(!row || row.expiry < Date.now()){
			console.log("username not found");
			return res.status(401).end();
		}
		req.userId = row.id;
		next();
	});

}
module.exports = checkToken;
