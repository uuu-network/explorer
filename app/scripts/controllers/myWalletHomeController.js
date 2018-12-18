angular.module('unetworkExplorer')
  .directive('file', function () {
      return {
          scope: {
              file: '='
          },
          link: function (scope, el, attrs) {
              el.bind('change', function (event) {
                  var file = event.target.files;
                  scope.file = file ? file : undefined;
                  scope.$apply();
              });
          }
      };
  })
  .controller('myWalletHomeCtrl', function ($rootScope, $scope, $http, $location) {

    var web3 = $rootScope.web3

    var login = $('#login')
    var home = $('#home')
    var transferConfirmationModal = $('#transferConfirmationModal')


    function turnToHome(acc){
      home.find('.addr').text(acc.address)
      var uuus = web3.fromWei(acc.balance, 'ether').split('.')
      if(uuus.length===2){
        uuus = uuus[0] + '<span style="color: #bbb;">.'+uuus[1]+'</span>'
      }else{
        uuus = uuus[0]
      }
      home.find('.bls').html( uuus )
      login.hide();
      home.show();

      $.get('/api', {
        module: 'onekeytoken',
        action: 'mines',
      }, function(data, status){
        $scope.$apply(function(){
          var empty = $('ul.tksmine').next()
          // console.log(data.result)
          if(data && data.result && data.result.datas && data.result.datas.length>0){
            $scope.minetks = data.result.datas;
            empty.hide()
          }else{
            // $scope.minetks = []
            empty.show()
          }
        })
      })

      updateShowWallets()

      // $scope.minetks = [{},{},{}]
      // $scope.wallettks = [{},{},{}]

      web3.freegas.getSurplus(acc.address, function(error, result){
        console.log(error)
        console.log(result.toString())
        $scope.$apply(function(){
          $scope.useble_free_gas = result.toString() || 0
        })
      })



    }

    // check login
    $.get('/api', {
      module: 'wallet',
      action: 'checkLogin',
    }, function(data, status){
      if(data&&data.result&&data.result.address){
        // alert(data.result.address)
        // console.log(data.result)
        turnToHome(data.result)
      }else{
        // alert('not login')
      }
    })


    function updateShowWallets() {

      $.get('/api', {
        module: 'onekeytoken',
        action: 'wallets',
      }, function(data, status){
        var empty = $('ul.tkswallet').next()
        $scope.$apply(function(){
          // console.log(data.result)
          if(data && data.result && data.result.datas && data.result.datas.length>0){
            $scope.wallettks = data.result.datas;
            empty.hide()
          }else{
            // $scope.minetks = []
            empty.show()
          }
        })
      })
    }


    function showTokenTransferModal(tkobj)
    {
      // $scope.$apply(function(){
      $scope.trstkdlg = tkobj
      // })
      var modal = $('#tokenTransferModal')
      modal.modal()
    }


    $scope.openQueryTokenBalanceModal = function() {
      var modal = $('#queryTokenBalanceModal')
      modal.modal()
    }


    $scope.clickTokenTransferBtn = function(tkobj) {
      showTokenTransferModal(tkobj)
    }

    $scope.confirmTransferToken = function(tkobj) {
      var addr = $scope.trstk_address
      var amount = parseFloat($scope.trstk_amount)
      // console.log(addr.length)
      // console.log(tkobj)
      // console.log(addr)
      // console.log(amount)
      if(addr.length !== 42 || addr.indexOf('0x') !== 0){
        return alert('account address format is error')
      }
      if(!amount || amount <= 0 || amount > parseFloat(tkobj.balance)){
        return alert('amount is error: not more than '+tkobj.balance+' or less than 0')
      }

      $.post('/papi', {
        module: 'onekeytoken',
        action: 'transfer',
        contractAddress: tkobj.contractAddress,
        to: addr,
        amount: amount,
        usefreegas: openUseFreeGasStatus?1:0,
      }, function(data, status){
        var res = data.result
        if( res && res.err ){
          return alert('Query Error: ' + res.msg)
        }
        $scope.$apply(function(){
          $scope.trstk_address = $scope.trstk_amount = ''
          $('#tokenTransferModal').modal('hide')
          $scope.trshashcfmt = res.trshash
          transferConfirmationModal.modal()
          setTimeout(()=>{
            transferConfirmationModal.modal('hide')
          }, 60000)
          // alert('Transfer Successfully! Wait Confirmation.')
        })
      })
    }


    // Upload Keystore File
    var keystorefileinput = $('#lgksd').get(0)
    keystorefileinput.onchange = () => {
      var v = keystorefileinput.files[0]
      // console.log(v)
      $('#lgksdshow').val(v.name)
    }


    $scope.queryTokenBalance = function() {
      var addr = $scope.contractAddress
      if( ! /0x[A-Za-z0-9]{20}/.test(addr) ){
        return alert('token contract address format is error')
      }

      $('#queryTokenBalanceModal').modal('hide')

      $.get('/api', {
        module: 'onekeytoken',
        action: 'getBalance',
        contractAddress: addr,
      }, function(data, status){
        var res = data.result
        if( res && res.err ){
          return alert('Query Error: ' + res.msg)
        }
        res.addr = addr
        $scope.$apply(function(){
          $scope.qtbr = res
          $scope.contractAddress = ''
          updateShowWallets()
        })
        $('#queryBalanceModal').modal()
        // setTimeout(updateShowWallets, 2000)
        // alert('token address: '+addr+'\n\n'+'Your Balance is '+res.balance+' '+res.symbol)
        // location.reload()
      })

    }


    $scope.doSendCoin = function() {
      var address = $scope.address;
      var amount = $scope.amount;

      $.post('/papi', {
        module: 'transaction',
        action: 'sendCoin',
        to: address,
        amount: web3.toWei(amount),
        usefreegas: openUseFreeGasStatus?1:0,
      }, function(data, status){
        if(data && data.result){
          var d = data.result
          if(d.err){
            alert('Send Error: '+d.msg)
            if(d.err == 1){
              location.href = '/'
            }
            return
          }
          $scope.$apply(function(){
            // console.log(d)
            $scope.address = $scope.amount = ''
            $scope.trshashcfmt = d.trshash
            transferConfirmationModal.modal()
            // alert('Send Successfully! Wait Confirmation.')
            setTimeout(()=>{
              location.reload()
            }, 60000)
          })
        }


      })
    }

    var openUseFreeGasStatusCookieKey = 'oufgs'
    var openUseFreeGasStatus =  $.cookie(openUseFreeGasStatusCookieKey) === '1'
    // console.log(openUseFreeGasStatus)
    var $openUseFreeGasBtn = $('#ufgbtn')
    if(openUseFreeGasStatus){
      $openUseFreeGasBtn.addClass('active')
    }

    function clearSwitchUseFreeGasBtnStatus(){
      $openUseFreeGasBtn.removeClass('active')
      $.cookie(openUseFreeGasStatusCookieKey, null);
    }

    $scope.switchUseFreeGas = function() {
      var istouse = $openUseFreeGasBtn.hasClass('active')
      if(istouse){
        $.cookie(openUseFreeGasStatusCookieKey, '1', {expires: 0.007, path: '/'});
      }else{
        clearSwitchUseFreeGasBtnStatus()
      }
      openUseFreeGasStatus = istouse
      // alert(istouse)
    }

    $scope.logoutWallet = function() {
      $.get('/api', {
        module: 'wallet',
        action: 'logout',
      }, function(data, status){
        clearSwitchUseFreeGasBtnStatus()
        location.href = '/'
      })
    }

    // login
    $scope.submitLoginWallet = function() {
      var prikey = $scope.prikey;
      var keystore = $scope.keystore;
      var password = $scope.password;
      // console.log(prikey)
      // console.log(keystore)
      // console.log(password)
      if(!prikey && !password){
        return alert('must use "Keystore File & Password" or "PrivateKey"')
      }
      if(password){
        var fileobj = $scope.keystore_file
        if (!fileobj) {
          return alert('must select "Keystore File"')
        }
        tmp_file = document.getElementById("lgksd").files[0];
        // console.log(fileobj) 
        // console.log(tmp_file) 
        var fd = new FormData();
        fd.append('module', 'wallet'); 
        fd.append('action', 'loginByKeystore'); 
        fd.append('keystore', tmp_file); 
        fd.append('password', password); 
        $http({
          headers : {
              'content-type': undefined,
          },
          method: "POST",
          url: "/fapi",
          data : fd,
          //transformRequest: angular.identity,
          transformRequest: function (data, headersGetter) {
              var formData = new FormData();
              angular.forEach(data, function (value, key) {
                  formData.append(key, value);
              });
              var headers = headersGetter();
              delete headers['Content-Type'];
              return formData;
          },
        }).then(function(response){
          // console.log('asgasgf');
          // console.log(response);
          callback(response.data, response.status)
        },function(response){
          // console.log('======');
          // console.log(response);
        });

        // $.post('/papi', {
        //   module: 'wallet',
        //   action: 'loginByKeystore',
        //   keystore: keystore,
        //   password: password,
        // }, callback)

      }else{
        $.post('/papi', {
          module: 'wallet',
          action: 'loginByPrivateKey',
          privateKey: prikey,
        }, callback)
      }
      
      function callback(data, status){
        if (data && data.result && data.result.address ) {
          // alert(data.result.address)
          // console.log(data.result)
          clearSwitchUseFreeGasBtnStatus()
          turnToHome(data.result)
        }else{
          alert('Login Error :' + (data.result.msg||''))
        }
        // console.log(data)
        // console.log(status)
      }

    }


    var createTokenSymbolInput = $('#generateMyTokenModal').find('input.symbol')
    createTokenSymbolInput.on('change', ()=>{
      var v = createTokenSymbolInput.val()
      if(v && /[A-Za-z]{1,12}/.test(v)){
        createTokenSymbolInput.val(v.toUpperCase())
      }
    })


    $scope.oneKeyGenerateToken = function() {

      var modal = $('#generateMyTokenModal')
      , symbol = modal.find('input.symbol').val()
      , name = modal.find('input.name').val()
      , total = modal.find('input.total').val()
      if( !symbol || !name || !total ){
        return alert('symbol, name and total is required')
      }
      if( !/[A-Z]{1,12}/.test(symbol) ){
        return alert('symbol is only upper case, length must be less than 12')
      }
      if( name.length > 64 ){
        return alert('name length must be less than 64')
      }
      if( !/^-?\d+$/.test(total) || parseInt(total)>1000000000000 ){
        return alert('total supply must be between 1 and 1000000000000, only integer')
      }
      // post
      var param = {
        module: 'onekeytoken',
        action: 'generate',
        symbol: symbol,
        name: name,
        total: total,
        usefreegas: openUseFreeGasStatus?1:0,
      }
      // console.log(param)
      $.post('/papi', param, function (data, status){
        // console.log(data.result)
        if(data.result.err){
          return alert('Generate Error: ' + data.result.msg)
        }
        confirmGenerate()
      })

      function confirmGenerate(){
        // alert('Generate Successfully')
        modal.modal('hide')
        var confirmationModal = $('#generateConfirmationModal')
        confirmationModal.modal({backdrop: false})
        var progressBar = confirmationModal.find('.progress-bar')
        , miao = 13, sec = 1
        , itvl = setInterval( ()=>{
          var per = parseInt(sec/miao*100)+'%'
          progressBar.width(per)
          progressBar.text(per)
          if(sec >= miao){
            clearInterval(itvl)
            confirmationModal.modal('hide')
            return location.reload()
          }
          sec ++
        }, 1000 )
      }


    }





    /*************  button onoff 插件  **************/

    $('button.onoff').click(function(e){
      var $b = $(this)
      $b.toggleClass('active')
    })
    

    var useFreeGasTipModelShow
    $('#ufgbtn').click(function(e){
      var $b = $(this)
      if (!useFreeGasTipModelShow) {
        useFreeGasTipModelShow = true
        setTimeout(()=>{
          if($b.hasClass('active')){
            $('#useFreeGasOpenTipModal').modal()
          }
        }, 200)
      }
    })
    









  })