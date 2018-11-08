
const CONST = require('./const.js')


module.exports = ($scope) => {

  web3 = $scope.web3

  return {

    sendCoin: async function(query, cb, req){

      if (!query.to || !query.amount) {
        return cb({err: 2, msg: "to, amount is required"});
      }
      var address = CONST.checkLogin(req)
      if(!address){
        return cb({err: 1, msg: 'you must login first'});
      }
      var accobj = web3.eth.accounts.wallet[address]
      if(!accobj){
        return cb({err: 1, msg: 'you must login first'});
      }
      // sand
      /*console.log(address)
      console.log(query.to)
      console.log(query.amount)*/
      /*var txraw = await accobj.signTransaction({
        from: address,
        to: query.to,
        value: query.amount,
        gas: 500000,
        chainId: 5816,
      })
      // web3.eth.net.getId().then(console.log);
      console.log(txraw)*/

      // web3.eth.sendSignedTransaction(txraw.rawTransaction, 
      web3.eth.sendTransaction({
        from: address,
        to: query.to,
        value: query.amount,
        gas: 500000,
        gasPrice: 0,
        chainId: 5816,
      },
      function(err, result){
          if(err) {
            // console.log(err)
            return cb({err: 2, msg: err})
          }
          // console.log("#" + result + "#")
          cb(null, result)
      })
    
    }

  }

}