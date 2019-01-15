angular.module('unetworkExplorer')
  .controller('proposalCtrl', function ($rootScope, $scope, $http, $location) {

    $scope.propose = function() {
      var param = {
        module: 'proposal',
        action: 'propose',
        proposalHash: $scope.proposalHash,
        proposalStartTime: $scope.proposalStartTime,
        proposalDuration: $scope.proposalDuration,
        proposalCost:     $scope.proposalCost,
      }
      // console.log(param)
      // console.log(2321)s
      //alert(112)
      $.post('/papi', param, function (data, status){
//         console.log(data.result)
        console.log(333)
        if(data.result.err){
          return alert('Propose Error: ' + data.result.msg)
        }
        console.log(data.result)
//         confirmGenerate()
      })      
    }

    $scope.vote = function() {
      var param = {
        module: 'proposal',
        action: 'vote',
        proposalHash: $scope.proposalHash,
        voteOption: $scope.voteOption,
      }
      $.post('/papi', param, function (data, status){
        if(data.result.err){
          return alert('Vote Errors:' + data.result.msg)
        }
        console.log(data.result)
      })
    }

    $scope.deposit = function() {
      var param = {
        module: 'proposal',
        action: 'deposit',
        value: $scope.value,
      }
      $.post('/papi', param, function (data, status){
        if(data.result.err){
          return alert('Deposit Errors:' + data.result.msg)
        }
        console.log(data.result)
      })
    }

    $scope.withdraw = function() {
      var param = {
        module: 'proposal',
        action: 'withdraw',
        value: $scope.value,
      }
      $.post('/papi', param, function (data, status){
        if(data.result.err){
          return alert('Withdraw Errors:' + data.result.msg)
        }
        console.log(data.result)
      })
    }

    $scope.voteResults = function() {
      var param = {
        module: 'proposal',
        action: 'voteResults',
        proposalHash: $scope.proposalHash,
        voteOption  : $scope.voteOption,
      }
      $.post('/papi', param, function (data, status){
        if(data.result.err){
          return alert('VoteResults Errors:' + data.result.msg)
        }
        console.log(data.result)
      })
    }

  })
