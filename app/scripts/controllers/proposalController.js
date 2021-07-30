angular.module('unetworkExplorer')
  .controller('proposalCtrl', function ($rootScope, $scope, $http, $location) {

    $scope.propose = function () {
      var param = {
        module: 'proposal',
        action: 'propose',
        userName: $scope.userName,
        userProfile: $scope.userProfile,
        proposalTitle: $scope.proposalTitle,
        proposalSummary: $scope.proposalSummary,
        proposalDetail: $scope.proposalDetail,
        proposalStartTime: $scope.voteStartTime,
        proposalEndTime: $scope.voteEndTime,
        proposalCost: 5,
        /*
                proposalHash: $scope.proposalHash,
                proposalStartTime: $scope.voteStartTime,
                proposalDuration: $scope.proposalDuration,
                proposalCost:     $scope.proposalCost,
        */
      }

      $.post('/papi', param, function (data, status) {
        console.log(333)
        if (data.result.err) {
          return alert('Propose Error: ' + data.result.msg)
        }
        console.log(data.result)
      })
    }

    $scope.vote = function (option, obj) {
      console.log(obj)
      var param = {
        module: 'proposal',
        action: 'vote',
//        proposalHash: $scope.proposalHash,
        voteOption: option,
        proposalHash: obj.proposalHash
      }
      $.post('/papi', param, function (data, status) {
        if (data.result.err) {
          return alert('Vote Errors:' + data.result.msg)
        }
        console.log(data.result)
      })
    }

    $scope.deposit = function () {
      var param = {
        module: 'proposal',
        action: 'deposit',
        value: $scope.value,
      }
      $.post('/papi', param, function (data, status) {
        if (data.result.err) {
          return alert('Deposit Errors:' + data.result.msg)
        }
        console.log(data.result)
      })
    }

    $scope.withdraw = function () {
      var param = {
        module: 'proposal',
        action: 'withdraw',
        value: $scope.value,
      }
      $.post('/papi', param, function (data, status) {
        if (data.result.err) {
          return alert('Withdraw Errors:' + data.result.msg)
        }
        console.log(data.result)
      })
    }

    $scope.voteResults = function () {
      var param = {
        module: 'proposal',
        action: 'voteResults',
        proposalHash: $scope.proposalHash,
        voteOption: $scope.voteOption,
      }
      $.post('/papi', param, function (data, status) {
        if (data.result.err) {
          return alert('VoteResults Errors:' + data.result.msg)
        }
        console.log(data.result)
        console.log(data.r)
      })
    }

    $scope.depositsOf = function () {
      var param = {
        module: 'proposal',
        action: 'depositsOf',
      }
      $.post('/papi', param, function (data, status) {
        if (data.result.err) {
          return alert('Deposit Errors:' + data.result.msg)
        }
        console.log(data.result)
      })
    }

    $scope.activeProposal = function () {
      var addr = $scope.contractAddress

      $.get('/api', {
        module: 'proposal',
        action: 'getActiveProposal',
      }, function (data, status) {
        console.log(33333)
        console.log(data.result.datas)
        var empty = $('ul.tksproposals').next()
        $scope.$apply(function () {
          if (data && data.result && data.result.datas && data.result.datas.length > 0) {
            $scope.proposalstks = data.result.datas;
            empty.hide()
          } else {
            empty.show()
          }
        })
      })
    }

    function getVoteResult(datas) {
      setTimeout(function () {
        for (_i in datas) {
          (function (one) {
            var li = $('#t' + one.proposalHash)
            for (var _j = 0; _j < 2; ++_j) {
              (function (k) {
                $.get('/api', {
                  module: 'proposal',
                  action: 'voteResults',
                  proposalHash: one.proposalHash,
                  voteOption: k,
                }, function (data, status) {

                  // alert(123)
                  console.log(data.result.voteResult)
                  // console.log(li.find('.disagree'))

                  if (k) {
                    li.find('.disagree').html(data.result.voteResult)
                  } else {
                    li.find('.agree').html(data.result.voteResult)
                  }
                })
              })(_j)
            }
          })(datas[_i])
        }
      }, 1000)
    }

    $scope.endProposal = function () {
      var addr = $scope.contractAddress

      $.get('/api', {
        module: 'proposal',
        action: 'getLeaderBoard',
      }, function (data, status) {
        console.log(33333)
        //   console.log(data.result.datas)
        var empty = $('ul.endproposals').next()
        $scope.$apply(function () {
          if (data && data.result && data.result.datas && data.result.datas.length > 0) {
            $scope.proposalsend = data.result.datas;
            getVoteResult(data.result.datas)
            empty.hide()
          } else {
            empty.show()
          }
        })
      })
    }

    $scope.ShowDetail = function (obj) {
      var divDetail = $("#h" + obj._id)
      divDetail.show()
      divDetail.find(".close").click(function () {
        divDetail.hide()
      })
    }

    $scope.ShowBalance = function () {
      var divBalance = $("#voteBalance")
      divBalance.show()
      divBalance.find(".close").click(function () {
        divBalance.hide()
      })
    }

    var bts = $("#nav").find("button")
    var ps = $("#paper>div")
    bts.click(function () {
      ps.hide()
      ps.filter(".p" + $(this).attr("v")).show()
    })

    $.get('/api', {
      module: 'proposal',
      action: 'depositsOf',
    }, function (data, status) {
      console.log(data)
      $scope.$apply(function () {
        $scope.deposisOf = data.result.votes;
      })
    })

    $.get('/api', {
      module: 'proposal',
      action: 'voteResults',
    }, function (data, status) {
      console.log(data)
      $scope.$apply(function () {
        $scope.deposisOf = data.result.votes;
      })
    })

  })
