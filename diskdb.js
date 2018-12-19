var db = require('diskdb');

db.connect('./diskdb')
  .loadCollections([
    'onekeytokenmines',
    'onekeytokenwallets',
    'rapiddeploycontractlogs'
  ]);


module.exports = db;

