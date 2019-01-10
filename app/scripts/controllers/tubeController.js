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
  .controller('tubeCtrl', function ($rootScope, $scope, $http, $location) {

    $scope.tube = function() {
/*
        var modal = $('#rapidDeploymentModal')
        , sourceCode = modal.find('input.sourceCode').val()
*/

        var param = {
          module: 'tube',
          action: 'obtain',
          fileName: fileName,
          contractName: contractName,
          sourceCode: contractCode
        }
        // console.log(param)
        // console.log(2321)s
        //alert(112)
        $.post('/papi', param, function (data, status){
 //         console.log(data.result)
          console.log(333)
          if(data.result.err){
            return alert('Obtain Coins Error: ' + data.result.msg)
          }
          console.log(data.result)
 //         confirmGenerate()
        })      
      }
  })
