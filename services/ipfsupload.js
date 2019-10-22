
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


    catfile: function(query, cb, req, res){
        if( !query.refpath ){
            return cb("refpath must.")
        }

        try {

            let filename = query.refpath.split('/')[1]
            let tyarys = filename.split('.')
            let ty = tyarys[tyarys.length-1].toLowerCase()
            let filebuf = readFileFromIPFS(query.refpath) 
            let types = {
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg',
                'png': 'image/png',
                'gif': 'image/gif',
            }
            let headers = {
                'Content-Type': types[ty] ? types[ty] : 'application/octet-stream',
                'Content-Length': filebuf.length,
            }
            if(query.download){
                headers['Content-Disposition'] = 'attachment; filename='+filename;
            }
            res.set(headers);
            res.end(filebuf)

        } catch (error) {
            return cb(error.toString());
        }

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
// QmdSsQpZSAXXCaK4rNRTnr3NDZiDteNjdnR1YgVBbHM4Lc/59c488531093d.jpg
function readFileFromIPFS(refpath) {
    return exec('ipfs cat '+refpath.split('/')[0]);
}








