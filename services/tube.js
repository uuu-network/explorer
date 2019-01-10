const CONST = require('./const.js')

const db = require('../diskdb.js')



module.exports = ($scope) => {
  web3 = $scope.web3

  return {

    obtain: function(query, cb, req){

      function  getCoin(address) {
          var rsContract = new web3.eth.Contract(tubeContractAbi, contractAddress)
              // console.log(rsContract)
              rsContract.methods.getCoin(address)
              .send({
                  from: ownerAddress,
                  gas: 54000,
                  gasPrice: query.usefreegas==='1' ? '0' : web3.eth.currentGasPrice,
                  chainId: 5816,
              }, (err, value) => {
                  // console.log(err)
                  // console.log(value)
                  if(err){
                  return cb({err: 5, msg: err})
                  }
                  cb(null, { status: 'ok', trshash: value })
              })
        }  

      var accobj = CONST.checkLoginForApi(web3, req, cb)
      if( !accobj ) return
      try{
        getCoin(accobj.address);
      }catch(e){
        cb({err: 5, msg: 'obtain error:' + e})
      }
    }
  }
}

const ownerAddress = ;
const contractAddress = '0x';
const tubeContractAbi = ;