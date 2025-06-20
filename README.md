# 电信套餐查询格式化服务 v2.0

[![Deno Deploy](https://img.shields.io/badge/Deno-Deploy-brightgreen?logo=deno)](https://deno.com/deploy)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

> 🚀 基于 Deno 的智能电信套餐查询系统，支持多用户管理、实时监控、机器人通知集成

## 📋 目录

- [项目概述](#-项目概述)
- [核心特性](#-核心特性)  
- [快速开始](#-快速开始)
- [部署指南](#-部署指南)
- [API 接口文档](#-api-接口文档)
- [使用示例](#-使用示例)
- [高级配置](#-高级配置)
- [故障排除](#-故障排除)

## 🎯 项目概述

电信套餐查询格式化服务是一个现代化的电信数据监控解决方案，提供：

- **🔍 智能查询** - 实时获取电信套餐、流量、余额等信息
- **📊 美观展示** - 进度条可视化、智能提醒、数据分析
- **🤖 自动通知** - 支持钉钉、Telegram机器人推送
- **🔄 多用户管理** - 同时监控多个手机号
- **⚡ 高性能** - 智能缓存、并发查询、API优化

### 适用场景

- **个人监控** - 日常查看套餐使用情况
- **家庭管理** - 统一管理家庭成员的手机套餐
- **企业监控** - 批量监控公司手机号使用情况
- **自动化运维** - 集成到监控系统，自动报警

## ✨ 核心特性

### 🎨 用户体验
- **现代化界面** - 响应式设计，渐变背景，毛玻璃效果
- **智能交互** - 用户切换器，快捷操作，自动刷新
- **数据可视化** - 进度条显示，状态图标，趋势分析
- **隐私保护** - 手机号脱敏显示，安全认证

### 📱 查询功能  
- **基础查询** - 余额、流量、通话时长等核心信息
- **增强查询** - 流量包详情、使用分析、智能提醒
- **实时更新** - 强制刷新，缓存管理，数据同步
- **多格式输出** - HTML页面、JSON数据、格式化文本

### 🤖 通知集成
- **钉钉机器人** - Webhook推送，Markdown格式支持
- **Telegram Bot** - 频道/群组发送，多种解析模式
- **智能格式化** - 平台优化，自动适配，时间戳
- **批量发送** - 一键多平台，状态反馈，错误处理

### 🔧 技术特性
- **高可用** - 容错处理，优雅降级，状态监控
- **高性能** - 智能缓存，并发查询，资源优化
- **安全性** - 环境变量配置，Session认证，数据加密
- **扩展性** - 模块化设计，RESTful API，易于集成

## 🚀 快速开始

### 方式一：在线体验 (推荐)

1. **访问演示站点**
   ```
   https://199.deno.dev
   ```

2. **配置手机号** (可选)
   - 如需查看自己的数据，请Fork项目并部署

### 方式二：一键部署

1. **Fork 本仓库**
   
2. **部署到 Deno Deploy**
   - 访问 [Deno Deploy](https://deno.com/deploy)
   - 连接 GitHub 仓库
   - 选择 `main.ts` 作为入口文件

3. **设置环境变量**
   ```bash
   # 必需配置
   TELECOM_PHONENUM=199****1016,138****5678
   TELECOM_PASSWORD=123456,234567
   
   # 可选配置  
   WEB_PASSWORD=your_web_password
   ```

4. **访问服务**
   ```
   https://your-project.deno.dev
   ```

### 方式三：本地开发

```bash
# 克隆项目
git clone https://github.com/your-username/telecom-formatter.git
cd telecom-formatter

# 设置环境变量
export TELECOM_PHONENUM="199****1016"
export TELECOM_PASSWORD="123456"

# 启动服务
deno run --allow-all main.ts
```

## 📦 部署指南

### 环境变量配置

| 变量名 | 必需 | 说明 | 示例 |
|--------|------|------|------|
| **基础配置** |
| `TELECOM_PHONENUM` | ✅ | 手机号列表（逗号分隔） | `199****1016,138****5678` |
| `TELECOM_PASSWORD` | ✅ | 对应密码列表（逗号分隔） | `123456,234567` |
| `WEB_PASSWORD` | ❌ | 网页访问密码 | `admin123` |
| **性能配置** |
| `API_BASE` | ❌ | 后端API地址 | `https://dx.ll.sd` |
| `CACHE_TIME` | ❌ | 缓存时间（秒） | `120` |
| **通知配置** |
| `DINGTALK_WEBHOOK` | ❌ | 钉钉群机器人Webhook | `https://oapi.dingtalk.com/robot/send?access_token=xxx` |
| `TELEGRAM_BOT_TOKEN` | ❌ | Telegram机器人Token | `1234567890:ABCDefGhiJklMnoPqrStUvWxYz` |
| `TELEGRAM_CHAT_ID` | ❌ | Telegram默认聊天ID | `@your_channel` 或 `-1001234567890` |

### Deno Deploy 部署步骤

1. **准备代码仓库**
   ```bash
   git clone https://github.com/your-username/telecom-formatter.git
   git add .
   git commit -m "部署配置"
   git push origin main
   ```

2. **创建 Deno Deploy 项目**
   - 登录 [Deno Deploy](https://deno.com/deploy)
   - 点击 "New Project"
   - 选择 GitHub 仓库
   - 入口文件：`main.ts`

3. **配置环境变量**
   - 进入项目设置 → Environment Variables
   - 添加上表中的必需变量
   - 保存并重新部署

4. **验证部署**
   ```bash
   curl https://your-project.deno.dev/status
   ```

### 其他平台部署

<details>
<summary>Cloudflare Workers</summary>

1. 安装 Wrangler CLI
2. 修改 `wrangler.toml` 配置
3. 执行 `wrangler publish`

</details>

<details>
<summary>Docker 部署</summary>

```dockerfile
FROM denoland/deno:1.40.0
WORKDIR /app
COPY . .
RUN deno cache main.ts
EXPOSE 8000
CMD ["deno", "run", "--allow-all", "main.ts"]
```

</details>

## 📡 API 接口文档

### 接口概览

| 类别 | 端点 | 方法 | 说明 |
|------|------|------|------|
| **网页端点** | `/` | GET | 主页面 |
| | `/query` | GET | 基础查询页面 |
| | `/enhanced` | GET | 增强查询页面 |
| | `/json` | GET | JSON数据页面 |
| **管理端点** | `/status` | GET | 系统状态 |
| | `/clear-cache` | GET/POST | 清除缓存 |
| **API端点** | `/api/bot` | POST | 机器人集成接口 |
| | `/api/query` | POST | 格式化查询接口 |
| | `/api/login` | POST | 用户登录接口 |
| **原始API** | `/api/qryImportantData` | POST | 套餐详细信息 |
| | `/api/userFluxPackage` | POST | 流量包查询 |
| | `/api/qryShareUsage` | POST | 共享流量查询 |

### 🤖 机器人集成接口 (推荐)

**功能**：查询套餐信息并可选择性发送到钉钉或Telegram

```http
POST /api/bot
Content-Type: application/json
```

#### 请求参数

```json
{
  "phonenum": "199****1016",
  "password": "123456",
  "type": "compact",
  "send_type": "both",
  "chat_id": "@your_channel",
  "use_markdown": false
}
```

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `phonenum` | string | ✅ | 手机号码 |
| `password` | string | ✅ | 查询密码 |
| `type` | string | ❌ | 数据格式：`basic`/`enhanced`/`compact`(默认) |
| `send_type` | string | ❌ | 发送平台：`dingtalk`/`telegram`/`both` |
| `chat_id` | string | ❌ | Telegram聊天ID(覆盖环境变量) |
| `use_markdown` | boolean | ❌ | 是否使用Markdown格式(仅Telegram) |

#### 数据格式类型

| 类型 | 用途 | 输出长度 | 适用场景 |
|------|------|----------|----------|
| `compact` | 紧凑版 | ~4行 | 钉钉/TG通知，日常监控 |
| `basic` | 基础版 | ~15行 | 常规查询，包含关键详情 |
| `enhanced` | 增强版 | ~50行 | 详细分析，完整信息 |

#### 响应格式

```json
{
  "success": true,
  "data": "格式化的查询结果",
  "cached": false,
  "phonenum": "199****1016",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "send_results": {
    "platform": "both",
    "results": [
      {
        "platform": "dingtalk",
        "success": true,
        "message": "钉钉消息发送成功"
      },
      {
        "platform": "telegram",
        "success": true,
        "message": "Telegram消息发送成功"
      }
    ],
    "total_sent": 2,
    "total_failed": 0
  }
}
```

### 📊 格式化查询接口

**功能**：获取格式化的套餐信息，支持多种输出格式

```http
POST /api/query
Content-Type: application/json
```

#### 请求参数

```json
{
  "phonenum": "199****1016",
  "enhanced": true,
  "format": "formatted"
}
```

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `phonenum` | string | ✅ | 手机号码 |
| `enhanced` | boolean | ❌ | 是否增强模式 |
| `format` | string | ❌ | 输出格式：`formatted`(默认)/`json` |

### 🔐 认证相关接口

#### 用户登录

```http
POST /api/login
Content-Type: application/json
```

```json
{
  "phonenum": "199****1016",
  "password": "123456"
}
```

#### 会话管理

- `GET /api/session/stats` - 会话统计
- `GET /api/session/clean` - 清理过期会话
- `GET /api/session/clear` - 清除所有会话

### 📋 原始API接口

这些接口与Python版本兼容，返回原始JSON数据：

- `POST /api/qryImportantData` - 套餐详细信息  
- `POST /api/userFluxPackage` - 流量包查询
- `POST /api/qryShareUsage` - 共享流量查询
- `POST /api/summary` - 综合信息查询

## 💡 使用示例

### 场景1：日常监控脚本

**需求**：每天早上8点自动查询并发送到钉钉群

```bash
#!/bin/bash
# telecom_daily_check.sh

API_URL="https://199.deno.dev/api/bot"
PHONE="199****1016"
PASSWORD="123456"

response=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"phonenum\": \"$PHONE\",
    \"password\": \"$PASSWORD\",
    \"type\": \"compact\",
    \"send_type\": \"dingtalk\"
  }")

echo "✅ 监控完成: $response"
```

**部署方式**：
```bash
# 添加到crontab
0 8 * * * /path/to/telecom_daily_check.sh
```

### 场景2：青龙面板集成

**需求**：在青龙面板中监控多个手机号

```javascript
// telecom_multi_monitor.js
const axios = require('axios');

const phones = [
  { num: "199****1016", pwd: "123456", name: "主号" },
  { num: "138****5678", pwd: "234567", name: "副号" }
];

async function checkAllPhones() {
  for (const phone of phones) {
    try {
      const response = await axios.post('https://199.deno.dev/api/bot', {
        phonenum: phone.num,
        password: phone.pwd,
        type: 'compact',
        send_type: 'telegram'
      });
      
      if (response.data.success) {
        console.log(`✅ ${phone.name} 监控成功`);
      } else {
        console.error(`❌ ${phone.name} 监控失败: ${response.data.error}`);
      }
    } catch (error) {
      console.error(`❌ ${phone.name} 请求异常: ${error.message}`);
    }
    
    // 避免频繁请求
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

checkAllPhones();
```

### 场景3：GitHub Actions 自动化

**需求**：每天检查流量使用情况，超过80%时自动通知

```yaml
# .github/workflows/telecom-monitor.yml
name: Telecom Monitor
on:
  schedule:
    - cron: '0 9,18 * * *'  # 每天9点和18点

jobs:
  monitor:
    runs-on: ubuntu-latest
    steps:
      - name: Check Telecom Usage
        run: |
          response=$(curl -s -X POST https://199.deno.dev/api/bot \
            -H "Content-Type: application/json" \
            -d '{
              "phonenum": "${{ secrets.TELECOM_PHONE }}",
              "password": "${{ secrets.TELECOM_PASSWORD }}",
              "type": "basic",
              "send_type": "telegram"
            }')
          
          echo "Monitor result: $response"
```

### 场景4：Home Assistant 集成

**需求**：在智能家居系统中显示套餐信息

```yaml
# configuration.yaml
sensor:
  - platform: rest
    name: "电信套餐余额"
    resource: "https://199.deno.dev/api/bot"
    method: POST
    headers:
      Content-Type: "application/json"
    payload: |
      {
        "phonenum": "199****1016",
        "password": "123456",
        "type": "compact"
      }
    value_template: "{{ value_json.data | regex_findall('余额: ¥(\\d+\\.\\d+)') | first }}"
    unit_of_measurement: "¥"
    scan_interval: 3600
```

### 场景5：企业批量监控

**需求**：监控公司所有手机号，生成使用报告

```python
# enterprise_monitor.py
import requests
import json
import pandas as pd
from datetime import datetime

def monitor_enterprise_phones():
    phones = [
        {"dept": "销售部", "phone": "199****1001", "password": "123456"},
        {"dept": "技术部", "phone": "199****1002", "password": "234567"},
        {"dept": "市场部", "phone": "199****1003", "password": "345678"},
    ]
    
    results = []
    
    for phone_info in phones:
        try:
            response = requests.post('https://199.deno.dev/api/bot', json={
                "phonenum": phone_info["phone"],
                "password": phone_info["password"],
                "type": "basic"
            })
            
            if response.json()["success"]:
                data = response.json()["data"]
                # 解析数据并添加到结果中
                results.append({
                    "部门": phone_info["dept"],
                    "手机号": phone_info["phone"],
                    "查询时间": datetime.now(),
                    "状态": "成功",
                    "详情": data
                })
            else:
                results.append({
                    "部门": phone_info["dept"],
                    "手机号": phone_info["phone"],
                    "查询时间": datetime.now(),
                    "状态": "失败",
                    "详情": response.json()["error"]
                })
                
        except Exception as e:
            results.append({
                "部门": phone_info["dept"],
                "手机号": phone_info["phone"],
                "查询时间": datetime.now(),
                "状态": "异常",
                "详情": str(e)
            })
    
    # 生成报告
    df = pd.DataFrame(results)
    df.to_excel(f"telecom_report_{datetime.now().strftime('%Y%m%d')}.xlsx", index=False)
    print("✅ 企业监控报告已生成")

if __name__ == "__main__":
    monitor_enterprise_phones()
```

## ⚙️ 高级配置

### 自定义缓存策略

```bash
# 设置不同的缓存时间
CACHE_TIME=300    # 5分钟缓存
CACHE_TIME=1800   # 30分钟缓存  
CACHE_TIME=3600   # 1小时缓存
```

### 多API源配置

```bash
# 配置备用API源
API_BASE=https://backup-api.example.com
```

### 安全增强配置

```bash
# 设置访问白名单
WHITELIST_NUM=admin,special_user

# 设置强密码
WEB_PASSWORD=ComplexPassword123!
```

### 钉钉机器人高级配置

创建关键词型机器人：

1. **创建机器人**
   - 进入钉钉群 → 群设置 → 机器人 → 添加机器人
   - 选择"自定义机器人"
   - 设置关键词：`电信`、`套餐`、`流量`

2. **获取Webhook**
   ```
   https://oapi.dingtalk.com/robot/send?access_token=YOUR_TOKEN
   ```

3. **配置环境变量**
   ```bash
   DINGTALK_WEBHOOK=https://oapi.dingtalk.com/robot/send?access_token=YOUR_TOKEN
   ```

### Telegram Bot 高级配置

1. **创建Bot**
   - 与 @BotFather 对话
   - 发送 `/newbot`
   - 获取 Bot Token

2. **获取Chat ID**
   ```bash
   # 方法1：通过API获取
   curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
   
   # 方法2：添加 @userinfobot 到群组
   ```

3. **配置频道发送**
   ```bash
   TELEGRAM_BOT_TOKEN=1234567890:ABCDefGhiJklMnoPqrStUvWxYz
   TELEGRAM_CHAT_ID=@your_channel  # 公开频道
   # 或
   TELEGRAM_CHAT_ID=-1001234567890  # 私有群组
   ```

### 性能优化配置

```bash
# 调整并发数
MAX_CONCURRENT=5

# 调整超时时间  
REQUEST_TIMEOUT=30000

# 启用压缩
ENABLE_COMPRESSION=true
```

## 🔧 故障排除

### 常见问题

#### 1. 部署相关

**问题**：部署后访问404
```bash
# 检查入口文件设置
✅ 确认入口文件为 main.ts
✅ 检查GitHub仓库文件结构
✅ 查看Deno Deploy构建日志
```

**问题**：环境变量不生效
```bash
# 检查环境变量配置
✅ 确认变量名拼写正确
✅ 检查是否保存并重新部署
✅ 通过 /status 端点验证配置
```

#### 2. 查询相关

**问题**：手机号或密码错误
```bash
# 验证步骤
1. 确认手机号为11位数字
2. 确认密码为6位数字  
3. 手机号与密码数量一一对应
4. 测试登录电信官网验证
```

**问题**：查询超时或失败
```bash
# 排查步骤
1. 检查网络连接
2. 尝试强制刷新 (?refresh=1)
3. 清除缓存 (/clear-cache)
4. 检查API源状态
```

#### 3. 通知相关

**问题**：钉钉通知发送失败
```bash
# 检查项目
✅ Webhook地址是否正确
✅ 关键词是否设置并匹配
✅ 群机器人是否被移除
✅ 消息内容是否符合格式要求
```

**问题**：Telegram通知发送失败
```bash
# 检查项目
✅ Bot Token是否有效
✅ Chat ID是否正确
✅ Bot是否被添加到群组/频道
✅ Bot是否有发送权限
```

#### 4. 性能相关

**问题**：响应缓慢
```bash
# 优化建议
1. 启用缓存（默认已启用）
2. 减少并发查询数量
3. 使用compact格式减少数据量
4. 选择距离较近的API源
```

### 调试工具

#### 1. 状态检查
```bash
curl https://your-domain.deno.dev/status
```

#### 2. 缓存管理
```bash
# 清除所有缓存
curl -X POST https://your-domain.deno.dev/clear-cache

# 强制刷新查询
curl "https://your-domain.deno.dev/query?refresh=1"
```

#### 3. 日志查看
```bash
# Deno Deploy控制台查看实时日志
# 关注以下关键词：
# - ❌ 错误标识  
# - ⚠️ 警告标识
# - ✅ 成功标识
```

### 联系支持

如果遇到无法解决的问题：

1. **GitHub Issues** - [提交问题](https://github.com/your-username/telecom-formatter/issues)
2. **功能建议** - [提交建议](https://github.com/your-username/telecom-formatter/discussions)
3. **安全问题** - 发送邮件到安全邮箱

---

## 📄 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🤝 贡献

欢迎提交 Pull Request 和 Issue！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## ⭐ Star History

如果这个项目对您有帮助，请考虑给一个 Star ⭐

---

<div align="center">

**[⬆ 返回顶部](#电信套餐查询格式化服务-v20)**

Made with ❤️ by [Your Name](https://github.com/your-username)

</div> 