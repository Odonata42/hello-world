var db = require("../db");
function getID(callback){

	db.incr("id", callback);

}
module.exports = getID;
