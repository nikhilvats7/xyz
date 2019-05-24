var databaseUrl = "localhost:12345/trio-mobil"; // "username:password@example.com/mydb"
var collections = ["devices","parking_occupancy","test","live_data","area_comparison"]
var mongojs = require('mongojs');
var moment = require('moment');
//var waterfall = require('async-waterfall');
var db = mongojs(databaseUrl, collections)
var exports = module.exports = {};
//var cron = require('node-cron');

// console.log("here : ", getContactNumberOfUserAndCustomer("105"));
//logger.info('cronjob started');
//cron.schedule('0 */10 * * * *', function(){

/*
  *find individual device
  *location points
  *harse breaking alarms
  *harse acceleration alarms
*/
exports.activityReports = function(req, res){

   /*let ts = {
        $gte: moment(start).startOf('day'),
        $lte: moment(end).endOf('day')
    }*/
    db.collection('histories').find({},function(err, livedata){
      if(err){
        res.json(err)
      }else{
        console.log('livedata',livedata)
        let engineStatus;
        let startPoint = true;
        let overAllDirections = [];
        let overAllpoints = [];
        let pointsObj = {
          origin:{lat: 0, lng: 0},
          destination:{lat: 0, lng: 0},
          driverName: '',
          overAllpoints: [],
          address: '',
          vehichleNo: '',
          ts: '',
          speed: 0,
          ignitionStatus: 0
         }

        for(let data of livedata) {
          engineStatus = data.Status.engineStatus == 1 ? true : false;
          if(engineStatus){
            let points = {}
            points['lat'] = data.Latitude;
            points['lng'] = data.Longitude;
            overAllpoints.push(points);
          }
          if(engineStatus && startPoint){
            pointsObj.driverName = 'Raj';
            pointsObj.address = 'HSR Layout, Bangalore';
            pointsObj.distance = 0;
            pointsObj.vehichleNo = data._id.IMEI;
            pointsObj.ts = moment(data._id.ts).format('YYYY-MM-DD HH:MM');
            pointsObj.speed = data.Speed;
            pointsObj.ignitionStatus = data.Status.digitalInputStatus;
            pointsObj['origin'] = {
              'lat' : data.Latitude,
              'lng' : data.Longitude
            };
            startPoint = false
            console.log('pointsObj',pointsObj);
          }else if (!engineStatus && !startPoint) {
             pointsObj['destination']= {
               'lat' : data.Latitude,
               'lng' : data.Longitude
             }

              pointsObj.overAllpoints = overAllpoints;
              overAllDirections.push(pointsObj);
              pointsObj = {};
              startPoint = true;
              overAllpoints = [];
          }
          
        }
        console.log('overAllDirections', overAllDirections);
        res.json(overAllDirections)
        // let individualDeviceInfo = {
        //   'overAllDirections': overAllDirections,
        //   'overAllpoints': overAllpoints
        // };
        //findBreaksAlarm(res, individualDeviceInfo)
      }
    })
};

//Find breaking alarm
function findBreaksAlarm(res, individualDeviceInfo){
  console.log('ACC Alarm');
  db.collection('alarms').find({
    'harsh_braking_alarm': { $exists: true}, 
    '_id.IMEI':'353469042193425' },function(err, breakAlarms){
      if(err){
        console.log('Error while fetching Alarms');
      }else{
        let harseBreakAlarmData  = [];
        let breakAlarmsTs = [];
        for(let breakAlarm of breakAlarms){
          breakAlarmsTs.push(breakAlarm['_id'].ts)
        }
        db.collection('today_datas').find({'ts': { $in: breakAlarmsTs }},function(err, breakAlarmInTodayDatas){
          if(err){
            console.log(err);
          }else{
            var result = breakAlarmInTodayDatas.filter(function(o1){
                breakAlarms.some(function(o2){
                     if(o1.ts == o2['_id'].ts){
                       harseBreakAlarmData.push(Object.assign(o1, o2));
                    }          // assumes unique id
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
function findAccelerationsAlarm(res, individualDeviceInfo){
  console.log('ACC Alarm');
  db.collection('alarms').find({
    'harsh_acceleration_alarm': { $exists: true}, 
    '_id.IMEI':'353469042193425' },function(err, accelerations){
      if(err){
        console.log('Error while fetching Alarms');
      }else{
        let harseAccelerationData  = [];
        let accelerationsTs = [];
        for(let acceleration of accelerations){
          accelerationsTs.push(acceleration['_id'].ts)
        }
        console.log('accelerationsTs : ',accelerationsTs);
        db.collection('today_datas').find({'ts': { $in: accelerationsTs }},function(err, accelerationInTodayDatas){
          if(err){
            console.log(err);
          }else{
            console.log('Break Alarm Data: ', accelerationInTodayDatas)

            var result = accelerationInTodayDatas.filter(function(o1){
                // filter out (!) items in result2
                console.log('First Ts : ', o1.ts);
                accelerations.some(function(o2){
                console.log('Second Ts : ', o2['_id'].ts);
                     if(o1.ts == o2['_id'].ts){
                       harseAccelerationData.push(Object.assign(o1, o2));
                    }          // assumes unique id
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