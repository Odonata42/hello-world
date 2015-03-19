var hashCompare = require('./hashCompare');
/*function login(req, res){
    'use strict';
    console.log(req.body);
    if(!req.body.username || !req.body.password){
        return res.status(400).end();
    }
    hashCompare(req, res);
*/
    //example of middle ware number 1! copy this!

function getUserWithUsernameMiddleware(req, res, next) {
	console.log("login1");
	//console.log("req: " + req.body)
	hashCompare.getUserWithUsername(req.body.username, function(err, user){
		if(err){
			console.log("error getting user info");
			return res.status(500).end();
		}
		if(!user){
			console.log("username not found");
			return res.status(404).end();
		}
		req.user = user;
		//console.log("req.user1: " + user)

		next();
	});
}

function checkPasswordMiddleware(req, res, next) {
	console.log("login2");
	hashCompare.checkPassword(req.body.password, req.user, function(err, result) {
		console.log (result);
		if(err){
			console.log("hash check error: " + err.stack);
			return res.status(500).end();
		}

		if(result===false){
			return res.status(401).end();
		}

		next();
	});
}

function generateTokenMiddleware(req, res, next){
	console.log("login3");
	hashCompare.generateToken(function(err, token){
		if(err){
			console.log("random generator error: " + err.stack);
			return res.status(500).end();
		}
		req.token = token;
		next();
	});
}


function setTokenMiddleware(req, res, next){
	console.log("login4");
	hashCompare.setToken(req.user.id, req.token, function(err){
		if(err){
			console.log("error storing token" + err.stack);
			return res.status(500).end();
		}
		//add cookie
		res.cookie("userCookie", req.token, { maxAge: Date.now() + 1000 * 60 * 60 });
		return res.status(204).end();
		next();
	});

}

//}
var loginArr = [getUserWithUsernameMiddleware,checkPasswordMiddleware, generateTokenMiddleware, setTokenMiddleware];

module.exports = loginArr;





