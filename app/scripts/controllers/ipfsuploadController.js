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
  .controller('ipfsuploadCtrl', function ($rootScope, $scope, $http) {

    let ipfs_ref_name = "";

    // Upload Keystore File
    const keystorefileinput = $('#upipfsfile').get(0);
    keystorefileinput.onchange = () => {
      const v = keystorefileinput.files[0];
      // console.log(v)
      $('#fileshow').val(v.name)
    }

    // 保存
    $scope.storeAddrTrs = function () {
      // alert(ipfs_ref_name)
      if (ipfs_ref_name) {
        storeAddrTrs(ipfs_ref_name)
      }
    };

    $scope.submitUpload = function () {

      const fileobj = $scope.upload_file;
      if (!fileobj) {
        return alert('must select target file.')
      }
      tmp_file = document.getElementById("upipfsfile").files[0];
      // console.log(fileobj)
      // console.log(tmp_file)
      const fd = new FormData();
      fd.append('module', 'ipfsupload');
      fd.append('action', 'uploadfile');
      fd.append('file', tmp_file);
      $http({
        headers: {
          'content-type': undefined,
        },
        method: "POST",
        url: "/fapi",
        data: fd,
        //transformRequest: angular.identity,
        transformRequest: function (data, headersGetter) {
          const formData = new FormData();
          angular.forEach(data, function (value, key) {
            formData.append(key, value);
          });
          const headers = headersGetter();
          delete headers['Content-Type'];
          return formData;
        },
      }).then(function (response) {
        console.log('========');
        // console.log(response);
        uploadSuccess(response.data)
        //   callback(response.data, response.status)
      }, function (response) {
        console.log('!!!ERR!!!');
        console.log(response);
        alert("file upload error.")
      });


      function uploadSuccess(data) {
        // console.log(data);
        if (data.status > 0) {
          $('#uploadform').hide();
          let $succ = $('#showupload')
            , $show = $succ.find('.show')
            , $down = $succ.find('.down')
          $succ.show()
          let ffs = data.result.ref_name.split('.')
          let ty = ffs[ffs.length - 1]
          // QmdSsQpZSAXXCaK4rNRTnr3NDZiDteNjdnR1YgVBbHM4Lc/59c488531093d.jpg
          let url = "/api?module=ipfsupload&action=catfile&refpath=" + data.result.ref_name
          if ({'jpg': 1, 'jpeg': 1, 'png': 1, 'gif': 1}[ty.toLowerCase()]) {
            $show.find('img').attr('src', url);
            $show.show();
          } else {
            $show.hide();
          }
          $down.find('a').attr('href', url + '&download=1');
          // 询问是否上链
          ipfs_ref_name = data.result.ref_name
          setTimeout(function () {
            storeAddrTrs(data.result.ref_name)
          }, 250)
        } else {
          alert("file upload error.")
        }

      }

    }


    // 保存地址上交易
    function storeAddrTrs(ref_name) {
      if (!ref_name) {
        return
      }
      if (!confirm("Cost some UUU to store IPFS address to U Network blockchain ?")) {
        return
      }
      // 上链
      $.post('/papi', {
        module: 'transaction',
        action: 'sendCoin',
        recordIPFSAddress: 'ipfs://' + ref_name, // 记录 ipfs 地址
      }, function (data) {
        if (data && data.result) {
          const d = data.result;
          if (d.err) {
            alert('Record IPFS Error: ' + d.msg)
            return
          }
          //   // show loading
          //   $area_submit.hide()
          //   $area_loading.show()
          alert('Record successfully!')
          // /transaction/xxx
          $scope.$apply(function () {
            //   var url = location.protocol+'//'+location.host+'/transaction/'+d.trshash
            $scope.trsUrl = '/transaction/' + d.trshash
          })
        }
      })
    }


  })
