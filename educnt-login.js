#!/usr/bin/env node
/**
 * 海南大学校园网自动登录脚本
 * 使用 Playwright 浏览器自动化实现
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const os = require('os');

// 配置文件路径
const CONFIG_PATH = path.join(os.homedir(), '.educnt.json');

// 登录页面 URL
const LOGIN_URL = 'https://xyw.hainanu.edu.cn/srun_portal_pc?ac_id=1&theme=pro';

/**
 * 读取配置文件
 */
function loadConfig() {
    if (!fs.existsSync(CONFIG_PATH)) {
        console.error('❌ 配置文件不存在，请先运行: educnt --setup');
        process.exit(1);
    }

    try {
        const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
        if (!config.username || !config.password) {
            console.error('❌ 配置文件格式错误，缺少 username 或 password');
            process.exit(1);
        }
        return config;
    } catch (err) {
        console.error('❌ 配置文件读取失败:', err.message);
        process.exit(1);
    }
}

/**
 * 初始化配置文件
 */
function setupConfig() {
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log('🎓 海南大学校园网自动登录 - 配置向导\n');

    rl.question('请输入学号: ', (username) => {
        rl.question('请输入密码: ', (password) => {
            const config = { username, password };
            fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
            console.log(`\n✅ 配置已保存到: ${CONFIG_PATH}`);
            console.log('现在可以运行 educnt 登录校园网了！');
            rl.close();
        });
    });
}

/**
 * 执行登录
 */
async function login() {
    const config = loadConfig();

    console.log('🔐 正在登录海南大学校园网...');
    console.log(`   账号: ${config.username}`);

    const browser = await chromium.launch({
        headless: true,
        channel: 'chrome'  // 使用系统安装的 Chrome 浏览器
    });
    const page = await browser.newPage();

    try {
        // 1. 打开登录页
        await page.goto(LOGIN_URL, { waitUntil: 'networkidle' });

        // 2. 如果已登录，先注销
        if (page.url().includes('srun_portal_success')) {
            console.log('   检测到已登录，正在注销...');
            await page.locator('#logout').click();
            await page.waitForTimeout(2000);
            await page.goto(LOGIN_URL, { waitUntil: 'networkidle' });
        }

        // 3. 填写账号密码并登录
        await page.fill('#username', config.username);
        await page.fill('#password', config.password);
        await page.locator('#login-account').click();

        // 4. 等待登录成功
        await page.waitForURL('**/srun_portal_success*', { timeout: 15000 });
        console.log('✅ 登录成功！');

        // 5. 获取用户信息
        const infoText = await page.locator('.info-content').allTextContents();
        if (infoText.length > 0) {
            console.log('\n📊 账户信息:');
            infoText.forEach(text => console.log('   ' + text.trim()));
        }
    } catch (err) {
        console.error('❌ 登录失败:', err.message);
        process.exit(1);
    } finally {
        await browser.close();
    }
}

// 主程序入口
const args = process.argv.slice(2);

if (args.includes('--setup') || args.includes('-s')) {
    setupConfig();
} else if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🎓 海南大学校园网自动登录工具

用法:
  educnt              登录校园网
  educnt --setup      配置账号密码
  educnt --help       显示帮助信息

配置文件: ~/.educnt.json
`);
} else {
    login();
}
