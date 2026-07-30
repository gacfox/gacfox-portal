# Gacfox Portal

轻量级导航门户，使用 React + Go 构建。

## 功能

- 🔐 首次启动初始化管理员账号，输入用户名、密码登录
- ✏️ 编辑模式：增删改/排序分类与书签、管理小组件、修改站点设置
- 🖼️ 图标与背景图支持本地上传
- 🎨 明亮/暗色主题、响应式布局
- 🧩 小组件：时钟、天气、GitHub Trending、当季番剧、Steam 愿望单
- 📦 单可执行文件分发

## 项目结构

```
gacfox-portal/
├── cmd/server/main.go        # 服务端入口
├── config/                             # 项目配置文件
├── frontend/                         # React 前端
├── internal/                           # Go 服务端
       ├── auth/                         # JWT 签发/验证
       ├── config/                      # 配置加载
       ├── database/                 # GORM 初始化
       ├── handler/                    # API 处理器
       ├── helper/                      # 通用响应工具
       ├── middleware/             # JWT 鉴权中间件
       ├── model/                     # 数据模型
       └── router/                     # 路由与 SPA 静态资源
├── embed_static.go             # 生产构建
└── embed_static_debug.go     # 开发环境构建 -tags dev
```

## 开发环境启动

```bash
# 终端 1：启动服务端（:8080）
go build -tags dev -o ./bin/server ./cmd/server/ && ./bin/server

# 终端 2：启动前端（:5173，/api 与 /uploads 由 vite 代理到 :8080）
cd frontend && npm install && npm run dev
```

## 生产构建

```bash
cd frontend && npm run build && cd ..
go build -o ./bin/server ./cmd/server/
./bin/server
```

运行时数据（SQLite `gacfox.db`、上传文件、JWT 密钥）写入可执行文件旁的 `data/` 目录（可在配置文件中修改 `data_dir`）。

## 配置

`config/config.prod.yaml`（默认）或 `-config` 指定其他文件：

| 字段               | 说明                                               | 默认         |
| ------------------ | -------------------------------------------------- | ------------ |
| `server.port`      | 监听端口                                           | 8080         |
| `data_dir`         | 数据目录                                           | `./data`     |
| `jwt.secret`       | JWT 密钥，留空自动生成并持久化到 `data/jwt_secret` | 空           |
| `jwt.expire_hours` | 令牌有效期（小时）                                 | 720（30 天） |
| `gin_mode`         | `debug` / `release`                                | release      |
