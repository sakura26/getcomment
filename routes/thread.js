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
    image_url    : { type: String },
    placed_at    : { type: String },
    style    : { type: String },
    recipe    : { type: String },
    pass    : { type: String },
    created_at : { type: Date },
    updated_at : { type: Date }
});
var CommentSchema = new Schema({
	threadId : String,
    nickname    : String,
    response    : String,
    score    : Number,
    scoreBJCP :Number,
    bjcppass	: String, 
    email	: String, 
    public	: String, 
    bjcp_id	: String, 
    created_at : { type: Date },
    updated_at : Date
});
var BJCPerSchema = new Schema({
	bjcppass : String,
    nickname : String,
    email	: String, 
    public	: String, 
    bjcp_id	: String, 
    created_at : { type: Date },
    updated_at : Date
});
var Thread = mongoose.model( 'Thread', ThreadSchema );
var Comment = mongoose.model( 'Comment', CommentSchema );
var BJCPer = mongoose.model( 'BJCPer', BJCPerSchema );


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
	if (req.params.id=='createEmpty'){
		createEmpty(req, res);
		return;
	}
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
	  delete qq.pass;
	  var ress = [];
	  //gen QRCode
	  ress.push(new Promise((resolve, reject)=>{  QRCode.toDataURL(siteHost+'/thread/'+req.params.id+'/show',function(err, qrcode){qq.qrcode = qrcode;resolve();}); }) );
	  ress.push(new Promise((resolve, reject)=>{ Comment.find({threadId:req.params.id}, function(err, comments){
	  	//get comments
  		if (thisthread.public=='yes')  //show if public
  			qq.comments = comments;
  		//calc avgRank
  		var sum=0, bjcpsum=0, bjcpcount=0;
  		comments.forEach(function(ele){ 
  			ele.bjcppass = "masked";
  			sum+=ele.score; 
  			if(ele.scoreBJCP>-1 && ele.scoreBJCP<51){
  				bjcpcount++; 
  				bjcpsum+=ele.scoreBJCP;
  			} 
  		});
  		qq.avgScore = sum/comments.length ;//calc average rank
  		qq.avgScoreBJCP = bjcpsum/bjcpcount;//calc average rank
  		resolve();
	  } ); }) );
	  Promise.all(ress).then(function() {
	  	res.writeHead( 201, {'Content-Type' : 'text/plain'});
		res.end(JSON.stringify(qq));
	  });
	});
});

createEmpty = function(req, res) {
	//TODO: validate email!
	//TODO: send notify email!
	var thisthread = new Thread( {
		public: 'pregen', 
		title: 'This tag is not set yet~ ',
		created_at: Date.now(),
		pass: genRandomString(5)} );//mongoose.model('Thread');
	thisthread.save(function (err, fluffy) {
	  if (err) return console.error(err);
	  var editurl = siteHost+'/thread/'+thisthread._id+'/edit/'+thisthread.pass;
	  var viewurl = siteHost+'/thread/'+thisthread._id+'/show';
	  	QRCode.toDataURL(editurl,function(err, qrcode_edit){
			QRCode.toDataURL(viewurl,function(err, qrcode){
				loglog("prelocateThread "+thisthread._id,"INFO");
				res.render('preGenCode', {qrcode: qrcode, qrcode_edit: qrcode_edit, url_edit: editurl, url_show: viewurl});
			});
		});
	});
}

router.post('/', function(req, res) {
	//TODO: validate email!
	//TODO: send notify email!
	var clearComment = xssFilters.inHTMLData(req.body.ownerSaid);
	//for (i = 0; i < 5; i++) 
	//    clearComment = clearComment.replace(/\n$/, '<br>');
	var WTF1=genRandomString(5);
	var WTF2=Date.now();
	var thisthread = new Thread( 
	  {nickname: xssFilters.inHTMLData(req.body.nickname), 
	  title: xssFilters.inHTMLData(req.body.title), 
	  ownerSaid: clearComment, 
	  tags: xssFilters.inHTMLData(req.body.tags), 
	  email: xssFilters.inHTMLData(req.body.email), 
	  defaultResponse: xssFilters.inHTMLData(req.body.defaultResponse), 
	  recipe: xssFilters.inHTMLData(req.body.recipe), 
	  style: xssFilters.inHTMLData(req.body.style), 
	  image_url: xssFilters.inHTMLData(req.body.image_url), 
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
	var clearComment = xssFilters.inHTMLData(req.body.ownerSaid);
	//for (i = 0; i < 5; i++) 
	//    clearComment = clearComment.replace(/\n$/, '<br>');
	var WTF1=genRandomString(5);
	var WTF2=Date.now();
	var thisthread = new Thread( {
		nickname: xssFilters.inHTMLData(req.body.nickname), 
		title: xssFilters.inHTMLData(req.body.title), 
		ownerSaid: clearComment,
		tags: xssFilters.inHTMLData(req.body.tags), 
		email: xssFilters.inHTMLData(req.body.email), 
		defaultResponse: xssFilters.inHTMLData(req.body.defaultResponse), 
		public: xssFilters.inHTMLData(req.body.public), 
	  	recipe: xssFilters.inHTMLData(req.body.recipe), 
	  	style: xssFilters.inHTMLData(req.body.style), 
	  	image_url: xssFilters.inHTMLData(req.body.image_url), 
		pass: WTF1, 
		created_at: WTF2} );//mongoose.model('Thread');
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
	  delete qq.pass;
	  var ress = [];
	  //gen QRCode
	  ress.push(new Promise((resolve, reject)=>{  QRCode.toDataURL(siteHost+'/thread/'+req.params.id+'/show',function(err, qrcode){qq.qrcode = qrcode;resolve();}); }) );
	  ress.push(new Promise((resolve, reject)=>{ Comment.find({threadId:req.params.id}, function(err, comments){
	  	//get comments
  		if (thisthread.public=='yes')  //show if public
  			qq.comments = comments;
  		//calc avgRank
  		var sum=0, bjcpsum=0, bjcpcount=0;
  		comments.forEach(function(ele){ 
  			ele.bjcppass = "masked";
  			sum+=ele.score; 
  			if(ele.scoreBJCP>-1 && ele.scoreBJCP<51){
  				bjcpcount++; 
  				bjcpsum+=ele.scoreBJCP;
  			} 
  		});
  		qq.avgScore = sum/comments.length ;//calc average rank
  		qq.avgScoreBJCP = bjcpsum/bjcpcount;//calc average rank
  		resolve();
	  } ); }) );
	  Promise.all(ress).then(function() {
	  	//loglog(JSON.stringify(qq));
	  	res.render('threadshow', qq);
	  });
	});
});

router.get('/:id/printA4Detail', function(req, res) {
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
	  var viewurl = siteHost+'/thread/'+thisthread._id+'/show';
	  qq.url_show = viewurl;
	  ress.push(new Promise((resolve, reject)=>{  QRCode.toDataURL(viewurl,function(err, qrcode){qq.qrcode = qrcode;resolve();}); }) );
	  Promise.all(ress).then(function() {
	  	//loglog(JSON.stringify(qq));
	  	res.render('printA4Detail', qq);
	  });
	});
});
router.get('/:id/printA4QRCode', function(req, res) {
	//var qr;
	QRCode.toDataURL(siteHost+'/thread/'+req.params.id+'/show',function(err, qrcode){
		///qr.qrcode = qrcode;
		res.render('printA4QRCode', {qrcode: qrcode});
	});
});

router.get('/:id/qrcode', function(req, res) {
	//TOOD: validate owner!
	QRCode.toDataURL(siteHost+'/thread/'+req.params.id+'/show', function (err, url) {
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
	  if (data.public=="pregen"){
	  	data.created_at = Date.now();
	  }
	  data.updated_at = Date.now();
	  data.title = req.body.title;
	  data.nickname = req.body.nickname;
	  data.ownerSaid = req.body.ownerSaid;
	  data.tags = req.body.tags;
	  data.defaultResponse = req.body.defaultResponse;
	  data.public = req.body.public;
	  data.email = req.body.email;
	  data.image_url = req.body.image_url;
	  data.style = req.body.style;
	  data.recipe = req.body.recipe;
	  //data.created_at = Date.now();
	  data.save(function (err, updatedTank) {
	    if (err) return loglog(err);
	    //res.send(updatedTank);
	  });
	  res.redirect("/thread/"+req.params.id+"/show");
	})
});
router.put('/:id/:pass', function(req, res) {
	//TOOD: validate owner!
	loglog("updThread "+req.params.id,"INFO");

	//var thisthread = new Thread();//mongoose.model('Thread');
	Thread.findOne({_id:ObjectId(req.params.id)}, function (err, data) {
	  if (err){
	  	res.writeHead( 500, {'Content-Type' : 'text/plain'});
	    res.end(JSON.stringify({status:"error", msg:"exception:"+err}));
	    return;
	  } 
	  if (req.params.pass != data.pass){
	  	res.end("password not match");
	  	return;
	  }
	  if (data.public=="pregen"){
	  	data.created_at = Date.now();
	  }
	  data.updated_at = Date.now();
	  data.title = req.body.title;
	  data.nickname = req.body.nickname;
	  data.ownerSaid = req.body.ownerSaid;
	  data.tags = req.body.tags;
	  data.defaultResponse = req.body.defaultResponse;
	  data.public = req.body.public;
	  data.email = req.body.email;
	  data.image_url = req.body.image_url;
	  data.style = req.body.style;
	  data.recipe = req.body.recipe;
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
	  //loglog("new comment","INFO");
	  //check bjcppass
	  	BJCPer.findOne({bjcppass: req.body.bjcppass}, function(err, bjcper){ 
	  		//loglog("bjcper:"+bjcper,"DEBUG");
	  		if(bjcper!=null){
	  			var thiscomment = new Comment( {
			  		threadId: xssFilters.inHTMLData(req.params.id), 
			  		nickname: xssFilters.inHTMLData(req.body.nickname), 
			  		response: xssFilters.inHTMLData(req.body.response), 
			  		score: xssFilters.inHTMLData(req.body.score), 
			  		scoreBJCP: xssFilters.inHTMLData(req.body.scoreBJCP), 
			  		bjcppass: xssFilters.inHTMLData(req.body.bjcppass), 
			  		email: xssFilters.inHTMLData(req.body.email), 
			  		public: xssFilters.inHTMLData(req.body.public), 
			  		created_at: Date.now()} );//mongoose.model('Thread');
	  		} 
	  		else{
	  			var thiscomment = new Comment( {
			  		threadId: xssFilters.inHTMLData(req.params.id), 
			  		nickname: xssFilters.inHTMLData(req.body.nickname), 
			  		response: xssFilters.inHTMLData(req.body.response), 
			  		score: xssFilters.inHTMLData(req.body.score), 
			  		scoreBJCP: xssFilters.inHTMLData(req.body.scoreBJCP), 
			  		email: xssFilters.inHTMLData(req.body.email), 
			  		public: xssFilters.inHTMLData(req.body.public), 
			  		created_at: Date.now()} );//mongoose.model('Thread');
	  		}
	  		var avgRank;
			thiscomment.save(function (err, fluffy) {
			    if (err){
				  	loglog("Faile to add comment: "+err,"ERROR");
					res.end("ERROR: Faile to add comment: "+err);
					//res.render('commentFail', data);
				  	return;
			    } 
			    //loglog("comment saved","DEBUG");
			    //get comments and calc average rank
			      var ress = [];
			      var avgScore, avgScoreBJCP;
				  ress.push(new Promise((resolve, reject)=>{ Comment.find({threadId:req.params.id}, function(err, comments){
			  		var sum=0, bjcpsum=0, bjcpcount=0;
			  		comments.forEach(function(ele){ sum+=ele.score; if(ele.scoreBJCP>-1 && ele.scoreBJCP<51){bjcpcount++; bjcpsum+=ele.scoreBJCP;} });
			  		avgScore = sum/comments.length ;//calc average rank
			  		avgScoreBJCP = bjcpsum/bjcpcount;//calc average rank
			  		//loglog("score calc:"+avgScore,"DEBUG");
			  		resolve();
				  } ); }) );
				  Promise.all(ress).then(function() {
				  	if (req.body.scoreBJCP>-1 && req.body.scoreBJCP<51)
				  		var bjcps = "BJCP Score:"+req.body.scoreBJCP+"/50 (average BJCP score:"+avgScoreBJCP+") \n";
				  	else
				  		var bjcps = "";
				    //send mail to owner
					var mailOptions = {
					    from: siteEmail, // sender address
					    to: thethread.email, // list of receivers
					    subject: '['+thethread.title+'] New comment for you! Score "'+req.body.score+'/100"', // Subject line
					    text: 'Thread main page: '+siteHost+'/thread/'+req.params.id+'/show \n'+ //, // plaintext body
					    	'Score: '+req.body.score+'/100 (average score:'+avgScore+')\n'+
					    	bjcps+
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
	})
});

module.exports = router;