angular.module('unetworkExplorer')
  .controller('rapidDeploymentCtrl', function ($rootScope, $scope, $http, $location) {


    var $wrap_compile = $('#compile')
    , $wrap_deploy = $('#deploy')

    function updateFreeGasStatus(){
      var openUseFreeGasStatusCookieKey = 'oufgs'
      var openUseFreeGasStatus =  $.cookie(openUseFreeGasStatusCookieKey) === '1'
      $scope.$apply(function(){
        $scope.use_free_gas_status = openUseFreeGasStatus
      })
    }
    setInterval(updateFreeGasStatus, 999)
    updateFreeGasStatus()


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


    $scope.deployContract = function() {

      var param = {
        module: 'rapidDeployment',
        action: 'compile',
        fileName: deploy,
        contractAbi: $scope.contract_abi,
        contractCode: $scope.contract_code
      }

      alert('deployContract')


    }


    $scope.compileContract = function() {
      /*
      var modal = $('#rapidDeploymentModal')
      , sourceCode = modal.find('input.sourceCode').val()
      */

      var param = {
        module: 'rapidDeployment',
        action: 'compile',
        fileName: fileName,
        contractName: $scope.contract_name,
        sourceCode: $scope.source_code
      }
      // console.log(param)
      // console.log(2321)s
      //alert(112)
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