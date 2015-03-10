var db = require("../db");

function updateTodo(req, res){
    'use strict';
    var id = req.params.id;

	db.run("UPDATE todos SET task = ? WHERE userId = ? AND id =?",[req.body.task, req.userId, id], function(err){
        if(err){
            console.log(err.stack);
            return res.status(500).end();
        }
        return res.send('ok');
    });

}
module.exports = updateTodo;