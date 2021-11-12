/**

 *Created by zzl on 2017/1/8.

 */
const restart_timeout = 60 * 60;

const fork = require('child_process').fork;

//保存被子进程实例数组
const workers = [];

//这里的被子进程理论上可以无限多
const appsPath = ['./server.js'];

const createWorker = function (appPath) {
  //保存fork返回的进程实例
  const worker = fork(appPath);

  setTimeout(() => {
    worker.kill() // 定时自动重启
  }, restart_timeout * 1000)

  //监听子进程exit事件
  worker.on('exit', function () {
    console.log('worker: ' + worker.pid + ' exited');
    delete workers[worker.pid];
    createWorker(appPath);
  });

  workers[worker.pid] = worker;
  console.log('Create worker:' + worker.pid);
};

//启动所有子进程
for (let i = appsPath.length - 1; i >= 0; i--) {
　　createWorker(appsPath[i]);
}

//父进程退出时杀死所有子进程
process.on('exit',function(){
　　 for(const pid in workers){
　　　　workers[pid].kill();
　　}
});
