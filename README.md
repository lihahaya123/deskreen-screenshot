# Deskreen CE：局域网按需屏幕截图分支

本仓库基于 Deskreen CE 修改，目前的核心用途是：在同一局域网内，通过手机、平板或另一台电脑的浏览器，按需获取运行端电脑的当前屏幕或窗口截图。

这不是上游 Deskreen 的原始实时第二屏实现。当前分支已经移除实时视频播放、视频质量控制、码率调整和持续画面传输，仅保留设备连接、授权、截图源选择、连接状态通信和按按钮截图。

## 当前功能

- 在电脑端显示局域网访问网址和二维码。
- 访问网址不再包含一次性的房间路径；局域网 IP 不变时可重复使用同一网址。
- 首次连接时由电脑端确认设备，并选择要截图的整个屏幕或应用窗口。
- 网页端点击“获取当前画面”后，电脑端才捕获并返回一张 JPEG 图片。
- 不持续传输桌面视频，也不定时获取截图。
- 同一个已授权浏览器意外断开后，在电脑程序保持运行的前提下，可以重新进入原网址并自动恢复所选截图源。
- 当前只允许一个浏览器设备占用查看连接。
- Electron 辅助渲染窗口默认隐藏。
- Windows 主窗口最小化后隐藏到系统托盘，托盘使用黑白相机图标。
- 已删除桌面首页中的 Deskreen Pro 广告。

## 与上游版本的主要区别

| 项目 | 当前分支 |
| --- | --- |
| 画面传输 | 用户点击按钮时返回一张截图 |
| 实时视频 | 已移除 |
| 访问网址 | 使用固定的局域网根网址 |
| 首次连接 | 电脑端确认并选择截图源 |
| 意外断开 | 同一浏览器可在本次程序运行期间免确认重连 |
| 同时连接数 | 1 个查看设备 |
| 后台表现 | 主窗口可最小化到系统托盘 |
| Pro 广告 | 已删除 |

## 连接与截图流程

1. 确保电脑和查看设备连接到同一个局域网。
2. 在电脑上启动本程序。
3. 使用查看设备扫描二维码，或输入电脑端显示的网址。
4. 首次连接时，在电脑端确认该设备。
5. 在电脑端选择整个屏幕或一个应用窗口。
6. 网页进入“按需屏幕截图”页面。
7. 点击“获取当前画面”，获取最新的一张 JPEG 截图。

截图接口要求当前浏览器已经获得电脑端授权。常见接口状态：

- `403`：当前浏览器未获得授权。
- `409`：电脑端尚未选择截图源。
- `404`：原先选择的屏幕或窗口当前不可用。

## 访问地址和端口

开发模式和打包版本使用的查看地址不同：

| 模式 | 浏览器访问地址 | 用途 |
| --- | --- | --- |
| 开发模式 | `http://<局域网IP>:5174/` | Vite 网页开发服务器 |
| 开发模式 | `http://127.0.0.1:3131` | 截图 API 和 Socket.IO，由 5174 代理访问 |
| 打包版本 | `http://<局域网IP>:3131/` | 网页、截图 API 和 Socket.IO |

电脑端界面会自动显示当前模式下应使用的网址。不要在开发模式下直接把手机连接到 `3131`；开发模式应使用界面显示的 `5174` 地址。

这里的“固定网址”指网址不再随连接房间变化。电脑的局域网 IP 如果因 DHCP、切换 Wi-Fi 或更换网卡而变化，网址中的 IP 仍会变化。若需要长期固定，应在路由器中为电脑设置 DHCP 地址保留，或给电脑配置固定局域网 IP。

可以通过参数指定界面和二维码使用的局域网地址：

```powershell
& 'C:\Program Files\Deskreen CE\Deskreen CE.exe' --ip 192.168.31.68
```

也可以使用 `--local-ip`：

```powershell
& 'C:\Program Files\Deskreen CE\Deskreen CE.exe' --local-ip 192.168.31.68
```

该参数只选择程序公布给查看设备的地址，不会修改 Windows 或路由器的网络配置。

## 免确认重连的边界

免确认重连目前是运行期信任，不是永久授权：

- 同一个浏览器需要保留本地存储中的查看设备 ID。
- 电脑端程序必须保持运行。
- 用户不能在电脑端主动断开并忘记该设备。
- 原先选择的屏幕或窗口必须仍然存在。
- 重启电脑端程序后，需要重新确认设备并选择截图源。
- 清除手机浏览器网站数据、使用无痕模式或更换浏览器后，会被识别为新设备。

## 环境要求

当前分支主要在 Windows 和以下开发环境中验证：

- Node.js `23.11.0`
- npm `11.3.0`
- Electron `37.x`
- Vite `7.x`

项目仍保留 macOS 和 Linux 的构建目标，但当前定制功能主要按 Windows 行为进行测试。

## 安装依赖

必须分别安装根项目和网页查看端的依赖。从项目根目录执行：

```powershell
Set-Location E:\toolcode\deskreen-screenshot
npm ci

Push-Location .\src\client-viewer
npm ci
Pop-Location
```

如果已经位于 `src\client-viewer`，不要再次执行 `Push-Location .\src\client-viewer`，应先回到项目根目录。

在国内网络下可以使用镜像：

```powershell
npm config set registry https://registry.npmmirror.com
$env:ELECTRON_MIRROR = 'https://npmmirror.com/mirrors/electron/'
```

若安装 Electron 时出现 `ECONNRESET`，通常是下载被中断。设置镜像后重新执行根目录的 `npm ci`。

## 开发运行

从项目根目录执行：

```powershell
npm run dev
```

该命令会同时启动：

- Electron 主进程和电脑端界面。
- `5174` 端口上的网页查看端。
- `3131` 端口上的信令和截图服务。

首次启动或依赖锁文件发生变化时，Vite 可能重新优化依赖。

如果启动日志中先出现一次：

```text
http proxy error: /socket.io/...
Error: connect ECONNREFUSED 127.0.0.1:3131
```

随后马上出现：

```text
signaling server is online at port 3131
```

这是网页端比信令服务器稍早启动造成的一次性时序提示。Socket.IO 会自动重试；连接和截图正常时无需处理。如果服务器启动后仍持续出现该错误，才需要检查端口占用或服务启动失败。

## 构建检查

仅构建应用资源并执行全部类型检查：

```powershell
npm run build
```

构建成功不等于已经生成 Windows 安装包或 EXE。

## 生成 Windows 程序

生成 Windows portable EXE 和 MSI：

```powershell
npm run build:win
```

生成未打包目录，便于本机验证：

```powershell
npm run build:unpack
```

输出默认位于 `dist` 目录。当前名称配置下，未打包程序通常位于：

```text
dist\win-unpacked\Deskreen CE.exe
```

Windows 构建目标由 `electron-builder.yml` 配置，目前包括：

- `portable`
- `msi`

当前构建配置仍包含上游项目的 Azure 签名参数。本机没有对应签名账号或证书时，正式打包可能在签名阶段失败；本地无签名构建需要暂时移除或禁用 `win.azureSignOptions`，不能使用上游的签名身份发布此分支。

## 常用脚本

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 启动 Electron、网页查看端和截图服务 |
| `npm run typecheck` | 检查客户端、主进程和桌面渲染层 TypeScript |
| `npm run buildClientViewer` | 构建网页查看端 |
| `npm run build` | 类型检查并构建全部应用资源 |
| `npm run build:unpack` | 生成 Windows 未打包目录 |
| `npm run build:win` | 生成 Windows portable 和 MSI |

## 常见问题

### 手机访问 `3131` 只显示 `{"ready":true}`

表示信令服务已经运行，但找不到网页查看端构建产物。开发模式请访问电脑端显示的 `5174` 地址；打包或生产模式请先执行：

```powershell
npm run buildClientViewer
```

### 手机完全打不开网址

检查：

- 手机和电脑是否在同一 Wi-Fi 或局域网。
- 是否使用电脑 Wi-Fi 网卡的 IPv4 地址，而不是虚拟网卡地址。
- Windows 防火墙是否允许本程序访问专用网络。
- 开发模式下是否允许 TCP `5174` 和 `3131`。
- 路由器是否启用了 AP 隔离或访客网络隔离。

### `Source is not capturable`

Electron 在枚举或获取某个暂时不可用的屏幕/窗口时可能输出该提示。偶尔出现一次且截图正常时可以忽略；如果持续出现并伴随空白截图，应在电脑端重新选择仍然存在的屏幕或窗口。

### 只能连接一个设备

这是当前实现的明确限制。第一个设备占用查看槽位后，其他设备不能建立查看连接，直到当前设备断开并释放槽位。

### 关闭和最小化行为

- 在 Windows 上最小化主窗口会隐藏到系统托盘。
- 点击托盘相机图标会恢复主窗口。
- 关闭主窗口会退出程序，不等同于最小化到托盘。

## 安全与隐私

- 当前服务使用局域网 HTTP，不提供 HTTPS。
- 不要将 `3131` 或 `5174` 端口映射到公网。
- 未知浏览器首次连接仍需要电脑端确认。
- 截图只在已授权网页点击按钮时生成，不进行持续桌面录制或视频传输。
- 网页请求携带本地保存的查看设备 ID，用于判断是否已经授权。
- 开发环境未配置 `VITE_CLIENT_VIEWER_GA_TAG` 时不会使用有效的 Google Analytics 标签。

## 当前已知遗留项

- 软件名称、部分菜单和内部符号仍沿用 Deskreen CE，暂未进行整体改名。
- 自动版本检查仍读取上游 Deskreen 发布信息，下载和教程入口仍指向上游网站。
- 不应使用上游更新安装包直接覆盖当前定制版本，否则本分支修改会丢失。
- 部分旧多语言翻译词条仍保留，但已经没有对应的实时视频或 Pro 广告运行入口。
- 构建时仍可能出现大于 500 kB 的分包提示以及主进程混合导出提示，目前不影响运行。

## 主要目录

```text
src/main/           Electron 主进程、窗口、托盘和 IPC
src/renderer/       电脑端操作界面
src/client-viewer/  手机或其他设备访问的网页端
src/server/         HTTP、截图 API 和 Socket.IO 服务
src/features/       设备连接、截图源和会话服务
resources/          运行时图标等资源
build/              electron-builder 构建资源
scripts/            版本和相机图标生成脚本
```

## 上游项目与许可证

本项目基于开源项目 [Deskreen](https://github.com/pavlobu/deskreen) 修改。

Deskreen 原项目及本仓库继承部分适用 GNU Affero General Public License v3.0，详细条款见 [LICENSE](./LICENSE)。重新分发修改版本时，应保留许可证和上游版权声明，并按照 AGPL-3.0 的要求提供对应源代码。

本项目同时使用 Electron、React、Vite、electron-builder、Blueprint、simple-peer 等第三方开源组件，其许可证以各依赖包内的声明为准。
