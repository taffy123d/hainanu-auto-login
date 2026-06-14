# 海南大学校园网自动登录工具

> 一键登录海南大学校园网，无需手动打开浏览器

> ⚠️ **性能说明**：本项目基于 Playwright 浏览器自动化，每次登录需启动 Chrome，全流程约 **4-7 秒**。
>
> 💡 **优化方向**：如需更快的登录速度（< 1 秒），可参考 [页面分析文档](docs/hainanu-campus-net-page-analysis.md)，通过纯 HTTP API 实现登录。


## 安装

### 前置条件

- [Node.js](https://nodejs.org/) >= 18
- [Google Chrome](https://www.google.com/chrome/) 浏览器

### 安装步骤

```bash
# 克隆仓库
git clone https://github.com/taffy123d/hainanu-auto-login.git
cd hainanu-auto-login

# 安装依赖
npm install
```

### 注册命令

```bash
npm link
```

执行后即可在任意位置使用 `educnt` 命令。

macOS/Linux 也可以用别名方式：

```bash
echo 'alias educnt="node /path/to/hainanu-auto-login/educnt-login.js"' >> ~/.zshrc
source ~/.zshrc
```

## 使用

### 1. 首次配置

```bash
educnt --setup
```

按提示输入学号和密码，配置会保存到 `~/.educnt.json`。

### 2. 登录校园网

```bash
educnt
```

## 命令说明

| 命令 | 说明 |
|------|------|
| `educnt` | 登录校园网 |
| `educnt --setup` | 配置/修改账号密码 |
| `educnt --help` | 显示帮助信息 |

## 配置文件

配置保存在用户主目录下的 `.educnt.json`：

| 系统 | 路径 |
|------|------|
| Windows | `C:\Users\你的用户名\.educnt.json` |
| macOS | `~/.educnt.json` |
| Linux | `~/.educnt.json` |

配置内容：

```json
{
  "username": "202x300xxxx",
  "password": "your_password",
  "browser": "chrome"
}
```

| 字段 | 说明 | 默认值 |
|------|------|--------|
| `username` | 学号 | 必填 |
| `password` | 密码 | 必填 |
| `browser` | 浏览器 | `chrome` |

可选浏览器：`chrome`、`msedge`、`chromium`

## 更换账号密码

```bash
educnt --setup
```

重新输入新的学号和密码即可，旧配置会被覆盖。

## 工作原理

使用 Playwright 自动化控制浏览器，模拟手动登录流程：

1. 打开校园网登录页面
2. 若已登录则先注销
3. 填写账号密码
4. 点击登录按钮
5. 等待登录成功

## 故障排查

**Q: 提示"配置文件不存在"**

运行 `educnt --setup` 创建配置文件。

**Q: 登录失败**

1. 检查账号密码是否正确：`educnt --setup`
2. 确认已连接校园网
3. 确认系统已安装 Chrome 浏览器

## License

ISC
