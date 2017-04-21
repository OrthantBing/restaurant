var app = require('../app');
var assert = require('assert');
var request = require('superagent');
var expect = require('expect.js')
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

describe('Food Schema BDD', function() {
    var adminuser;
    var normaluser;
    var datetime = Date.now();
    var fooditem = [];
    var addonitem = [];
    before(function() {
        new Promise(function(resolve, reject) {
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
                }
            ], function(err, data) {
                if (err) return done(err);
                addonitem.push(data[0]._id, data[1]._id);
            });
        });
    });

    after(function() {
        models.user.remove({ _id: { $in: [adminuser, normaluser] } }, function(err, data) {
            if (err) return done(err);
        });
    });


    it('Checks status', function(done) {
        user1.get(appurl + '/api/fooditems').end(function(e, res) {
            assert.equal(res.status, 200);
            done();
        });
    });

    it('Add FoodItem', function(done) {
        user1.post(appurl + '/api/fooditems')
            .send({
                nature: "breakfast",
                name: "Dosa",
                description: "Contains 2 idlis",
                available: true,
                createdby: adminuser,
                updatedby: adminuser,
                price: 30
            })
            .end(function(e, res) {
                assert.equal(res.status, 200);
                fooditem.push(res.body._id);
                done();
            });
    });

    it('Add addon FoodItem', function(done) {
        user1.post(appurl + '/api/fooditems')
            .send({
                nature: "addons",
                name: "Fries",
                description: "These are authentic french fries",
                available: true,
                createdby: adminuser,
                updatedby: adminuser,
                price: 20
            })
            .end(function(e, res) {
                assert.equal(res.status, 200);
                addonitem.push(res.body._id);
                done();
            });
    });

    it('Update FoodItem, price increase, add addons', function(done) {
        user1.put(appurl + '/api/fooditems/' + fooditem[0])
            .send({
                price: 30,
                addons: addonitem
            })
            .end(function(e, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body.name, "Dosa");
                assert.equal(res.body.createdby, adminuser);
                assert.equal(res.body.price, 30);
                assert.equal(res.body.addons.length, 3);
                assert.notEqual(res.body.updated, res.body.created);
                done();
            });
    });

    it('Check addon content', function(done) {
        user1.get(appurl + '/api/fooditems/' + fooditem[0])
            .end(function(e, res) {
                assert.equal(res.status, 200);
                console.log(res.body[0].addons[0]);
                done();
            });
    });

    it('Delete FoodItems', function() {
        // We should ideally get the food items that were created.
        // This is written to learn about promises.
        return new Promise(function(resolve, reject) {
                user1.get(appurl + '/api/fooditems')
                    .end(function(e, res) {
                        resolve(res);
                    });
            })
            .then(function(res) {
                var content = res.body;
                var idarray = [];
                for (var i = 0; i < content.length; i += 1) {
                    idarray.push(content[i]);
                }
                return idarray;
            })
            .then(function(delarray) {
                return models.food.remove({ _id: { $in: delarray } });
            })
            .then(function(res) {
                expect(res.result.ok).to.equal(1);
            });
    });
});