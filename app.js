var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');


/*
 * Database connection and stuffs
 *
 */

var dbUrl = process.env.MONGOHQ_URL || 'mongodb://localhost/m2m';

var mongoose = require('mongoose');


mongoose.Promise = global.Promise;
mongoose.connect(dbUrl)
    .then(function() {
        console.log("Connection establised");
    })
    .catch(function(err) {
        console.error(err);
    });


var models = require('./models');

/* db
 *
 * Description:
 *  middleware that hooks the db info to the req
 * 
 */
function db(req, res, next) {
    req.db = {
        User: models.user,
        Food: models.food,
        DailyUsage: models.dailyusage,
        CartInfo: models.cartinfo
    };
    return next();
}

var routes = require('./routes');

var app = express();

// This is the one that allows the request from our ember server.
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, PATCH, DELETE, OPTIONS');
    next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('node-sass-middleware')({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: true,
    sourceMap: true
}));

app.use(express.static(path.join(__dirname, 'public')));


/*
 *
 * 
 * 
 * 
 * 
 */
function checkAdmin(req, res, next) {
    // Add the logic to check if the user is logged in or not.
    // Check the cookie info and find the user.
    // Add it to the request like req.user = userid.
    return next();
}

function checkUser(req, res, next) {
    return next();
}
/* Main:
 *  1) Login
 *  2) Logout
 *
 *
 *
 */

//Once the login is done, check for the open cart info
//Another webservice call to /api/users/:id in the background,
//and update the cart once the response is got.
//app.post('/api/login', db, routes.main.login);

//app.post('/api/logout', routes.main.logout);

/* User
 *
 *
 *
 *
 *
 */

app.get('/api/users', checkAdmin, db, routes.users.getUsers);

//Comapre the sessionid with the id passed and get the info.
//Secondly, get the cart info. [use params??]
//For history, we can say use params={history:true}

app.get('/api/users/:id', checkUser, db, routes.users.getUser);
app.post('/api/users', db, routes.users.add);

//Check for the elite customer here too.
app.put('/api/users/:id', db, routes.users.updateUser);
app.delete('/api/users/:id', db, routes.users.remove);


/* Food
 *
 *
 *
 *
 *
 */
//For Admin
app.post('/api/fooditems', checkAdmin, db, routes.food.add);
app.put('/api/fooditems/:id', checkAdmin, db, routes.food.update);

//Get the params info about breakfast, lunch, dinner, all.
//
app.get('/api/fooditems', checkUser, db, routes.food.getItems);
app.get('/api/fooditems/:id', checkUser, db, routes.food.getItem);
//app.delete('/api/fooditems/:id', checkAdmin, db, routes.food.deleteItem);


/* Cart
 *
 * 
 * 
 */
//Lets try it out with query info.
app.get('/api/cart', checkUser, db, routes.cart.getCart);
/* Daily Usage
 *
 *
 *
 *
 *
 */
app.post('/api/cart', checkUser, db, routes.cart.getAndUpdateCart, routes.cart.add);
app.put('/api/cart/:cartid', checkUser, db, routes.cart.updateCart);
//app.put('/api/cart/:id', checkUser, db, routes.cart.updateCart);
//app.get('/api/cart/history', checkUser, db, routes.cart.getUserItemHistory);


app.post('/api/dailyusage', checkUser, db, routes.dailyusage.checkAndUpdate, routes.dailyusage.add);
app.put('/api/dailyusage/:id', checkUser, db, routes.dailyusage.updatestatus, routes.dailyusage.updatepayment);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        console.error(err);
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