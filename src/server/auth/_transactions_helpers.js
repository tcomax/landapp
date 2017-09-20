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

function getPortfolio(req, res) {
  if (!sess) {
    sess = req.session;
  }
  // res.status(200).json({data: 'portfolio', status: 'success'});
  let query = baale('transactions')
  .groupBy('land_id','location', 'user_id')
  .having('user_id','=', 35)
  .orderBy('location','asc')
  .sum('qty AS quantity')
  .sum('amount AS total')
  .select('land_id','location')
  .where('status','=',0)
  .returning(['quatity','value','land_id','location']);
  console.log(`portfolio query: ${query.toString()}`);
  return query.then((portfolio) => {
    // console.log(`portfolio: ${JSON.stringify(portfolio)}`);
    sess.portfolio = portfolio;
    // console.log(`sess: ${JSON.stringify(sess)}`);
    res.status(200).json({data: sess.portfolio, status: 'success'});
  }).catch((err) => {
    res.status(400).json({status: err.message});
  });
}

function getTransactions(req, res) {
  if (!sess) {
    sess = req.session;
  }
  let query = baale('transactions')
  .orderBy('created','desc')
  .select(
    '*'
  ).returning(['*']);
  console.log(query.toString());
  return query.then((transactions) => {
    // console.log(`transaction: ${JSON.stringify(transactions)}`);
    sess.transactions = transactions;
    // console.log(`sess: ${JSON.stringify(sess)}`);
    res.status(200).json({data: sess.transactions, status: 'success'});
  }).catch((err) => {
    res.status(400).json({status: err.message});
  });
}

function createTransactions(req, res) {
  getInviter();
  getCommissionRate();
  getBuyer();
  let transaction = req.body;
  console.log(`req.body: ${JSON.stringify(req.body)}`);
  console.log(`createTransactions sess.passport: ${JSON.stringify(sess.passport)}`);
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
  .returning(['*']);
  console.log(query.toString());
  return query.then((transactions) => {
    // console.log(`contact: ${JSON.stringify(cntctInfo)}`);
    sess.trxn = transactions[0];
    createCommission();
    // console.log(`sess: ${JSON.stringify(sess)}`);
    res.status(200).json({data: sess.trxn, statusText: 'success'});
  }).catch((err) => {
    res.status(400).json({status: err.message});
  });
}

function getCommissionRate() {
  // res.status(200).json({data: 'portfolio', status: 'success'});
  let query = baale('system')
  .select('commission_rate')
  .returning(['commission_rate']);
  console.log(`commission_rate query: ${query.toString()}`);
  return query.then((system) => {
    sess.commission_rate = system[0].commission_rate;
    console.log(`sess.commission_rate: ${JSON.stringify(sess.commission_rate)}`);
    console.log(`sess: ${JSON.stringify(sess)}`);
  });
}

function getBuyer() {
  // res.status(200).json({data: 'portfolio', status: 'success'});
  let query = baale('user_info')
  .returning(['inviterId'])
  .select('user_info.id','contacts.name')
  .join('contacts', function () {
    this.on('contacts.id','=','user_info.cntct_id');})
  .where('user_info.id','=',sess.passport.user);
  console.log(`buyer query: ${query.toString()}`);
  return query.then((buyer) => {
    sess.buyer = buyer[0];
    console.log(`buyer: ${JSON.stringify(sess.buyer)}`);
    // console.log(`sess: ${JSON.stringify(sess)}`);
  });
}

function getInviter() {
  // res.status(200).json({data: 'portfolio', status: 'success'});
  let subquery = baale('user_info')
  .select('invited_by')
  .where('id','=', sess.passport.user);
  let query = baale('user_info')
  .returning(['inviterId'])
  .select('user_info.id','contacts.name')
  .join('contacts', function () {
    this.on('contacts.id','=','user_info.cntct_id');})
  .where('phone','in',subquery);
  console.log(`inviterId query: ${query.toString()}`);
  return query.then((inviter) => {
    sess.inviter = inviter[0];
    console.log(`inviter: ${JSON.stringify(sess.inviter)}`);
    // console.log(`sess: ${JSON.stringify(sess)}`);
  });
}

function getEarnings() {
  // res.status(200).json({data: 'portfolio', status: 'success'});
  let query = baale('earnings')
  .select('*')
  .where('user_id','=',sess.passport.user)
  .returning(['*']);
  console.log(`earnings query: ${query.toString()}`);
  return query.then((earnings) => {
    console.log(`earnings: ${JSON.stringify(earnings)}`);
    sess.earnings = earnings[0];
    // console.log(`sess: ${JSON.stringify(sess)}`);
  });
}

function createCommission() {
  console.log(`--------------------------------------- createCommission -------------------------------------------------`);
  console.log(`createCommission sess.commission_rate: ${JSON.stringify(sess.commission_rate)}`);
  console.log(`createCommission sess.inviter: ${JSON.stringify(sess.inviter)}`);
  if (sess.commission_rate && sess.inviter) {
    let query = baale('earnings')
    .insert (
      {trxn_id: sess.trxn.id,
      amount: sess.trxn.amount,
      location: sess.trxn.location,
      type: 0,
      rate: sess.commission_rate,
      user_id: sess.inviter.id,
      buyer: sess.buyer.name,
      buyer_id: sess.passport.user,
      status: 0,
      commission: (sess.trxn.amount * sess.commission_rate),
      created: 'now()',
      modified: 'now()'})
    .returning(['id']);
    console.log(query.toString());
    return query.then((id) => {
      // console.log(`contact: ${JSON.stringify(cntctInfo)}`);
      sess.comm_id = id[0];
      // console.log(`sess: ${JSON.stringify(sess)}`);
    });
  }
}

module.exports = {
  getTransactions,
  createTransactions,
  getPortfolio,
  createCommission
};
