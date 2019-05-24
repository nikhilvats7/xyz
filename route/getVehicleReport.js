const express = require('express');
const router = express.Router();
const vehicleReportController = require("../controller/vehicleReportController");
router.post('/addOneRecord', vehicleReportController.addOneRecord);
router.post('/activity-report', vehicleReportController.getActivityReport);
router.post('/travel-report', vehicleReportController.getTravelReport);
router.get('/vehicle-list', vehicleReportController.getVehicleList);
router.post('/stopover-report', vehicleReportController.getStopOverReport);
router.post('/one-route-report', vehicleReportController.getOneRouteReport);
router.post('/alarm-report', vehicleReportController.getAlarmReport);
router.post('/sensor-report', vehicleReportController.getSensorReport);
router.post('/digital-input-report', vehicleReportController.getDigitalInputReport);
router.post('/overview-report', vehicleReportController.getOverViewReport);
module.exports = router;