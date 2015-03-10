var db = require("../db");
var bcrypt = require("bcrypt");
var crypto = require("crypto");

var timeout = 60*1000;

function setToken(id, token, callback){
	var expiry = Date.now() + timeout;
	db.run("UPDATE users SET token = ?, expiry = ? WHERE id = ?", [token, expiry, id], callback);
}

function getUserWithUsername(username, callback){
	db.get("SELECT * FROM users WHERE userName = ?", [req.body.username], callback);
}

function checkPassword(password, user, callback){
	bcrypt.compare(password, user.passwordHash, callback);
}

function generateToken(callback){
	crypto.randomBytes(256, function(err, buffer){
		if (err){
			return callback(err);
		}
		var token = buffer.toString("hex");
		callback(null, token);
	});
}

//example of middle ware number 1! copy this!
function getUserWithUsernameMiddleware(req, res, next) {
	getUserWithUsername(req.body.username, function(err, user){
		if(err){
			console.log("error getting user info");
			return res.status(500).end();
		}
		if(!user){
			return res.status(404).end();
		}

		req.user = user;

		next();
	});
}

// putting login check in function below. then separate each function below into its own
//middleware making use of the next() function. login - module.exports becomes an array of all the newly created middlewares

function hashCompare(req, res){
	if(!req.body.username){
		return res.status(400).end();
	}


	getUserWithUsername(req.body.username, function(err, user){
		if(err){
			console.log("error getting user info");
			return res.status(500).end();
		}
		if(!user){
			return res.status(404).end();
		}

		checkPassword(req.body.password, user, function(err, result) {
			if(err){
				console.log("hash check error: " + err.stack);
				return res.status(500).end();
			}

			if(result===false){
				return res.status(401).end();
			}


			generateToken(function(err, token){
				if(err){
					console.log("random generator error: " + err.stack);
					return res.status(500).end();
				}


				setToken(row.id, token, function(err){
					if(err){
						console.log("error storing token" + err.stack);
						return res.status(500).end();
					}
					//add cookie
					res.cookie("userCookie", token, { maxAge: Date.now() + 1000 * 60 * 60 });
					return res.status(204).end();
				});
			});


		});

	});
}




module.exports = hashCompare;
