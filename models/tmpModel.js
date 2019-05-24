var mongoose = require('mongoose');

var tmpSchema = new mongoose.Schema({
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
    alarmData: Object,
    // "status": {
    //     digitalInputStatus: Number,
    //     gpsStatus: Number,
    //     roamingStatus: Number,
    //     engineStatus: Number
    // }
    "ts": Date

})

var tmpMdodel = mongoose.model('tmp', tmpSchema);

module.exports = tmpMdodel;