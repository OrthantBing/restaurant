var mongoose = require('mongoose');
var validator = require('validator');
var Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

/* Schema logic below
 *  1) Food
 *  2) User
 *  3) Daily Usage
 */

var foodtypes = ['others', 'breakfast', 'lunch', 'dinner', 'snack', 'addons'];
var paymenttypearray = ['COD', 'PayUMoney'];
var statusarray = ['Created', 'Placed', 'Processing', 'En Route', 'Delivered', 'Cancelled', 'Payment Failed'];

/* Food
 *  Description:
 *    This schema contains info about the food details that we have.
 *  
 *  Skeleton:
 *    name: String
 *    description: String
 *    available: boolean
 *    addons: ['ref(Food)']
 *    created: Date
 *    updated: Date
 *
 */
var FoodSchema = new Schema({
    nature: {
        type: String,
        required: true,
        trim: true,
        enum: foodtypes,
        default: foodtypes[0],
    },

    name: {
        type: String,
        required: true,
        trim: true,
    },

    description: {
        type: String,
        max: 4000,
    },

    available: {
        type: Boolean,
        default: true,
        required: true
    },

    created: {
        type: Date,
        required: true
    },

    addons: [{
        type: Schema.Types.ObjectId,
        ref: FoodSchema,
    }],

    updated: {
        type: Date,
        default: Date.now,
        required: true
    },
    createdby: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedby: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    price: {
        type: Number,
        required: true
    }
    /*
        createdby: {
            id: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            name: {
                type: String,
            }
            // In theory, this should be set to required.
            // Leaving it now for testing.
        },

        updatedby: {
          id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
          },
          name: {
            type: String,
          }
        }
      */
});




/* User:
 *  Description:
 *    This contains info about the users that login to the application
 *
 *  Skeleton:
 *    firstname: String
 *    lastname: String
 *    displayName: String
 *    password: Salted String (bcrypted)
 *    email: String
 *    approved: Boolean
 *    banned: Boolean
 *    elite: Boolean
 *    admin: Boolean
 *    created: Date
 *    updated: Date
 */
var UserSchema = new Schema({
    firstname: {
        type: String,
        required: true,
        trim: true
    },

    lastname: {
        type: String,
        required: true,
        trim: true,
    },

    displayName: {
        type: String,
        trim: true,
    },

    password: String,
    email: {
        type: String,
        required: true,
        trim: true
    },

    elite: {
        type: Boolean,
        default: false
    },

    banned: {
        type: Boolean,
        default: false
    },

    admin: {
        type: Boolean,
        default: false
    },

    created: {
        type: Date,
        required: true,
    },

    updated: {
        type: Date,
        required: true
    }
});



UserSchema.statics.findUserById = function(id, fields, callback) {

};


/*
 *
 *
 *
 *
 *
 *
 *
 *
 */

var CartSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    content: [{
        type: Schema.Types.ObjectId,
        ref: 'Food',
    }],

    price: {
        type: Number,
        required: true,
        default: 0
    },
    created: {
        type: Date,
        required: true,
    },
    updated: {
        type: Date,
        required: true,
    },
    processed: {
        type: Boolean,
        default: false,
    }
});

var DailyUsageSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    cartinfo: {
        type: Schema.Types.ObjectId,
        ref: 'Cart',
        required: true,
    },

    created: {
        type: Date,
        required: true
    },

    updated: {
        type: Date,
        default: Date.now,
    },

    // There should be only one offer for a cart.
    // Lets not kid ourself.
    offer: {
        type: String,
        required: false
    },

    // This is the final price after the offers, and tax.
    // This will let us know if we are robbed or not.
    // If someone hacks the price value using javascript.
    price: {
        type: Number,
        required: true
    },

    paymenttype: {
        type: String,
        enum: paymenttypearray,
        required: true,
        default: paymenttypearray[0]
    },

    currentstatus: {
        type: String,
        required: true,
        enum: statusarray,
        default: statusarray[0]
    },

    statushistory: [{
        name: {
            type: String,
            enum: statusarray,
            required: true,
            default: statusarray[0]
        },
        timestamp: {
            type: Date,
            required: true,
            default: Date.now
        }
    }]
});

module.exports = {
    user: mongoose.model("User", UserSchema),
    food: mongoose.model("Food", FoodSchema),
    dailyusage: mongoose.model("DailyUsage", DailyUsageSchema),
    cartinfo: mongoose.model("Cart", CartSchema)
};