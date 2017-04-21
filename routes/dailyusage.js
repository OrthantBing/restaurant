var offers = require('../utils/offers');

var offerhash = {
    'M2M10': {
        type: 'percentoffer',
        value: 10
    },
    'M2M50': {
        type: 'flatoffer',
        value: 50
    }
};

var add = function(req, res, next) {
    var DailyUsageModel = req.db.DailyUsage;
    var CartModel = req.db.CartInfo;
    var datetime = Date.now();

    var userid = req.body.userid;
    var cartid = req.body.cartid;
    var offer = req.body.offerid;
    //var price = req.body.price;
    var discountprice = 0;
    var currentstatus = 'Created';
    var paymenttype = req.body.paymenttype;

    return new Promise(function(resolve, reject) {
        CartModel.find({ _id: cartid }, function(err, data) {
            if (err) reject(err);
            var discountedprice = data[0].price;
            if (offerhash.hasOwnProperty(offer)) {
                var offermethod = offerhash[offer].type;
                discountedprice = offers[offermethod](data[0].price, offerhash[offer].value);
            }
            resolve(discountedprice);
        });
    }).then(function(price) {
        DailyUsageModel.create({
            user: userid,
            cartinfo: cartid,
            created: datetime,
            updated: datetime,
            offer: offer,
            price: price,
            currentstatus: currentstatus,
            paymenttype: paymenttype,

            statushistory: {
                name: currentstatus,
                timestamp: datetime
            }
        }, function(err, data) {
            if (err) next(err);
            DailyUsageModel.populate(data, {
                path: 'cartinfo'
            }, function(err, resp) {
                if (err) next(err);
                var apiresponse = {
                    dailyusage: resp
                };
                res.json(apiresponse);
            });
        });
    });
};

var checkAndUpdate = function(req, res, next) {
    var DailyUsageModel = req.db.DailyUsage;
    var CartModel = req.db.CartInfo;
    var datetime = Date.now();

    var userid = req.body.userid;
    var cartid = req.body.cartid;
    var offer = req.body.offerid;
    var paymenttype = req.body.paymenttype;
    var discountprice = 0;
    var status;
    if (paymenttype === 'COD') {
        status = 'Placed';
    } else {
        status = req.body.status;
    }

    return new Promise(function(resolve, reject) {
            DailyUsageModel.findOne({
                    cartinfo: cartid
                })
                .populate({
                    path: 'cartinfo',
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
                var cartcontent = data.cartinfo;
                var discountedprice = cartcontent.price;
                if (offerhash.hasOwnProperty(offer)) {
                    var offermethod = offerhash[offer].type;
                    discountedprice = offers[offermethod](cartcontent.price, offerhash[offer].value);
                }
                DailyUsageModel.findByIdAndUpdate(data._id, {
                        paymenttype: paymenttype,
                        offer: offer,
                        price: discountedprice,
                        updated: datetime,
                        created: status,
                        $push: {
                            'statushistory': {
                                name: 'Created' || status,
                                timestamp: datetime
                            }
                        }
                    }, {
                        new: true,
                        safe: true,
                    })
                    .populate({
                        path: 'cartinfo'
                    })
                    .exec(function(err, data) {
                        if (err) next(err);
                        var apiresponse = {
                            dailyusage: data
                        };
                        res.json(apiresponse);
                    });
            }
        }).catch(function(err) {
            next(err);
        });
};

var updatestatus = function(req, res, next) {
    if (!req.body.status) {
        next();
    }
    var DailyUsageModel = req.db.DailyUsage;
    var datetime = Date.now();
    DailyUsageModel.findByIdAndUpdate(req.params.id, {
            currentstatus: req.body.status,
            $push: {
                'statushistory': {
                    name: 'Created' || status,
                    timestamp: datetime
                }
            },
            updated: datetime,
        }, {
            new: true,
            safe: true,
        })
        .populate({
            path: 'cartinfo'
        })
        .exec(function(err, data) {
            if (err) next(err);
            var apiresponse = {
                dailyusage: data
            };
            res.json(apiresponse);
        });
};

var updatepayment = function(req, res, next) {
    if (!req.body.paymenttype) {
        next();
    }
    var DailyUsageModel = req.db.DailyUsage;
    var datetime = Date.now();
    DailyUsageModel.findByIdAndUpdate(req.params.id, {
            paymenttype: req.body.paymenttype,
            updated: datetime,
        }, {
            new: true,
            safe: true
        })
        .populate({
            path: 'cartinfo'
        })
        .exec(function(err, data) {
            if (err) next(err);
            var apiresponse = {
                dailyusage: data
            };
            res.json(apiresponse);
        });
};

module.exports = {
    add: add,
    checkAndUpdate: checkAndUpdate,
    updatepayment: updatepayment,
    updatestatus: updatestatus
};