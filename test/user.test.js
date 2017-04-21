var app = require('../app');
var assert = require('assert');
var request = require('superagent');
var expect = require('expect.js')
var http = require('http');


var port = '4000';
app.set('port', port);
var server = http.createServer(app);

server.listen(port, function() {
    console.log('Express server listening on port ' + app.get('port'));
});

var user1 = request.agent();

var appurl = 'http://localhost:' + app.get('port');

/*suite('APPLICATION API', function(){
    suiteSetup(function(done){
        done();
    });
});*/

describe('login as a user', function() {
    var normalid;
    var adminid;
    it('Checks status', function(done) {
        user1.get(appurl + '/api/users').end(function(e, res) {
            assert.equal(res.status, 200);
            done();
        });
    });

    it('Creates User', function(done) {
        user1.post(appurl + '/api/users')
            .send({
                firstname: "Shriram",
                lastname: "Thirukkumaran",
                email: "str@aggu.in",
                admin: true,
                created: Date.now()
            })
            .end(function(e, res) {
                normalid = res.body._id;
                assert.equal(res.status, 200);
                assert.equal(res.body.displayName, "Shriram Thirukkumaran");
                done();
            });
    });

    it('Updates User', function(done) {
        user1.put(appurl + '/api/users/' + normalid)
            .send({
                firstname: "Sriram",
                lastname: "Thirukkumaran",
                admin: true,
                email: "91tamilinban@gmail.com"
            })
            .end(function(e, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body.displayName, "Sriram Thirukkumaran");
                assert.notEqual(res.body.created, res.body.updated);
                done();
            });
    });

    it('Deletes User', function(done) {
        user1.del(appurl + '/api/users/' + normalid)
            .end(function(e, res) {
                assert.equal(res.status, 200);
                done();
            });
    });



});