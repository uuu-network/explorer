const solc = require('../libraries/solc');

const util = require('util');


const db = require('../diskdb.js')

const CONST = require('./const.js')


// 必须要有 固定格式
module.exports = ($scope) => {
  web3 = $scope.web3

  return {


    // rapiddeploycontractlogs


    logs: function (query, cb, req) {

      const accobj = CONST.checkLoginForApi(web3, req, cb);
      if (!accobj) return

      const logs = db.rapiddeploycontractlogs.find({address: accobj.address});

      const datas = [];
      if (logs && logs.length) {
        let one = logs.pop();
        while (one) {
          datas.push(one)
          one = logs.pop()
        }
      }

      cb(null, {datas})

    },


    deploy: function (query, cb, req) {

      const accobj = CONST.checkLoginForApi(web3, req, cb);
      if (!accobj) return

      let ABI = [];
      let argumentary = [];
      try {
        ABI = JSON.parse(query.contractAbi)
        argumentary = JSON.parse(query.contractArguments)
      } catch (e) {
        return cb({err: 1, msg: 'deploy error: contractAbi or arguments format error'})
      }
      // console.log(query)

      let trsHash = '';

      const rsContract = new web3.eth.Contract(ABI);

      rsContract.deploy({
        data: query.contractByteCode,	//已0x开头
        arguments: argumentary,	//传递构造函数的参数
      })
        .send({
          from: accobj.address,
          gas: parseInt(query.gasLimit),
          gasPrice: query.usefreegas === '1' ? '0' : web3.eth.currentGasPrice,
          chainId: 5816,
        }, function (error, transactionHash) {
          // console.log('error:')
          // console.log(error)
          // console.log('transactionHash:')
          // console.log(transactionHash)
          if (error) {
            return cb({err: 1, msg: error})
          }
          trsHash = transactionHash

          cb(null, {
            status: 'ok',
            transactionHash,
          })

        })
        .on('error', function (error) {
          // console.log('error:')
          // console.log(error)
        })
        .on('transactionHash', function (transactionHash) {
          // console.log('transactionHash', transactionHash)
        })
        .on('receipt', function (receipt) {
          // console.log('receipt', receipt.contractAddress) // contains the new contract address
          db.rapiddeploycontractlogs.save({
            address: accobj.address,
            name: query.contractName,
            // blockHash: receipt.blockHash,
            // blockNumber: receipt.blockNumber,
            contractAddress: receipt.contractAddress,
            transactionHash: trsHash,
          })
        })
        // .on('confirmation', function(confirmationNumber, receipt){
        //   // console.log('confirmation:')
        //   // console.log(confirmationNumber)
        //   // console.log(receipt)
        // })
        .then(function (newContractInstance) {
          // console.log('newContractInstance:')
          // console.log(newContractInstance)
          // console.log(newContractInstance.options.address) // instance with the new contract address
        });

      // console.log(result)


    },


    compile: function (query, cb, req) {
      const fileName = query.fileName;
      const contractName = query.contractName;
      const sources = {};
      sources[fileName] = {
        content: query.sourceCode
      }
      const input = {
        'language': 'Solidity',
        sources,
        settings: {
          outputSelection: {
            '*': {
              '*': ['*']
            }
          }
        }
      };
      /*
              var output = JSON.parse(solc.compile(JSON.stringify(input)))

              // `output` here contains the JSON output as specified in the documentation
              for (var contractName in output.contracts['test.sol']) {
                  console.log(contractName + ': ' + output.contracts['test.sol'][contractName].evm.bytecode.object)
                  console.log(output.contracts['test.sol'][contractName].abi)
              }
      */

      try {
        const output = JSON.parse(solc.compile(JSON.stringify(input)));

        // `output` here contains the JSON output as specified in the documentation
        for (const _contractName in output.contracts[fileName]) {
          // console.log(_contractName + ': ' + output.contracts[fileName][_contractName].evm.bytecode.object)
          // console.log(output.contracts[fileName][_contractName].abi)
        }
        cb(null, {
          status: 'ok',
          bytecode: output.contracts[fileName][contractName].evm.bytecode.object,
          abi: JSON.stringify(output.contracts[fileName][contractName].abi)
        })
      } catch (e) {
        cb({err: 1, msg: 'compile error: ' + e})
      }

    }
  }
}
