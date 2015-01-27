var db = require("../db");
var async = require("async");

function getIDs(callback){
	db.lrange('currentIDs',0,-1,callback);
}

function getItem(id,callback){
	var key = "todo:" + id;
	db.hgetall(key,callback);
}

function getItems(currentIDs,callback){
	async.map(currentIDs, getItem, callback);
	//applies function getItem on each ID retrieved from currentIDs. passes list of results back in callback
}

function todos(req,res){
	getIDs(function(err,currentIDs) {
		if(err){
			console.error(err.stack || err.message);
			return res.status(500).end();
		}

		getItems(currentIDs,function(err,todos){
			if(err){
				console.error(err.stack || err.message);

				return res.status(500).end();
			}

			res.send(todos);
		});
	});
}


module.exports = todos;
