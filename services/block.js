
// data cache
var BLOCK_BROWSE_CACHE = {}
setInterval(function(){
  BLOCK_BROWSE_CACHE = {}
}, 6000)

module.exports = ($scope) => {
  web3 = $scope.web3

  return {

    browse: async function(query, cb){

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
      for (var i = 0; i < limit; i++) {
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