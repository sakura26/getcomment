var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// by s2
//var sqlite3 = require('sqlite3');  
var mongodb = require('mongodb');
var crypto = require('crypto');
sanitize = require('mongo-sanitize');
var nodemailer = require('nodemailer');
xssFilters = require('xss-filters');

var config = require('./config.js');

// INIT
//mongodbServer = new mongodb.Server('localhost', 27017, { auto_reconnect: true, poolSize: 10 });
//db = new mongodb.Db('getcomment', mongodbServer);
//db = mongoose.connection;
//db.on('error', console.error.bind(console, 'connection error:'));

var routes = require('./routes/index');
var threads = require('./routes/thread');
var app = express();

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
genRandomString = function(length){
    return crypto.randomBytes(Math.ceil(length/2))
            .toString('hex') /** convert to hexadecimal format */
            .slice(0,length);   /** return required number of characters */
};


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/thread', threads);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;

app.listen(sitePort, function () {
  console.log('GetComment listening on port '+sitePort)
})
