var databaseUrl = "localhost:27017/trio-mobil"; // "username:password@example.com/mydb"
var collections = ["devices", "parking_occupancy", "test", "live_data", "area_comparison"]
var mongojs = require('mongojs');
var _ = require('underscore');
//var moment = require('moment');
//var waterfall = require('async-waterfall');
var db = mongojs(databaseUrl, collections)
var exports = module.exports = {};
//var cron = require('node-cron');

// console.log("here : ", getContactNumberOfUserAndCustomer("105"));
//logger.info('cronjob started');
//cron.schedule('0 */10 * * * *', function(){

//Find live devices
exports.mapLiveData = function (req, res) {
  db.collection('live_datas').find(function (err, livedata) {
    if (err) {
      res.json(err)
    } else {
      console.log('livedata', livedata);
      res.send(livedata)
    }
  })
};



/*
 *find individual device
 *location points
 *harse breaking alarms
 *harse acceleration alarms
 */
exports.individualDeviceInfo = function (req, res) {
  db.collection('today_datas').find(req.body, function (err, livedata) {
    if (err) {
      res.json(err)
    } else {
      let engineStatus;
      let startPoint = true;
      let overAllDirections = [];
      let overAllpoints = [];
      let pointsObj = {
        origin: {
          lat: 0,
          lng: 0
        },
        destination: {
          lat: 0,
          lng: 0
        }
      }
      for (let data of livedata) {
        engineStatus = data.Status.engineStatus == 1 ? true : false;
        if (engineStatus && startPoint) {
          pointsObj['origin'] = {
            'lat': data.Latitude,
            'lng': data.Longitude
          };
          startPoint = false
          console.log('pointsObj', pointsObj);
        } else if (!engineStatus && !startPoint) {
          pointsObj['destination'] = {
            'lat': data.Latitude,
            'lng': data.Longitude
          }
          overAllDirections.push(pointsObj);
          pointsObj = {};
          startPoint = true;
        }
        if (engineStatus) {
          let points = {}
          points['lat'] = data.Latitude;
          points['lng'] = data.Longitude;
          overAllpoints.push(points);
        }
      }
      let individualDeviceInfo = {
        'overAllDirections': overAllDirections,
        'overAllpoints': overAllpoints
      };
      findBreaksAlarm(res, individualDeviceInfo)
    }
  })
};

//Find breaking alarm
function findBreaksAlarm(res, individualDeviceInfo) {
  console.log('ACC Alarm');
  db.collection('alarms').find({
    'harsh_braking_alarm': {
      $exists: true
    },
    '_id.IMEI': '353469042193425'
  }, function (err, breakAlarms) {
    if (err) {
      console.log('Error while fetching Alarms');
    } else {
      let harseBreakAlarmData = [];
      let breakAlarmsTs = [];
      for (let breakAlarm of breakAlarms) {
        breakAlarmsTs.push(breakAlarm['_id'].ts)
      }
      db.collection('today_datas').find({
        'ts': {
          $in: breakAlarmsTs
        }
      }, function (err, breakAlarmInTodayDatas) {
        if (err) {
          console.log(err);
        } else {
          var result = breakAlarmInTodayDatas.filter(function (o1) {
            breakAlarms.some(function (o2) {
              if (o1.ts == o2['_id'].ts) {
                harseBreakAlarmData.push(Object.assign(o1, o2));
              } // assumes unique id
            });
          })
          individualDeviceInfo.harseBreakAlarmData = harseBreakAlarmData;
          findAccelerationsAlarm(res, individualDeviceInfo)
        }
      })
    }
  })
}

//Find Acceleration alarm
function findAccelerationsAlarm(res, individualDeviceInfo) {
  console.log('ACC Alarm');
  db.collection('alarms').find({
    'harsh_acceleration_alarm': {
      $exists: true
    },
    '_id.IMEI': '353469042193425'
  }, function (err, accelerations) {
    if (err) {
      console.log('Error while fetching Alarms');
    } else {
      let harseAccelerationData = [];
      let accelerationsTs = [];
      for (let acceleration of accelerations) {
        accelerationsTs.push(acceleration['_id'].ts)
      }
      console.log('accelerationsTs : ', accelerationsTs);
      db.collection('today_datas').find({
        'ts': {
          $in: accelerationsTs
        }
      }, function (err, accelerationInTodayDatas) {
        if (err) {
          console.log(err);
        } else {
          console.log('Break Alarm Data: ', accelerationInTodayDatas)

          var result = accelerationInTodayDatas.filter(function (o1) {
            // filter out (!) items in result2
            console.log('First Ts : ', o1.ts);
            accelerations.some(function (o2) {
              console.log('Second Ts : ', o2['_id'].ts);
              if (o1.ts == o2['_id'].ts) {
                harseAccelerationData.push(Object.assign(o1, o2));
              } // assumes unique id
            });
          })
          console.log('harseAccelerationData', harseAccelerationData);
          individualDeviceInfo.harseAccelerationData = harseAccelerationData;
          //console.log('breakAlarmsTs : ',breakAlarmsTs);
          res.json(individualDeviceInfo)
        }
      })
    }
  })
}



// db.collection('alarms').find({
//   $or : [
//    { harsh_breakng_alarm : { $exists: true } },
//    { harsh_acceleration_alarm : { $exists: true } }
//  ]
//    },function(err, breakAlarms){
//     if(err){
//       console.log('Error while fetching Alarms');
//     }else{
//       console.log('DAATAAA :  ', breakAlarms)
//     }
//   })


//Does anyone know of a (lodash if possible too) way to group an array of objects by an object key then create a new array of objects based on the grouping? For example, I have an array of car objects:

// var cars = [
//     {
//         'make': 'audi',
//         'model': 'r8',
//         'year': '2012'
//     }, {
//         'make': 'audi',
//         'model': 'rs5',
//         'year': '2013'
//     }, {
//         'make': 'ford',
//         'model': 'mustang',
//         'year': '2012'
//     }, {
//         'make': 'ford',
//         'model': 'fusion',
//         'year': '2015'
//     }, {
//         'make': 'kia',
//         'model': 'optima',
//         'year': '2012'
//     },
// ];

// var grouped = _.mapObject(_.groupBy(cars, 'make'),
//                           clist => clist.map(car => _.omit(car, 'make')));

// console.log('grouped', grouped);