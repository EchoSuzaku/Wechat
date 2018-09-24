/*
copyright by Ekain Cao @2017
*/

var router = require('express').Router(),
	httpServer = require(__dirname+'/../functions/http-server.js');

router.get('/WXOAuth',httpServer.WXOAuth);
router.get('/WXgetUserInfo',httpServer.WXgetUserInfo);
router.get('/isCarfman',httpServer.isCarfman);
router.get('/getMajor',httpServer.getMajor);
router.get('/setMajor',httpServer.setMajor);
router.get('/addMajor',httpServer.addMajor);
router.get('/setBookingPlan',httpServer.setBookingPlan);
router.get('/getMajor2Carfmans',httpServer.getMajor2Carfmans);
router.get('/setCarfman',httpServer.setCarfman);
router.get('/firstCarfman',httpServer.firstCarfman);
router.get('/getMyCarfmans',httpServer.getMyCarfmans);
router.get('/getBookings',httpServer.getBookings);
router.get('/getMySchedules/:token',httpServer.getMySchedules);

module.exports = router;