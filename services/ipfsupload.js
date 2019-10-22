
const mkdirp = require("mkdirp");
const fs = require("fs");

var exec = require('child_process').execSync;


module.exports = ($scope) => {
//   web3 = $scope.web3


  return {

    uploadfile: function(query, cb){
        
        // console.log(query)
        try {
            let file = query.files.file
            let ref_name = addFileToIPFS(file) 
            return cb(null, {
                ref_name: ref_name,
            });
        } catch (error) {
            return cb(error.toString());
        }
    },


    catfile: function(query, cb){


    },

  }
}






// 保存文件至 ipfs 本地节点
// 返回文件 ref/name
function addFileToIPFS(file) {
    let cmdretstr = exec('ipfs add '+file.path);
    let fileref = cmdretstr.toString("utf8").trim().split(' ')[1]
    // console.log(fileref);
    return fileref+'/'+file.name
}



// 从 ipfs 节点读取文件
function readFileFromIPFS(ref) {
    return exec('ipfs cat '+ref);
}









