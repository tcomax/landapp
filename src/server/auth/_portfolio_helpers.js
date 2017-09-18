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

function getPortfolios(req, res) {
  if (!sess) {
    sess = req.session;
  }
  let query = baale('portfolio')
  .select(
    '*'
  ).returning(['*']);
  // console.log(query.toString());
  return query.then((portfolio) => {
    // console.log(`contact: ${JSON.stringify(cntctInfo)}`);
    sess.portfolio = portfolio;
    // console.log(`sess: ${JSON.stringify(sess)}`);
    res.status(200).json({data: sess.portfolio, status: 'success'});
  }).catch((err) => {
    res.status(400).json({status: err.message});
  });
}

module.exports = {
  getPortfolios
};
