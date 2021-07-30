angular.module('unetworkExplorer')
  .controller('recordwordsCtrl', function ($rootScope, $scope, $http, $location, $sce) {

    var $area_input = $('#input')
      , $area_success = $('#success')
      , $area_loading = $('#loading')
      , $area_submit = $('#submit')


    // 返回
    $area_success.find('button').click(function () {
      $area_loading.hide()
      $area_success.hide()
      $area_input.show()
      $area_submit.show()
    })


    $scope.doSubmitRecordWords = function () {

      $.post('/papi', {
        module: 'transaction',
        action: 'sendCoin',
        recordWords: $scope.recordwords,
      }, function (data, status) {
        if (data && data.result) {
          var d = data.result
          if (d.err) {
            alert('Record Error: ' + d.msg)
            return
          }
          // show loading
          $area_submit.hide()
          $area_loading.show()
          // /transaction/xxx
          $scope.$apply(function () {
            $scope.trsUrl = location.protocol + '//' + location.host + '/transaction/' + d.trshash
          })
          setTimeout(function () {
            $scope.$apply(function () {
              $scope.recordwords = ''
            })
            $area_loading.hide()
            $area_input.hide()
            $area_success.show()
          }, 7000)
        }
      })
    }


  })
