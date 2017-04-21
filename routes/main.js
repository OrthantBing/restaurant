//Requires go at the top
var bcrypt = require('bcryptjs');

/* checkAdmin
 *  Description:
 *      Middleware that checks if the user 
 * logged in is an administrator 
 * 
 */

exports.checkAdmin = function(req, res, next) {
    if (req.session && req.session.auth && req.session.userId && req.session.admin) {
        console.info('Access ADMIN: ' + req.session.userId);
        return next();
    } else {
        next('User is not an administrator');
    }
};

/* checkUser
 *  Description:
 *      Middleware the checks if the user
 * is an active user.
 * 
 * 
 */

exports.checkUser = function(req, res, next) {
    if (req.session && req.session.auth && req.session.userId) {
        console.info('Access USER: ' + req.session.userId);
        return next();
    } else {
        next('User is not logged in.');
    }
};

/* login
 *  Description: 
 *      Checks for username and password.
 * 
 * 
 * 
 */

// For reference: findOne takes the following parameters
// conditions, projection, options, callback
// here in the below query,
// condition: {email: req.body.email}
// projection: null
// options: {safe: true}
// callback: another function
exports.login = function(req, res, next) {
    console.log('Loggin user with email: ', req.body.email);
    req.db.User.findOne({
        email: req.body.email
    }, null, {
        safe: true
    }, function(err, user) {
        if (err) {
            return next(err);
        }
        if (user) {
            bcrypt.compare(req.body.password, user.password, function(err, match) {
                if (match) {
                    req.session.auth = true;
                    req.session.userId = user._id.toHexString();
                    req.session.user = user; //not sure if this is required considering the safety
                    if (user.admin) {
                        req.session.admin = true;
                    }
                    console.info('Login USER: ' + req.session.userId);
                    // Here we have to probably set the cookies
                    res.status(200).json({
                        msg: 'Authorized'
                    });
                } else {
                    next(new Error('Wrong password'));
                }
            });
        } else {
            next(new Error('Username not found'));
        }
    });
};

/* logout
 *
 * 
 * 
 * 
 */

exports.logout = function(req, res, next) {
    console.info('Logout USER: ' + req.session.userId);
    req.session.destroy(function(error) {
        if (!error) {
            res.send({
                msg: 'Logged out'
            });
        }
    });
};