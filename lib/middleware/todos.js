var db = require("../db");
var async = require("async");


function getIDs(callback){
	db.get('currentIDs', function(err, value){
		if (err && err.type !== 'NotFoundError'){
			return callback(err);
		}
		if(!value){
			return callback(null,[]);
		}

		var currentIDs;

		try{
			currentIDs =  JSON.parse(value);
		}catch(err){
			return callback(err);
		}
		console.log("currentIDs: " + currentIDs);
		return callback(null,currentIDs);
	})
}

function getItem(id,callback){
	var key = "todo:" + id;
	db.get(key,function(err,value){
		if (err){
			return callback(err);
		}
		var todo;
		try{
			todo = JSON.parse(value);
		}catch(err){
			return callback(err);
		}
		return callback(null,todo);
	});

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