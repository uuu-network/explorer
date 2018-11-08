angular.module('unetworkExplorer')
  .controller('createNewWalletCtrl', function ($rootScope, $scope, $location) {

    passinput = $('#passwd')
    div_create = $('#create')
    div_save = $('#save')


    function showSaveWalletKeyStoreFile(data) {
      div_save.find('a.download').attr('href', data.keystoreDownloadUrl)
      div_save.find('textarea').text(data.privateKey)
      div_create.hide()
      div_save.show()
    }


    $scope.submitCreateWallet = function() {
      var passwd = $scope.passwd;
      if (!passwd || passwd.length < 8) {
        return alert('input at least 8 characters')
      }
      $.post('/papi', {
        module: 'account',
        action: 'create',
        password: passwd,
      }, function(data, status){
        if (data && data.result && data.result.address ) {
          showSaveWalletKeyStoreFile(data.result)
        }else{
          alert('Create Error !')
        }
        // console.log(data)
        // console.log(status)
      })
    }


    isshowpass = false
    $scope.showPass = function() {
      passinput.attr('type', isshowpass ? 'password' : 'text')
      str1 = 'eye-closed.svg'
      str2 = 'eye.svg'
      if (isshowpass) {
        a = str2
        str2 = str1
        str1 = a
      }
      showbt = passinput.next().children()
      oldsty = showbt.attr('style')
      newsty = oldsty.replace( str1, str2)
      showbt.attr('style', newsty)
      isshowpass = !isshowpass
    }
    
  })