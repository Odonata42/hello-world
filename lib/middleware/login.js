var hashCompare = require('./hashCompare');
function login(req, res){
    'use strict';
    console.log(req.body);
    if(!req.body.username || !req.body.password){
        return res.status(400).end();
    }
    hashCompare(req, res);

}
module.exports = login;