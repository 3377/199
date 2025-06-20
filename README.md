# 电信套餐查询格式化服务 v2.0

[![Deno Deploy](https://img.shields.io/badge/Deno-Deploy-brightgreen?logo=deno)](https://deno.com/deploy)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

一个基于 Deno 的电信套餐查询格式化服务，支持多用户、实时查询、美观展示和API调用。

## ✨ 功能特性

### 🔐 安全认证
- **密码保护**：基于 session 的认证系统
- **环境变量配置**：WEB_PASSWORD 控制访问密码
- **24小时免登录**：首次验证后持久化 session

### 📱 多用户支持
- **多手机号配置**：支持同时配置多个手机号查询
- **用户切换器**：左侧悬浮选择器，便捷切换用户
- **隐私保护**：手机号显示为 `199****1016` 格式

### 🎨 现代化界面
- **响应式设计**：完美适配手机、平板、桌面
- **美观UI**：渐变背景、毛玻璃效果、动画交互
- **进度条可视化**：直观显示流量使用情况
- **快捷操作**：底部链接、悬浮刷新按钮

### 📦 流量包增强显示
- **订购时间显示**：显示流量包的订购、生效和到期时间
- **状态智能识别**：自动识别流量包状态（正常/即将到期/已过期）
- **时间排序**：按到期时间排序，即将到期的优先显示
- **统计分析**：提供详细的流量包统计（总数、活跃、即将到期、已过期）
- **到期提醒**：显示具体的剩余天数和到期提醒

### ⚡ 性能优化
- **智能缓存**：默认2分钟缓存，提高响应速度
- **实时查询**：支持强制刷新获取最新数据
- **并行查询**：多用户数据并行获取

### 🔌 API接口
- **RESTful设计**：支持 GET/POST 多种调用方式
- **多种格式**：HTML页面、JSON数据、纯文本
- **CORS支持**：跨域友好，便于集成

## 🚀 快速部署

### Deno Deploy 部署

1. **Fork仓库**：Fork本仓库到你的GitHub账号

2. **配置 Deno Deploy**：
   - 访问 [Deno Deploy](https://deno.com/deploy)
   - 连接 GitHub 仓库
   - 选择 `main.ts` 作为入口文件

3. **设置环境变量**：
   ```bash
   # 必需配置
   TELECOM_PHONENUM=199****1016,138****5678,159****4321
   TELECOM_PASSWORD=123456,234567,345678
   
   # 可选配置
   WEB_PASSWORD=your_web_password
   API_BASE=https://dx.ll.sd
   CACHE_TIME=120000
   ```

### 环境变量说明

| 变量名 | 必需 | 说明 | 示例 |
|--------|------|------|------|
| `TELECOM_PHONENUM` | ✅ | 手机号列表（逗号分隔） | `199****1016,138****5678` |
| `TELECOM_PASSWORD` | ✅ | 对应密码列表（逗号分隔） | `123456,234567` |
| `WEB_PASSWORD` | ❌ | 网页访问密码 | `admin123` |
| `API_BASE` | ❌ | 后端API地址 | `https://dx.ll.sd` |
| `CACHE_TIME` | ❌ | 缓存时间（秒） | `120` |

> **注意**：手机号和密码必须一一对应，数量要匹配

## 📖 使用说明

### 网页界面访问

1. **首次访问**：输入设置的 `WEB_PASSWORD`
2. **选择用户**：左侧悬浮选择器切换手机号
3. **查看数据**：选择不同端点查看不同格式数据

### 可用端点

| 端点 | 方法 | 说明 | 示例 |
|------|------|------|------|
| `/query` | GET | 基础套餐查询 | `/query?phone=199****1016` |
| `/enhanced` | GET | 增强套餐查询（进度条） | `/enhanced?phone=199****1016&refresh=1` |
| `/json` | GET | JSON数据展示 | `/json?phone=199****1016` |
| `/status` | GET | 系统状态检查 | `/status` |
| `/clear-cache` | GET/POST | 清除缓存 | `/clear-cache` |
| `/api/query` | POST | API查询接口 | 见下方API说明 |

### URL参数

- `phone`: 指定查询的手机号
- `refresh=1`: 强制刷新，忽略缓存
- `auto=30`: 自动刷新，30秒后重新加载

## 🔌 API 调用说明

### 格式化查询 API

**端点**: `POST /api/query`

**请求格式**: `application/json` 或 `application/x-www-form-urlencoded`

### 原始 API 接口（兼容 Python 版本）

#### 用户登录

**端点**: `POST /api/login`

**请求示例**:
```bash
curl -X POST https://your-domain.deno.dev/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "phonenum": "199****1016",
    "password": "123456"
  }'
```

**响应示例**:
```json
{
  "success": true,
  "message": "登录成功",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires": 1703932800000,
  "phonenum": "199****1016"
}
```

#### 套餐信息查询

**端点**: `POST /api/qryImportantData`

**请求示例**:
```bash
curl -X POST https://your-domain.deno.dev/api/qryImportantData \
  -H "Content-Type: application/json" \
  -d '{
    "phonenum": "199****1016",
    "token": "your_token_here"
  }'
```

#### 流量包查询

**端点**: `POST /api/userFluxPackage`

**请求示例**:
```bash
curl -X POST https://your-domain.deno.dev/api/userFluxPackage \
  -H "Content-Type: application/json" \
  -d '{
    "phonenum": "199****1016", 
    "token": "your_token_here"
  }'
```

#### 共享流量查询

**端点**: `POST /api/qryShareUsage`

#### 综合信息查询

**端点**: `POST /api/summary`

### 会话管理 API

#### 会话统计

**端点**: `GET /api/session/stats`

**响应示例**:
```json
{
  "success": true,
  "message": "获取会话统计成功",
  "stats": {
    "totalSessions": 5,
    "activeSessions": 3,
    "expiredSessions": 2,
    "sessionsByPhone": {
      "199****1016": 2,
      "138****5678": 1
    }
  }
}
```

#### 清理过期会话

**端点**: `GET /api/session/clean`

#### 清除所有会话

**端点**: `GET /api/session/clear`

### 格式化查询 API (原有)

#### JSON 请求示例

```bash
curl -X POST https://your-domain.deno.dev/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "phonenum": "199****1016",
    "enhanced": true,
    "format": "formatted"
  }'
```

#### 表单请求示例

```bash
curl -X POST https://your-domain.deno.dev/api/query \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d 'phonenum=199****1016&enhanced=true&format=json'
```

#### JavaScript 调用示例

```javascript
// 获取格式化文本
const response = await fetch('https://your-domain.deno.dev/api/query', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    phonenum: '199****1016',
    enhanced: true,
    format: 'formatted'
  })
});

const result = await response.json();
console.log(result.data); // 格式化的文本

// 获取原始JSON数据
const jsonResponse = await fetch('https://your-domain.deno.dev/api/query', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    phonenum: '199****1016',
    format: 'json'
  })
});

const jsonResult = await jsonResponse.json();
console.log(jsonResult.data); // 原始数据对象
```

#### Python 调用示例

```python
import requests
import json

# 获取格式化文本
response = requests.post('https://your-domain.deno.dev/api/query', 
    json={
        'phonenum': '199****1016',
        'enhanced': True,
        'format': 'formatted'
    }
)

result = response.json()
if result['success']:
    print(result['data'])  # 格式化的文本
else:
    print(f"错误: {result['error']}")

# 获取原始JSON数据
json_response = requests.post('https://your-domain.deno.dev/api/query',
    json={
        'phonenum': '199****1016', 
        'format': 'json'
    }
)

json_result = json_response.json()
if json_result['success']:
    data = json_result['data']
    print(f"余额: {data['summary']['balance'] / 100}元")
    print(f"流量: {data['summary']['flowUse'] / 1024 / 1024:.2f}GB")
```

#### 请求参数

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `phonenum` | string | ✅ | 要查询的手机号 |
| `enhanced` | boolean | ❌ | 是否使用增强模式（进度条） |
| `format` | string | ❌ | 返回格式：`formatted`（默认）或 `json` |

#### 响应格式

```json
{
  "success": true,
  "data": "格式化的文本内容或JSON对象",
  "cached": false,
  "phonenum": "199****1016",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

#### 错误响应

```json
{
  "success": false,
  "error": "错误描述",
  "cached": false,
  "phonenum": "199****1016"
}
```

## 🎯 集成示例

### 在青龙面板中使用

```javascript
// qinglong_telecom.js
const axios = require('axios');

async function queryTelecom() {
  try {
    const response = await axios.post('https://your-domain.deno.dev/api/query', {
      phonenum: process.env.TELECOM_PHONE,
      enhanced: true,
      format: 'formatted'
    });
    
    if (response.data.success) {
      console.log(response.data.data);
      // 发送到通知渠道
      await notify(response.data.data);
    } else {
      console.error('查询失败:', response.data.error);
    }
  } catch (error) {
    console.error('请求失败:', error.message);
  }
}

queryTelecom();
```

### 在 GitHub Actions 中使用

```yaml
name: Daily Telecom Check
on:
  schedule:
    - cron: '0 9 * * *'  # 每天9点执行

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - name: Query Telecom Data
        run: |
          response=$(curl -s -X POST https://your-domain.deno.dev/api/query \
            -H "Content-Type: application/json" \
            -d '{"phonenum":"${{ secrets.PHONE }}","enhanced":true}')
          
          echo "$response" | jq -r '.data'
```

## 🛠️ 本地开发

```bash
# 克隆仓库
git clone https://github.com/your-username/199.git
cd 199

# 设置环境变量
export TELECOM_PHONENUM="199****1016,138****5678"
export TELECOM_PASSWORD="123456,234567"  
export WEB_PASSWORD="admin123"

# 启动开发服务器
deno run --allow-all --watch main.ts

# 或使用任务
deno task dev
```

## 📊 数据格式

### 基础查询返回示例

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 电信套餐查询结果
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📱 手机号: 199****1016
💰 账户余额: ¥25.68
📞 语音通话: 100/1000 分钟 (10%)
📶 总流量使用: 2.50/50.00 GB (5%)

▶ 流量包详情:
🇨🇳 国内流量: 2.50/20.00 GB (13%) [████░░░░░░]
📺 专用流量: 0.00/30.00 GB (0%) [░░░░░░░░░░]

查询时间: 2024-01-01 12:00:00
天下之事，分久必合，合久必分 ----三国演义
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 增强查询返回示例

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 电信套餐查询结果 (增强版)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📱 手机号: 199****1016  💰 余额: ¥25.68 ✅
📞 语音: 100/1000分钟 (10%) 📶 流量: 2.50/50.00GB (5%)

▶ 流量使用详情:
🇨🇳 国内流量: 2.50/20.00 GB (13%)
   [████░░░░░░░░░░░░░░░░] 13%
📺 专用流量: 0.00/30.00 GB (0%)  
   [░░░░░░░░░░░░░░░░░░░░] 0%

📊 使用统计分析:
• 日均流量: 0.83 GB
• 剩余天数: 25 天  
• 使用趋势: 📊 正常
• 预计月用量: 25.00 GB (在套餐范围内)

💡 智能提醒: ✅ 一切正常，继续享受服务

查询时间: 2024-01-01 12:00:00 (北京时间)
诗云: 海内存知己，天涯若比邻 ----送杜少府之任蜀州
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🔧 自定义配置

### 修改缓存时间

```bash
# 设置为5分钟缓存（300秒）
CACHE_TIME=300
```

### 更改API后端

```bash
# 使用自定义API地址
API_BASE=https://your-custom-api.com
```

### 自定义密码

```bash  
# 设置强密码
WEB_PASSWORD=your-secure-password-123
```

## 🐛 故障排除

### 常见问题

1. **手机号格式错误**
   - 确保手机号为11位有效号码
   - 多个手机号用英文逗号分隔

2. **密码验证失败**
   - 检查密码是否为6位数字
   - 手机号与密码数量要匹配

3. **API调用失败**
   - 确认手机号在配置列表中
   - 检查POST请求格式是否正确

4. **缓存问题**
   - 使用 `?refresh=1` 强制刷新
   - 或访问 `/clear-cache` 清空缓存

### 调试模式

```bash
# 启动时查看详细日志
deno run --allow-all main.ts
```

## 📄 License

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**⭐ 如果这个项目对你有帮助，请给个星标支持！** 