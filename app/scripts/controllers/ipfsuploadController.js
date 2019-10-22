angular.module('unetworkExplorer')
//   .directive('file', function () {
//       return {
//           scope: {
//               file: '='
//           },
//           link: function (scope, el, attrs) {
//               el.bind('change', function (event) {
//                   var file = event.target.files;
//                   scope.file = file ? file : undefined;
//                   scope.$apply();
//               });
//           }
//       };
//   })
  .controller('ipfsuploadCtrl', function ($rootScope, $scope, $http, $location) {

    // Upload Keystore File
    var keystorefileinput = $('#upipfsfile').get(0)
    keystorefileinput.onchange = () => {
      var v = keystorefileinput.files[0]
      // console.log(v)
      $('#fileshow').val(v.name)
    }


    $scope.submitUpload = function() {

        var fileobj = $scope.upload_file
        if (!fileobj) {
          return alert('must select target file.')
        }
        tmp_file = document.getElementById("upipfsfile").files[0];
        // console.log(fileobj) 
        // console.log(tmp_file) 
        var fd = new FormData();
        fd.append('module', 'ipfsupload'); 
        fd.append('action', 'uploadfile'); 
        fd.append('file', tmp_file); 
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
            console.log('========');
            console.log(response);
            //   callback(response.data, response.status)
        },function(response){
            console.log('!!!ERR!!!');
            console.log(response);
        });


    }




  })
