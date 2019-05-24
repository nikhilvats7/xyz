var mongoose = require('mongoose');
let id = mongoose.Schema.ObjectId;
var historySchema = new mongoose.Schema({
    "_id": {
        ts: Date,
        imei: String
    },
    "imei": String,
    "lat": Number,
    "lng": Number,
    "speed": Number,
    "direction": Number,
    "ewns": Number,
    "stat": Number,
    "milage": Number,
    "signal": Number,
    "status": Object,
    // "status": {
    //     digitalInputStatus: Number,
    //     gpsStatus: Number,
    //     roamingStatus: Number,
    //     engineStatus: Number
    // }
    "ts": Date

});

var historyModel = mongoose.model('histories', historySchema);

module.exports = historyModel;