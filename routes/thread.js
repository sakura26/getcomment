var express = require('express');
var router = express.Router();


 
var ThreadSchema = mongoose.Schema({
    title    : { type: String },
    ownerSaid    : { type: String },
    defaultResponse    : { type: String },
    tags    : { type: String },
    email    : { type: String },
    url    : { type: String },
    updated_at : { type: Date }
});/*
var Comment = new Schema({
    nickname    : String,
    response    : String,
    rank    : String,
    updated_at : Date
});*/
/*ThreadSchema.methods.getThread = function(id, callback) {
  this.findOne({ email: "qqq" }, function (a,b){loglog("a:"+a+" b:"+b);})
//this.findOne({ email: ObjectId(sanitize(id)) }, callback);
  .exec(callback);
}*/
var Thread = mongoose.model( 'Thread', ThreadSchema );
//mongoose.model( 'Comment', Comment );

/* GET users listing. */
router.get('/:id', function(req, res) {
	loglog("getThread id="+req.params.id,"DEBUG");
	var thisthread = new Thread({title:"new"});//mongoose.model('Thread');
	Thread.find(function (err, data) {
	  if (err){
	  	res.writeHead( 500, {'Content-Type' : 'text/plain'});
		    res.end( "exception in thread" );
		    return;
	  } 
	  if (nov(data)){
			res.writeHead( 400, {'Content-Type' : 'text/plain'});
		    res.end( "Failed to get thread" );
		    return;
		}
	    res.writeHead( 201, {'Content-Type' : 'text/plain'});
	    res.end(JSON.stringify(data));
	})
/*	thisthread.getThread(req.params.id, function(err, data){
		if (!nov(err)){
			loglog("getThread: find id: "+err,"DEBUG");
			return;
		}
		loglog("getThread: err:"+err+" data:"+data,"DEBUG");
		console.log("my data: %o", data);
		console.log("my err: %o", err);
		if (nov(data)){
			res.writeHead( 400, {'Content-Type' : 'text/plain'});
		    res.end( "Failed to get thread" );
		    return;
		}
	    res.writeHead( 201, {'Content-Type' : 'text/plain'});
	    res.end(JSON.stringify(data));
	});*/
/*	db.open(function() {
	    db.collection('thread', function(err, collection) {
    		if (!nov(err)){
    			loglog("getThread: open collection 'thread': "+err,"DEBUG");
    			return;
    		}
	    	if (nov(collection)){
	    		loglog("WTF happened mongodb thread==null, "+err,"FATAL");
	    	}
	    	collection.findOne({_id : ObjectId(sanitize(req.params.id))}, function(err, data) {
	    		if (!nov(err)){
	    			loglog("getThread: find id: "+err,"DEBUG");
	    			return;
	    		}
	    		loglog("getThread: data:"+data,"DEBUG");
				console.log("my object: %o", data)
				if (nov(data)){
					res.writeHead( 400, {'Content-Type' : 'text/plain'});
				    res.end( "Failed to get thread" );
				    return;
				}
			    res.writeHead( 201, {'Content-Type' : 'text/plain'});
			    res.end(JSON.stringify(data));
	        });
	    });
	});*/
/*
	var r = getThread(req.params.id, function(data){
		loglog("getThread: data:"+data,"DEBUG");
		console.log("my object: %o", data)
		if (nov(data) || data.length!=1){
			res.writeHead( 400, {'Content-Type' : 'text/plain'});
		    res.end( "Failed to get thread" );
		    return;
		}
	    res.writeHead( 201, {'Content-Type' : 'text/plain'});
	    res.end(JSON.stringify(data));
	});*/
});

router.post('/', function(req, res) {
	loglog("addThread","DEBUG");
	var thisthread = new Thread( {title: req.body.title, ownerSaid: req.body.ownerSaid, tags: req.body.tags, email: req.body.email, defaultResponse: req.body.defaultResponse, url: req.body.url} );//mongoose.model('Thread');
	thisthread.save(function (err, fluffy) {
	  if (err) return console.error(err);
		res.writeHead( 201, {'Content-Type' : 'text/plain'});
		res.end(JSON.stringify(thisthread));
	});
	return thisthread._id;
/*	var r = addThread({title: req.body.title, ownerSaid: req.body.ownerSaid, tags: req.body.tags, email: req.body.email}, 
		function(result, res) {
			var statecode;
			var returnString;
			loglog("r="+r,"debug");
			if (result==null){
				statecode = 400;
				returnString = "Failed to add thread";
			}
			else{
				statecode = 201;
				returnString = JSON.stringify(r);
			}
		    res.writeHead( statecode, {'Content-Type' : 'text/plain'});
		    res.end( returnString );
		}
	);
	var statecode;
	var returnString;
	loglog("r="+r,"debug");
	if (r==null){
		statecode = 400;
		returnString = "Failed to add thread";
	}
	else{
		statecode = 201;
		returnString = JSON.stringify(r);
	}
    res.writeHead( statecode, {'Content-Type' : 'text/plain'});
    res.end( returnString );*/
});
/*
function getThread( id, callback ) {
	db.open(function() {
	    db.collection('thread', function(err, collection) {
	    	if (nov(collection))
	    		loglog("WTF happened mongodb thread==null", "FATAL")
	    	collection.find({_id : ObjectId(id)}, function(err, data) {
	    		if (!nov(err))
	    			loglog("getThread: not found: "+err,"DEBUG");
	    		callback(data);
	        });
	    });
	});
}
function addThread( thread, callback ) {
	db.open(function() {
	    db.collection('thread', function(err, collection) {
	    	//loglog("db="+db+" collection="+collection,"DEBUG");
	    	if (collection==null){
	    		loglog("WTF? "+err,"FATAL");
	    	}
	    	
	    	// check is not used
	    	collection.find({ email: sanitize(thread.email), title: sanitize(thread.title) }, function(err, data) {
	            if (data) {
	            	return null;
	            }
	        });
	        //add
	        collection.insert(
	        	{ data }
	        , function(err, data) {
	            if (data) {
	                loglog('addThread: "'+thread.email+"("+thread.title+")"+'" added',"WARN");
	            } else {
	                loglog('addThread: failed to write!!',"ERROR");
	                //TODO: error msg
	                return null;
	            }
	        });
	    	collection.find({ email: sanitize(thread.email), title: sanitize(thread.title)  }, function(err, data) {
	            if (data) {
	            	return data;
	            } 
	            else{
	                loglog('addThread: write db but cant read: ' + thread.email+"("+thread.title+")", "ERROR");
	                return null;
	            }
	        });
	    });
	});
	//TODO: send email to user

}
*/
module.exports = router;
