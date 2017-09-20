const bcrypt = require('bcryptjs');
const knex = require('../db/connection');
const baale = require('../db/baale.connection');
var sess;
// import entire SDK
var AWS = require('aws-sdk');
// import AWS object without services
var AWS = require('aws-sdk/global');

var S3 = new AWS.S3();

var myConfig = new AWS.Config();
myConfig.update({region: 'us-east-2'});
const fileType = require('file-type');

function getDocuments(req, res) {
  console.log(`req.query ${JSON.stringify(req.query)}`);
  console.log(`req.body ${JSON.stringify(req.body)}`);
  console.log(`req.params ${JSON.stringify(req.params)}`);
  //console.log(`sess: ${JSON.stringify(sess)}`);
  if (!sess) {
    sess = req.session;
  }
  let landId = 0;
  let query = baale('documents')
  .where('land_id', '=', '0')
  .select('*')
  .returning('*');
  console.log(`${query}`);
  return query.then((docs) => {
    sess.docs = docs;
    res.status(200).json({data: sess.docs, status: 'success'});
  })
  .catch((err) => {
    res.status(400).json({status: err.message});
  });
}

function getLands(req, res) {
  // console.log(`sess: ${JSON.stringify(sess)}`);
  if (!sess) {
    sess = req.session;
  }
  let query = baale('lands')
  .select('id','location','description','price','area','available','owner_id AS ownerId')
  .returning('id','location','description','price','area','available','ownerId');
  console.log(`${query}`);
  return query.then((lands) => {
    sess.lands = lands;
    res.status(200).json({data: sess.lands, status: 'success'});
  })
  .catch((err) => {
    res.status(400).json({status: err.message});
  });
}

function getLand(req, res) {
  console.log(`req.query ${JSON.stringify(req.query)}`);
  // console.log(`sess: ${JSON.stringify(sess)}`);
  if (!sess) {
    sess = req.session;
  }
  let id = req.query.id;
  let query = baale('lands')
  .where('id', '=', id)
  .select('id','location','description','price','area','available','owner_id AS ownerId')
  .returning('id','location','description','price','area','available','ownerId');
  console.log(`${query}`);
  return query.then((lands) => {
    sess.lands = lands;
    res.status(200).json({data: sess.lands, status: 'success'});
  })
  .catch((err) => {
    res.status(400).json({status: err.message});
  });
}

function createLand(req, res) {
  // console.log(`sess: ${JSON.stringify(sess)}`);
  // console.log(`body: ${JSON.stringify(req.body)}`);
  let location = req.body.location;
  let description = req.body.description;
  let area = req.body.area;
  let price = req.body.price;
  let avaialble = req.body.avaialble;
  let query =  baale('lands')
  .insert({
    locations: location,
    description: description,
    area: area,
    price: price,
    modified: 'now()',
    created: 'now()'
  }).returning('id');
  return query.then((id) => {
    sess.landId = id[0];
    return createGeo(req, res);
  }).catch((err) => {
    res.status(400).json({status: err.message});
  });
}

function updateLand(req, res) {
  // console.log(`sess: ${JSON.stringify(sess)}`);
  let landId = sess.landId;
  let landLocation = req.body.location;
  let landDescription = req.body.location;
  let landPrice = req.body.price;
  let landArea = req.body.area;
  let available = req.body.available;
  let query =  baale('lands')
  .where ('id', '=', landId)
  .update({
    location: landLocation,
    description: landDescription,
    price: landPrice,
    area: landArea,
    modified: 'now()'
  })
  .returning('id');
  return query.then((id) => {
    sess.landId = id;
    return updateGeo(req, res);
  }).catch((err) => {
    res.status(400).json({status: err.message});
  });
}

function getLand(req, res) {
  // console.log(`sess: ${JSON.stringify(sess)}`);
  let landId = req.body.landId;
  let query = baale('lands')
  .where ('id', '=', landId)
  .select('id','location','description','price','area','available')
  .returning('id','location','description','price','area','available');
  return query.then((lands) => {
    sess.land = lands[0];
    res.status(200).json({status: 'success'});
  })
  .catch((err) => {
    res.status(400).json({status: err.message});
  });
}

function createDocument(req, res) {
  // console.log(`sess: ${JSON.stringify(sess)}`);
  let image = req.body.docImage;
  let docRegNo = req.body.docRegNo;
  let status = 'verified';
  let docType = req.body.docType;
  let landId = req.body.landId;
  let issuerId = req.session.docIssuerId;
  let ownerId = req.session.docOwnerId;
  let query =  baale('transactions')
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
  return query.then((id) => {
    sess.docId = id;
  }).catch((err) => {
    res.status(400).json({status: err.message});
  });
}

function updateDocument(req, res) {
  // console.log(`sess: ${JSON.stringify(sess)}`);
  let docId = req.body.docId;
  let image = req.body.docImage;
  let docRegNo = req.body.docRegNo;
  let docStatus = req.body.docStatus;
  let docType = req.body.docType;
  let landId = req.body.landId;
  let issuerId = req.session.docIssuerId;
  let ownerId = req.session.docOwnerId;
  let query = baale('transactions')
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
  query.then((id) => {
    sess.docId = id;
  }).catch((err) => {
    res.status(400).json({status: err.message});
  });
}

function createIssuer(req, res) {
  // console.log(`sess: ${JSON.stringify(sess)}`);
  let issuerName = req.body.issuerName;
  let issuerType = req.body.issuerType;
  let issuerContactId = req.body.issuerContactId;
  let query = baale('issuers')
  .insert({
    name: issuerName,
    type: issuerType,
    cid: issuerContactId,
    modified: 'now()',
    created: 'now()'
  })
  .returning('id');
  return query.then((id) => {
    sess.issuerId = id;
  }).catch((err) => {
    res.status(400).json({status: err.message});
  });
}

function updateIssuer(req, res) {
  // console.log(`sess: ${JSON.stringify(sess)}`);
  let issuerId = sess.issuerId;
  let issuerName = req.body.issuerName;
  let issuerType = req.body.issuerType;
  let issuerContactId = req.body.issuerContactId;
  let query =  baale('issuers')
  .where('id', '=', issuerId)
  .update({
    name: issuerName,
    type: issuerType,
    cntct_id: issuerContactId,
    modified: 'now()'
  })
  .returning('id');
  query.then((id) => {
    sess.IssuerId = id;
  }).catch((err) => {
    res.status(400).json({status: err.message});
  });
}

function getIssuer(req, res) {
  // console.log(`sess: ${JSON.stringify(sess)}`);
  let issuerId = sess.issuerId;
  let query = baale('issuers')
  .where ('id', '=', issuerId)
  .select('id','name','type','contactid')
  .returning('id','name','type','contactid');
  return query.then((issuer) => {
    sess.issuer = issuer[0];
    res.status(200).json({status: 'success'});
  })
  .catch((err) => {
    res.status(400).json({status: err.message});
  });
}

function createGeo(req, res) {
  let query = baale('geo')
  .insert({
    lat: req.body.lat,
    lng: req.body.lng,
    land_id: req.body.landId,
    modified: 'now()',
    created: 'now()'
  })
  .returning('id');
  return query.then((id) => {
    sess.geoId = id[0];
    res.status(200).json({status: 'success'});
  }).catch((err) => {
    res.status(400).json({status: err.message});
  });
}

function updateGeo(req, res) {
  // console.log(`sess: ${JSON.stringify(sess)}`);
  let geoId = sess.geoId;
  let geoLat = req.body.lat;
  let geoLng = req.body.lng;
  let geoLandId = req.body.landId;
  let query = baale('geo')
  .where('id', '=', geoId)
  .update({
    lat: geoLat,
    lng: geoLng,
    land_id: geoLandId,
    modified: 'now()',
    created: 'now()'
  })
  .returning('id');
  return query.then((id) => {
    sess.geoId = id;
    res.status(200400).json({status: 'success'});
  }).catch((err) => {
    res.status(400).json({status: err.message});
  });
}

function getGeo(req, res) {
  // console.log(`sess: ${JSON.stringify(sess)}`);
  let landId = sess.landId;
  let query = baale('geo')
  .where ('land_id', '=', landId)
  .select('id','lat','lng','land_id')
  .returning('id','lat','lng','land_id');
  return query.then((lands) => {
    sess.land = lands[0];
    res.status(200).json({status: 'success'});
  })
  .catch((err) => {
    res.status(400).json({status: err.message});
  });
}

module.exports = {
  getLands,
  getLand,
  createLand,
  updateLand,
  createDocument,
  updateDocument,
  getDocuments,
  getGeo,
  createGeo,
  updateGeo,
  createIssuer,
  updateIssuer,
  getIssuer
};
