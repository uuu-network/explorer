angular.module('unetworkExplorer')
    .controller('transactionInfosCtrl', function ($rootScope, $scope, $location, $routeParams,$q) {

       var web3 = $rootScope.web3;
	
        $scope.init=function()
        {
            $scope.txId=$routeParams.transactionId;

            if($scope.txId!==undefined) { // add a test to check if it match tx paterns to avoid useless API call, clients are not obliged to come from the search form...

                getTransactionInfos()
                    .then(function(result){
                  getTransactionReceipts()
                      .then(function(resultReceipt){

                        	//TODO Refactor this logic, asynchron calls + services....
                        	var number = web3.eth.blockNumber;

                    		$scope.result = result;

                    		if(result.blockHash!==undefined){
                    		    $scope.blockHash = result.blockHash;
                    		}
                    		else{
                    		    $scope.blockHash ='pending';
                    		}
                    		if(result.blockNumber!==undefined){
                    		    $scope.blockNumber = result.blockNumber;
                    		}
                    		else{
                    		    $scope.blockNumber ='pending';
                    		}
                    		$scope.from = result.from;
                    		$scope.gas = result.gas;
				                $scope.gasUsed = resultReceipt.gasUsed;
                    		$scope.gasPrice = result.gasPrice.c[0] + ""; // Wei
                    		$scope.hash = result.hash;
                    		$scope.input = result.input;
                    		$scope.content = hex2utf8(result.input); // that's a string
                    		$scope.nonce = result.nonce;
                    		$scope.to = result.to;
                    		$scope.transactionIndex = result.transactionIndex;
                    		$scope.ethValue = result.value.c[0] / 10000; 
                    		$scope.txprice = (result.gas * result.gasPrice)/1000000000000000000 + " UUU";
                    		if($scope.blockNumber!==undefined){
                    		    $scope.conf = number - $scope.blockNumber;
                    		    if($scope.conf===0){
                    		        $scope.conf='unconfirmed'; //TODO change color button when unconfirmed... ng-if or ng-class
                    		    }
                    		}
                    		    //TODO Refactor this logic, asynchron calls + services....
                    		if($scope.blockNumber!==undefined){
                    		    var info = web3.eth.getBlock($scope.blockNumber);
                    		    if(info!==undefined){
                                    if($scope.txId=='0xe653283dcbfb35b7716b949baf62f5f3d1617cb6a7e2d4fc579a803f626752fc'){
                                        info.timestamp = 1577694048
                                    }
                                    $scope.time = info.timestamp;
                                    $scope.timeshow = new Date(1000*info.timestamp).toLocaleString();
                    		    }
                    		}

                	});
		            });
            }

            else{
                $location.path("/"); // add a trigger to display an error message so user knows he messed up with the TX number
            }


            function getTransactionInfos(){
                var deferred = $q.defer();

                web3.eth.getTransaction($scope.txId,function(error, result) {
                    if(!error){
                        deferred.resolve(result);
                    }
                    else{
                        deferred.reject(error);
                    }
                });
                return deferred.promise;

            }

            function getTransactionReceipts(){
                var deferred = $q.defer();

                web3.eth.getTransactionReceipt($scope.txId,function(error, result) {
                    if(!error){
                        deferred.resolve(result);
                    }
                    else{
                        deferred.reject(error);
                    }
                });
                return deferred.promise;

            }


        };
        $scope.init();
        // console.log($scope.result);

        

        $('#display_raw_data').click(function(){
            var $btn = $(this)
            , $raw = $btn.next()
            , $con = $raw.next()
            $btn.hide()
            $con.hide()
            $raw.show()
        })

    });

    
function hex2utf8(hexx) {
  var hex = hexx.toString();//force conversion
  console.log(hex)
  var arr = [];
  for (var i = 2; i < hex.length; i += 2){
    arr.push(parseInt(hex.substr(i, 2), 16));
  }
  console.log(arr)
  return utf8ByteToUnicodeStr(arr);
}

function byteToString(arr) {  
  if(typeof arr === 'string') {  
      return arr;  
  }  
  var str = '',  
      _arr = arr;  
  for(var i = 0; i < _arr.length; i++) {  
      var one = _arr[i].toString(2),  
          v = one.match(/^1+?(?=0)/);  
      if(v && one.length == 8) {  
          var bytesLength = v[0].length;  
          var store = _arr[i].toString(2).slice(7 - bytesLength);  
          for(var st = 1; st < bytesLength; st++) {  
              store += _arr[st + i].toString(2).slice(2);  
          }  
          str += String.fromCharCode(parseInt(store, 2));  
          i += bytesLength - 1;  
      } else {  
          str += String.fromCharCode(_arr[i]);  
      }  
  }  
  return str;  
}  

/**
 * utf8 byte to unicode string
 * @param utf8Bytes
 * @returns {string}
 */
function utf8ByteToUnicodeStr(utf8Bytes){
  var unicodeStr ="";
  for (var pos = 0; pos < utf8Bytes.length;){
      var flag= utf8Bytes[pos];
      var unicode = 0 ;
      if ((flag >>>7) === 0 ) {
          unicodeStr+= String.fromCharCode(utf8Bytes[pos]);
          pos += 1;

      } else if ((flag &0xFC) === 0xFC ){
          unicode = (utf8Bytes[pos] & 0x3) << 30;
          unicode |= (utf8Bytes[pos+1] & 0x3F) << 24;
          unicode |= (utf8Bytes[pos+2] & 0x3F) << 18;
          unicode |= (utf8Bytes[pos+3] & 0x3F) << 12;
          unicode |= (utf8Bytes[pos+4] & 0x3F) << 6;
          unicode |= (utf8Bytes[pos+5] & 0x3F);
          unicodeStr+= String.fromCharCode(unicode) ;
          pos += 6;

      }else if ((flag &0xF8) === 0xF8 ){
          unicode = (utf8Bytes[pos] & 0x7) << 24;
          unicode |= (utf8Bytes[pos+1] & 0x3F) << 18;
          unicode |= (utf8Bytes[pos+2] & 0x3F) << 12;
          unicode |= (utf8Bytes[pos+3] & 0x3F) << 6;
          unicode |= (utf8Bytes[pos+4] & 0x3F);
          unicodeStr+= String.fromCharCode(unicode) ;
          pos += 5;

      } else if ((flag &0xF0) === 0xF0 ){
          unicode = (utf8Bytes[pos] & 0xF) << 18;
          unicode |= (utf8Bytes[pos+1] & 0x3F) << 12;
          unicode |= (utf8Bytes[pos+2] & 0x3F) << 6;
          unicode |= (utf8Bytes[pos+3] & 0x3F);
          unicodeStr+= String.fromCharCode(unicode) ;
          pos += 4;

      } else if ((flag &0xE0) === 0xE0 ){
          unicode = (utf8Bytes[pos] & 0x1F) << 12;;
          unicode |= (utf8Bytes[pos+1] & 0x3F) << 6;
          unicode |= (utf8Bytes[pos+2] & 0x3F);
          unicodeStr+= String.fromCharCode(unicode) ;
          pos += 3;

      } else if ((flag &0xC0) === 0xC0 ){ //110
          unicode = (utf8Bytes[pos] & 0x3F) << 6;
          unicode |= (utf8Bytes[pos+1] & 0x3F);
          unicodeStr+= String.fromCharCode(unicode) ;
          pos += 2;

      } else{
          unicodeStr+= String.fromCharCode(utf8Bytes[pos]);
          pos += 1;
      }
  }
  return unicodeStr;
}
