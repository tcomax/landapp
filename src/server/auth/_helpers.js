const bcrypt = require('bcryptjs');
const knex = require('../db/connection');
const baale = require('../db/baale.connection');
var sess;

function comparePass(userPassword, databasePassword) {
  return bcrypt.compareSync(userPassword, databasePassword);
}

function createUserProfile(req, res) {
  console.log(`sess: ${JSON.stringify(sess)}`);
  console.log(`body: ${JSON.stringify(req.body)}`);
  let invitedBy = req.body.invitedBy;
  let bank = '';
  let accountNo = '';
  let photoUrl = '';
  return handleCreateContactErrors(req)
  .then(() => {
    let query =  baale('user_info')
    .insert({
      id: sess.userId,
      cntct_id: sess.cntctId,
      bank: bank,
      acct_num: accountNo,
      photo_url: photoUrl,
      invited_by: invitedBy,
      modified: 'now()',
      created: 'now()'
    }).returning('id');
    //console.log(query);
    return query.then((id) => {
      sess.userInfoId = id[0];
      res.status(200).json({status: 'success'});
    }).catch((err) => {
      res.status(400).json({status: err.message});
    });
  }).catch((err) => {
    res.status(400).json({status: err.message});
  });
}

function createContact(req, res) {
  console.log(`sess: ${JSON.stringify(sess)}`);
  console.log(`body: ${JSON.stringify(req.body)}`);
  let phone = req.body.phone;
  let name = req.body.name;
  let email = req.body.email;
  return handleCreateContactErrors(req)
  .then(() => {
    return baale('contacts')
    .insert({
      phone: phone,
      name: name,
      email: email,
      modified: 'now()',
      created: 'now()'
    }).returning('id')
    .then((id) => {
      sess.cntctId = id[0];
      return createUserProfile(req, res);
    }).catch((err) => {
      res.status(400).json({status: err.message});
    });
  }).catch((err) => {
    res.status(400).json({status: err.message});
  });
}

function updateContact(req, res) {
  let userId = sess.userId;
  let cntctId = sess.cntctId;
  let phone = req.body.phone;
  let email = req.body.email;
  let name = req.body.name;
  let query = baale('contacts')
  .where('id', '=', cntctId)
  .update({
    user_id: userId,
    name: name,
    email: email,
    phone: phone,
    modified: 'now()',
    created: 'now()'
  })
  .returning();
  console.log(query.toString());
  return query.then(() => {
    res.status(200).json({status: 'success'});
  }).catch((err) => {
    res.status(400).json({status: err.message});
  });
}

function createDocuments(req, res) {
  console.log(`sess: ${JSON.stringify(sess)}`);
  let image = req.body.docImage;
  let docRegNo = req.body.docRegNo;
  let status = 'verified';
  let docType = req.body.docType;
  let landId = req.body.landId;
  let issuerId = req.session.docIssuerId;
  let ownerId = req.session.docOwnerId;
  sess.docId = handleErrors(req)
  .then(() => {
    return baale('transactions')
    .insert({
      owner_id: ownerId,
      land_id: landId,
      type: docType,
      reg_no: docRegNo,
      image: image,
      issuer_id: issuerId,
      status: status,
      modified: 'now()',
      created: 'now()'
    })
    .returning('id');
  }).catch((err) => {
    res.status(400).json({status: err.message});
  });
  return sess.docId;
}

function updateDocuments(req, res) {
  console.log(`sess: ${JSON.stringify(sess)}`);
  let docId = req.body.docId;
  let image = req.body.docImage;
  let docRegNo = req.body.docRegNo;
  let docStatus = req.body.docStatus;
  let docType = req.body.docType;
  let landId = req.body.landId;
  let issuerId = req.session.docIssuerId;
  let ownerId = req.session.docOwnerId;
  sess.docId = handleErrors(req)
  .then(() => {
    return baale('transactions')
    .where('id', '=', docId)
    .update({
      owner_id: ownerId,
      land_id: landId,
      type: docType,
      reg_no: docRegNo,
      image: image,
      issuer_id: issuerId,
      status: docStatus,
      modified: 'now()',
      created: 'now()'
    })
    .returning('id');
  }).catch((err) => {
    res.status(400).json({status: err.message});
  });
  return sess.docId;
}

function createIssuer(req, res) {
  console.log(`sess: ${JSON.stringify(sess)}`);
  let issuerName = req.body.issuerName;
  let issuerType = req.body.issuerType;
  let issuerContactId = req.body.issuerContactId;
  sess.issuerId = handleErrors(req)
  .then(() => {
    const salt = bcrypt.genSaltSync();
    const hash = bcrypt.hashSync(req.body.password, salt);
    return baale('issuers')
    .insert({
      name: issuerName,
      type: issuerType,
      cid: issuerContactId,
      modified: 'now()',
      created: 'now()'
    })
    .returning('id');
  }).catch((err) => {
    res.status(400).json({status: err.message});
  });
  return sess.issuerId;
}

function updateIssuer(req, res) {
  console.log(`sess: ${JSON.stringify(sess)}`);
  let issuerId = sess.issuerId;
  let issuerName = req.body.issuerName;
  let issuerType = req.body.issuerType;
  let issuerContactId = req.body.issuerContactId;
  sess.issuerId = handleErrors(req)
  .then(() => {
    const salt = bcrypt.genSaltSync();
    const hash = bcrypt.hashSync(req.body.password, salt);
    return baale('issuers')
    .where('id', '=', issuerId)
    .update({
      name: issuerName,
      type: issuerType,
      cntct_id: issuerContactId,
      modified: 'now()'
    })
    .returning('id');
  }).catch((err) => {
    res.status(400).json({status: err.message});
  });
  return sess.issuerId;
}

function createLand(req, res) {
  console.log(`sess: ${JSON.stringify(sess)}`);
  let landLocation = req.body.location;
  let landDescription = req.body.location;
  let landPrice = req.body.price;
  let landArea = req.body.area;
  sess.landId = handleErrors(req)
  .then(() => {
    const salt = bcrypt.genSaltSync();
    const hash = bcrypt.hashSync(req.body.password, salt);
    return baale('lands')
    .insert({
      location: landLocation,
      description: landDescription,
      price: landPrice,
      area: landArea,
      modified: 'now()',
      created: 'now()'
    })
    .returning('id');
  }).catch((err) => {
    res.status(400).json({status: err.message});
  });
  return sess.landId;
}

function updateLand(req, res) {
  console.log(`sess: ${JSON.stringify(sess)}`);
  let landId = sess.landId;
  let landLocation = req.body.location;
  let landDescription = req.body.location;
  let landPrice = req.body.price;
  let landArea = req.body.area;
  sess.landId = handleErrors(req)
  .then(() => {
    const salt = bcrypt.genSaltSync();
    const hash = bcrypt.hashSync(req.body.password, salt);
    return baale('lands')
    .where ('id', '=', landId)
    .update({
      location: landLocation,
      description: landDescription,
      price: landPrice,
      area: landArea,
      modified: 'now()'
    })
    .returning('id');
  }).catch((err) => {
    res.status(400).json({status: err.message});
  });
  return sess.landId;
}

function findLand(req, res) {
  console.log(`sess: ${JSON.stringify(sess)}`);
  let landId = sess.landId;
  sess.land = handleErrors(req)
  .then(() => {
    const salt = bcrypt.genSaltSync();
    const hash = bcrypt.hashSync(req.body.password, salt);
    return baale('lands')
    .where ('id', '=', landId)
    .select('location','description','price','area');
  }).catch((err) => {
    res.status(400).json({status: err.message});
  });
  return sess.land;
}

function createTransaction(req, res) {
  console.log(`sess: ${JSON.stringify(sess)}`);
  let price = findLand(req, res).price;
  let amount = req.body.qty * price;
  let status = 'pending';
  let trnxType = req.body.trxnType;
  let landId = req.body.landId;
  let userId = sess.userId;
  sess.trxnId = handleErrors(req)
  .then(() => {
    return baale('transactions')
    .insert({
      user_id: sess.userId,
      land_id: landId,
      type: trnxType,
      amount: amount,
      price: price,
      status: status,
      modified: 'now()',
      created: 'now()'
    })
    .returning('id');
  }).catch((err) => {
    res.status(400).json({status: err.message});
  });
  return sess.trxnId;
}

function updateTransaction(req, res) {
  console.log(`sess: ${JSON.stringify(sess)}`);
  let trnxQty = req.body.qty;
  let trnxId = sess.trnxId;
  let trnxLandPrice = findLand(req, res).price;
  let trnxAmount = trnxQty * trnxLandPrice;
  let trnxStatus = 'pending';
  let trnxType = req.body.trxnType;
  let trnxLandId = req.body.landId;
  let trnxUsrId = sess.userId;
  sess.trxnId = handleErrors(req)
  .then(() => {
    return baale('transactions')
    .where('id', '=', trnxId)
    .update({
      user_id: trnxUsrId,
      land_id: trnxLandId,
      type: trnxType,
      amount: trnxAmount,
      price: trnxLandPrice,
      status: trnxStatus,
      modified: 'now()',
      created: 'now()'
    })
    .returning('id');
  }).catch((err) => {
    res.status(400).json({status: err.message});
  });
  return sess.trxnId;
}

function createUser(req, res) {
  console.log(`**************        CreatUser          **************`);
  console.log(`req.session: ${JSON.stringify(req.session)}`);
  console.log(`sess: ${JSON.stringify(sess)}`);
  console.log(`req.body: ${JSON.stringify(req.body)}`);
  let username = req.body.username;
  let password = req.body.password;
  let invitedBy = req.body.invitedBy;
  return handleCreateUserErrors(req)
  .then(() => {
    const salt = bcrypt.genSaltSync();
    const hash = bcrypt.hashSync(password, salt);
    let query = knex('users')
    .insert({
      username: req.body.username,
      password: hash
    }).returning('id');
    console.log(query);
    query.then((id) => {
      sess.userId = id[0];
      createContact(req,res);
    }).catch((err) => {
      res.status(400).json({status: err.message});
    });
  }).catch((err) => {
    res.status(400).json({status: err.message});
  });
}

function createGeo(req, res) {
  sess.geoId = handleErrors(req)
  .then(() => {
    return baale('geo')
    .insert({
      lat: req.body.lat,
      lng: req.body.lng,
      land_id: req.body.landId,
      modified: 'now()',
      created: 'now()'
    })
    .returning('id');
  }).catch((err) => {
    res.status(400).json({status: err.message});
  });
  return sess.geoId;
}

function updateGeo(req, res) {
  console.log(`sess: ${JSON.stringify(sess)}`);
  let geoId = sess.geoId;
  let geoLat = req.body.lat;
  let geoLng = req.body.lng;
  let geoLandId = req.body.landId;
  sess.geoId = handleErrors(req)
  .then(() => {
    return baale('geo')
    .where('id', '=', geoId)
    .update({
      lat: geoLat,
      lng: geoLng,
      land_id: geoLandId,
      modified: 'now()',
      created: 'now()'
    })
    .returning('id');
  }).catch((err) => {
    res.status(400).json({status: err.message});
  });
  return sess.geoId;
}

function getUserId(req, res) {
  return handleErrors(req)
  .then(() => {
    return knex('users')
    .select('id')
    .where('username', '=', req.user.username);
  }).catch((err) => {
    res.status(400).json({status: err.message});
  });
}

function updatePassword(req, res) {
  console.log(`sess: ${sess}`);
  let password = req.body.password;
  const salt = bcrypt.genSaltSync();
  const hash = bcrypt.hashSync(req.body.password, salt);
  return validateUpdatePassword(req)
  .then(() => {
    let query = knex('users')
    .where('username','=', req.user.username)
    .update({
      password: hash
    });
    return query.then(() => {
      req.logout();
      res.status(200).json({status: 'success'});
      console.log(`executed ${query.toString()}`);
    }).catch((err) => {
      req.logout();
      res.status(400).json({status: err.message});
    });
  }).catch((err) => {
    req.logout();
    res.status(400).json({status: err.message});
  });
}

function getProfile(req, res) {
  console.log(`getProfile sess: ${JSON.stringify(sess)}`);
  let userId = sess.passport.user;
  console.log(`userId: ${userId}`);
  let query = baale('user_info')
  .where('id', '=', userId)
  .select(
    'bank', 'acct_num AS accountNum', 'photo_url AS photoUrl', 'cntct_id AS cntctId'
  ).returning('bank', 'accountNum', 'photoUrl', 'cntctId');
  console.log(query.toString());
  return query.then((userInfo) => {
    console.log(`userInfo: ${JSON.stringify(userInfo)}`);
    sess.userInfo = userInfo[0];
    console.log(`sess: ${JSON.stringify(sess)}`);
    return getContact(req, res);
  }).catch((err) => {
    res.status(400).json({status: err.message});
  });
}

function getContactByPhone(req, res) {
  let cntctPhone = req.body.phone;
  return baale('contacts')
  .where('phone', '=', cntctPhone)
  .select(
    'phone','name','email'
  ).returning(['phone','name','email'])
  .then((cntct) => {
    console.log(`contact: ${JSON.stringify(cntct)}`);
    res.status(200).json(cntct);
  }).catch((err) => {
    res.status(400).json({status: err.message});
  });
}

function getContact(req, res) {
  console.log(`sess.userInfo.cntctId: ${sess.userInfo.cntctId}`);
  let query = baale('contacts')
  .where('id', '=', sess.userInfo.cntctId)
  .select(
    'phone','name','email'
  ).returning(['phone','name','email']);
  console.log(query.toString());
  return query.then((cntctInfo) => {
    console.log(`contact: ${JSON.stringify(cntctInfo)}`);
    sess.userInfo.cntctInfo = cntctInfo[0];
    console.log(`sess: ${JSON.stringify(sess)}`);
    res.status(200).json(sess.userInfo);
  }).catch((err) => {
    res.status(400).json({status: err.message});
  });
}

function updateProfile(req, res) {
  let userId = sess.passport.user;
  let phone = req.body.phone;
  let bank = req.body.bank;
  let accountNum = req.body.accountNum;
  let photoUrl = req.body.photoUrl;
  console.log(`req.body: ${JSON.stringify(req.body) }`);
  return baale('user_info')
  .where('id', '=', userId)
  .update({
    bank: bank,
    acct_num: accountNum,
    photo_url: photoUrl,
    modified: 'now()',
    created: 'now()'
  })
  .returning('cntct_id')
  .then((cntct_id) => {
    sess.cntctId = cntct_id[0];
    console.log(`sess: ${JSON.stringify(sess)}`);
    return updateContact(req, res);
  }).catch((err) => {
    res.status(400).json({status: err.message});
  });
}

function isUserLoggedIn(req,res,next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    loginRequired(req, res, next);
  }
}

function handleLoginErrors(req) {
  console.log(`body  ${JSON.stringify(req.body.username)}`);
  return new Promise((resolve, reject) => {
    if (req.body.username.length < 6) {
      reject({
        message: 'Username must be longer than 6 characters'
      });
    }
    else if (req.body.password.length < 6) {
      reject({
        message: 'Password must be longer than 6 characters'
      });
    } else {
      resolve();
    }
  });
}

function handleErrors(req) {
  console.log(`body  ${JSON.stringify(req.body.username)}`);
  return new Promise((resolve, reject) => {
    if (req.body.username.length < 6) {
      reject({
        message: 'Username must be longer than 6 characters'
      });
    }
    else if (req.body.password.length < 6) {
      reject({
        message: 'Password must be longer than 6 characters'
      });
    } else {
      resolve();
    }
  });
}

function handleCreateUserErrors(req) {
  let username = req.body.username;
  let password = req.body.password;
  console.log(`handleCreateUserErrors() username = ${username}`);
  console.log(`handleCreateUserErrors() password = ${password}`);
  return new Promise((resolve, reject) => {
    if (password === undefined || username === undefined) {
      reject({
        message: 'username/password cannot be undefined'
      });
    } else if (password.length < 6) {
      reject({
        message: 'Password must be longer than 6 characters'
      });
    } else if (username.length < 6) {
      reject({
        message: 'Username must be longer than 6 characters'
      });
    }
    else {
      resolve();
    }
  });
}

function handleCreateContactErrors(req) {
  let name = req.body.name;
  let phone = req.body.phone;
  let email = req.body.email;
  console.log(`handleRegistrationErrors() name = ${name}`);
  console.log(`handleRegistrationErrors() phone = ${phone}`);
  console.log(`handleRegistrationErrors() email = ${email}`);
  return new Promise((resolve, reject) => {
    if (email === undefined || phone === undefined || name === undefined) {
      reject({
        message: 'email/phone/name undefined'
      });
    }
    else {
      resolve();
    }
  });
}

function handleCreateUserInfoErrors(req) {
  let bank = req.body.bank;
  let photoUrl = req.body.phoroUrl;
  let accountNo = req.body.accountNo;
  console.log(`handleCreateUserInfoErrors() bank = ${bank}`);
  console.log(`handleCreateUserInfoErrors() photoUrl = ${photoUrl}`);
  console.log(`handleCreateUserInfoErrors() accountNo = ${accountNo}`);
  return new Promise((resolve, reject) => {
    if (accountNo === undefined || photoUrl === undefined || bank === undefined) {
      reject({
        message: 'accountNo/photoUrl/bank undefined'
      });
    }
    else {
      resolve();
    }
  });
}

function validateUpdatePassword(req) {
  console.log(`validateUpdatePassword() newpassword = ${req.body.password}`);
  return new Promise((resolve, reject) => {
    if (req.body.password === null || req.body.password === undefined) {
      reject({
        message: 'Enter a new password. Try again'
      });
    }
    /*else if (req.user === undefined) {
      reject({
        message: `you are not signed in`
      });
    }
    else if (req.body.oldpassword === req.body.newpassword) {
      reject({
        message: `New password same as old`
      });
    }*/
    else {
      resolve();
    }
  });
}

function loginRequired(req, res, next) {
  console.log(`**************        Login Required          **************`);
  console.log(`req.session: ${JSON.stringify(req.session)}`);
  console.log(`sess: ${JSON.stringify(sess)}`);
  console.log(`req.body: ${JSON.stringify(req.body)}`);
  if (sess === undefined) {
    sess = req.session;
  }
  if (!sess.passport.user) return res.status(401).json({status: 'Please log in'});
  return next();
}

function adminRequired(req, res, next) {
  if (!sess.passport.user) res.status(401).json({status: 'Please log in'});
  return knex('users').where({username: req.user.username}).first()
  .then((user) => {
    if (!user.admin) res.status(401).json({status: 'You are not authorized'});
    return next();
  })
  .catch((err) => {
    res.status(500).json({status: 'Something bad happened'});
  });
}

function loginRedirect(req, res, next) {
  console.log(`body: ${JSON.stringify(req.body)}`);
  console.log(`sess: ${JSON.stringify(req.session)}`);
  if (sess === undefined) {
    sess = req.session;
  }
  if (req.user) return res.status(401).json(
    {status: 'You are already logged in'});
  return next();
}

module.exports = {
  comparePass,
  createUser,
  createUserProfile,
  createContact,
  loginRequired,
  adminRequired,
  loginRedirect,
  updatePassword,
  updateProfile,
  getProfile,
  updateContact,
  isUserLoggedIn,
  findLand,
  getUserId
};
