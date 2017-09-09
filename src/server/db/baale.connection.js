const environment = process.env.NODE_ENV;
const config = require('../../../baale.db.js')[environment];

module.exports = require('knex')(config);
