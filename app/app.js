angular.module('unetworkExplorer', ['ngRoute','ui.bootstrap'])
    
    .config(['$routeProvider', '$locationProvider',
        function($routeProvider, $locationProvider) {
            $locationProvider.html5Mode(true);
            $routeProvider
                .when('/', {
                    templateUrl: 'views/main.html',
                    controller: 'mainCtrl',
                })
                .when('/block/:blockId', {
                    templateUrl: 'views/blockInfos.html',
                    controller: 'blockInfosCtrl'
                })
                .when('/transaction/:transactionId', {
                    templateUrl: 'views/transactionInfos.html',
                    controller: 'transactionInfosCtrl'
                })
                .when('/address/:addressId', {
                    templateUrl: 'views/addressInfo.html',
                    controller: 'addressInfoCtrl'
                })
                .when('/mywallet', {
                    templateUrl: 'views/myWalletHome.html',
                    controller: 'myWalletHomeCtrl'
                })
                .when('/newwallet', {
                    templateUrl: 'views/createNewWalletHome.html',
                    controller: 'createNewWalletCtrl'
                })
                .when('/deploy', {
                    templateUrl: 'views/rapidDeploy.html',
                    controller: 'rapidDeploymentCtrl'
                })
                .when('/recordwords', {
                    templateUrl: 'views/recordWords.html',
                    controller: 'recordwordsCtrl'
                })
                .when('/tube', {
                    templateUrl: 'views/tube.html',
                    controller: 'tubeCtrl'
                })
                .when('/proposal', {
                    templateUrl: 'views/proposal.html',
                    controller: 'proposalCtrl'
                })
                .when('/articlebuy', {
                    templateUrl: 'views/articleBuy.html',
                    controller: 'articlebuyCtrl'
                })
                .when('/ipfsupload', {
                    templateUrl: 'views/ipfsupload.html',
                    controller: 'ipfsuploadCtrl'
                })
                .otherwise({
                    redirectTo: '/'
                })
        }])
        .run(function($rootScope) {
            var web3 = new Web3();
            $.getJSON( "./config.json" , function( result ){
              web3.setProvider(new web3.providers.HttpProvider(result.rpcUrl));
            
              if(!web3.isConnected()) {
                var warn = $('#connectwarning')
                warn.modal({keyboard:false,backdrop:'static'}) 
                warn.modal('show') 
              }

            });
            $rootScope.web3 = web3;
            function sleepFor( sleepDuration ){
                var now = new Date().getTime();
                while(new Date().getTime() < now + sleepDuration){ /* do nothing */ } 
            }
            var connected = false;
                
        });
