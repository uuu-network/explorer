var db = require('diskdb');

db.connect('./diskdb')
  .loadCollections([
    'onekeytokenmines',
    'onekeytokenwallets',
  ]);


module.exports = db;

