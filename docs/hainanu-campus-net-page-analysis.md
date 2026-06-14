# 海南大学校园网登录页面分析

> 分析时间：2026-06-14  
> 分析工具：Playwright CLI  
> 页面地址：https://xyw.hainanu.edu.cn/

---

## 一、页面基本信息

| 项目 | 内容 |
|------|------|
| 系统名称 | 深澜 SRUN 认证网关 |
| 软件版本 | SRunCGIAuthIntfSvr V1.18 B20210607 |
| 页面主题 | pro (专业版) |
| 认证服务地址 | https://xyw.hainanu.edu.cn:8800 |
| 支持协议 | IPv4 / IPv6 双栈 |
| 密码存储方式 | Cookie（Base64 编码） |
| 认证方式 | 账号密码、短信、OTP、微信扫码、Cisco |

---

## 二、页面结构

### 2.1 登录页

**URL**: `/srun_portal_pc?ac_id=1&theme=pro`

```
┌─────────────────────────────┐
│    海南大学校徽 + 语言选择    │
├─────────────────────────────┤
│       账号登录               │
│                             │
│  👤  [请输入账号____________] │
│  🔒  [请输入密码____________] │
│                             │
│  ☐ 记住密码       忘记密码    │
│                             │
│  [    登 录    ]  [自助服务]  │
├─────────────────────────────┤
│   Copyright © 2020 海南大学  │
│   校园网服务热线：66250099   │
└─────────────────────────────┘
```

### 2.2 登录成功页

**URL**: `/srun_portal_success?ac_id=1&theme=pro`

```
┌─────────────────────────────┐
│      您已成功登录             │
├─────────────────────────────┤
│  用户账号    202x300xxxx     │
│  已用流量    xxx.xx GB       │
│  已用时长    xxxx小时xx秒      │
│  账户余额    xx.00 元        │
│  IP 地址    xxx:xxxx:...    │
├─────────────────────────────┤
│  [  注 销  ]  [ 自助服务 ]   │
├─────────────────────────────┤
│  校园网使用指南（右侧面板）    │
│  - 学生校园网账号开通步骤      │
│  - 第一步：修改校园网套餐      │
│  - 第二步：海大e卡缴费        │
└─────────────────────────────┘
```

---

## 三、关键元素

### 3.1 DOM 元素

| 用途 | 选择器 | 类型 | 备注 |
|------|--------|------|------|
| 学号输入框 | `#username` | textbox | placeholder: "请输入账号" |
| 密码输入框 | `#password` | textbox | placeholder: "请输入密码" |
| 登录按钮 | `#login-account` | button | 点击触发认证 |
| 注销按钮 | `#logout` | button | 已登录时显示 |
| 自助服务 | `#self-service` | button | 跳转自助服务系统 |
| 记住密码 | `#remember` | checkbox | |
| 忘记密码 | `#forget` | link | |
| 域名选择 | `#domain` | select | 可选的认证域 |

### 3.2 语言选择

页面顶部有下拉框，支持：
- 中文 (简体)
- English

---

## 四、前端配置

页面通过 `<script>` 内嵌全局配置对象 `CONFIG`：

```javascript
var CONFIG = {
    page   : 'success',                  // 当前页面: login / success
    ip     : "2409:875e:a030:1001:1c::7a17",  // 客户端 IP
    nas    : "",                          // NAS 设备
    mac    : "",                          // MAC 地址
    url    : "",                          // 原始请求 URL
    lang   : "zh-CN",                     // 语言
    isIPV6 : true,                        // 是否使用 IPv6
    portal : {
        AuthIP:           "",             // 认证服务器 IPv4
        AuthIP6:          "",             // 认证服务器 IPv6
        ServiceIP:        "https://xyw.hainanu.edu.cn:8800",  // 服务地址
        DoubleStackPC:    false,          // PC 端双栈
        DoubleStackMobile: false,         // 移动端双栈
        AuthMode:         false,          // 认证模式
        CloseLogout:      false,          // 关闭注销
        MacAuth:          true,           // MAC 认证
        RedirectUrl:      true,           // 认证后重定向
        OtherPCStack:     "IPV4",         // 其他协议栈
        OtherMobileStack: "IPV4",
        MsgApi:           "new",          // 消息 API 版本
        PublicSuccessPages: true,         // 公开成功页
        TrafficCarry:     1000,           // 流量系数
        UserAgreeSwitch:  false,          // 用户协议开关
        DialSwitch:       false,          // 代拨开关
    },
    notice : "list"
};
```

---

## 五、JavaScript 架构

### 5.1 核心文件

| 文件 | 作用 |
|------|------|
| `Portal.js` | Portal 核心类，包含 login、logout、info 等方法 |
| `main.js` | 入口脚本，绑定 UI 事件，调用 Portal 类 |
| `Utils.js` | 工具函数，包含 Cookie 操作、URL 参数解析等 |
| `lang.js` | 多语言支持 |
| `creater.js` | 组件创建（对话框、按钮等） |
| `redirect.js` | 页面重定向逻辑 |
| `all.min.js` | 第三方库集合（jQuery、md5、sha1、base64 等） |

### 5.2 Portal 类 API 端点

```javascript
_api = {
    info:          '/cgi-bin/rad_user_info',      // 用户在线信息 (JSONP)
    auth:          '/cgi-bin/srun_portal',         // 认证 & 注销 (JSONP)
    loginDM:       '/cgi-bin/rad_user_dm',         // DM 下线 (JSONP)
    authWechat:    '/v1/srun_wechat_code',          // 微信扫码 (GET)
    authSMSPhone:  '/cgi-bin/srunmobile_portal',    // 手机短信 (JSONP)
    authSMSAccount: '/v1/srun_portal_sms',          // 账号短信 (GET)
    token:         '/cgi-bin/get_challenge',        // 获取 Challenge (JSONP)
    vcodePhone:    '/cgi-bin/srunmobile_vcode',     // 手机验证码 (JSONP)
    vcodeAccount:  '/v1/srun_portal_sms_code',      // 账号验证码 (GET)
    sign:          '/v1/srun_portal_sign',           // 获取 Sign (GET)
    notice:        '/v2/srun_portal_message',        // 获取通知 (GET)
    log:           '/v1/srun_portal_log',            // 日志 (GET)
    ssoWechat:     '/v1/srun_wechat_barcode',       // 微信 SSO (GET)
    sso:           '/v1/srun_portal_sso',            // 单点登录 (GET)
    protocol:      '/v1/srun_portal_agree_new',      // 最新协议 (GET)
};
```

---

## 六、登录流程

详见 [hainanu-campus-net-auto-login.md](hainanu-campus-net-auto-login.md#二登录流程核心原理)

---

## 七、控制台输出/警告

加载页面时，控制台输出一条浏览器警告：

```
[DOM] Password field is not contained in a form:
  https://xyw.hainanu.edu.cn/srun_portal_pc?ac_id=1&theme=pro:0
```

这是因为密码输入框不在 `<form>` 标签内，所有提交通过 JavaScript（JSONP / AJAX）完成，与常规表单提交方式不同。

---

## 八、后续注意事项

1. **双栈认证**：同时支持 IPv4 和 IPv6，当前页面通过 `isIPV6: true` 标识走 IPv6
2. **Cookie 存密码**：勾选"记住密码"后，账号密码会以自定义 Base64 编码存入 Cookie
3. **设备类型检测**：`Portal.js` 中通过 `portalInfo.userDevice` 检测用户的操作系统和设备类型，随认证请求上报
4. **登录防抖**：短时间内多次点击登录按钮会被拦截（`running.login` 标识）