/*
copyright by Ekain Cao @2017
*/

var co_request = require('co-request'),
	crypto = require('crypto');


var weixinAppModule = {
	AppId:'',
	Secret:'',
	cryptoKey:"",
	setCryptoKey:function(key){
		this.cryptoKey = key;
	},
	getCryptoKey:function(){
		return cryptoKey;
	},
	takeCrypto:function* (text){
		const cipher = crypto.createCipher('aes-256-cbc', this.cryptoKey);
		var crypted = cipher.update(text,'utf8','hex');
		crypted+=cipher.final('hex');
		var message = crypted;
		return message;
	},
	deCrypto:function* (text){
		var decipher = crypto.createDecipher('aes-256-cbc',this.cryptoKey);
		var dec=decipher.update(text,'hex','utf8');
		dec+= decipher.final('utf8');
		var message = dec;
		return dec;
	},
	setAppID:function(appid){
		this.AppId = appid;
	},
	getAppID:function(){
		return this.AppId;
	},
	setSecret:function(secret){
		this.Secret = secret;
	},
	getSecret:function(){
		return this.Secret;
	},
	OAuth:function*(code){		
		var url = 'https://api.weixin.qq.com/sns/jscode2session?appid='+this.AppId+'&secret='+this.Secret+'&js_code='+code+'&grant_type=authorization_code';
		var r = yield co_request(url);
		var body = yield JSON.parse(r.body);
		var mykey = yield this.takeCrypto(body.session_key+"&&&&"+body.openid);
		return mykey;
	},
	getUserInfo:function*(token,iv,encryptedData){
		var sessionkey = yield this.deCrypto(token);
		var sessionkey = sessionkey.split("&&&&")[0];
		var userinfo = yield this.decipher(sessionkey,iv,encryptedData);
		return userinfo;
	},
	decipher:function* (sessionkey,iv,data){
		var appid = this.appid;
		var sessionkey = new Buffer(sessionkey,'base64');
		var encrytoed = new Buffer(data,'base64');
		var iv = new Buffer(iv,'base64');
		try{
			var decipher = crypto.createDecipheriv('aes-128-cbc', sessionkey, iv);
			decipher.setAutoPadding(true);
			var decoded = decipher.update(encrytoed, 'binary', 'utf8');
			decoded += decipher.final('utf8');
			decoded = JSON.parse(decoded);
		}catch (err) {
    		throw new Error('Illegal Buffer 1');
  		}
  		if (decoded.watermark.appid !== this.AppId) {
    		throw new Error('Illegal Buffer')
  		}
  		return decoded;
  	}
};

module.exports = weixinAppModule;