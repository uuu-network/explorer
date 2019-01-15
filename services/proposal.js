const CONST = require('./const.js')
const db = require('../diskdb.js')

module.exports = ($scope) => {
  web3 = $scope.web3

  return {

    propose: function(query, cb, req){

      function  propose() {
        var rsContract = new web3.eth.Contract(proposalContractAbi, contractAddress)
            // console.log(rsContract)
        var startTime = parseInt(query.proposalStartTime)
        var duration  = parseInt(query.proposalDuration)
//        var cost = parseInt(query.proposalCost)
          
        var proposalHash = web3.utils.fromDecimal(query.proposalHash)
//        var hex = stringtohex
        rsContract.methods.propose(proposalHash, startTime, duration)
        .send({
            from: accobj.address,
            gas: 200000,
            gasPrice: query.usefreegas==='1' ? '0' : web3.eth.currentGasPrice,
            chainId: 5816,
            value: web3.utils.toWei(query.proposalCost, 'ether').toString()
        }, (err, value) => {
            if(err){
            return cb({err: 5, msg: err})
            }
            cb(null, { status: 'ok', trshash: value })
        })
      }  

      var accobj = CONST.checkLoginForApi(web3, req, cb)
      if( !accobj ) return
      try{
        propose();
      }catch(e){
        cb({err: 5, msg: 'propose error:' + e})
      }
    },

    vote: function(query, cb, req){

      function  vote() {
        var rsContract = new web3.eth.Contract(proposalContractAbi, contractAddress)
        // console.log(rsContract)
        var voteOption = parseInt(query.voteOption)
//        var proposalHash = web3.utils.fromDecimal(query.proposalHash)
        rsContract.methods.vote(query.proposalHash, voteOption)
        .send({
            from: accobj.address,
            gas: 200000,
            gasPrice: query.usefreegas==='1' ? '0' : web3.eth.currentGasPrice,
            chainId: 5816,
        }, (err, value) => {
            if(err){
            return cb({err: 5, msg: err})
            }
            cb(null, { status: 'ok', trshash: value })
        })
      }  

      var accobj = CONST.checkLoginForApi(web3, req, cb)
      if( !accobj ) return
      try{
        vote();
      }catch(e){
        cb({err: 5, msg: 'vote error:' + e})
      }
    },

    deposit: function(query, cb, req){
      function  deposit() {
//        var rsContract = new web3.eth.Contract(proposalContractAbi, contractAddress)
//        var _value = parseInt(query.value)
        web3.eth.sendTransaction({
          from: accobj.address,
          to:   contractAddress,
          gas:  200000,
          gasPrice: query.usefreegas==='1' ? '0' : web3.eth.currentGasPrice,
          value: web3.utils.toWei(query.value, 'ether'),
          chainId: 5816
        },(err, value) => {
            if(err){
            return cb({err: 5, msg: err})
            }
            cb(null, { status: 'ok', trshash: value })
        })
      }  

      var accobj = CONST.checkLoginForApi(web3, req, cb)
      if( !accobj ) return
      try{
        deposit();
      }catch(e){
        cb({err: 5, msg: 'deposit error:' + e})
      }
    },

    withdraw: function(query, cb, req){
      function  withdraw() {
        var rsContract = new web3.eth.Contract(proposalContractAbi, contractAddress)
//        var _value = parseInt(query.value)
        rsContract.methods.withdraw(web3.utils.toWei(query.value, 'ether'))
        .send({
            from: accobj.address,
            gas: 200000,
            gasPrice: query.usefreegas==='1' ? '0' : web3.eth.currentGasPrice,
            chainId: 5816,
        }, (err, value) => {
            if(err){
            return cb({err: 5, msg: err})
            }
            cb(null, { status: 'ok', trshash: value })
        })
      }  

      var accobj = CONST.checkLoginForApi(web3, req, cb)
      if( !accobj ) return
      try{
        withdraw();
      }catch(e){
        cb({err: 5, msg: 'withdraw error:' + e})
      }
    },

    voteResults: function(query, cb, req){
      function voteResults() {
        var rsContract = new web3.eth.Contract(proposalContractAbi, contractAddress)
//        var proposalHash = web3.utils.fromDecimal(query.proposalHash)
        rsContract.methods.results(query.proposalHash, query.voteOption)
        .call({
            chainId: 5816,
        }, (err, value) => {
            if(err){
            return cb({err: 5, msg: err})
            }
            cb(null, { status: 'ok', trshash: value })
        })
      }  

      var accobj = CONST.checkLoginForApi(web3, req, cb)
      if( !accobj ) return
      try{
        voteResults();
      }catch(e){
        cb({err: 5, msg: 'Call VoteResults error:' + e})
      }
    },
  }
}

// This var should be changed to a new address of your contract.
const contractAddress = '';

const proposalContractAbi = [{"constant":false,"inputs":[{"name":"_payment","type":"uint256"}],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_cost","type":"uint256"}],"name":"changeProposalCost","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_hash","type":"bytes"},{"name":"_vote","type":"uint8"}],"name":"results","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"voteCost","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_payee","type":"address"}],"name":"mortageInfo","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"renounceOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_duration","type":"uint256"}],"name":"changeMortage","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_cost","type":"uint256"}],"name":"changeVoteCost","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"isOwner","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"deposit","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"payee","type":"address"}],"name":"depositsOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"proposalCost","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_hash","type":"bytes"},{"name":"_startTime","type":"uint256"},{"name":"_duration","type":"uint256"}],"name":"propose","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"_hash","type":"bytes"},{"name":"_vote","type":"uint8"}],"name":"vote","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_proposalcostI","type":"uint256"},{"name":"_voteCostI","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_proposer","type":"address"},{"indexed":false,"name":"_hash","type":"bytes"},{"indexed":false,"name":"_startTime","type":"uint256"}],"name":"Proposed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_voter","type":"address"},{"indexed":false,"name":"_hash","type":"bytes"},{"indexed":false,"name":"_vote","type":"uint8"}],"name":"Voted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"payee","type":"address"},{"indexed":false,"name":"weiAmount","type":"uint256"}],"name":"Deposited","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"payee","type":"address"},{"indexed":false,"name":"weiAmount","type":"uint256"}],"name":"Withdrawn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"},{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"}]
