var crypto = require('crypto');
var fs = require('fs');

var privatePem  = fs.readFileSync('../../../server.pem');
var publicPem  = fs.readFileSync('../../../server.pem');
var key = privatePem.toString('ascii');
var pubkey  = publicPem.toString('ascii');
var data = "abcdef"
var sign = crypto.createSign('RSA-SHA256');

sign.update(data);

var sig = sign.sign(key, 'hex');

var verify = crypto.createVerify('RSA-SHA256');