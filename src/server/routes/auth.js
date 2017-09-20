const express = require('express');
const router = express.Router();
var multer  = require('multer');
var upload = multer({});
const authHelpers = require('../auth/_helpers');
const authTransactionsHelpers = require('../auth/_transactions_helpers');
const authPortfolioHelpers = require('../auth/_portfolio_helpers');
const authEarningsHelpers = require('../auth/_earnings_helpers');
const authUserHelpers = require('../auth/_user_helpers');
const authLandHelpers = require('../auth/_land_helpers');
const passport = require('../auth/local');

router.post('/register', authHelpers.loginRedirect, (req, res, next)  => {
  return authUserHelpers.createUser(req, res)
  .then((response) => {
    passport.authenticate('local', (err, user, info) => {
      if (user) { handleResponse(res, 200, 'success'); }
    })(req, res, next);
  })
  .catch((err) => { handleResponse(res, 500, 'error'); });
});

router.post('/profile', upload.single('avatar'), authHelpers.loginRequired, (req, res, next)  => {
  return authUserHelpers.updateProfile(req, res);
});

router.post('/profile/image', authHelpers.loginRequired, (req, res, next)  => {
  return authUserHelpers.updateProfileImage(req, res);
});

router.get('/profile', authHelpers.loginRequired, (req, res, next)  => {
  return authUserHelpers.getProfile(req, res);
});

router.post('/settings', authHelpers.loginRequired, (req, res, next)  => {
  return authUserHelpers.updateSettings(req, res);
});

router.post('/updatepassword', authHelpers.loginRequired, (req, res, next)  => {
  return authUserHelpers.updatePassword(req, res);
});

router.post('/findcontactbyphone', authHelpers.loginRequired, (req, res, next)  => {
  return authUserHelpers.findContactByPhone(req, res);
});

router.get('/lands', authHelpers.loginRequired, (req, res, next)  => {
  return authLandHelpers.getLands(req, res);
});

router.get('/land/:landId', authHelpers.loginRequired, (req, res, next)  => {
  return authLandHelpers.getLand(req, res);
});

router.get('/documents', authHelpers.loginRequired, (req, res, next)  => {
  return authLandHelpers.getDocuments(req, res);
  //res.status(200).send('test Docs');
});

router.get('/transactions', authHelpers.loginRequired, (req, res, next)  => {
  return authTransactionsHelpers.getTransactions(req, res);
});

router.post('/transactions', authHelpers.loginRequired, (req, res, next)  => {
  return authTransactionsHelpers.createTransactions(req, res);
});

router.get('/portfolio', (req, res, next)  => {
  return authTransactionsHelpers.getPortfolio(req, res);
});

router.get('/earnings', (req, res, next)  => {
  return authEarningsHelpers.getEarnings(req, res);
});

router.get('/feeds', (req, res, next)  => {
  return authHelpers.getFeeds(req, res);
});

router.post('/login', authHelpers.loginRedirect, (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) { handleResponse(res, 500, 'error'); }
    if (!user) { handleResponse(res, 404, 'User not found'); }
    if (user) {
      req.logIn(user, function (err) {
        if (err) {
          console.log(err);
          return handleResponse(res, 500, 'error');
        }
        return handleResponse(res, 200, 'success');
      });
    }
  })(req, res, next);
});

router.get('/logout', authHelpers.loginRequired, (req, res, next) => {
  req.logout();
  handleResponse(res, 200, 'success');
});

// *** helpers *** //

function handleLogin(req, user) {
  return new Promise((resolve, reject) => {
    req.login(user, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
}

function handleResponse(res, code, statusMsg) {
  res.status(code).json({status: statusMsg});
}

module.exports = router;
