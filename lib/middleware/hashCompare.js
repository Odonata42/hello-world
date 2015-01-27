var db = require("../db");
var bcrypt = require("bcrypt");
var crypto = require("crypto");
function setToken(token, username, callback){
	db.SET("token:"+ token, username, "EX", 60, callback);
}


var hashCompare = function(req, res){
	db.HGET("UserHashes", req.body.username, function (err, hash){
		console.log(req, res);
		if(err){
			console.log("error getting hash: " + err.stack);
			return res.status(500).end();
		}

		if(!hash){
			console.log("hash");
			return res.status(401).end();
		}

		bcrypt.compare(req.body.password, hash, function(err, result) {
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
				//insert function here
				setToken(token, req.body.usename, function(err){
					if(err){
						console.log("error storing token" + err.stack);
						return res.status(500).end();
					}

					//add cookie
					res.cookie("userCookie", token, { maxAge: 6000 });
					return res.status(204).end();
				})
			});
		});
	});
};



module.exports = hashCompare;
