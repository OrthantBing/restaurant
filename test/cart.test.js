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

describe('Cart Schema BDD', function() {
    var adminuser;
    var normaluser;
    var datetime = Date.now();
    var fooditem = [];
    var addonitem = [];
    var promise;
    var cartid;
    before(function() {
        promise = new Promise(function(resolve, reject) {
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
            });
        });
    });

    it('Checks status', function(done) {
        promise.then(function(data) {
            user1.get(appurl + '/api/cart?userid=' + normaluser)
                .end(function(e, res) {
                    assert.equal(res.status, 200);
                    done();
                });
        });
    });

    it('Add to cart', function(done) {
        promise.then(function(data) {
            user1.post(appurl + '/api/cart')
                .send({
                    user: normaluser,
                    content: fooditem,
                })
                .end(function(e, res) {
                    cartid = res.body._id;
                    //console.log(res.body);
                    assert.equal(res.status, 200);
                    assert.equal(res.body.price, 85);
                    done();
                });
        });
    });

    it('Check for already existing cart info', function(done) {
        promise.then(function(data) {
            user1.post(appurl + '/api/cart')
                .send({
                    user: normaluser,
                    content: fooditem,
                })
                .end(function(e, res) {
                    //console.log(res.body);
                    assert.equal(res.status, 200);
                    assert.equal(res.body.price, 170);
                    done();
                });
        });
    });
    /*
        it('Create Empty Cart', function(done) {
            promise.then(function(data) {
                    user1.post(appurl + '/api/cart');
                })
                .send({
                    user: normaluser,
                })
                .end(function(e, res) {
                    console.log(res.body);
                    assert.equal(res.status, 200);
                });
        });
    */

    it('Update Cart with addons', function(done) {
        var cartitem = [fooditem[0], addonitem[0]];
        promise.then(function(data) {
            user1.put(appurl + '/api/cart/' + cartid)
                .send({
                    user: normaluser,
                    content: cartitem,
                    processed: false
                })
                .end(function(e, res) {
                    console.log(res.body);
                    assert.equal(res.status, 200);
                    done();
                });
        });
    });

    it('Get Cart info', function(done) {
        promise.then(function(data) {
            user1.get(appurl + '/api/cart?userid=' + normaluser)
                .end(function(e, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.content[0]._id, fooditem[0]);
                    assert.equal(res.body.content[0].price, 40);
                    done();
                });
        });
    });


    after(function() {
        models.user.remove({ _id: { $in: [adminuser, normaluser] } }, function(err, data) {
            if (err) return done(err);
        });
    });
});