
const CONST = require('./const.js')


module.exports = ($scope) => {

  web3 = $scope.web3

  return {

    // recordWords 内容上链
    sendCoin: async function(query, cb, req){

      if (!query.to || !query.amount) {
        if( ! query.recordWords && !query.recordIPFSAddress ){
          return cb({err: 2, msg: "to, amount is required"});
        }
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

      var inputData
      , appendGas = 0
      query.input = query.recordWords || query.recordIPFSAddress || query.input
      if(query.input){
        inputData = '0x' + new Buffer(query.input).toString('hex')
        var len = inputData.length
        , segnum = parseInt(len / 1000) + 1
        appendGas = 150 + segnum*102222
        if(query.recordWords){
          query.amount = web3.utils.toWei(segnum+'')
          query.to = '0xe739367D6088890F6705386EB93682075723Cd79';
        }else if(query.recordIPFSAddress){
          query.amount = web3.utils.toWei(segnum+'')
          query.to = '0xe739367D6088890F6705386EB93682075723Cd79';
        }
      }

      // console.log(query)
      // console.log(inputData)

      // var ddd = new Buffer("1234567890----------1234567890----------1234567890----------1234567890----------1234567890----------1234567890----------1234567890----------1234567890----------1234567890----------1234567890----------", 'base64').toString('hex')
      // var d5 = ddd + ddd + ddd + ddd + ddd
      // var d10 = d5 + d5

      // var buf = new Buffer('1234567890abcdefg杨捷')
      // , hex = buf.toString('hex')
      // , bytes = ''
      // for(var i=0; i<hex.length; i+=2){
      //   bytes += parseInt(hex.substr(i, 2), 16)+','
      // }
      // console.log(buf)
      // console.log(hex)
      // console.log(bytes)

      try {
        // web3.eth.sendSignedTransaction(txraw.rawTransaction, 

        console.log(web3.eth.currentGasPrice)

        web3.eth.sendTransaction({
          from: address,
          to: query.to,
          value: query.amount,
          gas: 21100 + appendGas,
          gasPrice: query.usefreegas==='1' ? '0' : web3.eth.currentGasPrice,
          chainId: 5816,
          input: inputData,
        },
        function(err, result){
            if(err) {
              // console.log(err)
              return cb({err: 2, msg: err.toString()})
            }
            // console.log("#" + result + "#")
            // console.log(result)
            cb(null, {
              trshash: result
            })
        })
        
      } catch (error) {
        return cb({err: 2, msg: error.toString()})
      }

    
    }

  }

}