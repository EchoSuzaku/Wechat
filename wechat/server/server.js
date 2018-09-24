/*
copyright by Ekain Cao @2017
*/

var fs = require('fs'),
	express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	moment = require('moment'),
	hbs = require('hbs'),
	router = require(__dirname+"/routers/index"),
	bodyparser = require('body-parser'),
	multiparty = require('multiparty'),
	pug = require('pug'),
	session = require('express-session'),
	co_request = require('co-request'),
	co = require('co'),
	crypto = require('crypto'),
	//io = require('socket.io')(server,{}),
	redisStore = require('connect-redis')(session),
	redis = require('redis'),
	redisClient = redis.createClient(),
	cookieParser = require('cookie-parser'),
	WXApp = require(__dirname+"/weixinAppModule");

/**
var io_server = require(__dirname+"/functions/io-server.js");
var url = require('url');
var ws = require('ws');

wss = new ws.Server({server:server});

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === ws.OPEN) {
      client.send(data);
    }
  });
};

wss.on('connection',(socket,req)=>{
	io_server.init(socket,req,ws,wss);
});
*/

global.serverConfig = {
	_SEVER_PORT_:2622,
	_R_D_:'https://uncleek.shoppingzone.com.cn',
	_L_D_:'http://localhost'
};

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));
app.use(cookieParser());
app.use(session({
	name:'Sc',
	store: new redisStore({
		host:'127.0.0.1',
		port:6379,
		db:0,
		ttl:60*60*24*30,
		prefix:"wxApp_Sc_",
		client:redisClient
	}),
	resave:false,
	saveUninitialized:false,
	secret:'angel7cn',
	cookie:{srcure:false,maxAge:1000*60*60*24*30}
}));
app.set("view engine",'html');
app.engine('html',pug.__express);
server.listen(global.serverConfig._SEVER_PORT_);
app.use('/',router);
console.log('Author: Ekain Cao');
console.log('Shanghai CN');
console.log('Copyright 2017.08 Ver 0.1');
console.log('Server is Online [@'+moment(new Date()).format('YYYY-MM-DD HH:mm:ss')+"] listening on Port : "+global.serverConfig._SEVER_PORT_);
