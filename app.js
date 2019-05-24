var express = require('express');
var app = express();

var config = require('./config');
var datdFormatter = require('./data-formatter');
var reportsModule = require('./reports');
// global.utilityFunction = require('./lib/util');

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

var allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Authorization, Accept,Content-Length, X-Requested-With, X-PINGOTHER');
    if ('OPTIONS' === req.method) {
        res.sendStatus(200);
    } else {
        next();
    }
};
app.use(allowCrossDomain);
/*mongo db connection*/
var mongoose = require('mongoose');
var mongoDbUrl = config.database.url;
mongoose.connect(mongoDbUrl, {
    useNewUrlParser: true
});
/*logging response*/
var winston = require('winston');
// winston.emitErrs = true;

var logger_create = winston.createLogger({
    transports: [
        new winston.transports.File({
            level: 'debug',
            filename: config.log_file,
            handleExceptions: true,
            json: true,
            maxsize: 10242880, //5MB
            maxFiles: 5,
            colorize: false
        }),
        new winston.transports.Console({
            level: 'debug',
            handleExceptions: true,
            json: false,
            colorize: true
        })
    ],
    exitOnError: false
});

global.logger = logger_create;
module.exports.stream = {
    write: function (message, encoding) {
        logger_create.info(message);
    }
};
/*requiring routes*/
var home = require('./route/homeRoute');
var users = require('./route/usersRoute');
var history = require('./route/historyRoute');
var liveData = require('./route/liveDataRoute');
var alarmHistory = require('./route/alarmHistoryRoute');
var assignedAlarm = require('./route/assignedAlarmsRoute');
var reports = require('./route/reportsRoute');
var customer = require('./route/customerRoute');
const getVehicleReport = require('./route/getVehicleReport');
/*defining base routes*/
app.use('/home', home);
app.use('/users', users);
app.use('/history', history);
app.use('/liveData', liveData);
app.use('/notifications', alarmHistory);
app.use('/assignedAlarm', assignedAlarm);
app.use('/reports', reports);
app.use('/customer', customer);
/*
Reports route
Author - Nikhil Vats
Date - 24 - April - 2019 
*/
app.use('/get-reports', getVehicleReport);
/*
Reports route ends
*/

app.get('/mapLiveData', function (req, res) {
    datdFormatter.mapLiveData(req, res);
});

app.post('/individualDeviceInfo', function (req, res) {
    console.log("REQ");
    datdFormatter.individualDeviceInfo(req, res);
});

app.post('/activityReports', function (req, res) {
    reportsModule.activityReports(req, res);
});

app.post('/travelReports', function (req, res) {
    reportsModule.activityReports(req, res);
});

app.get('/', express.static('public'));

/*listening on port 3001*/
app.listen(3001, function () {
    logger.info("Listening on port 3001...");
});

module.exports = app;