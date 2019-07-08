const myConf = require('../../config/MyConf');

const fs = require('fs');
const jwt = require('jsonwebtoken');

const bcrypt = require('bcrypt');
const saltRounds = 10;

let SecurityCenter = {

}

var self = SecurityCenter;

SecurityCenter.getPasswordHash = function(toHashValue, callback) {
  bcrypt.hash(toHashValue, saltRounds, function(err, hash) {
    callback && callback(hash);
  });
}

SecurityCenter.passwordCompare = function(testPassword, hashedPassword, callback) {
  bcrypt.compare(testPassword, hashedPassword).then((isEqual) => {
    callback && callback(isEqual);
  });
}

SecurityCenter.generateToken = function(data) {
  let created = Math.floor(Date.now() / 1000);
  let cert = fs.readFileSync(myConf.paths.config + '/rsa_private_key.pem');
  let token = jwt.sign({
      data,
      exp: created + 3600 * 0.5,
  }, cert, {algorithm: 'RS256'});
  return token;
}

SecurityCenter.verifyToken = function(token, callback) {
  let cert = fs.readFileSync(myConf.paths.config + '/rsa_public_key.pem');
  let isOk = false;

  jwt.verify(token, cert, {algorithms: ['RS256']}, (err, result) => {
    if (err) {isOk = false}
    if (result) {isOk = true}
    callback && callback(isOk, result);
  });
}

module.exports = {
  getPasswordHash: SecurityCenter.getPasswordHash,
  passwordCompare: SecurityCenter.passwordCompare,
  generateToken: SecurityCenter.generateToken,
  verifyToken: SecurityCenter.verifyToken,
}
