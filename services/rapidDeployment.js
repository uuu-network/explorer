
var solc = require('../libraries/solc-js')

var util = require('util')


// 必须要有 固定格式
module.exports = ($scope) => {
    web3 = $scope.web3
    
    return {
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
              console.log(_contractName + ': ' + output.contracts[fileName][_contractName].evm.bytecode.object)
              console.log(output.contracts[fileName][_contractName].abi)
          }
          cb(null, { 
            status: 'ok', 
            bytecode: output.contracts[fileName][contractName].evm.bytecode.object,
            abi: output.contracts[fileName][contractName].abi
          })
        }catch(e){
          cb({err: 1, msg: 'compile error: ' + e})
        }
        
      }
    }
}