var WXApp = require(__dirname+"/../weixinAppModule"),
	co = require('co'),
	moment = require('moment'),
	Mongo = require('mongodb').MongoClient,
	assert = require('assert'),
	ObjectId = require('mongodb').ObjectId;

WXApp.AppId = 'wxe78079f934ede04a';
WXApp.Secret = 'dd15d07720a9db561c26e6139d7c3904';
WXApp.cryptoKey = "i-love-Ekain-1000-years";

exports.WXOAuth = function(req,res,next){
	if (req.query.code != '' && "undefined" != typeof req.query.code) {
		var code = req.query.code;
		co(function*(){
			var mykey = yield WXApp.OAuth(code);
			req.session.token = mykey;
			res.status(200).send(mykey);
	//		console.log(req);
		}).catch(function(err){
			console.log(err.stack);
		});
	}else{
		res.status(200).send("");
	}
};

exports.WXgetUserInfo = function(req,res,next){
	if ((req.query.iv != '' && "undefined" != typeof req.query.iv) && (req.query.encrypteddata != '' && "undefined" != typeof req.query.encrypteddata) && (req.query.token != '' && "undefined" != typeof req.query.token)){
		var iv = req.query.iv;
		var encrypteddata = req.query.encrypteddata;
		var token = req.query.token;
		co(function*(){
			var userinfo = yield WXApp.getUserInfo(token,iv,encrypteddata);
			userinfo.register = moment(new Date()).format('YYYY/MM/DD HH:mm:ss');
			userinfo.lastlogin = moment(new Date()).format('YYYY/MM/DD HH:mm:ss');
			userinfo.isCarfman = "No";
			var db = yield Mongo.connect('mongodb://localhost:27017/Schedule');
			var collection = db.collection('users');
			var r = yield collection.findOne({"unionId":userinfo.unionId});
			if(r){
				var r = yield collection.updateOne({"unionId":userinfo.unionId},{$set:{"lastlogin":userinfo.lastlogin}});
				assert.equal(1, r.modifiedCount);
			}else{
				var r = yield collection.insertOne(userinfo);
				assert.equal(1, r.insertedCount);
			}
			db.close();
			res.status(200).send("ok");
		}).catch(function(err){
			console.log(err.stack);
		});
	}else{
		res.status(200).send("");
	}
};

exports.isCarfman = function(req,res,next){
	if (req.query.token != '' && "undefined" != typeof req.query.token) {
		var token = req.query.token;
		co(function*(){
			var openid = yield WXApp.deCrypto(token);
			openid = openid.split("&&&&")[1];
			var db = yield Mongo.connect('mongodb://localhost:27017/Schedule');
			var collection = db.collection('users');
			var r = yield collection.findOne({'openId':openid});
			if(r.isCarfman){
				if(r.isCarfman == "yes"){
					if(r.BookingPlan){
						res.status(200).send("have");
					}else{
						res.status(200).send("yes");
					}
				}else{
					res.status(200).send("no");
				}
			}else{
				res.status(200).send("no");
			}
			db.close();
		}).catch(function(err){
			console.log(err.stack);
		});
	}else{
		res.status(200).send("");
	}
};

exports.getMajor = function(req,res,next){
	co(function*(){
		var db = yield Mongo.connect('mongodb://localhost:27017/Schedule');
		var collection = db.collection('majors');
		var r = yield collection.find({}).toArray();
		res.status(200).send(r);
		db.close();
	}).catch(function(err){
		console.log(err.stack);
	});
};

exports.setMajor = function(req,res,next){
	if (req.query.token != '' && "undefined" != typeof req.query.token && req.query.id != '' && "undefined" != typeof req.query.id) {
		var token = req.query.token;
		var id = req.query.id;
		co(function*(){
			var openid = yield WXApp.deCrypto(token);
			openid = openid.split("&&&&")[1];
			var db = yield Mongo.connect('mongodb://localhost:27017/Schedule');
			var collection = db.collection('majors');
			var r = yield collection.findOne({"_id":ObjectId(id)});
			var majorName = r.name;
			var collection = db.collection('users');
			var r = yield collection.updateOne({'openId':openid},{$set:{'isCarfman':'yes','Major':majorName}});
			res.status(200).send("ok");
			db.close();
		}).catch(function(err){
			console.log(err.stack);
		});
	}else{
		res.status(200).send("");
	}
};

exports.addMajor = function(req,res,next){
	if (req.query.token != '' && "undefined" != typeof req.query.token && req.query.major != '' && "undefined" != typeof req.query.major) {
		var token = req.query.token;
		var newmajor = req.query.major;
		co(function*(){
			var openid = yield WXApp.deCrypto(token);
			openid = openid.split("&&&&")[1];
			var db = yield Mongo.connect('mongodb://localhost:27017/Schedule');
			var collection = db.collection('majors');
			var r = yield collection.insertOne({"name":newmajor});
			var majorName = newmajor;
			var collection = db.collection('users');
			var r = yield collection.updateOne({'openId':openid},{$set:{'isCarfman':'yes','Major':majorName}});
			res.status(200).send("ok");
			db.close();
		}).catch(function(err){
			console.log(err.stack);
		});
	}else{
		res.status(200).send("");
	}	
};

exports.setBookingPlan = function(req,res,next){
	if (req.query.token != '' && "undefined" != typeof req.query.token) {
		var token = req.query.token;
		var week = eval(req.query.week);
		var input = {
			'week':week,
        	'forever':eval(req.query.forever),
        	'targetday':req.query.targetday,
        	'starttime':req.query.starttime,
        	'endtime':req.query.endtime,
        	'timestamp':new Date(moment(new Date()).format('YYYY/MM/DD HH:mm:ss'))
		};
		co(function*(){
			var openid = yield WXApp.deCrypto(token);
			openid = openid.split("&&&&")[1];
			var db = yield Mongo.connect('mongodb://localhost:27017/Schedule');
			var collection = db.collection('users');
			var r = yield collection.updateOne({'openId':openid},{$set:{'BookingPlan':input}});
			res.status(200).send("ok");
			db.close();
		}).catch(function(err){
			console.log(err.stack);
		});
	}else{
		res.status(200).send("");
	}
};

exports.getMajor2Carfmans = function(req,res,next){
	if (req.query.id != '' && "undefined" != typeof req.query.id) {
		var id = req.query.id;
		co(function*(){
			var db = yield Mongo.connect('mongodb://localhost:27017/Schedule');
			var collection = db.collection('majors');
			var r = yield collection.findOne({"_id":ObjectId(id)});
			var majorName = r.name;
			var collection = db.collection('users');
			var r = yield collection.find({'Major':majorName,'isCarfman':'yes'},{'nickName':1,'gender':1,'city':1,'province':1,'avatarUrl':1}).toArray();
			res.status(200).send(r);
			db.close();
		}).catch(function(err){
			console.log(err.stack);
		});
	}else{
		res.status(200).send("");
	}		
};

exports.setCarfman = function(req,res,next){
	if (req.query.token != '' && "undefined" != typeof req.query.token && req.query.id != '' && "undefined" != typeof req.query.id) {
		var token = req.query.token;
		var id = req.query.id;
		co(function*(){
			var openid = yield WXApp.deCrypto(token);
			openid = openid.split("&&&&")[1];
			var db = yield Mongo.connect('mongodb://localhost:27017/Schedule');
			var collection = db.collection('users');
			var r0 = yield collection.findOne({"_id":ObjectId(id)});
			var input = {'major':r0.Major,'name':r0.nickName,'carfman_id':r0._id};
			var r = yield collection.updateOne({'openId':openid},{$push:{'myCarfmans':input}});
			res.status(200).send("ok");
			db.close();
		}).catch(function(err){
			console.log(err.stack);
		});		
	}else{
		res.status(200).send("");
	}
};

//我想学习调用第一个方法判断no is
//mongo 返回is路由到 /ihavecarfam/ihavecarfman
//mongo 返回 no 路由到 /ihavecarfam/ihavecarfman
exports.firstCarfman = function(req,res,next){
	if (req.query.token != '' && "undefined" != typeof req.query.token) {//判断是否有token
		var token = req.query.token;
		co(function*(){
			var openid = yield WXApp.deCrypto(token);
			openid = openid.split("&&&&")[1];
			var db = yield Mongo.connect('mongodb://localhost:27017/Schedule');
			var collection = db.collection('users');
			var r = yield collection.findOne({'openId':openid});
			if(r.myCarfmans){
				res.status(200).send("no");
			}else{
				res.status(200).send("is");
			}
			db.close();
		}).catch(function(err){
			console.log(err.stack);
		});
	}else{
		res.status(200).send("");
	}
};


exports.getMyCarfmans = function(req,res,next){
	if (req.query.token != '' && "undefined" != typeof req.query.token) {
		var token = req.query.token;
		co(function*(){
			var openid = yield WXApp.deCrypto(token);
			openid = openid.split("&&&&")[1];
			var db = yield Mongo.connect('mongodb://localhost:27017/Schedule');
			var collection = db.collection('users');
			var r = yield collection.findOne({'openId':openid},{'myCarfmans':1,"_id":0});
			if(r.myCarfmans){
				for(idx in r.myCarfmans){
					var r0 = yield collection.findOne({'_id':ObjectId(r.myCarfmans[idx].carfman_id)},{'avatarUrl':1,'_id':0,'BookingPlan':1});
					r.myCarfmans[idx].info = r0;
					if(r0.BookingPlan.forever){
						r.myCarfmans[idx].countDays = 365;
					}else{
						r.myCarfmans[idx].countDays =  parseInt((new Date(r0.BookingPlan.targetday) - new Date())/1000/60/60/24);
					}
				}
				res.status(200).send(r);
			}else{
				res.status(200).send("no");
			}
			db.close();
		}).catch(function(err){
			console.log(err.stack);
		});
	}else{
		res.status(200).send("");
	}	
};

exports.getBookings = function(req,res,next){
	if (req.query.token != '' && "undefined" != typeof req.query.token) {
		var token = req.query.token;
		var roomid = decodeURIComponent(req.query.roomId);
		console.log(roomid);
		co(function*(){
			var db = yield Mongo.connect('mongodb://localhost:27017/Schedule');
			var collection = db.collection('bookings');
			var r = yield collection.aggregate([
				{'$match':{'roomId':roomid,'active':true}},
				{'$project':{'time':'$startTime.d','range':'$timeRange','guest':'$bookingGuest','active':1,'_id':0}},
				{'$sort':{'time':1}}
			]).toArray();
			//console.log("r.l",r.length,"r",r);
			db.close();
			if(r.length > 0){
				res.status(200).send(r);
			}else{
				var r = [];
				res.status(200).send(r);
			//	res.writeHead(404);
			//	res.end("no data");
			}
		}).catch(function(err){
			console.log(err.stack);
		});
	}else{
		res.status(200).send("");
	}
};

exports.getMySchedules = function(req,res,next){
	if (req.params.token != '' && "undefined" != typeof req.params.token) {
		let token = req.params.token;
		co(function*(){
			var openid = yield WXApp.deCrypto(token);
			openid = openid.split("&&&&")[1];
			var db = yield Mongo.connect('mongodb://localhost:27017/Schedule');
			var collection = db.collection('users');
			var r = yield collection.findOne({'openId':openid},{"_id":1});
			var collection_b = db.collection('bookings');
			var r = yield collection_b.aggregate([
				{'$match':{'carfman.carfman_id':r._id.toString(),'active' : true,'bookingTimeStamp':{'$gte':new Date()}}},
				{'$project':{'date':'$bookingDate','time':'$startTime.d','range':'$timeRange','guest':'$bookingGuest','active':1,'_id':0}},
				{'$sort':{'bookingTimeStamp':-1,'time':1}}
			]).toArray();
			db.close();
			if(r.length > 0){
				res.status(200).send(r);
			}else{
				var r = [];
				res.status(200).send(r)
			}
		}).catch(function(err){
			console.log(err.stack);
		});	
	}else{
		res.status(200).send("");
	}	
};

