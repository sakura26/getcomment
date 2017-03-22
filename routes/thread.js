var express = require('express');
var router = express.Router();


 
var ThreadSchema = mongoose.Schema({
    title    : { type: String },
    ownerSaid    : { type: String },
    defaultResponse    : { type: String },
    tags    : { type: String },
    email    : { type: String },
    url    : { type: String },
    public    : { type: String },
    updated_at : { type: Date }
});
var CommentSchema = new Schema({
	threadId : String,
    nickname    : String,
    response    : String,
    rank    : String,
    email	: String, 
    public	: String, 
    updated_at : Date
});
var Thread = mongoose.model( 'Thread', ThreadSchema );
var Comment = mongoose.model( 'Comment', CommentSchema );


/* GET users listing. */
router.get('/', function(req, res) {
	var thisthread = new Thread();
	Thread.find(function (err, data) {
	  if (err){
	  	res.writeHead( 500, {'Content-Type' : 'text/plain'});
	    res.end(JSON.stringify({status:"error", msg:"exception:"+err}));
	    return;
	  } 
	  res.writeHead( 201, {'Content-Type' : 'text/plain'});
	  res.end(JSON.stringify(data));
	})
});

router.get('/:id', function(req, res) {
	//loglog("getThread id="+req.params.id,"DEBUG");
	var thisthread = new Thread();//mongoose.model('Thread');
	Thread.findOne({_id:ObjectId(req.params.id)}, function (err, data) {
	  if (err){
	  	res.writeHead( 500, {'Content-Type' : 'text/plain'});
	    res.end(JSON.stringify({status:"error", msg:"exception:"+err}));
	    return;
	  } 
	  if (nov(data)){
		res.writeHead( 404, {'Content-Type' : 'text/plain'});
	    res.end(JSON.stringify({status:"error", msg:"no such thread"}));
	    return;
	  }
	  Comment.find({threadId:req.params.id}, function (err, comments) {
	  	var qq = data.toObject();
	  	qq.comments = comments;
		res.writeHead( 201, {'Content-Type' : 'text/plain'});
		res.end(JSON.stringify(qq));
		//res.end(JSON.stringify(comments));
	  })
	})
});

router.post('/', function(req, res) {
	//TODO: validate email!
	//TODO: send notify email!
	var thisthread = new Thread( {title: req.body.title, ownerSaid: req.body.ownerSaid, tags: req.body.tags, email: req.body.email, defaultResponse: req.body.defaultResponse} );//mongoose.model('Thread');
	thisthread.save(function (err, fluffy) {
	  if (err) return console.error(err);
	  res.writeHead( 201, {'Content-Type' : 'text/plain'});
	  res.end(JSON.stringify(thisthread));
	});
	loglog("addThread "+thisthread._id,"INFO");
	return thisthread._id;
});
router.post('/addThread', function(req, res) {
	//TODO: validate email!
	//TODO: send notify email!
	var thisthread = new Thread( {title: req.body.title, ownerSaid: req.body.ownerSaid, tags: req.body.tags, email: req.body.email, defaultResponse: req.body.defaultResponse, public: req.body.public} );//mongoose.model('Thread');
	thisthread.save(function (err, fluffy) {
	  if (err) return console.error(err);
	  res.redirect("/thread/"+thisthread._id+"/show");
	});
	loglog("addThread "+thisthread._id,"INFO");
	return;
});

router.get('/:id/show', function(req, res) {
	//TOOD: validate owner!
	var thisthread = new Thread();//mongoose.model('Thread');
	Thread.findOne({_id:ObjectId(req.params.id)}, function (err, data) {
	  if (err){
	  	res.writeHead( 500, {'Content-Type' : 'text/plain'});
	    res.end(JSON.stringify({status:"error", msg:"exception:"+err}));
	    return;
	  } 
	  if (nov(data)){
		res.writeHead( 404, {'Content-Type' : 'text/plain'});
	    res.end(JSON.stringify({status:"error", msg:"no such thread"}));
	    return;
	  }
	  //get comments if needed
	  loglog("data.public:"+data.public,"DEBUG");
	  var qq = data.toObject();
	  // I know how to use promise!!! (crying)
	  var loaded = new Promise(function(resolve, reject) {
		  if (qq.public!="yes"){
		  	resolve();
		  }
		  Comment.find({threadId:req.params.id}, function (err, comments) {
		  	qq.comments = comments;
	  		resolve();
		  })
	  });
	  loaded.then(function() {
	    res.render('threadshow', qq);
	  });
	});
});

router.get('/:id/edit', function(req, res) {
	//TOOD: validate owner!
	var thisthread = new Thread();//mongoose.model('Thread');
	Thread.findOne({_id:ObjectId(req.params.id)}, function (err, data) {
	  if (err){
	  	res.writeHead( 500, {'Content-Type' : 'text/plain'});
	    res.end(JSON.stringify({status:"error", msg:"exception:"+err}));
	    return;
	  } 
	  if (nov(data)){
		res.writeHead( 404, {'Content-Type' : 'text/plain'});
	    res.end(JSON.stringify({status:"error", msg:"no such thread"}));
	    return;
	  }
	  res.render('threadedit', data);
	})
});
router.post('/:id/update', function(req, res) {  //workaround!
	//TOOD: validate owner!
	loglog("updThread "+req.params.id,"INFO");

	//var thisthread = new Thread();//mongoose.model('Thread');
	Thread.findOne({_id:ObjectId(req.params.id)}, function (err, data) {
	  if (err){
	  	res.writeHead( 500, {'Content-Type' : 'text/plain'});
	    res.end(JSON.stringify({status:"error", msg:"exception:"+err}));
	    return;
	  } 
	  data.title = req.body.title;
	  data.ownerSaid = req.body.ownerSaid;
	  data.tags = req.body.tags;
	  data.defaultResponse = req.body.defaultResponse;
	  data.save();
	  res.redirect("/thread/"+req.params.id+"/show");
	})
});
router.put('/:id', function(req, res) {
	//TOOD: validate owner!
	loglog("updThread "+req.params.id,"INFO");

	//var thisthread = new Thread();//mongoose.model('Thread');
	Thread.findOne({_id:ObjectId(req.params.id)}, function (err, data) {
	  if (err){
	  	res.writeHead( 500, {'Content-Type' : 'text/plain'});
	    res.end(JSON.stringify({status:"error", msg:"exception:"+err}));
	    return;
	  } 
	  data.title = req.body.title;
	  data.ownerSaid = req.body.ownerSaid;
	  data.tags = req.body.tags;
	  data.defaultResponse = req.body.defaultResponse;
	  data.save();
	  res.redirect("/thread/"+req.params.id+"/show");
	})
});
router.delete('/:id', function(req, res) {
	//TOOD: validate owner!
	loglog("delThread "+req.params.id,"INFO");
	var thisthread = new Thread();//mongoose.model('Thread');
	Thread.findOne({_id:ObjectId(req.params.id)}, function (err, data) {
	  if (err){
	  	res.writeHead( 500, {'Content-Type' : 'text/plain'});
	    res.end(JSON.stringify({status:"error", msg:"exception:"+err}));
	    return;
	  } 
	  if (nov(data)){
		res.writeHead( 404, {'Content-Type' : 'text/plain'});
	    res.end(JSON.stringify({status:"success", msg:"already removed"}));
	    return;
	  }
	  data.remove();
	  res.writeHead( 201, {'Content-Type' : 'text/plain'});
	  res.end(JSON.stringify({status:"success", msg:"obj removed"}));
	})
});

router.post('/:id/comment', function(req, res) {

	//TODO: validate email!
	//TODO: send notify email!
	Thread.findOne({_id:ObjectId(req.params.id)}, function (err, data) {
	  if (err){
	  	res.writeHead( 500, {'Content-Type' : 'text/plain'});
	    res.end(JSON.stringify({status:"error", msg:"exception:"+err}));
	    return;
	  } 
	  if (nov(data)){
		res.writeHead( 404, {'Content-Type' : 'text/plain'});
	    res.end(JSON.stringify({status:"error", msg:"no such thread"}));
	    return;
	  }
	  	var thiscomment = new Comment( {threadId: req.params.id, nickname: req.body.nickname, response: req.body.response, rank: req.body.rank, email: req.body.email, public: req.body.public} );//mongoose.model('Thread');
		thiscomment.save(function (err, fluffy) {
		    if (err){
			  	//res.render('commentFail', data);
			  	loglog("Faile to add comment: "+err,"ERROR");
				res.end("ERROR: Faile to add comment: "+err);
				//res.render('commentFail', data);
			  	return;
		    } 
			loglog("addComment "+thiscomment._id,"INFO");
			res.render('commentSuccess', data);
		});
	})
});
module.exports = router;
