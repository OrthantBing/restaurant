var add = function(req, res, next) {
    var FoodModel = req.db.Food;
    var UserModel = req.db.User;
    var datetime = Date.now();
    // How should the request be.
    // Will we get the entire content or just the ids.?
    // Use the session info in the server to get the id
    // Based on CheckAdmin Stuffs.

    var userid = req.body.createdby;

    FoodModel.create({
        nature: req.body.nature,
        name: req.body.name,
        description: req.body.description,
        available: req.body.available,
        created: datetime,
        updated: datetime,
        addons: req.body.addons, //This should contain array of ids of foodmodel.
        createdby: userid,
        updatedby: userid,
        price: req.body.price,
    }, function(err, data) {
        if (err) next(err);
        var apiresponse = {
            fooditems: data
        };
        res.json(apiresponse);
    });
};

var getItems = function(req, res, next) {
    var FoodModel = req.db.Food;
    FoodModel
        .find()
        /*
        .populate({
            path: 'createdby',
            select: 'displayName'
        })
        .populate({
            path: 'updatedby',
            select: 'displayName'
        })
        .populate({
            path: 'addons',
        })
        */
        .exec(function(err, data) {
            if (err) next(err);
            // Fuck with the data that is returned here
            // and send whatever that you want.
            var apiresponse = {
                fooditems: data
            };
            res.json(apiresponse);
        });
};

var DeleteItem = function(req, res, next) {
    var FoodModel = req.db.Food;
    FoodModel.findByIdAndRemove(req.params.id, function(err, data) {
        if (err) next(err);
        res.json(data);
    });
};

var getItem = function(req, res, next) {
    var FoodModel = req.db.Food;
    FoodModel.find({ _id: req.params.id })
        /*
            .populate({
                path: 'createdby',
                select: 'displayName'
            })
            .populate({
                path: 'updatedby',
                select: 'displayName'
            })
            .populate({
                path: 'addons',
            })
            */
        .exec(function(err, data) {
            if (err) next(err);
            var apiresponse = {
                fooditems: data
            };
            res.json(apiresponse);
        });
};

var updateItem = function(req, res, next) {
    var FoodModel = req.db.Food;
    var fields = req.body;
    // Set the update value.
    fields.updated = Date.now();
    FoodModel.findByIdAndUpdate({ "_id": req.params.id }, { "$set": fields }, { 'new': true }, function(err, data) {
        if (err) next(err);
        var apiresponse = {
            fooditems: data
        };
        res.json(apiresponse);
    });
};

module.exports = {
    add: add,
    getItems: getItems,
    getItem: getItem,
    update: updateItem
};