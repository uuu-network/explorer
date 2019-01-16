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
  function setPageBlockData(pn){
    $.get('/api', {
      module: 'browse',
      action: 'blocks',
      page: pn,
    }, function(data, status){
      $scope.$apply(function(){
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

  function setPageTrsData(pn){
    $.get('/api', {
      module: 'browse',
      action: 'transactions',
      page: pn,
    }, function(data, status){
      $scope.$apply(function(){
        var total = data.result.total;
        var limit = data.result.limit;
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
  var nav = $('#'+id)
  , curp = 1
  , cachetotal = 1
  , cachepagenum = 1
  , rg = 3
  , item = function(p, isactive){ return '<li p="'+p+'" '+(isactive?'class="active"':'')+'><a href="#">'+p+'</a></li>' }
  , prev = '<li p="p"><a href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a></li>'
  , next = '<li p="n"><a href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a></li>'
  nav.html( item(1, true) + next )
  nav.on('click', 'li', function(e){
    var p = $(this).attr('p')
    , pn = parseInt(p)
    if(p=='p' && curp>1){
      pn = curp-1
    }
    if(p=='n' && curp<cachepagenum){
      pn = curp+1
    }
    if(pn != curp){
      reset(pn, cachetotal)
    }
  })
  function reset(pn, total, limit) {
    cachetotal = total
    cachelimit = limit || cachelimit
    cachepagenum = Math.ceil(total/cachelimit)
    var hhh = ''
    , rt = 1
    for(var i=pn-rg; i<pn+rg+1+(pn<rg+1?rg-pn+1:0); i++){
      if(i>0 && i<=cachepagenum){
        hhh += item(i, i==pn)
        rt = i
      }
    }
    nav.html( (pn>1?prev:'') + hhh + (rt<cachepagenum?next:'') )
    if(curp!=pn){
      curp = pn
      changecall(pn)
    }
  }
  return reset
}