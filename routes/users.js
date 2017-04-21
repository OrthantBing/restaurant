var add = function(req, res, next) {
    var UserModel = req.db.User;
    var displayname = req.body.firstname + ' ' + req.body.lastname;
    var datetime = Date.now();
    UserModel.create({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        displayName: displayname,
        email: req.body.email,
        admin: req.body.admin,
        created: datetime,
        updated: datetime
    }, function(err, data) {
        if (err) next(err);
        var apiresponse = {
            users: data
        };
        res.json(apiresponse);
    });
};

var getUsers = function(req, res, next) {
    var UserModel = req.db.User;
    UserModel.find(function(err, data) {
        if (err) next(err);
        var apiresponse = {
            users: data
        };
        res.json(apiresponse);
    });
};

var updateUser = function(req, res, next) {
    var UserModel = req.db.User;
    var fields = req.body;
    fields.displayName = fields.firstname + ' ' + fields.lastname;
    fields.updated = Date.now();

    UserModel.findByIdAndUpdate({ "_id": req.params.id }, { "$set": fields }, { 'new': true }, function(err, data) {
        if (err) next(err);
        var apiresponse = {
            users: data
        };
        res.json(apiresponse);
    });
};

var getUser = function(req, res, next) {
    var UserModel = req.db.User;
    UserModel.findById(req.params.id, function(err, data) {
        if (err) next(err);
        var apiresponse = {
            users: data
        };
        res.json(apiresponse);
    });
};

var remove = function(req, res, next) {
    var UserModel = req.db.User;
    UserModel.findByIdAndRemove(req.params.id, function(err, data) {
        if (err) next(err);
        res.json(data);
    });
};


module.exports = {
    add: add,
    getUsers: getUsers,
    updateUser: updateUser,
    getUser: getUser,
    remove: remove,
};