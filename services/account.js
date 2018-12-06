
const mkdirp = require("mkdirp");
const fs = require("fs");








module.exports = ($scope) => {
  web3 = $scope.web3


  return {
    balance: function(query, cb){
      if (query.address == null) {
        return cb("Address is required");
      }

      function datacall(err, data){
        if (err != null) {
          return cb(err);
        }
        return cb(null, data.toString());
      }

      return web3.eth.getBalance(query.address, datacall);
    },

    create: function(query, cb){
      if (!query.password) {
        return cb("Password is required");
      }
      if (query.password.length < 8) {
        return cb("Password at least 8 characters");
      }
      accobj = web3.eth.accounts.create()
      storeobj = web3.eth.accounts.encrypt(accobj.privateKey, query.password)
        // console.log(accobj)
        // console.log(storeobj)
        // write key store file
        const d = new Date()
        const dts = d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()
        const filepath = 'keystores/'+dts
        const file = filepath + '/UTC-' + dts + '.' + storeobj.address + '.unetwork.wallet.keystore'
        mkdirp('app/'+filepath, function (err) {
          // console.log(err)
          if(err) return cb(err)
          fs.writeFile('app/'+file, JSON.stringify(storeobj), function(err){
            // console.log(err)
            if(err) return cb(err)
            // return
            cb(null, {
              address: accobj.address,
              privateKey: accobj.privateKey,
              keystoreDownloadUrl: '/' + file,
            })
          })
        })
    },



  }
}


