(function (vehicleReportController) {
    const History = require("../models/historyReportModel");
    const alarm = require("../models/alarmModel");
    const LiveData = require("../models/liveData");
    const TmpModel = require("../models/tmpModel");
    const moment = require("moment");
    const customErr = {
        rc: 11,
        msg: "Something went wrong"
    };
    //Get Activity Report
    vehicleReportController.getActivityReport = function (req, res, next) {
        let givenDate = moment().toISOString();
        try {
            const pipeline = [{
                    $match: {
                        ts: {
                            $lt: new Date(givenDate)
                        }
                    }
                },
                {
                    $sort: {
                        ts: 1
                    }
                },
                {
                    $group: {
                        _id: "$_id.imei",
                        data: {
                            $push: {
                                lat: "$lat",
                                lng: "$lng",
                                speed: "$speed",
                                mileage: "$mileage",
                                signal: "$signal",
                                status: "$status",
                                ts: "$ts"
                            }
                        }
                    }
                },
                {
                    $lookup: {
                        from: "staff_details",
                        localField: "_id",
                        foreignField: "imei",
                        as: "driverData"
                    }
                },
                {
                    $project: {
                        data: 1,
                        driverData: {
                            $arrayElemAt: ["$driverData", 0]
                        }
                    }
                }
                // , {
                //     $sort: {
                //         "data.ts": -1
                //     }
                // ,
                // {
                //     $out: "tmp"
                // }
            ];
            const firstPromise = History.aggregate(pipeline).exec();
            firstPromise
                .then(data => {
                    //

                    let formattedArray = [];
                    let customData;
                    let startedFlag = false;
                    data.forEach(oneVehicle => {
                        let oneRec = oneVehicle.data;

                        oneRec.forEach(oneVehicleData => {
                            if (oneVehicleData.status.engineStatus == 1 && !startedFlag) {
                                startedFlag = true;
                                //Make the custom format
                                customData = {
                                    imei: "",
                                    speed: 0,
                                    origin: {},
                                    destination: {
                                        lat: 0,
                                        lng: 0,
                                        ts: ''
                                    },
                                    driverName: "",
                                    driverAddress: ""
                                };
                                customData.imei = oneVehicle._id;
                                customData.speed = oneVehicleData.speed;
                                customData.origin = {
                                    lat: oneVehicleData.lat,
                                    lng: oneVehicleData.lng,
                                    ts: oneVehicleData.ts
                                };

                                if (oneVehicle.driverData) {
                                    customData.driverName = oneVehicle.driverData.name;
                                    customData.driverAddress = oneVehicle.driverData.address;
                                }
                            } else if (
                                oneVehicleData.status.engineStatus == 0 &&
                                startedFlag
                            ) {
                                startedFlag = false;
                                if (customData.imei == oneVehicle._id) {
                                    customData.destination = {
                                        lat: oneVehicleData.lat,
                                        lng: oneVehicleData.lng,
                                        ts: oneVehicleData.ts
                                    };

                                }
                                formattedArray.push(customData);
                            }
                        });
                    });
                    res.status(200).send({
                        rc: 1,
                        rd: formattedArray
                    });
                })
                .catch(err => {
                    // res.json(customErr);
                    throw Error(err);
                });
        } catch (err) {
            const errName = err.name; // Error Name
            const errMsg = err.message; // Error Message
            //throw Error(err);
            res.json(customErr);
        }
    };

    //Insert One record
    vehicleReportController.addOneRecord = function (req, res, next) {
        try {
            const oneRecord = {
                _id: 
                {
                    ts: moment().toISOString(true),
                    imei: req.body._id.imei
                },
                lat: req.body.lat,
                lng: req.body.lng,
                speed: req.body.speed,
                direction: req.body.direction,
                ewns: req.body.ewns,
                stat: req.body.stat,
                milage: req.body.milage,
                signal: req.body.signal,
                status: req.body.status,
                ts: moment().toISOString(true)
            };
            const pushRecord = new History(oneRecord);
            pushRecord
                .save()
                .then(() => {
                    return res.status(200).send({
                        rc: 1,
                        rd: "Record Saved"
                    });
                })
                .catch(function (err) {
                    console.log(err);
                });
        } catch (err) {
            const errName = err.name; // Error Name
            const errMsg = err.message; // Error Message
            //throw Error(err);
            res.json(customErr);
        }
    };
    //Get Travel report
    vehicleReportController.getTravelReport = function (req, res, next) {
        let givenDate = moment().toISOString();
        try {
            const pipeline = [{
                    $match: {
                        ts: {
                            $lt: new Date(givenDate)
                        }
                    }
                },
                {
                    $sort: {
                        ts: 1
                    }
                },
                {
                    $group: {
                        _id: "$_id.imei",
                        data: {
                            $push: {
                                lat: "$lat",
                                lng: "$lng",
                                speed: "$speed",
                                mileage: "$mileage",
                                signal: "$signal",
                                status: "$status",
                                ts: "$ts"
                            }
                        }
                    }
                },
                {
                    $lookup: {
                        from: "staff_details",
                        localField: "_id",
                        foreignField: "imei",
                        as: "driverData"
                    }
                },
                {
                    $project: {
                        data: 1,
                        driverData: {
                            $arrayElemAt: ["$driverData", 0]
                        }
                    }
                }
                // , {
                //     $sort: {
                //         "data.ts": -1
                //     }
                // ,
                // {
                //     $out: "tmp"
                // }
            ];
            const firstPromise = History.aggregate(pipeline).exec();
            firstPromise
                .then(data => {
                    //

                    let formattedArray = [];
                    let customData;
                    let startedFlag = false;
                    data.forEach(oneVehicle => {
                        let oneRec = oneVehicle.data;

                        oneRec.forEach(oneVehicleData => {
                            if (oneVehicleData.status.engineStatus == 1 && !startedFlag) {
                                startedFlag = true;
                                //Make the custom format
                                customData = {
                                    imei: "",
                                    finishTime: "0",
                                    origin: {},
                                    destination: {},
                                    driverName: "",
                                    driverAddress: "",
                                    travelDuration: 0
                                };
                                customData.imei = oneVehicle._id;
                                customData.speed = oneVehicleData.speed;
                                customData.origin = {
                                    lat: oneVehicleData.lat,
                                    lng: oneVehicleData.lng,
                                    ts: oneVehicleData.ts
                                };

                                if (oneVehicle.driverData) {
                                    customData.driverName = oneVehicle.driverData.name;
                                    customData.driverAddress = oneVehicle.driverData.address;
                                }
                            } else if (
                                oneVehicleData.status.engineStatus == 0 &&
                                startedFlag
                            ) {
                                startedFlag = false;
                                if (customData.imei == oneVehicle._id) {
                                    customData.destination = {
                                        lat: oneVehicleData.lat,
                                        lng: oneVehicleData.lng,
                                        ts: oneVehicleData.ts
                                    };
                                    //Calculate Travel Time
                                    const x = moment(customData.origin.ts);
                                    const y = moment(customData.destination.ts);
                                    customData.travelDuration = y.diff(x, "seconds");
                                    //Get finish time
                                    customData.finishTime = customData.destination.ts;
                                }
                                formattedArray.push(customData);
                            }
                        });
                    });
                    res.status(200).send({
                        rc: 1,
                        rd: formattedArray
                    });
                })
                .catch(err => {
                    // res.json(customErr);
                    throw Error(err);
                });
        } catch (err) {
            const errName = err.name; // Error Name
            const errMsg = err.message; // Error Message
            //throw Error(err);
            res.json(customErr);
        }
    };

    //Insert One record
    vehicleReportController.addOneRecord = function (req, res, next) {
        try {
            const oneRecord = {
                _id: {
                    ts: moment().toISOString(true),
                    imei: req.body._id.imei
                },
                lat: req.body.lat,
                lng: req.body.lng,
                speed: req.body.speed,
                direction: req.body.direction,
                ewns: req.body.ewns,
                stat: req.body.stat,
                milage: req.body.milage,
                signal: req.body.signal,
                status: req.body.status,
                ts: moment().toISOString(true)
            };
            const pushRecord = new History(oneRecord);
            pushRecord
                .save()
                .then(() => {
                    return res.status(200).send({
                        rc: 1,
                        rd: "Record Saved"
                    });
                })
                .catch(function (err) {
                    console.log(err);
                });
        } catch (err) {
            const errName = err.name; // Error Name
            const errMsg = err.message; // Error Message
            //throw Error(err);
            res.json(customErr);
        }
    };
    //Get Vehicle list
    vehicleReportController.getVehicleList = function (req, res, next) {
        let givenDate = moment().toISOString();
        try {
            const pipeline = [{
                    $group: {
                        _id: "$_id.imei",
                        data: {
                            $push: {
                                lat: "$Latitude",
                                lng: "$Longitude",
                                speed: "$Speed",
                                ignition: "$Status.engineStatus",
                                milage: "$Mileage",
                                ts: "$ts"
                            }
                        }
                    }
                },
                {
                    $lookup: {
                        from: "staff_details",
                        localField: "_id",
                        foreignField: "imei",
                        as: "driverData"
                    }
                },
                {
                    $project: {
                        _id: 0,
                        imei: "$_id",
                        data: 1,
                        vehicleDetails: {
                            $arrayElemAt: ["$data", -1]
                        },
                        driverName: {
                            $arrayElemAt: ["$driverData.name", 0]
                        },
                        driverAddress: {
                            $arrayElemAt: ["$driverData.address", 0]
                        }
                    }
                }
            ];
            const firstPromise = LiveData.aggregate(pipeline).exec();
            firstPromise
                .then(data => {
                    res.send(data);
                    // res.status(200).send({
                    //     "rc": 1,
                    //     "rd": data
                    // });
                })
                .catch(err => {
                    // res.json(customErr);
                    throw Error(err);
                });
        } catch (err) {
            const errName = err.name; // Error Name
            const errMsg = err.message; // Error Message
            //throw Error(err);
            res.json(customErr);
        }
    };
    //Get stopover results
    vehicleReportController.getStopOverReport = function (req, res, next) {
        let givenDate = moment().toISOString();
        try {
            const pipeline = [{
                    $match: {
                        ts: {
                            $lt: new Date(givenDate)
                        }
                    }
                },
                {
                    $sort: {
                        ts: 1
                    }
                },
                {
                    $group: {
                        _id: "$_id.imei",
                        data: {
                            $push: {
                                lat: "$lat",
                                lng: "$lng",
                                speed: "$speed",
                                mileage: "$mileage",
                                signal: "$signal",
                                status: "$status",
                                ts: "$ts"
                            }
                        }
                    }
                },
                {
                    $lookup: {
                        from: "staff_details",
                        localField: "_id",
                        foreignField: "imei",
                        as: "driverData"
                    }
                },
                {
                    $project: {
                        data: 1,
                        driverData: {
                            $arrayElemAt: ["$driverData", 0]
                        }
                    }
                }
                // , {
                //     $sort: {
                //         "data.ts": -1
                //     }
                // ,
                // {
                //     $out: "tmp"
                // }
            ];
            const firstPromise = History.aggregate(pipeline).exec();
            firstPromise
                .then(data => {
                    //res.send(data)
                    let formattedArray = [];
                    let customData;
                    let startedFlag = false;
                    let stopOverFlag = false;
                    data.forEach(oneVehicle => {
                        let oneRec = oneVehicle.data;

                        oneRec.forEach((oneVehicleData, index) => {
                            if (oneVehicleData.status.engineStatus == 1 && !startedFlag) {
                                startedFlag = true;
                                stopOverFlag = true;
                                //Make the custom format
                                customData = {
                                    imei: "",
                                    finishTime: "",
                                    origin: {},
                                    destination: {},
                                    driverName: "",
                                    driverAddress: "",
                                    travelDuration: 0,
                                    idleTime: 0
                                };
                                customData.imei = oneVehicle._id;
                                customData.speed = oneVehicleData.speed;
                                customData.origin = {
                                    lat: oneVehicleData.lat,
                                    lng: oneVehicleData.lng,
                                    ts: oneVehicleData.ts
                                };
                                if (oneVehicle.driverData) {
                                    customData.driverName = oneVehicle.driverData.name;
                                    customData.driverAddress = oneVehicle.driverData.address;
                                }
                            } else if (
                                oneVehicleData.status.engineStatus == 1 &&
                                stopOverFlag
                            ) {
                                if (customData.imei == oneVehicle._id) {
                                    //Check previous and current lat lng
                                    if (
                                        index > 0 &&
                                        oneRec[index].lat === oneRec[index - 1].lat
                                    ) {
                                        const x = moment(oneRec[index - 1].ts);
                                        const y = moment(oneRec[index].ts);
                                        let z = y.diff(x, "seconds");
                                        customData.idleTime = customData.idleTime + z;
                                    } else {
                                        stopOverFlag == false;
                                    }
                                }
                            } else if (
                                oneVehicleData.status.engineStatus == 0 &&
                                startedFlag
                            ) {
                                startedFlag = false;
                                stopOverFlag = false;
                                if (customData.imei == oneVehicle._id) {
                                    customData.destination = {
                                        lat: oneVehicleData.lat,
                                        lng: oneVehicleData.lng,
                                        ts: oneVehicleData.ts
                                    };
                                    //Calculate Travel Time
                                    const x = moment(customData.origin.ts);
                                    const y = moment(customData.destination.ts);
                                    customData.travelDuration = y.diff(x, "seconds");
                                    //Get finish time
                                    customData.finishTime = customData.destination.ts;
                                }
                                //Push the custom data
                                formattedArray.push(customData);
                            }
                        });
                    });
                    res.status(200).send({
                        rc: 1,
                        rd: formattedArray
                    });
                })
                .catch(err => {
                    // res.json(customErr);
                    throw Error(err);
                });
        } catch (err) {
            const errName = err.name; // Error Name
            const errMsg = err.message; // Error Message
            //throw Error(err);
            res.json(customErr);
        }
    };
    //Get one route report
    vehicleReportController.getOneRouteReport = async function (req, res, next) {
        const imei = req.body.imei;
        const startTime = new Date(req.body.startTime);
        const stopTime = new Date(req.body.stopTime);
        console.log(req.body.imei);
        console.log(req.body.startTime);
        console.log(req.body.stopTime);

        try {
            const pipeline = [{
                    $match: {
                        $and: [{
                                "_id.imei": imei
                            },
                            {
                                ts: {
                                    $gte: startTime
                                }
                            },
                            {
                                ts: {
                                    $lte: stopTime
                                }
                            }
                        ]
                    }
                },
                {
                    $lookup: {
                        from: "alarms",
                        let: {
                            lat: "$lat",
                            lng: "$lng",
                            imei: "$_id.imei",
                            ts: "$ts"
                        },
                        pipeline: [{
                                $match: {
                                    $expr: {
                                        $or: [{
                                                $eq: ["$_id.imei", "$$imei"]
                                            }, {
                                                $eq: ["$lat", "$$lat"]
                                            }, {
                                                $eq: ["$lng", "$$lng"]
                                            },
                                            {
                                                $eq: ["$ts", "$$ts"]
                                            }
                                        ]
                                    },
                                    $or: [{
                                            harsh_acceleration_alarm: {
                                                $exists: true
                                            }
                                        },
                                        {
                                            harsh_breaking_alarm: {
                                                $exists: true
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                $out: "tmps"
                            }
                        ],
                        as: "alarmData"
                    }
                },
                {
                    $project: {
                        _id: 1,
                        paramCode: 1,
                        lat: 1,
                        lng: 1,
                        speed: 1,
                        direction: 1,
                        ewns: 1,
                        stat: 1,
                        milage: 1,
                        signal: 1,
                        status: 1,
                        ts: 1
                    }
                }
            ];
            let masterData;
            const firstPromise = History.aggregate(pipeline).exec();
            firstPromise
                .then(data => {
                    //Do nothing
                    masterData = data;
                })
                .catch(err => {
                    // res.json(customErr);
                    throw Error(err);
                });
            const await1 = await TmpModel.find({
                harsh_breaking_alarm: {
                    $exists: true,
                }
            });
            const await2 = await TmpModel.find({
                harsh_acceleration_alarm: {
                    $exists: true,
                }
            });
            const rd = {
                "points": masterData,
                breakAlarm: await1,
                accelerationAlarm: await2
            }
            res.status(200).send({
                rc: 1,
                rd: rd
            });
        } catch (err) {
            const errName = err.name; // Error Name
            const errMsg = err.message; // Error Message
            throw Error(err);
            //res.json(customErr);
        }
    };
    //Get alarm report
    vehicleReportController.getAlarmReport = function (req, res, next) {
        try {
            const pipeline = [{
                    $match: {
                        $or: [{
                                harsh_acceleration_alarm: {
                                    $exists: true
                                }
                            },
                            {
                                harsh_breaking_alarm: {
                                    $exists: true
                                }
                            }
                        ]
                    }
                }, {

                    $sort: {
                        ts: -1
                    }
                },
                {
                    $project: {
                        _id: 1,
                        paramCode: 1,
                        lat: 1,
                        lng: 1,
                        view: 1,
                        ts: 1,
                        arrayofkeyvalue: {
                            "$objectToArray": "$$ROOT"
                        }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        paramCode: 1,
                        lat: 1,
                        lng: 1,
                        view: 1,
                        ts: 1,
                        description: {
                            $arrayElemAt: ["$arrayofkeyvalue.k", -2]
                        },
                        alarmData: {
                            $arrayElemAt: ["$arrayofkeyvalue.v", -2]
                        }

                    }
                }
            ];
            const firstPromise = alarm.aggregate(pipeline).exec();
            firstPromise
                .then(data => {
                    res.status(200).send({
                        rc: 1,
                        rd: data
                    });
                })
                .catch(err => {
                    // res.json(customErr);
                    throw Error(err);
                });
        } catch (err) {
            const errName = err.name; // Error Name
            const errMsg = err.message; // Error Message
            throw Error(err);
            //res.json(customErr);
        }
    };
    //Get sensor report
    vehicleReportController.getSensorReport = function (req, res, next) {
        try {
            const pipeline = [{
                    $match: {
                        $or: [{
                                batteryPercentage: {
                                    $exists: true
                                }
                            },
                            {
                                batteryVoltage: {
                                    $exists: true
                                }
                            },
                            {
                                batteryCurrent: {
                                    $exists: true
                                }
                            }
                        ]
                    }
                }, {

                    $sort: {
                        ts: -1
                    }
                },
                {
                    $project: {
                        _id: 1,
                        paramCode: 1,
                        lat: 1,
                        lng: 1,
                        view: 1,
                        ts: 1,
                        arrayofkeyvalue: {
                            "$objectToArray": "$$ROOT"
                        }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        paramCode: 1,
                        lat: 1,
                        lng: 1,
                        view: 1,
                        ts: 1,
                        description: {
                            $arrayElemAt: ["$arrayofkeyvalue.k", -2]
                        },
                        sensorData: {
                            $arrayElemAt: ["$arrayofkeyvalue.v", -2]
                        }

                    }
                }
            ];
            const firstPromise = alarm.aggregate(pipeline).exec();
            firstPromise
                .then(data => {
                    res.status(200).send({
                        rc: 1,
                        rd: data
                    });
                })
                .catch(err => {
                    // res.json(customErr);
                    throw Error(err);
                });
        } catch (err) {
            const errName = err.name; // Error Name
            const errMsg = err.message; // Error Message
            throw Error(err);
            //res.json(customErr);
        }
    };
    //Get Digital Input report
    vehicleReportController.getDigitalInputReport = function (req, res, next) {
        try {
            const pipeline = [{
                    $match: {
                        $or: [{
                                digitalInput1: {
                                    $exists: true
                                }
                            },
                            {
                                digitalInput2: {
                                    $exists: true
                                }
                            },
                            {
                                digitalInput3: {
                                    $exists: true
                                }
                            },
                            {
                                digitalInput4: {
                                    $exists: true
                                }
                            },
                            {
                                digitalInput5: {
                                    $exists: true
                                }
                            },
                            {
                                digitalInput6: {
                                    $exists: true
                                }
                            }
                        ]
                    }
                },
                {

                    $sort: {
                        ts: -1
                    }
                },
                {
                    $project: {
                        _id: 1,
                        paramCode: 1,
                        lat: 1,
                        lng: 1,
                        view: 1,
                        ts: 1,
                        arrayofkeyvalue: {
                            "$objectToArray": "$$ROOT"
                        }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        paramCode: 1,
                        lat: 1,
                        lng: 1,
                        view: 1,
                        ts: 1,
                        digitalInput: {
                            $arrayElemAt: ["$arrayofkeyvalue.k", -2]
                        },
                        status: {
                            $arrayElemAt: ["$arrayofkeyvalue.v", -2]
                        }

                    }
                }
            ];
            const firstPromise = alarm.aggregate(pipeline).exec();
            firstPromise
                .then(data => {
                    res.status(200).send({
                        rc: 1,
                        rd: data
                    });
                })
                .catch(err => {
                    // res.json(customErr);
                    throw Error(err);
                });
        } catch (err) {
            const errName = err.name; // Error Name
            const errMsg = err.message; // Error Message
            throw Error(err);
            //res.json(customErr);
        }
    };
    //Get Overview report
    vehicleReportController.getOverViewReport = function (req, res, next) {
        try {
            const pipeline = [{
                    $match: {
                        $or: [{
                                digitalInput1: {
                                    $exists: true
                                }
                            },
                            {
                                digitalInput2: {
                                    $exists: true
                                }
                            },
                            {
                                digitalInput3: {
                                    $exists: true
                                }
                            },
                            {
                                digitalInput4: {
                                    $exists: true
                                }
                            },
                            {
                                digitalInput5: {
                                    $exists: true
                                }
                            },
                            {
                                digitalInput6: {
                                    $exists: true
                                }
                            }
                        ]
                    }
                },
                {

                    $sort: {
                        ts: -1
                    }
                },
                {
                    $project: {
                        _id: 1,
                        paramCode: 1,
                        lat: 1,
                        lng: 1,
                        view: 1,
                        ts: 1,
                        arrayofkeyvalue: {
                            "$objectToArray": "$$ROOT"
                        }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        paramCode: 1,
                        lat: 1,
                        lng: 1,
                        view: 1,
                        ts: 1,
                        digitalInput: {
                            $arrayElemAt: ["$arrayofkeyvalue.k", -2]
                        },
                        status: {
                            $arrayElemAt: ["$arrayofkeyvalue.v", -2]
                        }

                    }
                }
            ];
            const firstPromise = alarm.aggregate(pipeline).exec();
            firstPromise
                .then(data => {
                    res.status(200).send({
                        rc: 1,
                        rd: data
                    });
                })
                .catch(err => {
                    // res.json(customErr);
                    throw Error(err);
                });
        } catch (err) {
            const errName = err.name; // Error Name
            const errMsg = err.message; // Error Message
            throw Error(err);
            //res.json(customErr);
        }
    };
})(module.exports)