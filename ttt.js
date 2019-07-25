

/*
// 十年数据量
console.log(
  2 * 12 * 24 * 365 * 10 / 1024 / 1024 
)


// TPS
console.log(

  2*1024*1024 /

  (1+3+5+1+34+1+1+2+3+34 + 2+1+33+64)

  / 5 / 60

)
console.log(
  30 * 60 * 24
)

*/


/*

奖励 1  1  2  3  5  8  13  21  13  8  5  3  2  1  1
年   1  2  3  4  5  6  7   8   7   6  5  4  3  2  1
年   1 

*/

console.log(
    ( Math.pow(16, 6)
    + Math.pow(16, 5)
    + Math.pow(16, 4)
    + Math.pow(16, 3)
    + Math.pow(16, 2)
    + Math.pow(16, 1)
    )// * 5 / (60*24*365)
)

console.log( 60*24*365 / 25 )

// console.log( (21+13+8+5+3+2+1+1) * 500000)
// console.log( (1*500000)/4.75/27000000 )
console.log( 5000*5/60/24 )

console.log( (1+1+2+3+5+8+13+21+13+8+5+3+2+1+1) )
console.log( (1+1+1+1+1+1+1+ 8 +7 +6+5+4+3+2+1) )

console.log( 10000*10 / (12*24*365) )

var total = 100000 * (
    1*1 +
    1*1 +
    2*1 +
    3*1 +
    5*1 +
    8*1 +
    13*10+
    8*10 +
    5*10 +
    3*10 +
    2*10 +
    1*10 +
    1*10
)

console.log( total )
console.log( 10000*10 / total / 0.9512937 )





// process.exit()











/////////////////////////////////////////////////////////




var cluster = require('cluster')
, numCPUs = require('os').cpus().length
, crypto = require('crypto')
, sha256 = require('js-sha256')
 
// if (cluster.isMaster) {
//     var date = new Date()
//     console.log(`${date.getHours()}:${date.getMinutes()}`,
//         'numCPUs=' + numCPUs)
//     for (var i = 0; i < numCPUs; i++) {
//         cluster.fork();
//     }
// } else if (cluster.isWorker) {}


var diamonds = []
, startTime = new Date().getTime()
for(var i=0; i<10000*10000*10000*100; i++){
    break
    // var buf = crypto.randomBytes(32)
    // var buf = sha256(`${process.pid}:${i}`)
    var hash = sha256.create();
    hash.update(`${process.pid}:${i}`)
    var buf = Buffer.from( hash.arrayBuffer('') )
    // console.log('buf=============')
    // console.log(buf)
    // process.exit()
    var ddd = hash17diamond( buf )
    //           0000000IWXUKNWTH
    var start = '0000000000'
    if(ddd.startsWith(start)){
        diamonds.push(ddd)
        curTime = new Date().getTime()
        var len = diamonds.length
        , time = parseInt((curTime-startTime)/1000)
        , rqst = parseInt(time/len)
        , dfct = parseInt(i/len)
        , power = parseInt(i/time)
        console.log(`${process.pid}:`, ddd, '=>', buf.toString('hex'),
            `alltime = ${time} request = ${rqst} difficulty = ${dfct} power = ${power}`)
    }
}


function hash17diamond( buffer ){
    // console.log(str.length)
    if (buffer.length !== 32){
        throw new Error("buffer must be hash256")
    }
    let stuff = '0WTYUIAHXVMEKBSZN'
    , total = 16
    , hhlen = stuff.length
    let diamond = []
    , fv = 0
    for(let step=0;step<total;step++)
    {
        let i = step * 2
        , n1 = buffer[i]
        , n2 = buffer[i+1]
        fv = (fv + n1 + n2) % hhlen
        diamond.push( stuff.charAt(fv) )
    }
    return diamond.join('')
}



function checkDiamond(stuff) {
    let chars = '0WTYUIAHXVMEKBSZN'
    if(stuff.length == 16 && stuff.startsWith('0000000000')){
        var sarys = stuff.substr(10).split('')
        , first = true
        // console.log(sarys)
        while(true){
            var l = sarys.shift()
            , idx = chars.indexOf(l)
            if(!l){
                return first ? false : true
            }
            if(idx==-1){
                return false
            }else if(idx==0){
                if(first){
                    continue
                }else{
                    return false
                }
            }else{
                first = false
            }
        }
    }else{
        return false
    }
}


console.log( checkDiamond('00000000VMEKBSZN') )
console.log( checkDiamond('0000000000EKB0ZN') )
console.log( checkDiamond('0000000000EKBSZ0') )
console.log( checkDiamond('0000000000POKSZN') )
console.log( checkDiamond('0000000000EKBSZN') )
console.log( checkDiamond('000000000000BSZN') )
console.log( checkDiamond('000000000000000N') )
console.log( checkDiamond('0000000000000000') )


function hash17diamond_old( str ){
    // console.log(str.length)
    if (str.length !== 64){
        throw new Error("str must be hash32 string")
    }
    str = str.toLowerCase()
    let stuff = '0WTYUIAHXVMEKBSZN'
    let step = 0
    , total = 16
    , hhlen = stuff.length
    let diamond = []
    , fv = 11
    for(;step<total;step++)
    {
        let n = step * 4
        , vl = str.charAt( n ).charCodeAt()
             * str.charAt( n + 1 ).charCodeAt()
             * str.charAt( n + 2 ).charCodeAt()
             / str.charAt( n + 3 ).charCodeAt()
        fv = (vl * fv) % hhlen
        diamond.push( stuff.charAt(fv) )
        if(fv==0) fv = 11
    }
    return diamond.join('')
}





// }



function calcBlockCoinBaseReward(block_height)
{
    var rwdns = [1,1,2,3,5,8,13,8,5,3,2,1,1] // length must uneven number
    , frix = parseInt(rwdns.length / 2)
    , pos = parseInt(block_height / (10000*10)) // almost 1 year
    // console.log(frix, pos)
    if(pos < frix){
        return rwdns[pos]
    }else if(pos < frix+((frix+1)*10)){
        return rwdns[frix + parseInt((pos-frix)/10)]
    }else{
        return rwdns[rwdns.length-1]
    }
}

for(var i=0; i<200; i++){
    // console.log(i, calcBlockCoinBaseReward( 10000*10*i + 1 ) )
}




function X16RS_HASH( prevhash_buf, stuff_buf )
{
    function SHA3_256(a){ return crypto.randomBytes(32) } // suppose
    var hashfuncs = [ // suppose 
        function Blake(a){ return crypto.randomBytes(32) },
        function BMW(a){ return crypto.randomBytes(32) },
        function Groestl(a){ return crypto.randomBytes(32) },
        function Jh(a){ return crypto.randomBytes(32) },
        function Keccak(a){ return crypto.randomBytes(32) },
        function Skein(a){ return crypto.randomBytes(32) },
        function Luffa(a){ return crypto.randomBytes(32) },
        function Cubehash(a){ return crypto.randomBytes(32) },
        function Shavite(a){ return crypto.randomBytes(32) },
        function Simd(a){ return crypto.randomBytes(32) },
        function Echo(a){ return crypto.randomBytes(32) },
        function Hamsi(a){ return crypto.randomBytes(32) },
        function Fugue(a){ return crypto.randomBytes(32) },
        function Shabal(a){ return crypto.randomBytes(32) },
        function Whirlpool(a){ return crypto.randomBytes(32) },
        function SHA512(a){ return crypto.randomBytes(32) },
    ]
    var hashloopnum = hashfuncs.length
    , stephashs = []
    for(var i=0; i<hashloopnum; i++){
        var funcidx = prevhash_buf.readUInt8(31) % hashloopnum
        // console.log(funcidx)
        prevhash_buf = stuff_buf = hashfuncs[funcidx](stuff_buf)
        stephashs.push(stuff_buf)
        // console.log(stuff_buf.toString('hex'))
        // console.log('----')
    }
    stuff_buf =  Buffer.concat(stephashs, hashloopnum*32)
    return SHA3_256(stuff_buf)
}


// console.log( X16RS_HASH(crypto.randomBytes(32), crypto.randomBytes(32)) )











/*



 numCPUs = 6
10803: 000000SYKIWMYESZ => 80e9e485d5fa687927fef398d30b1e5fd8a709cd35e802f5988222b2e52ef1b9 time = 14 difficulty = 3891688 jun = 277977
10810: 000000MYHZNXXUYU => d5c7813e028ac35105215cda6c191d64d6934a241d8e6c8b8118120c12db64be time = 25 difficulty = 6579621 jun = 263184
10790: 000000BKMUIASSMT => b52c912e36453007538e7506ed2344feef74a0f2890007931f1cc36f91aedeb2 time = 40 difficulty = 10800240 jun = 270006
10785: 000000SENVXMTKKM => 633aebe453b0d2dbae3362d4db8bfc002227c8411e36911b585ba5751a7f6598 time = 42 difficulty = 11267827 jun = 268281
10795: 000000USTNEVIHIT => fd5b8705bfff16dceed0ba5a28dff4bf555a76fdc7881cbf12c7537b6004b734 time = 86 difficulty = 23180003 jun = 269534
10798: 000000KWEMZWTMKW => d4a6d9b24569556a34f17a9a170a2bb80e0dde53d3ca1eb1fc59c2cd48cac144 time = 93 difficulty = 25057827 jun = 269439
10803: 000000MAWNAHWHNZ => a2e9b42d25abaf1088597b666267608a6a4c2286290051c05a06c2dc32f83200 time = 67 difficulty = 17842788 jun = 266310
10798: 000000EWVYWHUISW => 1874180e08ea14890279fed1f8d16a7a8a8ec3ad6ec2136a98ec32ced478ccf2 time = 74 difficulty = 20242748 jun = 273550
10785: 000000AAUVSMXYZX => c186920b72d5f6a6546b215a346fe1fb13fba1eb0ea112fa4bf682676452c984 time = 87 difficulty = 23840068 jun = 274023
10790: 000000SIZVBSYZNM => d286ce8a1313902f0f39e4b8f9b1e28bf888387df3a953589ac0137084f310fa time = 91 difficulty = 25254136 jun = 277517
10798: 000000HVAUEMSMKV => 9dbb0147ae11caf4ed276d41b1d08f0c6a81f4e67294e74a91c7cdd8b55dd03d time = 66 difficulty = 18181243 jun = 275473
10790: 000000IZXMWMISKV => f6c82556c7a26945248a79466cadfc84925563c0a09ae721d3afa7502ae4f13e time = 86 difficulty = 23636945 jun = 274848
10785: 000000TYKTKWZIKE => 438d27fe27fef5c9de8b251248dffcbf2ced5d878e378f98c7793604f9fbf30b time = 87 difficulty = 23585074 jun = 271092
10795: 000000VMVNUWYHVS => e88147ab07967baa336ac0a9f14e8c0e9a86bd275d637da1804e97e3a4e5514d time = 139 difficulty = 37179330 jun = 267477
10795: 000000BZAHNIUUEB => 9ecbb10ecd25ea5d8947627f057294a06fa906e964f92ab9b6ae4b2ca31f848e time = 108 difficulty = 29070336 jun = 269169
10810: 000000HKEIMXNXZZ => 622a569c971763f5600a1412c28c2e5f869a351a3fe7947ab871de3be9723157 time = 165 difficulty = 43977713 jun = 266531
10798: 000000EXMAASTIWZ => 88e120e396e4390f8d65cedf1de047713a72c06e27613cfe2f5e02129753b8bb time = 83 difficulty = 22529740 jun = 271442
10803: 000000ZKBTHVINVW => 5108bfffea1976af2776ccd06c8434ea8b207edc3fd6ed367c5dc9961a23e259 time = 114 difficulty = 29748124 jun = 260948
10803: 000000BBUAHVHTZY => 206c7dec31f439fd5d73b4f98c95d55da92b6866d63bd163de96b149ef83c385 time = 91 difficulty = 23658140 jun = 259979
10798: 000000WASNHNUWAA => aecc2cf9c43f19511a83def1fe6c75b11f8252f3258dd10440807d5dfc2a3311 time = 73 difficulty = 19958712 jun = 273407
10803: 000000YYXEYAHMKN => cb7cd52e40e5b80705ba3403440720ce57141ad7732f8c98f64ef2dc0dc1b185 time = 74 difficulty = 19340699 jun = 261360
10795: 000000MMIYSYXYBI => 3c3f24f0975b8abd405ddb3915d64345b699eb788dd2abc0f234c249d1f3523f time = 96 difficulty = 25868136 jun = 269459
10810: 000000MYKNZVNKSW => 19959c6780c7ba3882e77aef5e8dc7b9d2142336dda9d8edb584ad0abfcae320 time = 128 difficulty = 34422311 jun = 268924
10798: 000000MTSMIKAZII => 8eb92b94ea0824df71704c0dfa9b25b095cb1a48d4379d1407ae9c06c211ab21 time = 68 difficulty = 18442364 jun = 271211
10795: 000000EMXEYBIVXE => 23be83f747efeb8f101622483b18293c11ec38641824411ec6b983e6b9899c88 time = 82 difficulty = 22086861 jun = 269351
10803: 000000IKKATAVTBI => 98165845eed00851e5a6f9b4367d8262dd55fbecca97623bb3e8b07ba0d0b5a8 time = 69 difficulty = 18113266 jun = 262511
10785: 000000ASYAVAWZKK => 0a8237770664d2dbda5c67ade4f16a48be8b11470af8040a8c086fe23264b76a time = 105 difficulty = 28415952 jun = 270628
10803: 000000YNNKVTIASX => 17dbeb07d1bae122812d7cbac19a3d7abd644e251d2451c9846d50061cb8be6e time = 64 difficulty = 16852527 jun = 263320
10795: 000000YAUKWBWBIW => 9b240433e1337bbbabad87aff0af07956f9ff0395deca66523269a711ffa7201 time = 81 difficulty = 22058992 jun = 272333
10790: 000000ZSZTTEYYTV => e50de6fa73b2ddae3c2e84a1b30a6852d1fb6f9470c256c343709a323fae6618 time = 134 difficulty = 36627748 jun = 273341
10785: 000000SHSZZAWHUW => 89142e5e30e42b6184c32de781d4496b9c37835b5203af69d866cd2786edb29f time = 111 difficulty = 30128048 jun = 271423











































*/