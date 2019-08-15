let RouterMgr = {}

var indexRouter = require('./index');
var usersRouter = require('./users');
var registerRouter = require('./register');
var loginRouter = require('./login');
var friendRouter = require('./friend');
var moneyTreeRouter = require('./moneyTree');

RouterMgr.initRoutesWithApp = function(app) {
  app.use('/', indexRouter);
  app.use('/users', usersRouter);
  app.use('/register', registerRouter);
  app.use('/login', loginRouter);
  app.use('/friend', friendRouter);
  app.use('/moneyTree', moneyTreeRouter);
}

module.exports = RouterMgr
