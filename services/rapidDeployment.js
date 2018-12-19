
var solc = require('../libraries/solc')

var util = require('util')


// 必须要有 固定格式
module.exports = ($scope) => {
    web3 = $scope.web3
    
    return {


      // rapiddeploycontractlogs


      deploy: function(query, cb, req) {

        var accobj = CONST.checkLoginForApi(web3, req, cb)
        if( !accobj ) return


        var rsContract = new web3.eth.Contract(oneKeyTokenContractAbi)

        rsContract.deploy({
          data: oneKeyTokenContractData,	//已0x开头
          arguments:[query.total, query.name, query.symbol, query.description||''],	//传递构造函数的参数
        })
        .send({
          from: accobj.address,
          gas: 1442955,
          gasPrice: query.usefreegas==='1' ? '0' : web3.eth.currentGasPrice,
          chainId: 5816,
        }, function(error, transactionHash){ 
          // console.log('error:')
          // console.log(error)
          // console.log('transactionHash:')
          // console.log(transactionHash)
        })
        .on('error', function(error){ 
          console.log('error:')
          console.log(error)
        })
        .on('transactionHash', function(transactionHash){ 
          // console.log('transactionHash', transactionHash)
        })
        .on('receipt', function(receipt){
          // console.log('receipt', receipt.contractAddress) // contains the new contract address
          db.rapiddeploycontractlogs.save({
            address: accobj.address,
            // symbol: query.symbol,
            // blockHash: receipt.blockHash,
            // blockNumber: receipt.blockNumber,
            contractAddress: receipt.contractAddress,
          })
        })
        // .on('confirmation', function(confirmationNumber, receipt){ 
        //   // console.log('confirmation:')
        //   // console.log(confirmationNumber)
        //   // console.log(receipt)
        // })
        .then(function(newContractInstance){
          // console.log('newContractInstance:')
          // console.log(newContractInstance)
          // console.log(newContractInstance.options.address) // instance with the new contract address
        });
        
        // console.log(result)
  
        cb(null, {
          status: 'ok'
        })
  
        
  

      },


      compile: function(query, cb, req) {
        var fileName = query.fileName
        var contractName = query.contractName
        var sources = {}
        sources[fileName] = {
          content: query.sourceCode
        }
        var input = {
            'language': 'Solidity',
            sources, 
            settings: {
              outputSelection: {
                '*': {
                  '*': [ '*' ]
                }
              }
            }
        }
/*
        var output = JSON.parse(solc.compile(JSON.stringify(input)))

        // `output` here contains the JSON output as specified in the documentation
        for (var contractName in output.contracts['test.sol']) {
            console.log(contractName + ': ' + output.contracts['test.sol'][contractName].evm.bytecode.object)
            console.log(output.contracts['test.sol'][contractName].abi)
        }
*/

        try {
          var output = JSON.parse(solc.compile(JSON.stringify(input)))

          // `output` here contains the JSON output as specified in the documentation
          for (var _contractName in output.contracts[fileName]) {
              // console.log(_contractName + ': ' + output.contracts[fileName][_contractName].evm.bytecode.object)
              // console.log(output.contracts[fileName][_contractName].abi)
          }
          cb(null, { 
            status: 'ok', 
            bytecode: output.contracts[fileName][contractName].evm.bytecode.object,
            abi: JSON.stringify(output.contracts[fileName][contractName].abi)
          })
        }catch(e){
          cb({err: 1, msg: 'compile error: ' + e})
        }
        
      }
    }
}