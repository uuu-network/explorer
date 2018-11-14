const CONST = require('./const.js')

const db = require('../diskdb.js')



module.exports = ($scope) => {
  web3 = $scope.web3

  return {

    transfer: function(query, cb, req){

      if (!query.contractAddress || !query.to || !query.amount) {
        return cb({err: 3, msg: 'query "contractAddress", "to" and "amount" is must'})
      }

      var accobj = CONST.checkLoginForApi(web3, req, cb)
      if( !accobj ) return

      try{
        var rsContract = new web3.eth.Contract(oneKeyTokenContractAbi, query.contractAddress)
        // console.log(rsContract)
        rsContract.methods.transfer(query.to, web3.utils.toWei(query.amount, 'ether'))
        .send({
          from: accobj.address,
          gas: 1500000,
          gasPrice: '0',
          chainId: 5816,
        }, (err, value) => {
          // console.log(err)
          // console.log(value)
          if(err){
            return cb({err: 5, msg: err})
          }
          cb(null, { status: 'ok', trshash: value })
        })
      }catch(e){
        cb({err: 5, msg: 'transfer error:' + e})
      }



    },

    getBalance: function(query, cb, req){

      if (!query.contractAddress) {
        return cb({err: 3, msg: 'query "contractAddress" is must'})
      }

      var accobj = CONST.checkLoginForApi(web3, req, cb)
      if( !accobj ) return
      async function promise(){
        try{
          var balance = await getTokenBalanceOf(web3, accobj.address, query.contractAddress)
          var tkobj = db.onekeytokenmines.findOne({contractAddress: query.contractAddress})
          var isminetk = tkobj.address === accobj.address
          if ( ! isminetk) {
            var mywlt = db.onekeytokenwallets.findOne({
              address: accobj.address,
              contractAddress: query.contractAddress,
            })
            if(!mywlt) {
              db.onekeytokenwallets.save({
                address: accobj.address,
                contractAddress: query.contractAddress,
                symbol: tkobj.symbol,
              })
            }
          }
          cb(null, {
            balance: balance,
            symbol: tkobj.symbol,
          })
        }catch(e){
          // console.log(e)
          cb({ err: 4, msg: 'not find token' })
        }
      }
      promise()
    },

    wallets: async function(query, cb, req){

      var accobj = CONST.checkLoginForApi(web3, req, cb)
      if( !accobj ) return

      async function promise(){
        var wallets = db.onekeytokenwallets.find({address: accobj.address});
        var results = await getTokensBalances(web3, wallets, accobj.address, (one) => {
          db.onekeytokenwallets.remove({address: accobj.address, contractAddress: one.contractAddress, });
        })
        cb(null, {datas: results})
      }
      promise()

    },

    mines: function(query, cb, req){

      var accobj = CONST.checkLoginForApi(web3, req, cb)
      if( !accobj ) return
      async function promise(){
        var mines = db.onekeytokenmines.find({address: accobj.address});
        var results = await getTokensBalances(web3, mines, accobj.address, (one) => {
          // db.onekeytokenmines.remove({address: accobj.address, contractAddress: one.contractAddress, });
          db.onekeytokenwallets.remove({address: accobj.address, contractAddress: one.contractAddress, });
        })

        if (mines) {
          cb(null, {datas: results})
        }else{
          cb({err: 4, msg: 'not find token'})
        }
      }
      promise()

    },

    generate: async function(query, cb, req){

      var accobj = CONST.checkLoginForApi(web3, req, cb)
      if( !accobj ) return

      if (!query.symbol || !query.name || !query.total) {
        return cb({err: 3, msg: ''})
      }
      if( ! /[A-Z]{1,12}/.test(query.symbol) ){
        return cb({err: 3, msg: 'symbol format error'})
      }
      if( query.name.length > 64 ){
        return cb({err: 3, msg: 'name is too long'})
      }
      if( query.description && query.description.length > 256 ){
        return cb({err: 3, msg: 'description is too long'})
      }
      if( ! /[0-9]{1,12}/.test(query.total) || query.total < 1 || query.total > 10000 * 100000000 ){
        return cb({err: 3, msg: 'name is too long'})
      }

      var rsContract = new web3.eth.Contract(oneKeyTokenContractAbi)

      rsContract.deploy({
        data: oneKeyTokenContractData,	//已0x开头
        arguments:[query.total, query.name, query.symbol, query.description||''],	//传递构造函数的参数
      })
      .send({
        from: accobj.address,
        gas: 1500000,
        gasPrice: '0',
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
        db.onekeytokenmines.save({
          address: accobj.address,
          symbol: query.symbol,
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

      

    }


  }


}




function getTokensBalances (web3, rows, address, errcb) {

  return new Promise(async (success, error) => {
    if(!rows || !rows.length){
      return success([])
    }
    const balances = []
    for (const i in rows) {
      var one = rows[i]
      try{
        var balance = await getTokenBalanceOf(web3, address, one.contractAddress)
        balances.push({'balance': balance, 'symbol': one.symbol, 'contractAddress': one.contractAddress, })
      }catch(e){
        errcb(one, e)
      }
    }
    // console.log(balances)
    success(balances)
  })
}





function getTokenBalanceOf (web3, address, contractAddress) {

  return new Promise( (success, error) => {

    try{
      var rsContract = new web3.eth.Contract(oneKeyTokenContractAbi, contractAddress)
      rsContract.methods.balanceOf(address).call({
        gas: 1500000,
        gasPrice: '0',
        chainId: 5816,
      }, (err, value) => {
        // console.log(err)
        // console.log(value)
        if(err){
          return success(err)
        }
        success(value ? web3.utils.fromWei(value, 'ether') : 0)
      })
    }catch(e){
      // console.log(e)
      success(null)
    }

  });

}






const oneKeyTokenContractAbi = [
	{
		"constant": true,
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"name": "",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_spender",
				"type": "address"
			},
			{
				"name": "_value",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [
			{
				"name": "success",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "totalSupply",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_from",
				"type": "address"
			},
			{
				"name": "_to",
				"type": "address"
			},
			{
				"name": "_value",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [
			{
				"name": "success",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "decimals",
		"outputs": [
			{
				"name": "",
				"type": "uint8"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_value",
				"type": "uint256"
			}
		],
		"name": "burn",
		"outputs": [
			{
				"name": "success",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "description",
		"outputs": [
			{
				"name": "",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_from",
				"type": "address"
			},
			{
				"name": "_value",
				"type": "uint256"
			}
		],
		"name": "burnFrom",
		"outputs": [
			{
				"name": "success",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"name": "",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_owner",
				"type": "address"
			}
		],
		"name": "changeOwner",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_to",
				"type": "address"
			},
			{
				"name": "_value",
				"type": "uint256"
			}
		],
		"name": "transfer",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "address"
			},
			{
				"name": "",
				"type": "address"
			}
		],
		"name": "allowance",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"name": "_totalSupply",
				"type": "uint256"
			},
			{
				"name": "_name",
				"type": "string"
			},
			{
				"name": "_symbol",
				"type": "string"
			},
			{
				"name": "_description",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "from",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Burn",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "ChangeOwner",
		"type": "event"
	}
]




const oneKeyTokenContractData = "0x60806040526012600360006101000a81548160ff021916908360ff1602179055503480156200002d57600080fd5b50604051620014253803806200142583398101806040528101908080519060200190929190805182019291906020018051820192919060200180518201929190505050336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550600360009054906101000a900460ff1660ff16600a0a8402600481905550600454600660003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555082600190805190602001906200012c92919062000169565b5081600290805190602001906200014592919062000169565b5080600590805190602001906200015e92919062000169565b505050505062000218565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10620001ac57805160ff1916838001178555620001dd565b82800160010185558215620001dd579182015b82811115620001dc578251825591602001919060010190620001bf565b5b509050620001ec9190620001f0565b5090565b6200021591905b8082111562000211576000816000905550600101620001f7565b5090565b90565b6111fd80620002286000396000f3006080604052600436106100d0576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806306fdde03146100d5578063095ea7b31461016557806318160ddd146101ca57806323b872dd146101f5578063313ce5671461027a57806342966c68146102ab57806370a08231146102f05780637284e4161461034757806379cc6790146103d75780638da5cb5b1461043c57806395d89b4114610493578063a6f9dae114610523578063a9059cbb14610566578063dd62ed3e146105b3575b600080fd5b3480156100e157600080fd5b506100ea61062a565b6040518080602001828103825283818151815260200191508051906020019080838360005b8381101561012a57808201518184015260208101905061010f565b50505050905090810190601f1680156101575780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b34801561017157600080fd5b506101b0600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291905050506106c8565b604051808215151515815260200191505060405180910390f35b3480156101d657600080fd5b506101df610755565b6040518082815260200191505060405180910390f35b34801561020157600080fd5b50610260600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff1690602001909291908035906020019092919050505061075b565b604051808215151515815260200191505060405180910390f35b34801561028657600080fd5b5061028f610888565b604051808260ff1660ff16815260200191505060405180910390f35b3480156102b757600080fd5b506102d66004803603810190808035906020019092919050505061089b565b604051808215151515815260200191505060405180910390f35b3480156102fc57600080fd5b50610331600480360381019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919050505061099f565b6040518082815260200191505060405180910390f35b34801561035357600080fd5b5061035c6109b7565b6040518080602001828103825283818151815260200191508051906020019080838360005b8381101561039c578082015181840152602081019050610381565b50505050905090810190601f1680156103c95780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b3480156103e357600080fd5b50610422600480360381019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610a55565b604051808215151515815260200191505060405180910390f35b34801561044857600080fd5b50610451610c6f565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b34801561049f57600080fd5b506104a8610c94565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156104e85780820151818401526020810190506104cd565b50505050905090810190601f1680156105155780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b34801561052f57600080fd5b50610564600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610d32565b005b34801561057257600080fd5b506105b1600480360381019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610e87565b005b3480156105bf57600080fd5b50610614600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610e96565b6040518082815260200191505060405180910390f35b60018054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156106c05780601f10610695576101008083540402835291602001916106c0565b820191906000526020600020905b8154815290600101906020018083116106a357829003601f168201915b505050505081565b600081600760003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055506001905092915050565b60045481565b6000600760008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205482111515156107e857600080fd5b81600760008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254039250508190555061087d848484610ebb565b600190509392505050565b600360009054906101000a900460ff1681565b600081600660003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054101515156108eb57600080fd5b81600660003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282540392505081905550816004600082825403925050819055503373ffffffffffffffffffffffffffffffffffffffff167fcc16f5dbb4873280815c1ee09dbd06736cffcc184412cf7a71a0fdb75d397ca5836040518082815260200191505060405180910390a260019050919050565b60066020528060005260406000206000915090505481565b60058054600181600116156101000203166002900480601f016020809104026020016040519081016040528092919081815260200182805460018160011615610100020316600290048015610a4d5780601f10610a2257610100808354040283529160200191610a4d565b820191906000526020600020905b815481529060010190602001808311610a3057829003601f168201915b505050505081565b600081600660008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205410151515610aa557600080fd5b600760008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020548211151515610b3057600080fd5b81600660008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254039250508190555081600760008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282540392505081905550816004600082825403925050819055508273ffffffffffffffffffffffffffffffffffffffff167fcc16f5dbb4873280815c1ee09dbd06736cffcc184412cf7a71a0fdb75d397ca5836040518082815260200191505060405180910390a26001905092915050565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60028054600181600116156101000203166002900480601f016020809104026020016040519081016040528092919081815260200182805460018160011615610100020316600290048015610d2a5780601f10610cff57610100808354040283529160200191610d2a565b820191906000526020600020905b815481529060010190602001808311610d0d57829003601f168201915b505050505081565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16141515610d8d57600080fd5b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1614151515610dc957600080fd5b806000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508073ffffffffffffffffffffffffffffffffffffffff166000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff167f9aecf86140d81442289f667eb72e1202a8fbb3478a686659952e145e8531965660405160405180910390a350565b610e92338383610ebb565b5050565b6007602052816000526040600020602052806000526040600020600091509150505481565b6000808373ffffffffffffffffffffffffffffffffffffffff1614151515610ee257600080fd5b81600660008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205410151515610f3057600080fd5b600660008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205482600660008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205401111515610fbe57600080fd5b600660008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054600660008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205401905081600660008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254039250508190555081600660008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825401925050819055508273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef846040518082815260200191505060405180910390a380600660008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054600660008773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054011415156111cb57fe5b505050505600a165627a7a723058208213659bfa9b2c6a94f5301548fe3cf83daadd054de9ac4ca6752fc6e57abe7d0029"