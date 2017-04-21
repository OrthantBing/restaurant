var offers = require('../utils/offers');

var add = function(req, res, next) {
    var CartModel = req.db.CartInfo;
    var FoodModel = req.db.Food;
    var datetime = Date.now();
    //var user = req.session.id;
    // for now we get the userid from the req.
    var userid = req.body.user;
    // We probably need content.id here
    var fooditems = req.body.content;



    new Promise(function(resolve, reject) {
            FoodModel.find({ _id: { $in: fooditems } }, function(err, data) {
                if (err) reject(err);
                var price = 0;
                if (data.length) {
                    price = data.reduce(function(prev, next) {
                        return prev + next.price;
                    }, 0);
                }
                resolve(price);
            });
        })
        .then(function(data) {
            CartModel.create({
                user: userid,
                content: fooditems,
                price: data,
                created: datetime,
                updated: datetime
            }, function(err, data) {
                if (err) next(err);
                CartModel.populate(data, {
                    path: 'content'
                }, function(err, resp) {
                    if (err) next(err);
                    var apiresponse = {
                        cart: resp
                    };
                    res.json(apiresponse);
                });
            });
        })
        .catch(function(reason) {
            next(reason);
        });
};



var getCart = function(req, res, next) {
    var userid = req.query.userid;
    var CartModel = req.db.CartInfo;
    CartModel.findOne({
            user: userid,
            processed: false
        })
        .populate({
            path: 'content'
        })
        .exec(function(err, data) {
            if (err) next(err);
            var apiresponse = {
                cart: data
            };
            res.json(apiresponse);
        });
};
/*
var pushtoCart = function(req, res, next) {
    var cartid = req.params.cartid;
    var CartModel = req.db.CartInfo;
    var food = req.body.content;
    CartModel.findByIdAndUpdate(cartid, {
        $push: { content: food },
    }, {
        safe: true,
        upsert: true,
        new: true
    }, function(err, data) {
        if (err) next(err);
        console.log(data);
        res.json(data);
    });
};
*/

// This is a middleware that would check if a cart exists for a user,
// And update the cart with the appropriate info, that is coming in.
// Hopefully will be useful if the user already has an uprocessed cart.
var getAndUpdateCart = function(req, res, next) {
    var userid = req.body.user;
    var CartModel = req.db.CartInfo;
    var FoodModel = req.db.Food;
    var fooditems = req.body.content;

    return new Promise(function(resolve, reject) {
            CartModel.findOne({
                    user: userid,
                    processed: false
                })
                .exec(function(err, data) {
                    if (err) next(err);
                    resolve(data);
                });
        })
        .then(function(data) {
            if (data === null) {
                next();
            } else {
                _getPrice(fooditems, FoodModel)
                    .then(function(price) {
                        CartModel.findByIdAndUpdate(data._id, {
                                $push: {
                                    content: {
                                        $each: fooditems
                                    },
                                },
                                price: data.price + price
                            }, {
                                upsert: true,
                                new: true,
                                safe: true,
                            })
                            .populate({
                                path: 'content'
                            })
                            .exec(function(err, data) {
                                if (err) next(err);
                                var apiresponse = {
                                    cart: data
                                };
                                res.json(apiresponse);
                            });
                    })
                    .catch(function(err) {
                        next(err);
                    });
            }
        })
        .catch(function(err) {
            if (err) next(err);
        });
};

var updateCart = function(req, res, next) {
    var cartid = req.params.id;
    var CartModel = req.db.CartInfo;
    var FoodModel = req.db.Food;
    var datetime = Date.now();
    //var user = req.session.id;
    // for now we get the userid from the req.
    // We probably need content.id here
    var fooditems = req.body.content;
    var userid = req.body.user;
    //Probably do an array.filter to get the fooditems ids.

    new Promise(function(resolve, reject) {
            FoodModel.find({ _id: { $in: fooditems } }, function(err, data) {
                if (err) reject(err);
                var price = 0;
                if (data.length) {
                    price = data.reduce(function(prev, next) {
                        return prev + next.price;
                    }, 0);
                }
                resolve(price);
            });
        })
        .then(function(price) {
            CartModel.findByIdAndUpdate(cartid, {
                    user: userid,
                    content: fooditems,
                    price: price,
                    update: datetime,
                    processed: false,
                })
                .populate({
                    path: 'content'
                })
                .exec(function(err, data) {
                    if (err) next(err);
                    var apiresponse = {
                        cart: data
                    };
                    res.json(apiresponse);
                });
        })
        .catch(function(err) {
            next(err);
        });
};

var _getPrice = function(fooditems, FoodModel) {
    return new Promise(function(resolve, reject) {
        FoodModel.find({
                _id: {
                    $in: fooditems
                }
            })
            .exec(function(err, data) {
                if (err) reject(err);
                var price = 0;
                if (data.length) {
                    price = data.reduce(function(prev, next) {
                        return prev + next.price;
                    }, 0);
                }
                resolve(price);
            });
    });
};

module.exports = {
    add: add,
    getCart: getCart,
    getAndUpdateCart: getAndUpdateCart,
    updateCart: updateCart,
};