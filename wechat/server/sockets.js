var	https = require('https');
var http = require('http'),
	express = require('express'),
	app = express();
var url = require('url');
var fs = require('fs');
var ws = require('ws');
var io_server = require(__dirname+"/functions/io-server.js");
var key = process.cwd()+"/keys/215014023990670.key";
var cert = process.cwd()+"/keys/215014023990670.pem";
var op = {
		key: fs.readFileSync(key),
 		cert: fs.readFileSync(cert)
	};

/*
var server = https.createServer(op,(req,res) => {
		res.writeHead(200);
		res.end('test ws server!');
	}).listen(12811,() => {
		console.log('wss on 12811');
	});
*/

var server = http.createServer((req,res) => {
		res.writeHead(200);
		res.end('test ws server!');
	}).listen(12811,() => {
		console.log('wss on 12811');
	});

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