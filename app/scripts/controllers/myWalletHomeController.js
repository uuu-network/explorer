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


    var login = $('#login')
    var home = $('#home')


    function turnToHome(acc){
      home.find('.addr').text(acc.address)
      home.find('.bls').text(acc.balance)
      login.hide();
      home.show();
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


    $scope.doSendCoin = function() {
      var address = $scope.address;
      var amount = $scope.amount;

      $.post('/papi', {
        module: 'transaction',
        action: 'sendCoin',
        to: address,
        amount: amount,
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
          console.log(d)
          alert('Send Successfully! Wait Confirmation.')
          location.reload()
        }


      })
    }


    $scope.logoutWallet = function() {
      $.get('/api', {
        module: 'wallet',
        action: 'logout',
      }, function(data, status){
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
          turnToHome(data.result)
        }else{
          alert('Login Error :' + (data.result.msg||''))
        }
        // console.log(data)
        // console.log(status)
      }



    }


  })