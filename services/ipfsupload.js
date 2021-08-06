const mkdirp = require("mkdirp");
const fs = require("fs");

const exec = require('child_process').execSync;


const istest = false;

module.exports = ($scope) => {
//   web3 = $scope.web3


  return {

    uploadfile: function (query, cb) {

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


    catfile: function (query, cb, req, res) {
      if (!query.refpath) {
        return cb("refpath must.")
      }

      try {

        let filename = query.refpath.split('/')[1]
        let tyarys = filename.split('.')
        let ty = tyarys[tyarys.length - 1].toLowerCase()
        let filetmp = readFileFromIPFS(query.refpath)
        let types = {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'gif': 'image/gif',
        }
        var stats = fs.statSync(filetmp);
        if (stats.isFile()) {
          let headers = {
            'Content-Type': types[ty] ? types[ty] : 'application/octet-stream',
            'Content-Length': stats.size
          }
          if (query.download) {
            headers['Content-Disposition'] = 'attachment; filename=' + filename;
          }
          res.set(headers);
          fs.createReadStream(filetmp).pipe(res);
        } else {
          return cb("not find.")
        }

      } catch (error) {
        return cb(error.toString());
      }

    },

  }
}


// 保存文件至 ipfs 本地节点
// 返回文件 ref/name
function addFileToIPFS(file) {
  if (istest) {
    return "QmdSsQpZSAXXCaK4rNRTnr3NDZiDteNjdnR1YgVBbHM4Lc/test.png"
  }
  let cmdretstr = exec('ipfs add ' + file.path);
  let fileref = cmdretstr.toString("utf8").trim().split(' ')[1]
  // console.log(fileref);
  let filename = Math.ceil(Math.random() * 10000 * 10000 * 10000) + ''
  let ffs = file.name.split('.')
  if (ffs.length > 1) {
    filename += '.' + ffs[ffs.length - 1]
  }
  return fileref + '/' + filename
}


// 从 ipfs 节点读取文件
// QmdSsQpZSAXXCaK4rNRTnr3NDZiDteNjdnR1YgVBbHM4Lc/59c488531093d.jpg
function readFileFromIPFS(refpath) {
  if (istest) {
    return "/tmp/test.png"
  }
  let arys = refpath.split('/')
  let tmpfile = '/tmp/' + arys[1]
  exec('ipfs get ' + arys[0] + ' -o ' + tmpfile);
  // 定时删除文件
  setTimeout(function () {
    fs.unlink(tmpfile)
  }, 1000 * 60 * 5)
  return tmpfile;
}









