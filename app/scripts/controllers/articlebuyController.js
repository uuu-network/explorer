angular.module('unetworkExplorer')
  .controller('articlebuyCtrl', function ($rootScope, $scope, $http, $location, $sce) {

    var web3 = $rootScope.web3

    var $list = $('#list')

    var $post = $('#post')
    var $lockcv = $('.lockcv')
    var $lockbox = $('.box')

    $list.find('.i1').click(function () {
      $post.show()
      $list.hide()
    })

    $lockbox.click(function () {

      // 0x22a0b3688dd46ab1a37d6237871913037681d57f628862336bc9c3c468c4a449
      var pass = confirm("Confirm the transaction?")
      if (!pass) {
        return
      }

      // 登录
      $.post('/papi', {
        module: 'wallet',
        action: 'loginByPrivateKey',
        privateKey: "0x22a0b3688dd46ab1a37d6237871913037681d57f628862336bc9c3c468c4a449",
      }, function () {

        $('.unload').hide(0)
        $('.loading').show(0)


        // 发起一笔转账
        $.post('/papi', {
          module: 'transaction',
          action: 'sendCoin',
          to: "0x6F57b2e6D836676cc37Cd2E5E635EC5AE1D3D67E",
          amount: web3.toWei("1"),
          usefreegas: 0,
        }, function (data, status) {

          setTimeout(function () {

            $lockcv.slideToggle(600);
            setTimeout(function () {
              $post.removeClass('lock')
            }, 600)

          }, 2000)

        })

      })

    })


  });

