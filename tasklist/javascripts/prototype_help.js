var obj = {
    counter: 0,
    addOne: function() {
        return this.counter + 1;
    }
};

obj.addOne()

---------

function addOne() {
    return this.counter + 1;
}

function makeObject(counter) {
    return {
        counter: counter,
        addOne: addOne
    };
}

var obj = makeObject(0);

obj.addOne() // 1

---------

function makeAddOne(obj) {
    return function() {
        return obj.counter + 1;
    };
}

function makeObject(counter) {
    var obj = {
        counter: counter,
        addOne: makeAddOne(obj);
    };

    return obj;
}

---------

function MakeObject(counter) {
    this.counter = counter;
}

MakeObject.prototype.addOne = function() {
    return this + 1;
}





function asyncy(a, b, callback) {}

var a = 1;
var b = 2;

function asyncyCurry(callback) {
    asyncy(a, b, callback);
}