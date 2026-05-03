# 项目 Docker 部署与数据库说明

本文档用于把“项目管理人才库”部署到服务器。当前 Docker 编排包含：

- `frontend`：Vue 静态资源，Nginx 对外提供页面，并把 `/api` 反向代理到后端。
- `backend`：Spring Boot Java 后端，容器内端口 `8080`。
- `mysql`：MySQL 8.4，自动初始化 `database/dajiangtang_dump.sql`。

> 重要说明：Docker 部署默认启用 `jdbc` profile，后端通过 Spring JDBC + HikariCP 连接 MySQL。首页招聘卡片、招聘列表和登录注册账号均读取数据库初始化数据，不使用前端静态岗位数据作为业务数据来源。

## 一、交付文件

本次新增的部署文件：

```text
docker-compose.yml
.env.example
backend/Dockerfile
frontend/Dockerfile
frontend/nginx.conf
database/schema.sql
database/seed.sql
database/dajiangtang_dump.sql
docs/docker-deployment.md
```

数据库文件说明：

- `database/schema.sql`：仅表结构。
- `database/seed.sql`：仅初始化数据。
- `database/dajiangtang_dump.sql`：表结构 + 初始化数据，Docker MySQL 首次启动时会自动导入这一份。

## 二、服务器环境准备

服务器建议：

- Linux 服务器，推荐 Ubuntu 22.04 / 24.04 或 CentOS 7+。
- 已安装 Docker 和 Docker Compose Plugin。
- 开放 Web 端口，默认 `80`。
- 如需远程直连 MySQL，开放 `3306` 或自定义数据库端口。

检查命令：

```bash
docker --version
docker compose version
```

Ubuntu 安装参考命令：

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

## 三、上传项目到服务器

方式一：直接拉 Git 仓库。

```bash
git clone https://github.com/HaoWinchester/dajiangtang.git
cd dajiangtang
git checkout 001-recruitment-list
```

方式二：本地打包上传。

```bash
tar --exclude=node_modules --exclude=dist --exclude=target --exclude=.git \
  -czf dajiangtang-deploy.tar.gz .

scp dajiangtang-deploy.tar.gz root@服务器IP:/opt/
ssh root@服务器IP
cd /opt
mkdir -p dajiangtang
tar -xzf dajiangtang-deploy.tar.gz -C dajiangtang
cd dajiangtang
```

## 四、配置环境变量

复制示例配置：

```bash
cp .env.example .env
```

编辑 `.env`：

```bash
vim .env
```

建议至少修改下面两项密码：

```dotenv
MYSQL_PASSWORD=请改成强密码
MYSQL_ROOT_PASSWORD=请改成更强的root密码
```

连接池可按服务器规格调整，默认值已经写在 `.env.example`：

```dotenv
SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE=10
SPRING_DATASOURCE_HIKARI_MINIMUM_IDLE=2
SPRING_DATASOURCE_HIKARI_CONNECTION_TIMEOUT=30000
SPRING_DATASOURCE_HIKARI_IDLE_TIMEOUT=600000
SPRING_DATASOURCE_HIKARI_MAX_LIFETIME=1800000
```

默认端口：

```dotenv
WEB_PUBLIC_PORT=80
MYSQL_PUBLIC_PORT=3306
```

如果服务器已有 Nginx 占用 80，可改成：

```dotenv
WEB_PUBLIC_PORT=8088
```

然后通过 `http://服务器IP:8088` 访问。

## 五、构建并启动

在项目根目录执行：

```bash
docker compose build
docker compose up -d
```

查看容器状态：

```bash
docker compose ps
```

查看日志：

```bash
docker compose logs -f frontend
docker compose logs -f backend
docker compose logs -f mysql
```

访问地址：

```text
http://服务器IP/
```

后端接口经过前端 Nginx 反代：

```text
http://服务器IP/api/home/recruitments
http://服务器IP/api/recruitments
```

## 六、登录账号

当前数据库初始化账号：

| 角色 | 用户名 | 密码 |
| --- | --- | --- |
| 管理员 | `admin` | `Admin@2026` |
| 普通用户 | `cspm_user` | `Cspm@2026` |
| 企业用户 | `cspm_company` | `Cspm@2026` |

数据库初始化脚本中也写入了同样的账号数据，密码为 SHA-256 哈希。

## 七、后端数据库与连接池

Docker Compose 中的 `backend` 服务设置了：

```yaml
SPRING_PROFILES_ACTIVE: jdbc
SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/dajiangtang?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true&useSSL=false
SPRING_DATASOURCE_USERNAME: dajiangtang
SPRING_DATASOURCE_PASSWORD: .env 里的 MYSQL_PASSWORD
```

连接池由 Spring Boot 默认的 HikariCP 提供，配置位于 `backend/src/main/resources/application-jdbc.yml`。客户服务器上不需要额外安装连接池软件，只需要保证 MySQL 容器正常、`.env` 密码一致即可。

## 八、数据库初始化与导入

首次启动 MySQL 容器时会自动执行：

```text
database/dajiangtang_dump.sql
```

如果容器已经启动过，MySQL 数据卷 `mysql-data` 已存在，Docker 不会再次自动执行初始化 SQL。

重新初始化数据库的方式：

```bash
docker compose down
docker volume rm dajiangtang_mysql-data
docker compose up -d mysql
```

手动导入完整 dump：

```bash
docker compose exec -T mysql sh -lc 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD"' < database/dajiangtang_dump.sql
```

只导入表结构和数据：

```bash
docker compose exec -T mysql sh -lc 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD"' < database/schema.sql
docker compose exec -T mysql sh -lc 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" dajiangtang' < database/seed.sql
```

## 九、数据库表结构与初始化数据

核心表说明：

| 表名 | 作用 | 当前初始化数据 |
| --- | --- | --- |
| `user_accounts` | 管理员、个人用户、企业用户登录注册账号 | 3 条账号 |
| `recruitments` | 首页招聘卡片、招聘信息列表的数据源 | 15 条岗位 |
| `companies` | 企业中心资料 | 2 条企业资料 |
| `talents` | 人才信息列表与详情基础资料 | 4 条人才资料 |
| `talent_certificates` | 人才资格证书 | 4 条证书 |
| `recruitment_applications` | 岗位申请记录 | 空表，等待用户提交 |
| `personal_profiles` | 学员基本信息 | 空表，等待用户维护 |
| `work_experiences` | 工作经历 | 空表 |
| `project_experiences` | 项目经历 | 空表 |
| `honors` | 获得荣誉 | 空表 |
| `education_experiences` | 教育经历 | 空表 |
| `qualification_certificates` | 资格证书维护 | 空表 |

首页读取 `GET /api/home/recruitments`，该接口从 `recruitments` 表取 `ACTIVE`、`RECRUITING` 状态且最新更新的前 5 条数据。展示字段对应关系：

| 首页字段 | 数据库字段 |
| --- | --- |
| 岗位 | `recruitments.position` |
| 薪资 | `recruitments.salary` |
| 公司名称 | `recruitments.company_name` |
| 城市 | `recruitments.city` |
| 负责人 | `recruitments.owner` |
| 需求人数 | `recruitments.headcount` |
| CSPM 优先 | `recruitments.cspm_preferred` |

检查数据库数据：

```bash
docker compose exec mysql sh -lc 'mysql --default-character-set=utf8mb4 -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" -e "SELECT id, position, company_name, city, owner, headcount, cspm_preferred, status FROM recruitments ORDER BY updated_at DESC LIMIT 5;"'
```

检查首页接口实际返回：

```bash
curl http://127.0.0.1/api/home/recruitments
```

## 十、导出数据库表和数据

在服务器上导出当前数据库：

```bash
docker compose exec mysql sh -lc 'mysqldump \
  -uroot -p"$MYSQL_ROOT_PASSWORD" \
  --databases dajiangtang \
  --default-character-set=utf8mb4 \
  --single-transaction' \
  > database/dajiangtang_export_$(date +%Y%m%d_%H%M%S).sql
```

只导出表结构：

```bash
docker compose exec mysql sh -lc 'mysqldump \
  -uroot -p"$MYSQL_ROOT_PASSWORD" \
  --no-data \
  --databases dajiangtang \
  --default-character-set=utf8mb4' \
  > database/dajiangtang_schema_$(date +%Y%m%d_%H%M%S).sql
```

只导出数据：

```bash
docker compose exec mysql sh -lc 'mysqldump \
  -uroot -p"$MYSQL_ROOT_PASSWORD" \
  --no-create-info \
  --databases dajiangtang \
  --default-character-set=utf8mb4' \
  > database/dajiangtang_data_$(date +%Y%m%d_%H%M%S).sql
```

## 十一、远程连接数据库

### 1. 服务器防火墙放行端口

如果使用 Ubuntu UFW：

```bash
sudo ufw allow 3306/tcp
sudo ufw reload
```

如果是云服务器，还需要在云厂商安全组里放行 `3306`。

生产环境更推荐只允许固定办公 IP 访问数据库，例如：

```bash
sudo ufw allow from 你的公网IP to any port 3306 proto tcp
```

### 2. 本地命令行连接

```bash
mysql -h 服务器IP -P 3306 -u dajiangtang -p dajiangtang
```

输入 `.env` 中的 `MYSQL_PASSWORD`。

### 3. Navicat / DBeaver 连接参数

```text
Host：服务器IP
Port：3306
Database：dajiangtang
Username：dajiangtang
Password：.env 里的 MYSQL_PASSWORD
Character Set：utf8mb4
```

### 4. 不开放 3306，使用 SSH 隧道连接

本地执行：

```bash
ssh -L 13306:127.0.0.1:3306 root@服务器IP
```

然后数据库客户端连接：

```text
Host：127.0.0.1
Port：13306
Database：dajiangtang
Username：dajiangtang
Password：.env 里的 MYSQL_PASSWORD
```

## 十二、常用运维命令

重启服务：

```bash
docker compose restart
```

停止服务：

```bash
docker compose down
```

更新代码后重新构建：

```bash
git pull
docker compose build
docker compose up -d
```

查看前端是否能访问后端。招聘列表接口需要登录角色标记，命令行可临时带 `X-User-Role`：

```bash
curl http://127.0.0.1/api/home/recruitments
curl -H 'X-User-Role: ADMIN' http://127.0.0.1/api/recruitments
```

如果 Web 端口不是 80：

```bash
curl -H 'X-User-Role: ADMIN' http://127.0.0.1:8088/api/recruitments
```

进入 MySQL：

```bash
docker compose exec mysql sh -lc 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" dajiangtang'
```

## 十三、打包 Docker 镜像为 tar

如果服务器不能联网拉基础镜像或不能直接构建，可以在本地构建后导出镜像：

```bash
docker compose build
docker save dajiangtang/frontend:latest dajiangtang/backend:latest mysql:8.4 \
  -o dajiangtang-images.tar
```

上传服务器：

```bash
scp dajiangtang-images.tar root@服务器IP:/opt/
```

服务器导入：

```bash
docker load -i /opt/dajiangtang-images.tar
cd /opt/dajiangtang
docker compose up -d
```

## 十四、注意事项

1. Docker 部署使用 MySQL 数据，首次初始化后如果修改了 `database/dajiangtang_dump.sql`，需要删除旧数据卷或手动导入，容器不会自动重复执行初始化脚本。
2. 不建议长期对公网开放 3306；优先使用安全组白名单或 SSH 隧道。
3. `.env` 不要提交到公开仓库，服务器上单独维护。
4. 本地开发默认 `app.persistence=memory`，方便不启动 MySQL 时跑单元测试；服务器 Docker 已通过 `SPRING_PROFILES_ACTIVE=jdbc` 切换到数据库模式。
5. 如果前端打开正常但接口失败，优先查看 `frontend/nginx.conf` 的 `/api/` 反代和 `backend` 容器日志。
