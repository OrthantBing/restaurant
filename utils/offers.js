var percentoffer = function(price, offer) {
    var returnvalue = price - price * (offer / 100);
    return returnvalue;
};

var flatoffer = function(price, offer) {
    var returnvalue = price - offer;
    return returnvalue;
};

module.exports = {
    percentoffer: percentoffer,
    flatoffer: flatoffer
};