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

function getTransactions(req, res) {
  if (!sess) {
    sess = req.session;
  }
  let query = baale('transactions')
  .select(
    '*'
  ).returning(['*']);
  // console.log(query.toString());
  return query.then((transactions) => {
    // console.log(`contact: ${JSON.stringify(cntctInfo)}`);
    sess.transactions = transactions;
    // console.log(`sess: ${JSON.stringify(sess)}`);
    res.status(200).json({data: sess.transactions, status: 'success'});
  }).catch((err) => {
    res.status(400).json({status: err.message});
  });
}

function createTransactions(req, res) {
  let transaction = req.body;
  console.log(`req.body: ${JSON.stringify(transaction)}`);
  if (!sess) {
    sess = req.session;
  }
  let query = baale('transactions')
  .insert (
    {land_id: transaction.landId,
    user_id: sess.passport.user,
    type: transaction.type,
    amount: transaction.total,
    qty: transaction.quantity,
    available: transaction.available,
    location: transaction.location,
    area: transaction.area,
    status: 0,
    price: transaction.price,
    created: 'now()',
    modified: 'now()'})
  .returning(['id']);
  console.log(query.toString());
  return query.then((transactions) => {
    // console.log(`contact: ${JSON.stringify(cntctInfo)}`);
    sess.transactionId = transactions[0];
    // console.log(`sess: ${JSON.stringify(sess)}`);
    res.status(200).json({data: sess.transactionId, statusText: 'success'});
  }).catch((err) => {
    res.status(400).json({status: err.message});
  });
}

module.exports = {
  getTransactions,
  createTransactions
};
