angular.module('unetworkExplorer')
  .controller('mainCtrl', function ($rootScope, $scope, $location) {


    /*
    var web3 = $rootScope.web3;
    var maxBlocks = 50; // TODO: into setting file or user select
    var blockNum = $scope.blockNum = parseInt(web3.eth.blockNumber, 10);
    if (maxBlocks > blockNum) {
      maxBlocks = blockNum + 1;
    }

    // get latest 50 blocks
    blocks = [];
    for (var i = 0; i < maxBlocks; ++i) {
      var one = web3.eth.getBlock(blockNum - i);
      if(one){
        one.timeshow = new Date(1000*one.timestamp).toLocaleString();
        blocks.push(one);
      }
    }
    $scope.blocks = blocks
    */

    // alert('main blocks')
    function setPageBlockData(pn) {
      $.get('/api', {
        module: 'browse',
        action: 'blocks',
        page: pn,
      }, function (data, status) {
        $scope.$apply(function () {
          var total = $scope.blockNum = data.result.lastblocknumber;
          $scope.blocks = data.result.datas;
          pgblockset(pn, total)
        })
      })
    }

    setPageBlockData(1)
    // page
    var pgblockset = initPage('pgblock', 20, setPageBlockData)


    // alert('main transactions')

    function setPageTrsData(pn) {
      $.get('/api', {
        module: 'browse',
        action: 'transactions',
        page: pn,
      }, function (data, status) {
        $scope.$apply(function () {
          var total = data.result.total;
          var limit = data.result.limit;
          for (var i in data.result.datas) {
            if (data.result.datas[i].hash == '0xe653283dcbfb35b7716b949baf62f5f3d1617cb6a7e2d4fc579a803f626752fc') {
              data.result.datas[i].timestamp = '1577694048'
              data.result.datas[i].timeshow = '2019-12-30 16:20:48'
            }
          }
          $scope.transactions = data.result.datas;
          pgtrsset(pn, total, limit)
        })
      })
    }

    setPageTrsData(1)
    // page
    var pgtrsset = initPage('pgtrs', 20, setPageTrsData)


  });


// pgblock pgtrs
function initPage(id, cachelimit, changecall) {
  var nav = $('#' + id)
    , curp = 1
    , cachetotal = 1
    , cachepagenum = 1
    , rgs = 7
    , item = function (p, isactive) {
    return '<li p="' + p + '" ' + (isactive ? 'class="active"' : '') + '><a href="#">' + p + '</a></li>'
  }
    , prev = '<li p="p"><a href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a></li>'
    , next = '<li p="n"><a href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a></li>'
  nav.html(item(1, true) + next)
  nav.on('click', 'li', function (e) {
    var p = $(this).attr('p')
      , pn = parseInt(p)
    if (p == 'p' && curp > 1) {
      pn = curp - 1
    }
    if (p == 'n' && curp < cachepagenum) {
      pn = curp + 1
    }
    if (pn != curp) {
      reset(pn, cachetotal)
    }
  })

  function reset(pn, total, limit) {
    cachetotal = total
    cachelimit = limit || cachelimit
    cachepagenum = Math.ceil(total / cachelimit)
    var hhh = ''
      , start = pn - parseInt((rgs - 1) / 2);
    start = start >= 1 ? start : 1;
    var end = start + rgs;
    if (end + rgs > cachepagenum) {
      end = cachepagenum
      start = cachepagenum - rgs
    }
    start = start >= 1 ? start : 1;
    for (var i = start; i < end; i++) {
      hhh += item(i, i == pn)
    }
    nav.html((pn > 1 ? prev : '') + hhh + (pn < cachepagenum ? next : ''))
    if (curp != pn) {
      curp = pn
      changecall(pn)
    }
  }

  return reset
}
