var express = require('express');
var bodyParser = require('body-parser'); //including middleware
var cookieParser = require('cookie-parser');
//var cookieParser = require('cookie-parser');
var bcrypt = require('bcrypt');

var app = express();

var router = new express.Router();

var todos = require('./lib/middleware/todos');
var db = require('./lib/db');
var storeTodo = require('./lib/middleware/storeTodo');
var removeTodo = require('./lib/middleware/removeTodo');
var checkToken = require('./lib/middleware/checkToken');
var updateTodo = require('./lib/middleware/updateTodo');
var register = require('./lib/middleware/register');
var login = require('./lib/middleware/login');

app.use(function(req, res, next) {
    'use strict';
    req.headers['if-none-match'] = 'no-match-for-this';
    next();
});

app.disable('etag');
app.use(cookieParser());
app.use(express.static('tasklist'));
app.use(bodyParser.json()); // telling to use middleware

router.use(checkToken);






app.post('/newuser', register, login);

app.post('/login', login);



router.post('/todo', function(req, res){
    'use strict';
    console.log('step 1 complete');
    var todo = req.body;
    console.log('step 2 ' + JSON.stringify(req.body));


    storeTodo(todo, req.userId, function(err){
        if(err){
            console.log('error 4: ' + err.stack);
            return res.status(500).end();
        }

        res.send(todo);
    });
});



router.get('/todos', todos);





router.delete('/todo/:id', function(req, res){
    'use strict';
    var id = req.params.id;
    removeTodo(id, req.userId, function(err){
        if(err){
            console.log(err.stack);
            return res.status(500).end();
        }
        return res.send('ok');
    });
});

router.put('/todo/:id', updateTodo);

router.put('/todos/priority', function(req, res){
    'use strict';
    /*if(!req.cookies){
        return false;
    }
    */
    var id = parseInt(req.query.id, 10);
    var priority = parseInt(req.query.priority, 10);
    console.log('ID: ' + id + ' priority: ' + priority);
    var multi = db.multi();
    multi.lrem('currentIDs', 1, id);
    for (var i = 0; i < priority; i++){
        multi.rpoplpush('currentIDs', 'tempIDs');
    }
    multi.rpush('currentIDs', id);
    for(var j = 0; j < priority; j++){
        multi.evalsha(db.lpoprpushHash, 2, 'tempIDs', 'currentIDs');
    }
    multi.exec(function(err){
        if(err){
            console.log(err);
            return res.status(500).end();
        }
        return res.send('ok');
    });

});

db.on('open', function() {
    'use strict';
    var server = app.listen(3000, function() {
        console.log('Listening on port %d', server.address().port);
    });
});
app.use('/', router);
//may want to namespace later using pathname for all other router.put router.get etc. router.put(/auth/todos/priority, checktoken)
//--save in console saves the module to package.json for use later...
//level = database
