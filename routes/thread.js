var express = require('express');
var router = express.Router();

var QRCode = require('qrcode')
var Promise = require('bluebird');
 
var ThreadSchema = mongoose.Schema({
    title    : { type: String },
    nickname    : { type: String },
    ownerSaid    : { type: String },
    defaultResponse    : { type: String },
    tags    : { type: String },
    email    : { type: String },
    url    : { type: String },
    public    : { type: String },
    pass    : { type: String },
    created_at : { type: Date },
    updated_at : { type: Date }
});
var CommentSchema = new Schema({
	threadId : String,
    nickname    : String,
    response    : String,
    rank    : String,
    email	: String, 
    public	: String, 
    created_at : { type: Date },
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
	var thisthread = new Thread();//mongoose.model('Thread');
	Thread.findOne({_id:ObjectId(req.params.id)}, function (err, thisthread) {
	  if (err){
	  	res.writeHead( 500, {'Content-Type' : 'text/plain'});
	    res.end(JSON.stringify({status:"error", msg:"exception:"+err}));
	    return;
	  } 
	  if (nov(thisthread)){
		res.writeHead( 404, {'Content-Type' : 'text/plain'});
	    res.end(JSON.stringify({status:"error", msg:"no such thread"}));
	    return;
	  }
	  var qq = thisthread.toObject();
	  qq.created_at = ObjectId(req.params.id).getTimestamp();
	  var ress = [];
	  //gen QRCode
	  ress.push(new Promise((resolve, reject)=>{  QRCode.toDataURL(siteHost+req.params.id+'/show',function(err, qrcode){qq.qrcode = qrcode;resolve();}); }) );
	  ress.push(new Promise((resolve, reject)=>{ Comment.find({threadId:req.params.id}, function(err, comments){
	  	//get comments
  		if (thisthread.public=='yes')  //show if public
  			qq.comments = comments;
  		//calc avgRank
  		var sum=0;
  		comments.forEach(function(ele){ sum+=parseInt(ele.rank); });
  		qq.avgRank = sum/comments.length ;//calc average rank
  		loglog(sum/comments.length);
  		resolve();
	  } ); }) );
	  Promise.all(ress).then(function() {
	  	res.writeHead( 201, {'Content-Type' : 'text/plain'});
		res.end(JSON.stringify(qq));
	  });
	});
});

router.post('/', function(req, res) {
	//TODO: validate email!
	//TODO: send notify email!
	var WTF1=genRandomString(5);
	var WTF2=Date.now();
	var thisthread = new Thread( 
	  {nickname: req.body.nickname, 
	  title: req.body.title, 
	  ownerSaid: req.body.ownerSaid, 
	  tags: req.body.tags, 
	  email: req.body.email, 
	  defaultResponse: req.body.defaultResponse, 
	  pass: WTF1, 
	  created_at: WTF2} );//mongoose.model('Thread');
	thisthread.save(function (err, fluffy) {
	  if (err) return console.error(err);
	  res.writeHead( 201, {'Content-Type' : 'text/plain'});
	  res.end(JSON.stringify(thisthread));
	});
	loglog("addThread "+thisthread._id,"INFO");
	var mailOptions = {
	    from: siteEmail, // sender address
	    to: req.body.email, // list of receivers
	    subject: 'New getComment "'+req.body.title+'" created! here is your summary...', // Subject line
	    text: 'Thread main page: '+siteHost+'/thread/'+thisthread._id+'/show \n'+ //, // plaintext body
	    	'edit: '+siteHost+'/thread/'+thisthread._id+'/edit/'+thisthread.pass+' \n'+
	    	'delete: '+siteHost+'/thread/'+thisthread._id+'/delete/'+thisthread.pass+' \n'+
	    	'QRCode: '+siteHost+'/thread/'+thisthread._id+'/qrcode'
	    // html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
	};
	transporter.sendMail(mailOptions, function(error, info){
	    if(error){
	        loglog("addThread failed to send mail to user: "+error,"ERROR");
	        //res.json({yo: 'error'});
	    }else{
	        //console.log('Message sent: ' + info.response);
	        //res.json({yo: info.response});
	    };
	});
	return thisthread._id;
});
router.post('/addThread', function(req, res) {
	//TODO: validate email!
	//TODO: send notify email!
	var WTF1=genRandomString(5);
	var WTF2=Date.now();
	var thisthread = new Thread( {nickname: req.body.nickname, title: req.body.title, ownerSaid: req.body.ownerSaid, tags: req.body.tags, email: req.body.email, defaultResponse: req.body.defaultResponse, public: req.body.public, pass: WTF1, created_at: WTF2} );//mongoose.model('Thread');
	thisthread.save(function (err, fluffy) {
	  if (err) return console.error(err);
	  res.redirect("/thread/"+thisthread._id+"/show");
	});
	loglog("addThread "+thisthread._id,"INFO");

	var mailOptions = {
	    from: siteEmail, // sender address
	    to: req.body.email, // list of receivers
	    subject: 'New getComment "'+req.body.title+'" created! here is your summary...', // Subject line
	    text: 'Thread main page: '+siteHost+'/thread/'+thisthread._id+'/show \n'+ //, // plaintext body
	    	'edit: '+siteHost+'/thread/'+thisthread._id+'/edit/'+thisthread.pass+' \n'+
	    	'delete: '+siteHost+'/thread/'+thisthread._id+'/delete/'+thisthread.pass+' \n'+
	    	'QRCode: '+siteHost+'/thread/'+thisthread._id+'/qrcode'
	    // html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
	};
	transporter.sendMail(mailOptions, function(error, info){
	    if(error){
	        loglog("addThread failed to send mail to user: "+error,"ERROR");
	        //res.json({yo: 'error'});
	    }else{
	        //console.log('Message sent: ' + info.response);
	        //res.json({yo: info.response});
	    };
	});
	return;
});

router.get('/:id/show', function(req, res) {
	//TOOD: validate owner!
	var thisthread = new Thread();//mongoose.model('Thread');
	Thread.findOne({_id:ObjectId(req.params.id)}, function (err, thisthread) {
	  if (err){
	  	res.writeHead( 500, {'Content-Type' : 'text/plain'});
	    res.end(JSON.stringify({status:"error", msg:"exception:"+err}));
	    return;
	  } 
	  if (nov(thisthread)){
		res.writeHead( 404, {'Content-Type' : 'text/plain'});
	    res.end(JSON.stringify({status:"error", msg:"no such thread"}));
	    return;
	  }
	  var qq = thisthread.toObject();
	  qq.created_at = ObjectId(req.params.id).getTimestamp();
	  var ress = [];
	  //gen QRCode
	  ress.push(new Promise((resolve, reject)=>{  QRCode.toDataURL(siteHost+req.params.id+'/show',function(err, qrcode){qq.qrcode = qrcode;resolve();}); }) );
	  ress.push(new Promise((resolve, reject)=>{ Comment.find({threadId:req.params.id}, function(err, comments){
	  	//get comments
  		if (thisthread.public=='yes')  //show if public
  			qq.comments = comments;
  		//calc avgRank
  		var sum=0;
  		comments.forEach(function(ele){ sum+=parseInt(ele.rank); });
  		qq.avgRank = sum/comments.length ;//calc average rank
  		loglog(sum/comments.length);
  		resolve();
	  } ); }) );
	  Promise.all(ress).then(function() {
	  	loglog(JSON.stringify(qq));
	  	res.render('threadshow', qq);
	  });
	});
});

router.get('/:id/qrcode', function(req, res) {
	//TOOD: validate owner!
	QRCode.toDataURL(siteHost+req.params.id+'/show', function (err, url) {
	  //console.log(url)
		//var string = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==";
		var string = url;
		var regex = /^data:.+\/(.+);base64,(.*)$/;
		var matches = string.match(regex);
		var ext = matches[1];
		var data = matches[2];
		var buffer = new Buffer(data, 'base64');
	  res.writeHead( 201, {'Content-Type' : 'image/png'});
	  res.end(buffer);
	  //res.writeHead( 201, {'Content-Type' : 'text/html'});
	  //res.end('<img src="'+url+'">');
	})
});


router.get('/:id/edit/:pass', function(req, res) {
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
	  if (req.params.pass == data.pass)
	  	res.render('threadedit', data);
	  else
	  	res.end("password not match");
	})
});
router.post('/:id/update/:pass', function(req, res) {  //workaround!
	//TOOD: validate owner!
	loglog("updThread "+req.params.id,"INFO");

	//var thisthread = new Thread();//mongoose.model('Thread');
	Thread.findById(req.params.id, function (err, data) {
	  if (err){
	  	res.writeHead( 500, {'Content-Type' : 'text/plain'});
	    res.end(JSON.stringify({status:"error", msg:"exception:"+err}));
	    return;
	  } 
	  if (req.params.pass != data.pass){
	  	res.end("password not match");
	  	return;
	  }
	  data.title = req.body.title;
	  data.ownerSaid = req.body.ownerSaid;
	  data.tags = req.body.tags;
	  data.defaultResponse = req.body.defaultResponse;
	  //data.created_at = Date.now();
	  data.save(function (err, updatedTank) {
	    if (err) return loglog(err);
	    //res.send(updatedTank);
	  });
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
	  //data.created_at = Date.now();
	  data.save(function (err, updatedTank) {
	    if (err) return loglog(err);
	    //res.send(updatedTank);
	  });
	  res.redirect("/thread/"+req.params.id+"/show");
	})
});
router.delete('/:id', function(req, res) {
	//TOOD: validate owner!
	loglog("delThread "+req.params.id,"INFO");
	//var thisthread = new Thread();//mongoose.model('Thread');
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
	  //if (req.params.pass == data.pass)
	  	data.remove();
	  res.writeHead( 201, {'Content-Type' : 'text/plain'});
	  res.end(JSON.stringify({status:"success", msg:"obj removed"}));
	})
});
router.get('/:id/delete/:pass', function(req, res) {
	//TOOD: validate owner!
	loglog("delThread "+req.params.id,"INFO");
	//var thisthread = new Thread();//mongoose.model('Thread');
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
	  if (req.params.pass == data.pass)
	  	data.remove();
	  res.writeHead( 201, {'Content-Type' : 'text/plain'});
	  res.end("Thread removed");
	})
});

router.post('/:id/comment', function(req, res) {
	//TODO: validate email!
	//TODO: send notify email!
	Thread.findOne({_id:ObjectId(req.params.id)}, function (err, thethread) {  //get thread we comment to
	  if (err){
	  	res.writeHead( 500, {'Content-Type' : 'text/plain'});
	    res.end(JSON.stringify({status:"error", msg:"exception:"+err}));
	    return;
	  } 
	  if (nov(thethread)){
		res.writeHead( 404, {'Content-Type' : 'text/plain'});
	    res.end(JSON.stringify({status:"error", msg:"no such thread"}));
	    return;
	  }
	  var avgRank;
	  	var thiscomment = new Comment( {threadId: req.params.id, nickname: req.body.nickname, response: req.body.response, rank: req.body.rank, email: req.body.email, public: req.body.public, created_at: Date.now()} );//mongoose.model('Thread');
		thiscomment.save(function (err, fluffy) {
		    if (err){
			  	loglog("Faile to add comment: "+err,"ERROR");
				res.end("ERROR: Faile to add comment: "+err);
				//res.render('commentFail', data);
			  	return;
		    } 
		    //get comments and calc average rank
		      var ress = [];
			  	ress.push(new Promise((resolve, reject)=>{ Comment.find({threadId:req.params.id}, function(err, qqq){
			  		var sum=0;
			  		qqq.forEach(function(ele){ sum+=parseInt(ele.rank); });
			  		avgRank = sum/qqq.length ;//calc average rank
			  		resolve();
			  	} ); }) );
			  Promise.all(ress).then(function() {
			    //send mail to owner
				var mailOptions = {
				    from: siteEmail, // sender address
				    to: thethread.email, // list of receivers
				    subject: '['+thethread.title+'] New comment for you! rank "'+req.body.rank+'"', // Subject line
				    text: 'Thread main page: '+siteHost+'/thread/'+req.params.id+'/show \n'+ //, // plaintext body
				    	'Rank: '+req.body.rank+' (average:'+avgRank+')\n'+
				    	req.body.nickname+'('+req.body.email+') said: \n'+
				    	req.body.response+' \n'
				    // html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
				};
				transporter.sendMail(mailOptions, function(error, info){
				    if(error){
				        loglog("addComment failed to send mail to owner: "+error,"ERROR");
				        //res.json({yo: 'error'});
				    }else{
				        //console.log('Message sent: ' + info.response);
				        //res.json({yo: info.response});
				    };
				});
				loglog("addComment "+thiscomment._id,"INFO");
				res.render('commentSuccess', thethread);
			  });
		});
	})
});

module.exports = router;
