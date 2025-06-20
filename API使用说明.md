# 电信套餐查询API使用说明

## 🆕 最新功能

### 1. 基础查询增强
现在基础查询自动包含详细信息汇总，无需额外调用增强查询即可获得关键账户信息。

### 2. 机器人专用API接口
新增 `/api/bot` 接口，专为钉钉、TG机器人等自动化场景设计，支持多种数据格式。

---

## 📊 基础查询增强

**接口地址：** `GET /query`  
**功能：** 获取套餐基础信息 + 关键详细信息汇总

**示例响应：**
```
【 ✨ 电信套餐用量监控 ( 增强版 ) ✨ 】
=================【基础信息】=================
📱 手机: 199****1016
💰 余额: ¥384.62
📞 通话: 69 / 400 min [████████░░░░░░░] 17.3%
🌐 总流量
  - 通用: 6.60 / 120.40 GB [█░░░░░░░░░░░░░░] 5.5%

📊 账户详情汇总
💸 当月产生：149.10元
💰 账户余额：¥158.90
⭐ 积分余额：2165分
☁️ 云盘空间：个人29.63GB，家庭29.99GB
📋 主要套餐：5G畅享融合套餐 129.00元
```

---

## 🤖 机器人专用API接口

### 接口基本信息
- **URL:** `POST /api/bot`
- **Content-Type:** `application/json`
- **功能:** 获取格式化的聚合数据，专为机器人推送优化

### 请求参数
```json
{
  "phonenum": "手机号",
  "password": "密码",
  "type": "查询类型"  // 可选: basic(默认) | enhanced | compact
}
```

### 查询类型说明

#### 1. basic (默认) - 基础版
**用途：** 日常查询，包含关键详细信息汇总
```json
{
  "phonenum": "19900001234",
  "password": "password123",
  "type": "basic"
}
```

**响应示例：**
```
【 ✨ 电信套餐用量监控 ( 增强版 ) ✨ 】
=================【基础信息】=================
📱 手机: 199****1234
💰 余额: ¥384.62
[... 完整基础信息 ...]

📊 账户详情汇总
💸 当月产生：149.10元
💰 账户余额：¥158.90
⭐ 积分余额：2165分
☁️ 云盘空间：个人29.63GB，家庭29.99GB
📋 主要套餐：5G畅享融合套餐 129.00元
```

#### 2. compact - 紧凑版 (推荐用于机器人通知)
**用途：** 钉钉/TG通知，信息紧凑，适合推送
```json
{
  "phonenum": "19900001234",
  "password": "password123",
  "type": "compact"
}
```

**响应示例：**
```
📱 199****1234
💰 余额: ¥384.62
📊 流量: 6.60/120.40GB (5.5%)
📞 通话: 69/400min (17.3%)
📦 流量包: 2个 (剩余72.66GB/90GB)
⏰ 2025-01-19 14:30:25
```

#### 3. enhanced - 增强版
**用途：** 完整详细信息，包含所有数据
```json
{
  "phonenum": "19900001234",
  "password": "password123",
  "type": "enhanced"
}
```

**响应示例：**
```
【 ✨ 电信套餐用量监控 ( 增强版 ) ✨ 】
=================【基础信息】=================
[... 完整基础信息 ...]

📱 流量包详情
[... 详细流量包信息 ...]

📋 账户详细信息
[... 完整账户详细信息 ...]

🔄 共享套餐信息
[... 共享套餐详情 ...]
```

---

## 🔧 钉钉机器人集成示例

### 1. Python示例
```python
import requests
import json

def send_telecom_info_to_dingtalk():
    # 获取电信数据
    bot_api_url = "https://your-domain.com/api/bot"
    data = {
        "phonenum": "19900001234",
        "password": "your_password",
        "type": "compact"  # 紧凑版，适合钉钉通知
    }
    
    response = requests.post(bot_api_url, json=data)
    result = response.json()
    
    if result["success"]:
        telecom_info = result["data"]
        
        # 发送到钉钉
        dingtalk_webhook = "YOUR_DINGTALK_WEBHOOK_URL"
        dingtalk_data = {
            "msgtype": "text",
            "text": {
                "content": f"📱 电信套餐监控\n\n{telecom_info}"
            }
        }
        
        requests.post(dingtalk_webhook, json=dingtalk_data)
        print("✅ 钉钉通知发送成功")
    else:
        print(f"❌ 获取数据失败: {result['error']}")

# 设置定时任务，每天发送一次
send_telecom_info_to_dingtalk()
```

### 2. curl示例
```bash
# 获取紧凑版数据
curl -X POST https://your-domain.com/api/bot \
  -H "Content-Type: application/json" \
  -d '{
    "phonenum": "19900001234",
    "password": "your_password",
    "type": "compact"
  }'

# 发送到钉钉 (需要替换webhook地址)
curl -X POST "YOUR_DINGTALK_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "msgtype": "text",
    "text": {
      "content": "从上面API获取的数据"
    }
  }'
```

---

## 📱 Telegram机器人集成示例

### JavaScript/Node.js示例
```javascript
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const bot = new TelegramBot('YOUR_BOT_TOKEN', {polling: true});

// 监听 /telecom 命令
bot.onText(/\/telecom/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    // 获取电信数据
    const response = await axios.post('https://your-domain.com/api/bot', {
      phonenum: '19900001234',
      password: 'your_password',
      type: 'compact'  // 紧凑版
    });
    
    if (response.data.success) {
      const telecomInfo = response.data.data;
      bot.sendMessage(chatId, `📱 电信套餐监控\n\n${telecomInfo}`);
    } else {
      bot.sendMessage(chatId, `❌ 获取数据失败: ${response.data.error}`);
    }
  } catch (error) {
    bot.sendMessage(chatId, `❌ 请求错误: ${error.message}`);
  }
});
```

---

## 🔒 安全说明

1. **密码安全：** 请确保API调用在安全环境中进行，避免密码泄露
2. **访问控制：** 建议配置白名单，限制允许查询的手机号
3. **HTTPS：** 生产环境请使用HTTPS协议
4. **频率限制：** 建议实现适当的调用频率限制

---

## 📈 使用建议

### 钉钉/企业微信群通知
- 使用 `compact` 类型
- 设置每日定时推送
- 关注余额和流量使用情况

### Telegram个人通知
- 使用 `basic` 类型获得详细信息
- 可设置流量超标警告
- 支持交互式查询

### 监控系统集成
- 使用 `enhanced` 类型获取完整数据
- 解析JSON进行数据分析
- 设置异常告警规则

---

## ❓ 常见问题

**Q: 机器人API和原有API有什么区别？**
A: 机器人API专门为自动化推送优化，提供预格式化的文本数据，原有API主要用于兼容Python版本的调用方式。

**Q: 可以同时配置多个手机号吗？**
A: 可以，系统支持多用户配置，每次调用时指定对应的手机号和密码即可。

**Q: 数据多久更新一次？**
A: 数据有缓存机制，默认缓存时间内返回缓存数据，过期后自动从电信API获取最新数据。

**Q: 如何处理网络异常？**
A: 建议在客户端实现重试机制，API调用失败时会返回详细的错误信息。 