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

function getEarnings(req, res) {
  if (!sess) {
    sess = req.session;
  }
  let query = baale('earnings')
  .select(
    '*'
  ).returning(['*']);
  // console.log(query.toString());
  return query.then((earnings) => {
    // console.log(`contact: ${JSON.stringify(cntctInfo)}`);
    sess.earnings = earnings;
    // console.log(`sess: ${JSON.stringify(sess)}`);
    res.status(200).json({data: sess.earnings, status: 'success'});
  }).catch((err) => {
    res.status(400).json({status: err.message});
  });
}

module.exports = {
  getEarnings
};
