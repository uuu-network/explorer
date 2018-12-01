
const cookie = require('cookie')
const fs = require('fs')

const CONST = require('./const.js')




module.exports = ($scope) => {

  web3 = $scope.web3

  function holdToWallet(accobj, req, res) {
    // login
    web3.eth.accounts.wallet.add(accobj.privateKey)
    const expires = 60 * 10 // seconds
    // set cookie
    res.setHeader('Set-Cookie', cookie.serialize(
      CONST.walletPublicKeyCryptCookieName, 
      CONST.encryptWalletAddressCookie(accobj.address),
      {
        httpOnly: true,
        maxAge: expires,
      },
    ));
    // time to logout
    // console.log(web3.eth.accounts.wallet)
    setTimeout(()=>{
      web3.eth.accounts.wallet.remove( accobj.address )
      // console.log('logout: ' + accobj.address)
      // console.log(web3.eth.accounts.wallet)
    }, 1000 * expires)
  }

  function readerLogin(accobj, req, res, cb) {
    holdToWallet(accobj, req, res)
    web3.eth.getBalance(accobj.address, function(err, data){
      if (err != null) {
        return cb(err);
      }
      // console.log(data)
      // ok
      cb(null, {
        address: accobj.address,
        balance: data,
      })
    });
  }


  return {

    logout: function(query, cb, req, res){
      var address = CONST.checkLogin(req)
      if(!address){
        return cb();
      }
      // exit
      web3.eth.accounts.wallet.remove( address )
      return cb(null, {});
    },

    checkLogin: function(query, cb, req, res){
      var address = CONST.checkLogin(req)
      if(!address || !web3.eth.accounts.wallet[address]){
        return cb({err: 1, msg: 'you must login first'});
      }
      web3.eth.getBalance(address, function(err, data){
        if (err != null) {
          return cb(err);
        }
        // console.log(data)
        // ok
        cb(null, {
          address: address,
          balance: data,
        })
      });
    },

    loginByPrivateKey: function(query, cb, req, res){
      if (!query.privateKey) {
        return cb("privateKey is required");
      }
      const accobj = web3.eth.accounts.privateKeyToAccount(query.privateKey)
      readerLogin(accobj, req, res, cb)
    },

    loginByKeystore: function(query, cb, req, res){
      if (!query.files) {
        return cb({err: 2, msg: 'Keystore file upload fail'})
      }
      var fileobj = query.files.keystore
      if (!fileobj) {
        return cb({err: 2, msg: 'Keystore file upload fail'})
      }
      // read file
      fs.readFile(fileobj.path, function(err, con){
        if(err){
          return cb({err: 2, msg: 'Keystore file upload fail'})
        }
        var keyobj
        try{
          keyobj = JSON.parse(con)
        }catch(e){
          return cb({err: 2, msg: 'Keystore file format error'})
        }
        var accobj
        try{
          accobj = web3.eth.accounts.decrypt(keyobj, query.password)
        }catch(e){
          return cb({err: 2, msg: 'Key derivation failed - possibly wrong password'})
        }
        // console.log(accobj)
        readerLogin(accobj, req, res, cb)
      })


    }

  }

}