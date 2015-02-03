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

        db.run('INSERT INTO users (userName,passwordHash) VALUES(?,?)',[req.body.username, hash],function(err){
            if(err){
                console.log(err);
                return res.status(500).end();
            }
            next();
        });


    });

}
module.exports = registerMiddleware;