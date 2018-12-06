##
# root 账户部署钱包浏览器
# 环境依赖： 1. 安装 git 最新版，
#          2. g++11 编译器
#          2. 安装 node 10.xx.x  或者通过 nvm 安装 
##



mkdir -p /home/wwwroot/
chmod 777 -R /home/wwwroot
cd /home/wwwroot/
git clone https://github.com/U-Network/explorer.git
cd explorer
npm install

# 修改 配置文件 的 ipc文件路径  和  rpc 链接端口
vim app/config.json

# 启动后  访问 http://xxx.xxx.xxx.xxx:8000
npm start


#-------------------#


# 安装 nvm 后安装 node，  ## 项目主页：https://github.com/creationix/nvm


curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash

export NVM_DIR="${XDG_CONFIG_HOME/:-$HOME/.}nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm


nvm install node
nvm use node