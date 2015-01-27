var redis = require("redis");
var client = redis.createClient();

client.on("error", function (err) {
    console.log("Error " + err);
});

var luaScript = [
	'local ID = redis.call("LPOP",KEYS[1])',
	'return redis.call("RPUSH",KEYS[2],ID)'
].join("\n");

client.script("load",luaScript,function(err, hash){
	if (err){
		console.log(err);
	}
	
	client.lpoprpushHash = hash;

	client.emit('scripts-loaded');
});

module.exports = client;