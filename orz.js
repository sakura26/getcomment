

// by s2
var mongodb = require('mongodb');
sanitize = require('mongo-sanitize');

// INIT
//mongodbServer = new mongodb.Server('localhost', 27017, { auto_reconnect: true, poolSize: 10 });
//db = new mongodb.Db('getcomment', mongodbServer);
/*ObjectId = require('mongodb').ObjectId;
mongoose = require( 'mongoose' );
Schema   = mongoose.Schema;

//assert.equal(query.exec().constructor, require('bluebird'));
mongoose.connect( 'mongodb://localhost/getcomment' );
db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
*/

// my funcs
loglog = function(data, level){
    if (nov(level))
        level = "INFO";
    console.log('JAICAS: '+level+ ": " + data);
};
nov = function(data){  //not a value
    if (typeof data == "undefined" || data==null)
        return true;
    return false;
};


var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');
mongoose.Promise = require('bluebird');

var Cat = mongoose.model('Cat', { name: String });

var kitty = new Cat({ name: 'Zildjian' });
kitty.save(function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log('meow');
  }
});