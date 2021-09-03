# node.js + express + docker + mysql + jwt 实现用户管理restful api

## run

```
npm install
```

create mysql docker container

```
mkdir data

docker run -v "$PWD/data":/var/lib/mysql --name dev-mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=123456 -d mysql:5.7

# 将sql文件拷贝进容器内
docker cp $PWD/database.sql [containerId]:/database.sql
# 进入容器内
docker exec -it [containerId] bin/bash
# 连接mysql 输入密码
mysql -u root -p
# 显示所有数据数据库
show databases;
# 创建数据库
create database `node-app`;
# 使用数据库
use `node-app`;
# 导入数据表
source /database.sql;
# 退出mysql
exit;
# 退出容器
exit;
```

```
npm start
```

## use

```
POST - http://localhost:3000/api/register

POST - http://localhost:3000/api/login

POST - http://localhost:3000/api/get-user
```