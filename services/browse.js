const fs = require('fs')




// blocks data cache
var BLOCK_BROWSE_CACHE = {}
setInterval(function(){
  BLOCK_BROWSE_CACHE = {}
}, 6000)


// transactions data load
var TRS_BROWSE_CACHE = []
var TRS_LATEST_CACHE = []
function trsdbfile(name){ return './diskdb/dtrs/'+name+'.json' }
var dtrsconfig = JSON.parse(fs.readFileSync( trsdbfile('head') ))
dtrsconfig.page = dtrsconfig.page || 0
dtrsconfig.limit = dtrsconfig.limit || 2
dtrsconfig.lastbid = dtrsconfig.lastbid || 0
var ethtrsreading = false
setInterval(function(){
  // read trs
  readTrsFromEth().then()
  if(ethtrsreading){
    return // wait
  }
  // store
  var len = TRS_LATEST_CACHE.length
  , lmt = dtrsconfig.limit
  , pg = dtrsconfig.page + 1
  if( len >= lmt){
    var stores = TRS_LATEST_CACHE.splice(len-lmt, lmt)
    fs.writeFile(trsdbfile(pg), JSON.stringify(stores), function(err){
      if(err){ // reset 
        TRS_LATEST_CACHE = TRS_LATEST_CACHE.concat(stores)
      }else{
        dtrsconfig.page += 1
        flushTrsFile('head', dtrsconfig)
      }
    })
  }
  // clear cache
  if(TRS_BROWSE_CACHE.length > 20){
    TRS_BROWSE_CACHE.splice(20, 9999999)
  }
}, 4553)
// 保存配置文件
function flushTrsFile(name, data){
  fs.writeFile(trsdbfile(name), JSON.stringify(data), function(err){})
}
// 读取交易数据
async function readTrsFromEth(){
  ethtrsreading = true
  var num = dtrsconfig.lastbid
  const lastnumber = await web3.eth.getBlockNumber()
  if(num == lastnumber) {
    return ethtrsreading = false
  }
  var pagestore = []
  for(;num<=lastnumber;num++){
    const trscount = await web3.eth.getBlockTransactionCount(num)
    if(trscount == 0){
      continue
    }
    const blockobj = await web3.eth.getBlock(num, true);
    for(var i in blockobj.transactions){
      // console.log('transactions count', blockobj.transactions.length)
      var one = blockobj.transactions[i]
      pagestore.unshift({
        blockNumber: one.blockNumber,
        hash: one.hash,
        from: one.from,
        to: one.to,
        value: one.value,
        timestamp: blockobj.timestamp,
      })
      // console.log('pagestore count', pagestore.length)
      if(pagestore.length == dtrsconfig.limit){
        // console.log('flushTrsFile transactions', pagestore.length)
        dtrsconfig.page++
        flushTrsFile(dtrsconfig.page, pagestore)
        pagestore = []
      }
    }
  }
  // flush cnf
  dtrsconfig.lastbid = lastnumber
  flushTrsFile('head', dtrsconfig)
  ethtrsreading = false

  return dtrsconfig

}

readTrsFromEth().then()




/////////////////////////////////////////


module.exports = ($scope) => {
  web3 = $scope.web3

  return {

    transactions: async function(query, cb){
      var page = query.page || 1
      var dataresults = []
      if(page <= dtrsconfig.page){
        page = dtrsconfig.page - page + 1 // 倒序
        // load from dist
        fs.readFile(trsdbfile(page), function(err, data){
          if(!err && data){
            try {
              dataresults = JSON.parse(data)
            } catch (e) {}
          }
          render()
        })
      }else{
        render()
      }
      function render() {
        var datas = TRS_LATEST_CACHE.concat(dataresults)
        for(var i in datas){
          var one = datas[i]
          one.timeshow = new Date(1000*one.timestamp).toLocaleString()
          one.uuu = web3.utils.fromWei(one.value, 'ether')
        }
        return cb(null, {
          datas: datas,
          total: dtrsconfig.page * dtrsconfig.limit,
          limit: dtrsconfig.limit,
        });
      }
    },

    blocks: async function(query, cb){
      var limit = query.limit || 20
      if (limit > 100) {
        limit = 100
      }
      var page = query.page || 1
      var cachekey = page+'_'+limit
      if (BLOCK_BROWSE_CACHE[cachekey]) {
        return cb(null, BLOCK_BROWSE_CACHE[cachekey]);
      }
      const lastblocknumber = await web3.eth.getBlockNumber()
      const blockNum = lastblocknumber - ((page - 1) * limit)
      // console.log(lastblocknumber)

      const resultdata = []
      for (var i = 0; i < limit && i < blockNum; i++) {
        var one = await web3.eth.getBlock(blockNum - i);
        // console.log(one)
        if(one){
          resultdata.push({
            'number': one.number,
            'hash': one.hash,
            'transaction_count': one.transactions.length,
            'size': one.size,
            'gasUsed': one.gasUsed,
            'timeshow': new Date(1000*one.timestamp).toLocaleString(),
          });
        }
      }
      var result = BLOCK_BROWSE_CACHE[cachekey] = {
        lastblocknumber: lastblocknumber,
        datas: resultdata,
      }
      return cb(null, result);

    }


  }

}