/*
copyright by Ekain Cao @2017
*/
var canvas = require('canvas'),
	co = require('co'),
	fs = require('co-fs'),
	moment = require('moment'),
	Mongo = require('mongodb').MongoClient,
	assert = require('assert'),
	url = require('url'),
	WXApp = require(__dirname+"/../weixinAppModule"),
	ObjectId = require('mongodb').ObjectId;

global.roomcount = {};
global.haveC = {};

module.exports = {
	init:(socket,req,ws,wss)=>{
		//console.log(socket.upgradeReq.url);
		//wss.broadcast("i'm comming");
		//console.log('req.url  >> :',req.url);
		socket.on('close',()=>{
			var roomid = socket.RoomId;
			var data = {
				token:socket.userToken
			};
			global.roomcount[roomid]--;
			if(global.roomcount[roomid] <= 0){
				delete global.roomcount[roomid];
			}
			if("undefined" != typeof socket.sid && "undefined" != typeof global.haveC[socket.RoomId]["s_"+socket.sid] && global.haveC[socket.RoomId]["s_"+socket.sid] <= 0){
				delete global.haveC[socket.RoomId]["s_"+socket.sid];
			}
			if(!jsonisnotunll(global.haveC[socket.RoomId])){
				delete global.haveC[socket.RoomId];
			}
			wss.clients.forEach((client)=>{
				if(client.RoomId === roomid){
					var output = {
						'tag':'roomcount',
						'data':global.roomcount[socket.RoomId],
						'text':'one client left this day'
					};
					output = JSON.stringify(output);
					client.send(output);
				}
			});
			//refresh('close',data);

		});
		socket.on('message',(mess)=>{
			console.log(mess);
			var mess = JSON.parse(mess);
			switch (mess.tag){
				case 'bookingsubmit':
					mess.data.timeStamp = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
					co(function*(){
						let bookingTS = mess.data.bookingDate.day.replace(/\//g,'-') + "T" + mess.data.startTime.c+":00Z";
						mess.data.bookingTimeStamp = new Date(bookingTS);
						var db = yield Mongo.connect('mongodb://localhost:27017/Schedule');
						var collection = db.collection('bookings');
						var r = yield collection.insertOne(mess.data);
						var r = yield collection.aggregate([
							{'$match':{'roomId':mess.data.roomId,'active':true}},
							{'$project':{'time':'$startTime.d','range':'$timeRange','guest':'$bookingGuest','active':1,'_id':0}},
							{'$sort':{'time':1}}
							]).toArray();
						db.close();
						wss.clients.forEach((client)=>{
							if(client.RoomId === mess.data.roomId){
								var output = {
									'tag':'resetbookinginfomation',
									'data':r,
									'text':'new bookings infomations'
								};
								output = JSON.stringify(output);
								client.send(output);
							}
						});
					}).catch(function(err){
						console.log(err.stack);
					});
				break;
				case 'toReserve':
					var oldsid = socket.sid;
					socket.sid = mess.data.sid;
					if ("undefined" == typeof global.haveC[mess.data.roomid]){
						global.haveC[mess.data.roomid] = {};
						global.haveC[mess.data.roomid]["s_"+mess.data.sid] = 1;
					}else{
						if("undefined" == typeof global.haveC[mess.data.roomid]["s_"+mess.data.sid]){
							global.haveC[mess.data.roomid]["s_"+mess.data.sid] = 1;
						}else{
							global.haveC[mess.data.roomid]["s_"+mess.data.sid]++;
						}
					}
					if(oldsid != mess.data.sid && "undefined" != typeof oldsid){
						global.haveC[mess.data.roomid]["s_"+oldsid]--;
						if(global.haveC[mess.data.roomid]["s_"+oldsid] <= 0){
							delete global.haveC[mess.data.roomid]["s_"+oldsid];
						}
					}
					console.log(haveC);
					wss.clients.forEach((client)=>{
/*						if(client.RoomId === mess.data.roomid){
							var output = {
								'tag':'reservers',
								'data':global.haveC[mess.data.roomid],
								'text':'new one in'
							};
						}else{
							var output = {
								'tag':'reservers',
								'data':global.haveC[client.RoomId],
								'text':'new one in'
							};							
						}
						output = JSON.stringify(output);
						console.log(output);
						client.send(output);
					*/
						if("undefined" != typeof global.haveC[client.RoomId]){
							var output = {
								'tag':'reservers',
								'data':global.haveC[client.RoomId],
								'text':'new one in'
							};
							output = JSON.stringify(output);
							console.log(output);
							client.send(output);
						}
					
					});
				break;
				case 'setConn':
					socket.userToken = mess.data.token;
					socket.nickName = mess.data.nickname;
					socket.RoomId = mess.data.roomid;
					global.roomcount[mess.data.roomid] ? global.roomcount[mess.data.roomid]++ : global.roomcount[mess.data.roomid]=1;
					wss.clients.forEach((client)=>{
						if(client.RoomId === mess.data.roomid){
							var data = {
								token:client.userToken,
								status:client.readyState,
								roomid:mess.data.roomid
							};
							//refresh('setRoom',data);
							var output = {
								'tag':'roomcount',
								'data':global.roomcount[mess.data.roomid],
								'text':'All of '+(global.roomcount[mess.data.roomid])+' clients in same day'
								};
							output = JSON.stringify(output);
							client.send(output);
						}
					/*	
						if (client === socket) {
							var data = {
								token:mess.data.token,
								nickname:mess.data.nickname,
								status:client.readyState
							};
							//refresh('addone',data);
						}else if(client.readyState === wss.OPEN){
							client.send(mess.data.nickname+" is comming!");
						} 
					*/
					});
				break;
				case 'setRoom':
					if("undefined" != typeof socket.RoomId){
						var oldroomid = socket.RoomId;
						socket.RoomId = mess.data;
						if(oldroomid != mess.data){
							global.roomcount[oldroomid]--;
							global.roomcount[mess.data] ? global.roomcount[mess.data]++ : global.roomcount[mess.data]=1;
							if(global.roomcount[oldroomid] == 0){
								delete global.roomcount[oldroomid];
							}
							if("undefined" != typeof socket.sid){
								if ("undefined" != typeof global.haveC[oldroomid]["s_"+socket.sid]) global.haveC[oldroomid]["s_"+socket.sid]--;
								if(global.haveC[oldroomid]["s_"+socket.sid] <= 0){
									delete global.haveC[oldroomid]["s_"+socket.sid];							
									if(!jsonisnotunll(global.haveC[oldroomid])){
										delete global.haveC[oldroomid];
									}else{
										console.log(oldroomid,"is in global haveC",global.haveC[oldroomid]);
									}
								}
								delete socket.sid;
							}
						}else{
							global.roomcount[mess.data]++;
						}
					}else{
						socket.RoomId = mess.data;
						global.roomcount[mess.data] ? global.roomcount[mess.data]++ : global.roomcount[mess.data]=1;
					}
					wss.clients.forEach((client)=>{
						if("undefined" != typeof global.haveC){
							if("undefined" != typeof global.haveC[client.RoomId]){
								var output = {
									'tag':'reservers',
									'data':global.haveC[client.RoomId],
									'text':'new one in'
								};
								output = JSON.stringify(output);
								client.send(output);
							}
						}
						if (client === socket) {
							var data = {
								token:client.userToken,
								status:client.readyState,
								roomid:mess.data
							};
							//refresh('setRoom',data);
							var output = {
								'tag':'roomcount',
								'data':global.roomcount[mess.data],
								'text':'All of '+(global.roomcount[mess.data])+' clients in same day'
								};
							output = JSON.stringify(output);
							client.send(output);
						}else if(client.RoomId === mess.data){
							var output = {
								'tag':'roomcount',
								'data':global.roomcount[mess.data],
								'text':'new one client in same day'
								};
							output = JSON.stringify(output);
							client.send(output);							
						}else if(client.RoomId === oldroomid){
							var output = {
								'tag':'roomcount',
								'data':global.roomcount[oldroomid],
								'text':'one client left this day'
								};
							output = JSON.stringify(output);
							client.send(output);
						}
					});
					//console.log(socket);
				break;
				default:
					wss.broadcast("i'm comming");
				break;
			}
		});
	}
};

function* countRoomC(roomid){
	var db = yield Mongo.connect('mongodb://localhost:27017/Schedule');
	var collection = db.collection('wsCache');
	var r = yield collection.find({'room':roomid,'status':1}).toArray();
	db.close();
	return  r.length;
}


function jsonisnotunll(data){
	var output = false;
	for(var item in data){
		if("undefined" != typeof item){
			output = true;
			break;
		}
	}
	return output;
}

function refresh(ctrl,data){
		switch (ctrl){
			case 'addone':
				co(function*(){
					var db = yield Mongo.connect('mongodb://localhost:27017/Schedule');
					var collection = db.collection('wsCache');
					var r = yield collection.insertOne({'token':data.token,'nickname':data.nickname,'status':data.status});
					db.close();
				}).catch(function(err){
					console.log(err.stack);
				});
			break;
			case 'setRoom':
				co(function*(){
					var db = yield Mongo.connect('mongodb://localhost:27017/Schedule');
					var collection = db.collection('wsCache');
					var r = yield collection.updateOne({'token':data.token,'status':data.status},{$set:{'room':data.roomid}});
					db.close();
				}).catch(function(err){
					console.log(err.stack);
				});
			break;
			case 'close':
				co(function*(){
					var db = yield Mongo.connect('mongodb://localhost:27017/Schedule');
					var collection = db.collection('wsCache');
					var r = yield collection.deleteOne({'token':data.token});
					db.close();
				}).catch(function(err){
					console.log(err.stack);
				});
			break;
			
		}
	}

