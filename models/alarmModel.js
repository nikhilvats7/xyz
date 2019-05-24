var mongoose = require('mongoose');

var alarmSchema = new mongoose.Schema({
    _id: Object,
    paramCode: String,
    lat: String,
    lng: String,
    view: Object,
    ts: Date
})

var alarmModel = mongoose.model('alarms', alarmSchema);

module.exports = alarmModel;