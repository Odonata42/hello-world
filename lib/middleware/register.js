var bcrypt = require('bcrypt');
var db = require('../db');
//needs database!
function registerMiddleware(req, res, next){
    'use strict';

    bcrypt.hash(req.body.password, 8, function(err, hash){
        if(err){
            console.log(err);
            return res.status(500).end();
        }
console.log("username: " + req.body.username + " hash: " + hash)
        db.run('INSERT INTO users VALUES(NULL,?,?, NULL, NULL)',[req.body.username, hash],function(err){
            if(err){
                console.log(err);
                return res.status(500).end();
            }
            next();
        });


    });

}
module.exports = registerMiddleware;