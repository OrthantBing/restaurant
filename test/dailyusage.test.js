var app = require('../app');
var assert = require('assert');
var request = require('superagent');
var expect = require('expect.js');
var http = require('http');
var models = require('../models');

var port = '4000';
app.set('port', port);
var server = http.createServer(app);

server.listen(port, function() {
    console.log('Express server listening on port ' + app.get('port'));
});

var user1 = request.agent();

var appurl = 'http://localhost:' + app.get('port');

describe('DailyUsage Schema BDD', function() {
    var adminuser;
    var normaluser;
    var datetime = Date.now();
    var fooditem = [];
    var addonitem = [];
    var promise;
    var cartid;
    var cartinfo;
    before(function() {
        return new Promise(function(resolve, reject) {
                models.user.create([{
                        firstname: "dev",
                        lastname: "test1",
                        displayName: "devtest1",
                        email: "dev@aggu.in",
                        admin: true,
                        created: datetime,
                        updated: datetime
                    },
                    {
                        firstname: "dev",
                        lastname: "test2",
                        displayName: "devtest2",
                        email: "dev@aggu.in",
                        created: datetime,
                        updated: datetime
                    }
                ], function(err, data) {
                    if (err) return done(err);
                    resolve(data);
                });
            }).then(function(data) {
                adminuser = data[0]._id;
                normaluser = data[1]._id;
                var datetime = Date.now();
                return new Promise(function(resolve, reject) {
                        models.food.create([{
                                nature: 'addons',
                                name: 'Appalam',
                                description: "Desi Appalam",
                                available: true,
                                created: datetime,
                                updated: datetime,
                                createdby: adminuser,
                                updatedby: adminuser,
                                price: 10
                            },
                            {
                                nature: 'addons',
                                name: 'Masala Appalam',
                                description: "This contains masala appalam contents",
                                available: true,
                                created: datetime,
                                updated: datetime,
                                createdby: adminuser,
                                updatedby: adminuser,
                                price: 15,
                            },
                            {
                                nature: 'breakfast',
                                name: 'Dosa',
                                description: "This is the plain dosa",
                                available: true,
                                created: datetime,
                                updated: datetime,
                                createdby: adminuser,
                                updatedby: adminuser,
                                price: 40,
                            },
                            {
                                nature: 'breakfast',
                                name: 'Set Dosa',
                                description: "This contains the set of 2 dosas",
                                available: true,
                                created: datetime,
                                updated: datetime,
                                createdby: adminuser,
                                updatedby: adminuser,
                                price: 45
                            }
                        ], function(err, data) {
                            if (err) return done(err);
                            addonitem.push(data[0]._id, data[1]._id);
                            fooditem.push(data[2]._id, data[3]._id);
                            resolve(data);
                        });
                    })
                    .then(function(data) {
                        return new Promise(function(resolve, reject) {
                                models.food.find({
                                    _id: {
                                        $in: [data[0]._id, data[1]._id, data[2]._id, data[3]._id]
                                    }
                                }, function(err, data) {
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
                                models.cartinfo.create({
                                    user: normaluser,
                                    content: fooditem,
                                    price: price,
                                    created: datetime,
                                    updated: datetime,
                                }, function(err, data) {
                                    if (err) reject(err);
                                    cartid = data._id;
                                    /*
                                    models.cartinfo.populate(data, {
                                        path: 'content'
                                    }, function(err, resp) {
                                        if (err) next(err);
                                        cartinfo = resp;
                                        console.log(fooditem);
                                        //done();
                                    });
                                    */
                                });
                            })
                            .catch(function(err) {
                                if (err) reject(err);
                            });
                    })
                    .catch(function(err) {
                        if (err) reject(err);
                    });
            })
            .catch(function(err) {
                if (err) return done(err);
            });
    });

    it('Process Cart', function(done) {
        user1.post(appurl + '/api/dailyusage')
            .send({
                userid: normaluser,
                cartid: cartid,
                offer: 'M2M10',
                paymenttype: 'COD'
            })
            .end(function(e, res) {
                console.log(res.body);
                assert.equal(res.status, 200);
                done();
            });
    });

    after(function() {
        models.user.remove({ _id: { $in: [adminuser, normaluser] } }, function(err, data) {
            if (err) return done(err);
        });
    });

});