// 

exports.walletPublicKeyCryptCookieName = 'wltpkcrpt'







/////////// function ///////////


// express cookie
exports.checkLogin = (req) => {
  const ckstuff = req.cookies[exports.walletPublicKeyCryptCookieName]
  if(!ckstuff){
    return null
  }
  const address = exports.decryptWalletAddressCookie(ckstuff)
  return address
}


exports.encryptWalletAddressCookie = (address) => {
  address = address.substr(2).split('') // drop 0x
  var stuff1 = '', stuff2 = ''
  for(var i=0; true; i++){
    var char = address.pop()
    if(char){
      if(i%2==0){
        stuff1 += char
      }else{
        stuff2 += char
      }
    }else{
      break
    }
  }
  return stuff2 + stuff1
}


exports.decryptWalletAddressCookie = (stuff) => {
  var addr1 = stuff.substr(20).split(''), addr2 = stuff.substr(0, 20).split('')
  var address = ''
  for(var i=0; true; i++){
    var char1 = addr1.pop()
    var char2 = addr2.pop()
    if(char1 && char2){
      address += char2 + char1
    }else{
      break
    }
  }
  return '0x' + address
}

/*
var address = '0xb8CE9ab6943e0eCED004cDe8e3bBed6568B2Fa01'
var stuff =  exports.encryptWalletAddressCookie(address)
var addr =  exports.decryptWalletAddressCookie(stuff)
console.log(address)
console.log('--'+stuff)
console.log(addr)
*/





