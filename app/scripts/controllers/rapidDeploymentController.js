angular.module('unetworkExplorer')
  .controller('rapidDeploymentCtrl', function ($rootScope, $scope, $http, $location, $sce) {


    var $wrap_compile = $('#compile')
    , $wrap_deploy = $('#deploy')
    , $show_ufg = $('#showufg')

    function updateFreeGasStatus(){
      var openUseFreeGasStatusCookieKey = 'oufgs'
      var openUseFreeGasStatus =  $.cookie(openUseFreeGasStatusCookieKey) === '1'
      var none1 = 'display: none;', none2 = ''
      if (openUseFreeGasStatus) {
        none2 = none1
        none1 = ''
      }
      var html = '<span style="color: #419641; '+none1+'">Use Free Gas</span><span style="'+none2+'">Spend UUU</span>'
      $show_ufg.html(html)
    }
    // $scope.use_free_gas_show = '<span style="color: #419641">Use Free Gas</span>'
    setInterval(updateFreeGasStatus, 999)
    setTimeout(updateFreeGasStatus, 1)


    var wrapShowSwapMark
    $scope.wrapShowSwap = function(){
      if (wrapShowSwapMark) {
        $wrap_compile.show()
        $wrap_deploy.hide()
        wrapShowSwapMark = 0
      }else{
        $wrap_compile.hide()
        $wrap_deploy.show()
        wrapShowSwapMark = 1
      }
    }


    function confirmDeployModal(trshash, callback){

      $scope.$apply(function(){
        $scope.confirmTrsHash = trshash
      })
      // alert('Generate Successfully')
      var confirmationModal = $('#deploymentConfirmationModal')
      confirmationModal.modal({backdrop: false})
      var progressBar = confirmationModal.find('.progress-bar')
      , miao = 13, sec = 1
      , itvl = setInterval( ()=>{
        var per = parseInt(sec/4/miao*100)+'%'
        progressBar.width(per)
        progressBar.text(per)
        if(sec >= miao*4){
          clearInterval(itvl)
          confirmationModal.modal('hide')
          // return location.reload()
          callback && callback()
        }
        sec ++
      }, 250 )
    }


    // setTimeout(function(){
    //   confirmDeployModal('0x22dedb29b04d126a115ff7c9293c1b171c362a6da75f25718deeab9bce416416')
    // })


    $scope.deployContract = function() {

      // confirmDeployModal('ausdhgu89374687rifuyagsiuy9q384', function(){})
      // return

      var param = {
        module: 'rapiddeployment',
        action: 'deploy',
        contractName: $scope.contract_name,
        contractAbi: $scope.contract_abi,
        contractByteCode: '0x' + $scope.contract_bytecode,
        gasLimit: $scope.gas_limit_set,
      }

      $.post('/papi', param, function (data, status){
        // console.log(data)
        // console.log(333)
        var res = data.result
        if(res.err){
          return alert('Deploy Contract Error: ' + res.msg)
        }

        confirmDeployModal(res.transactionHash, function(){

          $scope.contract_name = ''
          $scope.source_code = ''
          $scope.wrapShowSwap()

          // update show
          updateShowDeployments(function(){
            setTimeout(function(){
              $('#'+res.transactionHash).css({"background-color":"#ffd"})
            }, 200)
          })
        })



      })
  

      // alert('deployContract')


    }

    function updateShowDeployments(callback) {

      $.get('/api', {
        module: 'rapiddeployment',
        action: 'logs',
      }, function(data, status){
        var empty = $('ul.deployments').next()
        $scope.$apply(function(){
          // console.log(data.result)
          if(data && data.result && data.result.datas && data.result.datas.length>0){
            $scope.deployments = data.result.datas;
            empty.hide()
          }else{
            // $scope.minetks = []
            empty.show()
          }
          callback && callback()
        })
      })
    }

    updateShowDeployments()



    /////////////   TEST CODE   /////////////
    // $scope.contract_abi = '[]'
    // $scope.contract_bytecode = '6080604052348015600f57600080fd5b50603580601d6000396000f3fe6080604052600080fdfea165627a7a72305820f46b985ea26958a803035f7e1fca64c56f7db5d07c11e9d14a9c897d508120910029'
    // $scope.wrapShowSwap()
    /////////////      END      /////////////


    $scope.compileContract = function() {
      /*
      var modal = $('#rapidDeploymentModal')
      , sourceCode = modal.find('input.sourceCode').val()
      */


      var param = {
        module: 'rapiddeployment',
        action: 'compile',
        fileName: fileName,
        contractName: $scope.contract_name,
        sourceCode: $scope.source_code
      }
      // console.log(param)
      // console.log(2321)s
      // alert(112)
      $.post('/papi', param, function (data, status){
      //         console.log(data.result)
        // console.log(333)
        var res = data.result
        if(res.err){
          return alert('Compile Contract Error: ' + res.msg)
        }

        $scope.$apply(function(){
          $scope.contract_abi = res.abi
          $scope.contract_bytecode = res.bytecode
          $scope.wrapShowSwap()
        })
        // console.log(data.result)
        // alert(data.content)
        //         confirmGenerate()
      })      
    }






  })





const contractName = 'Ballot'

const fileName = 'test.sol'

const contractCode = `

contract Ballot {

    struct Voter {
        uint weight;
        bool voted;
        uint8 vote;
        address delegate;
    }
    struct Proposal {
        uint voteCount;
    }

    address chairperson;
    mapping(address => Voter) voters;
    Proposal[] proposals;

    /// Create a new ballot with $(_numProposals) different proposals.
    constructor(uint8 _numProposals) public {
        chairperson = msg.sender;
        voters[chairperson].weight = 1;
        proposals.length = _numProposals;
    }
    
    /// Give $(toVoter) the right to vote on this ballot.
    /// May only be called by $(chairperson).
    function giveRightToVote(address toVoter) public {
        if (msg.sender != chairperson || voters[toVoter].voted) return;
        voters[toVoter].weight = 1;
    }

    /// Delegate your vote to the voter $(to).
    function delegate(address to) public {
        Voter storage sender = voters[msg.sender]; // assigns reference
        if (sender.voted) return;
        while (voters[to].delegate != address(0) && voters[to].delegate != msg.sender)
            to = voters[to].delegate;
        if (to == msg.sender) return;
        sender.voted = true;
        sender.delegate = to;
        Voter storage delegateTo = voters[to];
        if (delegateTo.voted)
            proposals[delegateTo.vote].voteCount += sender.weight;
        else
            delegateTo.weight += sender.weight;
    }

    /// Give a single vote to proposal $(toProposal).
    function vote(uint8 toProposal) public {
        Voter storage sender = voters[msg.sender];
        if (sender.voted || toProposal >= proposals.length) return;
        sender.voted = true;
        sender.vote = toProposal;
        proposals[toProposal].voteCount += sender.weight;
    }

    function winningProposal() public view returns (uint8 _winningProposal) {
        uint256 winningVoteCount = 0;
        for (uint8 prop = 0; prop < proposals.length; prop++)
            if (proposals[prop].voteCount > winningVoteCount) {
                winningVoteCount = proposals[prop].voteCount;
                _winningProposal = prop;
            }
    }
}

`