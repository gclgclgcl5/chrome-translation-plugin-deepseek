# 智能文本助手 Chrome 插件

一款强大的Chrome浏览器插件，支持选中文本的智能翻译和语音朗读功能，让您的浏览体验更加便捷高效。

## ✨ 功能特性

- 🌐 **智能翻译**
  - 支持中英文互译
  - 自动检测源语言（中文→英文，英文→中文）
  - 支持手动切换翻译目标语言
  - 使用DeepSeek AI提供高质量翻译

- 🔊 **语音朗读**
  - 使用Chrome浏览器内置语音合成API
  - 自动识别文本语言并选择合适的语音
  - 支持中文和英文朗读

- 🎨 **优雅的用户界面**
  - 悬浮工具栏设计，不干扰正常浏览
  - 选中文本后自动显示在文本上方
  - 翻译结果实时显示在工具栏下方
  - 响应式设计，适配各种屏幕尺寸

## 📦 安装部署

### 1. 下载插件文件

首先，下载或克隆本项目到本地：

```bash
git clone <repository-url>
cd 浏览器插件
```

或者直接下载ZIP文件并解压到本地目录。

### 2. 生成插件图标

打开 `icon-generator.html` 文件：

1. 用浏览器打开 `icon-generator.html`
2. 点击"生成图标"按钮
3. 右键点击每个图标，选择"图片另存为"
4. 在插件目录中创建 `icons` 文件夹
5. 将图标保存为：
   - `icons/icon16.png`
   - `icons/icon48.png`
   - `icons/icon128.png`

### 3. 加载插件到Chrome

1. 打开Chrome浏览器
2. 在地址栏输入 `chrome://extensions/` 并回车
3. 在右上角启用 **"开发者模式"**
4. 点击 **"加载已解压的扩展程序"** 按钮
5. 选择插件所在的文件夹（即本项目的根目录）
6. 插件加载成功后，会在扩展程序列表中显示"智能文本助手"

### 4. 配置DeepSeek API Key

插件需要DeepSeek API才能实现翻译功能。

#### 获取API Key：

1. 访问 [DeepSeek开放平台](https://platform.deepseek.com)
2. 注册并登录账号
3. 进入"API Keys"页面
4. 点击"创建新的API Key"
5. 复制生成的API Key

#### 配置API Key：

1. 在Chrome扩展程序页面找到"智能文本助手"
2. 点击 **"详细信息"**
3. 点击 **"扩展程序选项"**（或右键插件图标选择"选项"）
4. 在配置页面的输入框中粘贴您的API Key
5. 点击 **"保存设置"** 按钮
6. 看到"设置保存成功"提示即表示配置完成

## 🚀 使用方法

### 翻译文本

1. 在任意网页上选中您想要翻译的文本
2. 悬浮工具栏会自动显示在选中文本上方
3. 插件会自动检测语言：
   - 检测到中文 → 显示"→ EN"（翻译为英文）
   - 检测到英文 → 显示"→ 中文"（翻译为中文）
4. 如需切换翻译目标语言，点击语言切换按钮（蓝色按钮）
5. 点击 **"🌐 翻译"** 按钮开始翻译
6. 翻译结果会显示在工具栏下方

### 朗读文本

1. 选中您想要朗读的文本
2. 点击 **"🔊 朗读"** 按钮
3. 浏览器会自动开始朗读选中的文本
4. 朗读时会根据文本语言自动选择中文或英文语音

### 隐藏工具栏

- 点击页面其他任意位置，工具栏会自动隐藏
- 滚动页面时，工具栏也会自动隐藏

## 📁 项目结构

```
浏览器插件/
├── manifest.json          # Chrome插件配置文件（Manifest V3）
├── content.js             # 内容脚本，处理文本选择和UI显示
├── content.css            # 悬浮工具栏样式
├── background.js          # Service Worker，处理DeepSeek API调用
├── options.html           # 选项页面HTML
├── options.js             # 选项页面逻辑
├── icon-generator.html    # 图标生成工具
├── icons/                 # 插件图标目录
│   ├── icon16.png        # 16x16 图标
│   ├── icon48.png        # 48x48 图标
│   └── icon128.png       # 128x128 图标
└── README.md             # 说明文档
```

## 🛠️ 技术栈

- **Chrome Extension API**
  - Manifest V3
  - Content Scripts
  - Background Service Worker
  - Storage API
  - Runtime Messaging

- **DeepSeek API**
  - GPT模型翻译接口
  - RESTful API调用

- **Web Speech API**
  - Speech Synthesis（语音合成）
  - 支持多语言朗读

- **前端技术**
  - 原生JavaScript（ES6+）
  - CSS3动画和样式
  - DOM操作

## ⚙️ 核心功能实现

### 语言自动检测

插件使用正则表达式检测文本中是否包含中文字符：

```javascript
const chineseRegex = /[\u4e00-\u9fa5]/;
const isChinese = chineseRegex.test(text);
```

- 包含中文字符 → 源语言为中文，翻译目标为英文
- 不包含中文字符 → 源语言为英文，翻译目标为中文

### 消息通信机制

Content Script 和 Background Service Worker 之间通过 Chrome 消息传递API通信：

```javascript
// Content Script 发送消息
chrome.runtime.sendMessage({
  action: 'translate',
  text: selectedText,
  targetLang: targetLang
});

// Background 接收并处理
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'translate') {
    // 处理翻译请求
  }
});
```

### 数据持久化

使用 Chrome Storage API 安全地存储用户的API Key：

```javascript
// 保存
await chrome.storage.sync.set({ deepseekApiKey: apiKey });

// 读取
const result = await chrome.storage.sync.get(['deepseekApiKey']);
```

## ❓ 常见问题

### 1. 翻译功能不工作

**可能原因：**
- 未配置API Key
- API Key无效或已过期
- DeepSeek API额度用尽
- 网络连接问题

**解决方法：**
- 检查插件选项页面是否正确配置了API Key
- 登录DeepSeek平台检查API Key状态和余额
- 检查网络连接是否正常

### 2. 朗读功能没有声音

**可能原因：**
- 浏览器音量被静音
- 系统没有对应语言的语音包
- 浏览器权限设置问题

**解决方法：**
- 检查浏览器和系统音量设置
- 在系统设置中安装中文/英文语音包
- 在浏览器设置中允许网站访问语音功能

### 3. 工具栏显示位置不正确

**可能原因：**
- 页面CSS样式冲突
- 页面使用了特殊的定位方式

**解决方法：**
- 刷新页面重试
- 如果问题持续，可以在issues中反馈

### 4. 插件在某些网站不工作

**可能原因：**
- 网站使用了iframe或shadow DOM
- 网站有Content Security Policy限制

**解决方法：**
- 这是已知限制，部分特殊网站可能不支持
- 可以在普通网页上正常使用

## 🔒 隐私说明

- API Key存储在浏览器本地，使用Chrome Storage API加密保存
- 翻译的文本内容会发送到DeepSeek服务器进行处理
- 插件不会收集或上传任何个人信息
- 朗读功能完全在本地浏览器中执行

## 📝 更新日志

### v1.0.0 (2025-11-16)

- ✨ 首次发布
- 🌐 支持中英文智能翻译
- 🔊 支持文本语音朗读
- 🎨 美观的悬浮工具栏界面
- ⚙️ 可配置的API Key管理
- 🔄 自动语言检测和手动切换

## 🤝 贡献

欢迎提交Issue和Pull Request来帮助改进这个项目！

## 📄 许可证

MIT License

---

**提示：** 使用本插件需要自行申请DeepSeek API Key，请合理使用API配额。

