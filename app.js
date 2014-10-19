var express = require('express');
var bodyParser = require('body-parser'); //including middleware

var app = express();

var path = require('path');

var getHello = require('./lib/middleware/getHello');
var todos = require('./lib/middleware/todos');
var db = require ('./lib/db');

function addID(id, callback){
	//need to store a list of all IDs currently present in database - this will account for any that have been deleted	
	db.get('currentIDs', function(err, value){
		if (err && err.type !== 'NotFoundError'){
			return callback(err);
		}

		var currentIDs = (value && JSON.parse(value)) || [];
		currentIDs.push(id);
		var data = JSON.stringify(currentIDs);
		console.log("list of current IDs: " + currentIDs)
		db.put('currentIDs',data,callback);//last argument "callback" is there to catch and errors only
	});
}

function removeID(id,callback){
	console.log("removing ID");
	db.get('currentIDs',function(err,value){
		if(err && err.type !== 'NotFoundError'){
			return callback(err);
		}

		var currentIDs = (value && JSON.parse(value)) || [];
		console.log("currentIDs: " + currentIDs);
		var index = currentIDs.indexOf(parseInt(id));
		console.log("request deleting of ID: " + id)
		console.log("index found: " + index);
		if(index === -1){	
			return callback();
		}

		currentIDs.splice(index,1);
		console.log("currentIDs: " + currentIDs);
		var data = JSON.stringify(currentIDs);
		db.put('currentIDs',data,callback);
	})

}

function getID(callback){
	var id;

	function afterGet(err, value){
		 if (err && err.type !== 'NotFoundError'){ 
		 	return callback(err);
		 }
		 //incrementing to show most recent todo
		 id = parseInt(value, 10) || 0;
		 id +=1;
		 console.log("step 3: " +id)
		 db.put('id', id, afterPut);

	}

	function afterPut(err){
	 	if (err){ 
	 		return callback(err);
	 	}
	 	//below will run funtion starting line 85
	 	callback(null, id);

	}

	db.get('id', afterGet);
}


app.use(express.static("tasklist"));
app.use(bodyParser.json()); // telling to use middleware

app.get('/hello.txt', getHello);

app.post('/todo',function(req, res){
	console.log("step 1 complete");
	var todo = req.body;
	console.log("step 2 " +JSON.stringify(req.body));

	//getting new ID for current todo
	getID(function(err,id){

		if(err){
			console.log("error 4: " + err.stack);
			return res.status(500).end();
		}
		//updating and stringifying actual todo
		todo.id = id;
		//todo.priority = 1
		//update remaining items with priority+1 - use async.map - include as part of an update function

		var key = "todo:" + id;
		var value =JSON.stringify(todo);

		//saving todo into database
		db.put(key, value, function(err){
			console.log("key: " +key + " value: " + value);

			if(err){
				console.log(err.stack);
				return res.status(500).end();
			} 

			//adding ID to list of active IDs
			addID(id,function(err){
				if(err){
					console.log(err.stack);
					return res.status(500).end();
				}
				//sending todo back to user with ID 
				console.log(todo);

				res.send(todo);	
			});
		});
	})
})

app.put('/update',function(req,res){
	
});

app.get('/todos',todos);





app.delete('/todo/:id',function(req,res){
	var id = req.params.id;
	console.log("app.delete - req.param(id) = " + id);
	removeID(id,function(err){
		if(err){
			console.log(err.stack);
			return res.status(500).end();
		}
		return res.send("ok");
	})
})
app.put('/todo',function(req,res){
	var id = req.params.id;
})

var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});

//--save in console saves the module to package.json for use later...
//level = database
