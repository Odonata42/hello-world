var express = require('express');
var bodyParser = require('body-parser'); //including middleware
var cookieParser = require('cookie-parser');
//var cookieParser = require('cookie-parser');
var bcrypt = require('bcrypt');

var app = express();

var router = new express.Router();

var todos = require('./lib/middleware/todos');
var db = require('./lib/db');
var getID = require('./lib/middleware/getID');
var storeTodo = require('./lib/middleware/storeTodo');
var removeTodo = require('./lib/middleware/removeTodo');
var checkToken = require('./lib/middleware/checkToken');
var hashCompare = require('./lib/middleware/hashCompare');

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

function registerMiddleware(req, res, next){
    'use strict';
    console.log(req.body);

    db.hget('UserHashes', req.body.username, function(err, hash){
        if(err){
            return res.status(500).end();
        }
        if(hash){
            console.log('username taken, please choose another');
            return res.status(403).send('<script>alert("username taken"); window.document.location= document.referrer</script>').end();
        }
        console.log('username OK, please continue');
        //db.HSET("UserHashes",req.body.username,"test");
        //generate bcrypt hash for password
        //NEW NEW! needs work!!!
        bcrypt.hash(req.body.password, 8, function(err, hash){
            if(err){
                console.log(err);
                return res.status(500).end();
            }
            db.hset('UserHashes', req.body.username, hash, function(err){
                if(err){
                    return res.status(500).end();
                }
                return next();
            });
        });

    });

}



function loginMiddleware(req, res){
    'use strict';
    console.log(req.body);
    if(!req.body.username || !req.body.password){
        return res.status(400).end();
    }
    hashCompare(req, res);

}
app.post('/newuser', registerMiddleware, loginMiddleware);

app.post('/login', loginMiddleware);



router.post('/todo', function(req, res){
    'use strict';
    console.log('step 1 complete');
    var todo = req.body;
    console.log('step 2 ' + JSON.stringify(req.body));

//getting list of current IDs to get length for priority
    getID(function(err, id){
        console.log('getID step1');
        if(err){
            console.log('error 4: ' + err.stack);
            return res.status(500).end();
        }
        todo.id = id;
        //need current IDS length to determine priority
        //todo.priority = currentIDs.length;
        storeTodo(todo, function(err){
            if(err){
                console.log('error 4: ' + err.stack);
                return res.status(500).end();
            }

            res.send(todo);
        });
    });
});


router.get('/todos', todos);





router.delete('/todo/:id', function(req, res){
    'use strict';
    var id = req.params.id;
    removeTodo(id, function(err){
        if(err){
            console.log(err.stack);
            return res.status(500).end();
        }
        return res.send('ok');
    });
});

router.put('/todo/:id', function(req, res){
    'use strict';
    var id = req.params.id;
    console.log(id);
    var key = 'todo:' + id;
    console.log(JSON.stringify(req.body));
    console.log('hash/key is: ' + key + 'object is: ' + JSON.stringify(req.body));

    db.hmset(key, req.body, function(err){
        if(err){
            console.log(err.stack);
            return res.status(500).end();
        }
        return res.send('ok');
    });
});

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

db.once('scripts-loaded', function() {
    'use strict';
    var server = app.listen(3000, function() {
        console.log('Listening on port %d', server.address().port);
    });
});
app.use('/', router);
//may want to namespace later using pathname for all other router.put router.get etc. router.put(/auth/todos/priority, checktoken)
//--save in console saves the module to package.json for use later...
//level = database
