siteTitle = "戳我！";
siteHost = "http://localhost:3000";
siteEmail = "getcomment@localhost";
sitePort = 3000;

ObjectId = require('mongodb').ObjectId;
mongoose = require( 'mongoose' );
Schema   = mongoose.Schema;
mongoose.Promise = require('bluebird');
//assert.equal(query.exec().constructor, require('bluebird'));
mongoose.connect( 'mongodb://localhost/getcomment' );

var nodemailer = require('nodemailer');
transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'getcomment@localhost', // Your email id
        pass: 'xxxxxx' // Your password
    }
});
/*
var mailOptions = {
    from: siteEmail, // sender address
    to: 'sakura26@ccsakura-net.com', // list of receivers
    subject: 'Email Example', // Subject line
    text: 'test me QQ' //, // plaintext body
    // html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
};

transporter.sendMail(mailOptions, function(error, info){
    if(error){
        console.log(error);
        //res.json({yo: 'error'});
    }else{
        console.log('Message sent: ' + info.response);
        //res.json({yo: info.response});
    };
});*/