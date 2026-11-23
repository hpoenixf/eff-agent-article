---
title: "从零上线 Open ETF Agent：把研究工作台部署到自己的服务器"
description: "用一台 Linux 服务器、一个 systemd 服务和一条 SSH 隧道运行 Open ETF Agent。先用离线示例验证提问和历史回读，再按需接入自己的模型账户；整个过程不暴露应用端口。"
readingBrief:
  takeaways:
    - "固定一个公开版本，先让离线工作台在服务器上运行，再启用真实模型。"
    - "SSH 隧道允许自己的浏览器访问远程工作台，同时让应用继续只监听回环地址。"
    - "将源码、可写工作区、启动配置和模型密钥分开，升级代码不会替换会话历史。"
    - "验收不仅要看服务健康，还要从浏览器提交任务，再重开历史查看原报告。"
  appliesTo:
    - "有 Ubuntu 24.04 或兼容 Linux 服务器、能通过 SSH 登录，准备给自己部署研究工作台的读者。"
  notFor:
    - "需要开放注册、团队共享账号、公司单点登录或公网多租户部署的读者。"
---

# 从零上线 Open ETF Agent：把研究工作台部署到自己的服务器

<LearningPathNav />

第一次部署 Agent，我建议不要从域名、账号体系和付费模型同时开始。先把一个问题从自己的浏览器送到服务器，拿到一份报告，再重启服务后从历史打开它。做到这里，安装、入口、界面、运行和数据落盘才是同一条走通过的链路。接真实模型只需要改变这一条链上的一个环节。

本文固定使用 [Open ETF Agent v0.41.0](https://github.com/hpoenixf/open-etf-agent/releases/tag/v0.41.0)。这是按公开源码和[该版本发布说明](https://github.com/hpoenixf/open-etf-agent/blob/v0.41.0/docs/verification/v041-release-candidate.md)整理的自建步骤，不代表本文中的每条安装命令都在读者的机器上运行过。本教程里的「上线」指服务在自己的机器上常驻，自己能远程访问，不是把这个单人工作台公开给访客。

## 1. 在服务器准备 Node 和固定源码

需要一台可以 SSH 登录、自己能使用 `sudo` 的 Linux 服务器。下面以 Ubuntu 24.04 为例。你的 SSH 服务应当已经能正常使用，优先使用密钥登录；首次连接时先通过服务器控制台等可信渠道核对主机指纹。**不需要给应用开放防火墙端口，也不需要购买域名。**

先装基本工具。在服务器用普通操作账号运行：

```bash
sudo apt-get update
sudo apt-get install -y git ca-certificates curl xz-utils iproute2
```

该版本的 [package.json](https://github.com/hpoenixf/open-etf-agent/blob/v0.41.0/package.json) 要求 Node.js **26.8.1 至 26.x**。从 [Node.js 官方下载页](https://nodejs.org/en/download) 选择这一范围内的固定版本，取与你的服务器架构相符的 Linux 二进制包。项目的验证环境使用的是 Node.js 26.11.1；如果采用该版本，`uname -m` 输出 `x86_64` 时选 `linux-x64`，输出 `aarch64` 时选 `linux-arm64`。用同一官方发行目录的 `SHASUMS256.txt` 核对下载文件，目录提供签名校验时按官方说明验证。不要用名字相同的第三方重打包。

在普通账号的目录中解压。下面以 **x64 文件名为例**，ARM 机器把下面出现的文件名中的 `x64` 换成 `arm64`：

```bash
grep -F '  node-v26.11.1-linux-x64.tar.xz' SHASUMS256.txt | sha256sum --check --strict
tar -xJf node-v26.11.1-linux-x64.tar.xz
sudo install -d -m 0755 /opt/node26 /opt/open-etf-agent
sudo cp -a node-v26.11.1-linux-x64/. /opt/node26/
sudo chown -R root:root /opt/node26
export PATH="/opt/node26/bin:$PATH"
node --version
npm --version
```

拉取固定标签，不直接部署随时会变化的 `main`。装包和构建仍用普通账号：

```bash
git clone --depth 1 --branch v0.41.0 \
  https://github.com/hpoenixf/open-etf-agent.git open-etf-agent-v041
cd open-etf-agent-v041
git describe --tags --exact-match
git rev-parse HEAD
npm ci --ignore-scripts --no-audit --no-fund
npm run build
```

这里你应看到 `v0.41.0` 和提交 `83bd684ea089cd17eebe652084acca679f87a56d`。安装需要访问 npm，接下来跑离线示例不需要提供模型密钥。以全新目标目录为前提，把应用移入服务目录，不要覆盖已有部署：

```bash
test ! -e /opt/open-etf-agent/app
sudo cp -a . /opt/open-etf-agent/app
sudo chown -R root:root /opt/open-etf-agent/app
sudo useradd --system --user-group --no-create-home \
  --shell /usr/sbin/nologin openetf
```

若已存在同名用户或目录，先核对它是否为此应用专用，不要直接复用其他服务的账号或状态。

## 2. 先运行离线工作台

保存下面内容为本机的 `/etc/systemd/system/open-etf-agent.service`，可用 `sudoedit` 新建。这里的 `--project` 是应用自己的数据目录，不是代码目录。在第一次启动前，让 `/var/lib/open-etf-agent/offline` 保持不存在，由应用创建工作区。

```ini
[Unit]
Description=Open ETF Agent research workbench
After=network.target

[Service]
Type=simple
User=openetf
Group=openetf
WorkingDirectory=/opt/open-etf-agent/app
StateDirectory=open-etf-agent
StateDirectoryMode=0700
UMask=0077
NoNewPrivileges=yes
ProtectSystem=strict
ProtectHome=yes
PrivateTmp=yes
ExecStart=/opt/node26/bin/node /opt/open-etf-agent/app/src/gui-cli.mjs --project /var/lib/open-etf-agent/offline --port 4179
Restart=on-failure
RestartSec=3

[Install]
WantedBy=multi-user.target
```

这个 `ExecStart` 直接调用固定版中 `npm run gui` 所用的 [GUI 启动入口](https://github.com/hpoenixf/open-etf-agent/blob/v0.41.0/src/gui-cli.mjs)。借助 [systemd 的 StateDirectory](https://www.freedesktop.org/software/systemd/man/latest/systemd.exec.html#StateDirectory=)，应用只把持久状态写在自己的目录里；重启时不需要重新复制数据。

```bash
sudo systemd-analyze verify /etc/systemd/system/open-etf-agent.service
sudo systemctl daemon-reload
sudo systemctl enable --now open-etf-agent.service
sudo systemctl is-active open-etf-agent.service
ss -ltn 'sport = :4179'
curl --fail --silent --show-error \
  --output /dev/null --write-out 'HTTP %{http_code}\n' http://127.0.0.1:4179/
```

期望服务为 `active`，端口显示 `127.0.0.1:4179`，本机 HTTP 返回 200。如果地址是 `0.0.0.0` 或其他外部地址，先停下排查，不要继续。工作台自身没有公网鉴权；同台机器上能访问本机端口的其他进程也能尝试访问它，因此这条路径面向你能信任的单人服务器，不适合共享主机。

## 3. 用自己的浏览器打开，不开放应用端口

回到**你的电脑**，不是服务器，执行：

```bash
ssh -NT -o ExitOnForwardFailure=yes \
  -L 127.0.0.1:4179:127.0.0.1:4179 \
  your-ssh-user@your-server
```

把最后一项换成你的 SSH 用户和服务器地址。只将端口绑定在自己电脑的回环地址；保持这个终端运行。然后在本机浏览器打开 **`http://127.0.0.1:4179/`**。关于隧道的参数见 [OpenSSH 的 `-L` 手册](https://man.openbsd.org/ssh#L)。

这里本地和服务器使用**同一个端口**是有意为之。[该版 GUI](https://github.com/hpoenixf/open-etf-agent/blob/v0.41.0/src/gui-server.mjs) 检查请求的 Host，写请求还需要与监听地址一致的 Origin。SSH 隧道只转发 TCP，不改 HTTP 头。如果浏览器地址换成 `localhost:4179`，或者选择了不同的本地端口，首页或提交就可能遇到 `GUI_ORIGIN_REQUIRED`。本机 4179 被占用时，选一个空闲端口，**同时**改服务的 `--port`、隧道两端和浏览器地址，不要关闭 Origin 检查来解决。

页面打开后，选择一份自带演练资料，提交「这份资料说了什么？」一类的简单问题。验收有三个动作：

1. 页面出现一份完成的演练报告，能打开来源；离线示例不需要真实模型。
2. 刷新页面或从历史重新打开，原问题和报告仍在，不启动另一条研究。
3. 在服务器执行 `sudo systemctl restart open-etf-agent.service`，再从同一浏览器回读刚才的报告。这样验证的是持久工作区，不只是当前进程还记得上一轮。

失败时看 `sudo journalctl -u open-etf-agent.service -n 40 --no-pager`。先核对端口是否绑定、Node 版本是否正确、运行账号能否写自己的数据目录，再看网页报错。不要公开粘贴未脱敏的日志。**curl 200 只能证明页面能响应，不能替代浏览器里的提交、回读和重启检查。**

## 4. 可选：用自己的模型账户生成答案

离线能用就先停在这里也可以。想发真实请求时，核对提供商允许你的用法、地区和账户，以及账单、资料留存和额外收费设置。不要把任何个人资料当作第一条测试输入。

[固定版真实模型说明](https://github.com/hpoenixf/open-etf-agent/blob/v0.41.0/docs/local-gui-live.md) 提供了直连 DeepSeek 和 OpenCode Go 等配置。以下用该版本明确识别的 **DeepSeek 直连 Flash** 为例，配置不放密钥；这个配置的模型与接口以固定版为准，不代表该服务在你的地区或账户一定可用。其工具调用用法见 [DeepSeek 官方文档](https://api-docs.deepseek.com/guides/tool_calls/)。若选 OpenCode Go，按[官方 Go 指南](https://opencode.ai/docs/console/go/)和固定版文档核对你有权使用的模型；Go 账户持有人模式发送即可能消耗额度，不要共用订阅或绕开服务商拒绝。

先创建配置目录：

```bash
sudo install -d -o root -g openetf -m 0750 /etc/open-etf-agent
```

将以下内容保存为 `/etc/open-etf-agent/live.json`，设为 `root:openetf`、权限 `0640`：

```json
{
  "gateway": {
    "provider": "deepseek-direct",
    "endpoint": "https://api.deepseek.com/chat/completions",
    "model": "deepseek-flash",
    "apiKeyEnv": "ETF_GUI_PROVIDER_KEY"
  },
  "limits": {
    "model": 4,
    "timeoutMs": 120000
  }
}
```

密钥只通过服务器的一次隐藏输入写入 root 私有文件。不在 SSH 命令参数、JSON、仓库、聊天、shell 历史中粘贴，不用 `echo key`。以下初始化会拒绝覆盖已有凭据。运行命令后，等看到提示再粘贴密钥：

```bash
sudo bash -c '
  set -eu
  umask 077
  dir=/etc/open-etf-agent
  test ! -e "$dir/provider.key"
  IFS= read -r -s -p "Provider key: " key < /dev/tty
  printf "\n" >&2
  test -n "$key"
  set -o noclobber
  printf "%s\n" "$key" > "$dir/provider.key"
  unset key
'
sudo stat -c '%U:%G %a %n' /etc/open-etf-agent/provider.key
```

期望凭据归 `root:root` 所有、权限 `600`。创建下面的启动脚本 `/opt/open-etf-agent/start-live.sh`，用 root 所有、0755 安装。它从 systemd 为此进程提供的凭据文件读取密钥；应用按自己的契约从环境变量取值。不打印该变量，不给脚本加 `set -x`。

```bash
#!/bin/bash
set -eu
: "${CREDENTIALS_DIRECTORY:?No service credentials}"
export ETF_GUI_PROVIDER_KEY="$(< "$CREDENTIALS_DIRECTORY/provider.key")"
test -n "$ETF_GUI_PROVIDER_KEY"
exec /opt/node26/bin/node /opt/open-etf-agent/app/src/gui-cli.mjs \
  --project /var/lib/open-etf-agent/live --port 4179 \
  --live-config /etc/open-etf-agent/live.json
```

创建一个**只用于模型开关**的 systemd 配置片段，不改原离线服务。先建目录，再用 `sudoedit` 保存至 `/etc/systemd/system/open-etf-agent.service.d/10-live.conf`：

```bash
sudo install -d -m 0755 /etc/systemd/system/open-etf-agent.service.d
```

```ini
[Service]
LoadCredential=provider.key:/etc/open-etf-agent/provider.key
ExecStart=
ExecStart=/opt/open-etf-agent/start-live.sh
```

```bash
sudo systemctl daemon-reload
sudo systemctl restart open-etf-agent.service
sudo systemctl is-active open-etf-agent.service
ss -ltn 'sport = :4179'
```

真实模式使用新的 `live` 工作区，不接管原演练历史。通过原来的 SSH 地址重新打开，先确认模式和模型，再用内置合成资料发一个小问题，例如「这份样例写了哪两项限制？」如果页面要求核对问题和资料再确认，以页面为准。看答案是否到达、历史是否可回读，并到自己的提供商账户核对计费。打开页面、建空会话和读历史不该发送模型请求；真正发送后可能产生费用，`limits.model` **不是金额预算**。遇到 403、429 或结果未知时，不要盲目重复提交，先核对权限、额度及原请求状态。

要回到离线，不必删模型数据或重装。把哪个片段开启了真实模式记清楚，只移出这一个文件：

```bash
sudo mv /etc/systemd/system/open-etf-agent.service.d/10-live.conf \
  /etc/open-etf-agent/10-live.conf.disabled
sudo systemctl daemon-reload
sudo systemctl restart open-etf-agent.service
```

两份工作区仍各自在磁盘上。常规更新时保留当前代码和两个独立的工作区备份，在另一个代码目录安装新标签。先用新工作区验证，正式切换前确认新版本会不会改变存储格式；回退代码不一定能回退已经写入的新结构。旧版真实启动还可能校验原工作区的配置身份，不能把不同启动配置和旧目录随便混用。

## 5. 什么时候需要域名和 HTTPS？

仅个人访问，以上方式已经完成了自己的服务器部署。SSH 隧道外面没有访客入口，不需要把 4179 加到安全组，也不会把单人工作台误认为公共产品。没有桌面电脑时，手机若有支持本机端口转发的受信 SSH 客户端，可以沿用同样原则；不具备这个条件，就不要为了方便直接暴露端口。

如果需要在手机浏览器直接输入域名，或要分享给其他人，这是**下一项部署工作**，不是把域名指向端口就完成的。至少需要独立域名、HTTPS、挡在全部页面和 API 前的认证，以及能区分预发和正式数据的配置。用 Caddy 等反向代理时，[HTTPS 管理](https://caddyserver.com/docs/automatic-https)与[访问认证](https://caddyserver.com/docs/caddyfile/directives/basic_auth)解决的是入口问题；还要在代理或受控网关先核对公网请求的真实 Host 与写请求 Origin，再把获准请求的 Host/Origin 转成应用期待的回环值。**不要无条件改写 Origin**，否则应用看到的每个请求都会像「自己发来的」。先在隔离数据上验未登录拒绝、浏览器登录、提交和历史，再考虑正式对外访问。需要账号体系时，[v0.43.0](https://github.com/hpoenixf/open-etf-agent/releases/tag/v0.43.0) 是单独的可选邀请制实现，不会自动给 v0.41 加上公网认证；也不能仅凭 Release 就断言你自己的托管环境已验收。

第一次上线做到三件事就够了：**端口没有裸露，报告重启后还能打开，模型密钥不出现在浏览器、源码或日志里。** 浏览器只是入口；知道是谁在执行、结果写到哪、下一次升级会改动什么，才是这套工作台可以长期留在服务器上的原因。

接着读：[从一次提问到答案可见：ETF Agent 六层调用全景](017-prompt-to-answer-six-layer-panorama-v3.md)。 · [喜欢这个项目，欢迎在 GitHub 点 Star](https://github.com/hpoenixf/open-etf-agent)
