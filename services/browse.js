const fs = require('fs')


// blocks data cache
let BLOCK_BROWSE_CACHE = {};
setInterval(function () {
  BLOCK_BROWSE_CACHE = {}
}, 6000)


// transactions data load
const TRS_BROWSE_CACHE = [];

function trsdbfile(name) {
  return './diskdb/dtrs/' + name + '.json'
}

let TRS_LATEST_CACHE = JSON.parse(fs.readFileSync(trsdbfile('temp')));
const dtrsconfig = JSON.parse(fs.readFileSync(trsdbfile('head')));
dtrsconfig.page = dtrsconfig.page || 0
dtrsconfig.limit = dtrsconfig.limit || 20
dtrsconfig.lastbid = dtrsconfig.lastbid || 0
let ethtrsreading = false;
setInterval(function () {
  // read trs
  readTrsFromEth().then()
  if (ethtrsreading) {
    return // wait
  }
  // store
  const len = TRS_LATEST_CACHE.length
    , lmt = dtrsconfig.limit
    , pg = dtrsconfig.page + 1;
  if (len >= lmt) {
    const stores = TRS_LATEST_CACHE.splice(len - lmt, lmt);
    fs.writeFile(trsdbfile(pg), JSON.stringify(stores), function (err) {
      if (err) { // reset
        TRS_LATEST_CACHE = TRS_LATEST_CACHE.concat(stores)
      } else {
        dtrsconfig.page += 1
        flushTrsFile('head', dtrsconfig)
      }
    })
  }
  // clear cache
  if (TRS_BROWSE_CACHE.length > 20) {
    TRS_BROWSE_CACHE.splice(20, 9999999)
  }
}, 4553)

// 保存配置文件
function flushTrsFile(name, data) {
  fs.writeFile(trsdbfile(name), JSON.stringify(data), function (err) {
  })
}

// 读取交易数据
async function readTrsFromEth() {
  ethtrsreading = true
  flushTrsTemp()
  const num = dtrsconfig.lastbid;
  const lastnumber = await web3.eth.getBlockNumber()
  if (num === lastnumber) {
    return ethtrsreading = false
  }
  for (let idx = num + 1; idx <= lastnumber; idx++) {
    const trscount = await web3.eth.getBlockTransactionCount(idx)
    if (trscount === 0) {
      continue
    }
    const blockobj = await web3.eth.getBlock(idx, true);
    for (const i in blockobj.transactions) {
      // console.log('transactions count', blockobj.transactions.length)
      const one = blockobj.transactions[i];
      TRS_LATEST_CACHE.unshift({
        blockNumber: one.blockNumber,
        hash: one.hash,
        from: one.from,
        to: one.to,
        value: one.value,
        timestamp: blockobj.timestamp,
      })
      flushTrsTemp()
    }
  }

  function flushTrsTemp() {
    // console.log('pagestore count', pagestore.length)
    if (TRS_LATEST_CACHE.length === dtrsconfig.limit) {
      // console.log('flushTrsFile transactions', pagestore.length)
      dtrsconfig.page++
      flushTrsFile(dtrsconfig.page, TRS_LATEST_CACHE)
      TRS_LATEST_CACHE = []
    }
  }

  // console.log(TRS_LATEST_CACHE)
  // TRS_LATEST_CACHE
  flushTrsFile('temp', TRS_LATEST_CACHE)
  // flush cnf
  dtrsconfig.lastbid = lastnumber
  flushTrsFile('head', dtrsconfig)
  ethtrsreading = false

  return dtrsconfig

}

setTimeout(function () {
  readTrsFromEth().then()
}, 33)


/////////////////////////////////////////


module.exports = ($scope) => {
  web3 = $scope.web3

  return {

    transactions: async function (query, cb) {
      const page = query.page || 1;
      let dataresults = [];
      if (page <= dtrsconfig.page) {
        const dbpage = dtrsconfig.page - page + 1; // 倒序
        // check cache
        for (const i in TRS_BROWSE_CACHE) {
          if (TRS_BROWSE_CACHE[i].dbpage === 'p' + dbpage) {
            dataresults = TRS_BROWSE_CACHE[i].datas
            // 置顶
            // console.log('TRS_BROWSE_CACHE===================')
            // console.log(TRS_BROWSE_CACHE)
            const pop = TRS_BROWSE_CACHE.splice(i, 1);
            TRS_BROWSE_CACHE.unshift(pop[0])
            // console.log(TRS_BROWSE_CACHE)
            return render()
          }
        }
        // load from dist
        fs.readFile(trsdbfile(dbpage), function (err, data) {
          if (!err && data) {
            try {
              dataresults = JSON.parse(data)
              TRS_BROWSE_CACHE.unshift({
                dbpage: 'p' + dbpage,
                datas: dataresults,
              })
            } catch (e) {
            }
          }
          render()
        })
      } else {
        render()
      }

      function render() {
        let datas;
        if (page === 1) {
          datas = TRS_LATEST_CACHE.concat(dataresults)
        } else {
          datas = dataresults
        }
        for (const i in datas) {
          const one = datas[i];
          one.timeshow = new Date(1000 * one.timestamp).toLocaleString()
          one.uuu = web3.utils.fromWei(one.value, 'ether')
        }
        return cb(null, {
          datas: datas,
          total: dtrsconfig.page * dtrsconfig.limit,
          limit: dtrsconfig.limit,
        });
      }
    },

    blocks: async function (query, cb) {
      let limit = query.limit || 20;
      if (limit > 100) {
        limit = 100
      }
      const page = query.page || 1;
      const cachekey = page + '_' + limit;
      if (BLOCK_BROWSE_CACHE[cachekey]) {
        return cb(null, BLOCK_BROWSE_CACHE[cachekey]);
      }
      const lastblocknumber = await web3.eth.getBlockNumber()
      const blockNum = lastblocknumber - ((page - 1) * limit)
      // console.log(lastblocknumber)

      const resultdata = []
      for (let i = 0; i < limit && i < blockNum; i++) {
        const one = await web3.eth.getBlock(blockNum - i);
        // console.log(one)
        if (one) {
          resultdata.push({
            'number': one.number,
            'hash': one.hash,
            'transaction_count': one.transactions.length,
            'size': one.size,
            'gasUsed': one.gasUsed,
            'timeshow': new Date(1000 * one.timestamp).toLocaleString(),
          });
        }
      }
      const result = BLOCK_BROWSE_CACHE[cachekey] = {
        lastblocknumber: lastblocknumber,
        datas: resultdata,
      };
      return cb(null, result);

    }


  }

}
