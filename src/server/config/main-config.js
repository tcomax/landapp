(function(appConfig) {

  'use strict';

  // *** main dependencies *** //
  const path = require('path');
  const cookieParser = require('cookie-parser');
  const bodyParser = require('body-parser');
  const session = require('express-session');
  const flash = require('connect-flash');
  const morgan = require('morgan');
  const nunjucks = require('nunjucks');
  const passport = require('passport');
  var cors = require('cors');
  var corsOptions =
  {
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: true,
    credentials: true,
    optionsSuccessStatus: 204
  };

  // *** view folders *** //
  const viewFolders = [
    path.join(__dirname, '..', 'views')
  ];

  // *** load environment variables *** //
  require('dotenv').config();

  appConfig.init = function(app, express) {

    // *** view engine *** //
    nunjucks.configure(viewFolders, {
      express: app,
      autoescape: true
    });
    app.set('view engine', 'html');

    // *** app middleware *** //
    if (process.env.NODE_ENV !== 'test') {
      app.use(morgan('dev'));
    }
    app.use(cors(corsOptions));
    app.use(cookieParser());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(express.static(path.join(__dirname, '..', '..', 'client')));
    // uncomment if using express-session
    app.use(session({
      secret: process.env.SECRET_KEY,
      resave: false,
      saveUninitialized: true
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash());
    /*
    app.use(function(req, res, next) {
      res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:8080');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      next();
    });*/
  };

})(module.exports);
