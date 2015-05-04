/**
 * Ferropoly Main
 *
 * This is the "real" application file
 * Created by kc on 14.04.15.
 */
'use strict';
var express = require('express');
var path = require('path');
var logger = require('morgan');
//var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var settings = require('./settings');
var authStrategy = require('../common/lib/authStrategy');
var passport = require('passport');
var flash = require('connect-flash');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
// Model includes
var users = require('../common/models/userModel');
//var gameplays = require('../common/models/gameplayModel');
var properties = require('../common/models/propertyModel');
var locations = require('../common/models/locationModel');
var ferropolyDb = require('../common/lib/ferropolyDb');
// Routes includes
var indexRoute = require('./routes/index');
var login = require('./routes/login');
var authtoken = require('./routes/authtoken');
var marketplace = require('./lib/accounting/marketplace');

var app = express();

/**
 * Initialize DB connection, has to be only once for all models
 */
ferropolyDb.init(settings, function (err) {
  if (err) {
    console.log('Failed to init ferropolyDb');
    console.error(err);
    return;
  }

  authStrategy.init(settings, users);

  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');

  // uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}));
 // app.use(cookieParser());

  // Define Strategy, login
  passport.use(authStrategy.strategy);
  // Session serializing of the user
  passport.serializeUser(authStrategy.serializeUser);
  // Session deserialisation of the user
  passport.deserializeUser(authStrategy.deserializeUser);
  // required for passport: configuration
  app.use(session({
    secret: 'ferropolyIsAGameWithAVeryLargePlayground!',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false}, // This is important! secure works only for https, with http no cookie is set!!!!
    store: new MongoStore({ mongooseConnection: ferropolyDb.getDb() })
  })); // session secret
  app.use(passport.initialize());
  app.use(passport.session()); // persistent login sessions
  app.use(flash()); // use connect-flash for flash messages stored in session
  app.use(express.static(path.join(__dirname, 'public')));

  // Routes initialisation
  login.init(app, settings);
  app.use('/', indexRoute);
  authtoken.init(app);

  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // development error handler
  // will print stacktrace
  if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err
      });
    });
  }

  // production error handler
  // no stacktraces leaked to user
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {}
    });
  });

  // Now it is time to start the scheduler
  var gameScheduler = require('./lib/gameScheduler')();
  marketplace.init(gameScheduler);

  var server = require('http').Server(app);

  app.set('port', settings.server.port);
  app.set('ip', settings.server.host);
  server.listen(app.get('port'), app.get('ip'), function () {
    console.log('%s: Node server started on %s:%d ...',
      new Date(Date.now()), app.get('ip'), app.get('port'));
  });
  console.log('Ferropoly Main server listening on port ' + app.get('port'));


});
