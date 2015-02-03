var db = require("../db");
var bcrypt = require("bcrypt");
var crypto = require("crypto");

var timeout = 60*1000;

function setToken(id, token, callback){
	var expiry = Date.now() + timeout;
	db.run("UPDATE users SET token = ?, expiry = ? WHERE id = ?", [token, expiry, id], callback);
}

function hashCompare(req, res){
	if(!req.body.username){
		return res.status(400).end();
	}
	db.get("SELECT * FROM users WHERE userName = ?", [req.body.username], function(err, row){
		if(err){
			console.log("error getting user info");
			return res.status(500).end();
		}
		if(!row){
			return res.status(404).end();
		}
		bcrypt.compare(req.body.password, row.passwordHash, function(err, result) {
			if(err){
				console.log("hash check error: " + err.stack);
				return res.status(500).end();
			}

			if(result===false){
				return res.status(401).end();
			}


			crypto.randomBytes(256,function(err, buffer){
				if(err){
					console.log("random generator error: " + err.stack);
					return res.status(500).end();
				}

				var token = buffer.toString("hex");
				setToken(row.id, token, function(err){
					if(err){
						console.log("error storing token" + err.stack);
						return res.status(500).end();
					}

					//add cookie
					res.cookie("userCookie", token, { maxAge: 6000 });
					return res.status(204).end();
				});
			});


		});

	});
}




module.exports = hashCompare;
