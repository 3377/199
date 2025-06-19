# 📱 电信套餐查询格式化服务 Enhanced

基于 Deno 构建的中国电信套餐查询格式化服务，将 ChinaTelecomMonitor 的 JSON 接口数据转换为美观的文本格式。

## ✨ 功能特性

### 🎯 核心功能
- **智能格式化**：将原始JSON数据转换为类似青龙脚本推送的美观格式
- **双重显示模式**：基础模式（兼容原版）和增强模式（进度条+统计分析）
- **进度条可视化**：使用ASCII字符创建进度条显示使用比例
- **智能提醒**：根据余额和流量使用情况提供个性化提醒

### 🚀 性能优化
- **高性能缓存**：使用Deno KV缓存数据，减少接口调用（默认10分钟）
- **并行请求**：同时调用多个接口，提高数据获取速度
- **错误恢复**：部分接口失败不影响核心功能

### 🔒 安全与配置
- **环境变量配置**：通过环境变量管理敏感信息
- **配置验证**：启动时验证手机号和密码格式
- **CORS支持**：支持跨域访问

### 📊 监控与状态
- **服务状态监控**：提供详细的服务健康检查
- **缓存统计**：实时查看缓存使用情况
- **接口健康检查**：监控各个电信接口的可用性

## 🌐 接口说明

### 主要接口

| 接口路径 | 方法 | 说明 | 返回格式 |
|---------|------|------|----------|
| `/query` | GET | 基础套餐查询（兼容原版格式） | 文本 |
| `/enhanced` | GET | 增强套餐查询（进度条+统计分析） | 文本 |
| `/json` | GET | 原始JSON数据 | JSON |
| `/status` | GET | 服务状态检查 | JSON |
| `/clear-cache` | POST | 清除缓存 | 文本 |

### 返回格式示例

#### 基础模式 (`/query`)
```
【电信套餐用量监控】

📱 手机：199****1016
💰 余额：384.62
📞 通话：68 / 400 min
🌐 总流量
  - 通用：6.56 / 120.4 GB 🟢

【流量包明细】

🇨🇳国内通用流量
🔹[电信无忧卡201905-手机上网全国流量]已用21.18MB/共200.00MB
🔹[5G流量包-权益平台]已用1.54GB/共5.00GB

查询时间：2025-01-19 20:00:03

前不见古人,后不见来者.念天地之悠悠,独怆然而涕下.    ----登幽州台歌
```

#### 增强模式 (`/enhanced`)
```
【✨ 电信套餐用量监控 ✨】
════════════════════════════════════════

📱 手机：199****1016
💰 余额：¥384.62 (充足)
📞 通话：68 / 400 min [███░░░░░░░] 17.0%
🌐 总流量
  - 通用：6.56 / 120.4 GB 🟢
    [██░░░░░░░░░░░░░] 5.4%

📊 使用分析
📊 日均流量：245.6MB | 剩余天数：12天
📈 使用趋势：正常

════════════════════════════════════════
【📦 流量包明细】

🇨🇳 国内通用流量
  🔹 [电信无忧卡201905-手机上网全国流量] 已用21.18MB/共200.00MB
      [██░░░░░░] 10.6% 已使用
  🔹 [5G流量包-权益平台] 已用1.54GB/共5.00GB
      [███░░░░░] 30.8% 已使用

📦 流量包统计：共25个，活跃3个

════════════════════════════════════════
⏰ 查询时间：2025-01-19 20:00:03
💡 温馨提示：✅ 一切正常，继续享受服务

📜 海内存知己,天涯若比邻.    ----送杜少府之任蜀州
════════════════════════════════════════
```

## 🚀 部署方式

### 方法一：Deno Deploy 部署（推荐）

根据 [Deno Deploy 官方文档](https://docs.deno.com/deploy/manual/)，多文件项目需要通过 GitHub 集成部署：

#### 1. 准备 GitHub 仓库
```bash
# 克隆或下载项目到本地
git clone <your-repo-url>
cd telecom-formatter

# 推送到你的 GitHub 仓库
git add .
git commit -m "初始化电信套餐查询服务"
git push origin main
```

#### 2. 在 Deno Deploy 中创建项目
1. 访问 [Deno Deploy Dashboard](https://dash.deno.com)
2. 点击 "New Project" 按钮
3. 选择 "Connect to GitHub"
4. 授权并选择包含代码的 GitHub 仓库
5. 配置项目设置：
   - **Entry Point**: `main.ts`
   - **Root Directory**: `telecom-formatter/`（如果文件在子目录中）

#### 3. 设置环境变量
在 Deno Deploy 项目设置中配置：
```bash
TELECOM_PHONENUM=199****1016    # 你的电信手机号
TELECOM_PASSWORD=123456         # 你的服务密码（6位数字）
API_BASE=https://dx.ll.sd       # 你的ChinaTelecomMonitor接口地址
CACHE_TIME=600000               # 缓存时间（毫秒，可选，默认10分钟）
PORT=8000                       # 端口号（可选，默认8000）
```

#### 4. 部署完成
- 点击 "Deploy Project" 完成部署
- 获得类似 `https://your-project.deno.dev` 的访问地址
- 访问 `/enhanced` 体验增强格式化效果

### 方法二：本地开发和测试

#### 1. 安装 Deno
```bash
# macOS/Linux
curl -fsSL https://deno.land/install.sh | sh

# Windows (PowerShell)
irm https://deno.land/install.ps1 | iex
```

#### 2. 设置环境变量
```bash
# Linux/macOS
export TELECOM_PHONENUM="199****1016"
export TELECOM_PASSWORD="123456"
export API_BASE="https://dx.ll.sd"

# Windows
set TELECOM_PHONENUM=199****1016
set TELECOM_PASSWORD=123456
set API_BASE=https://dx.ll.sd
```

#### 3. 运行服务
```bash
# 开发模式（自动重载）
deno task dev

# 生产模式
deno task start

# 或直接运行
deno run --allow-net --allow-env --allow-read --allow-write main.ts
```

#### 4. 访问服务
- 基础查询：http://localhost:8000/query
- 增强查询：http://localhost:8000/enhanced
- JSON数据：http://localhost:8000/json
- 状态检查：http://localhost:8000/status

### 方法三：其他 Deno 托管平台

本项目也可以部署到其他支持 Deno 的平台：
- **Deno Deploy** (推荐)
- **Heroku** (使用 Deno buildpack)
- **Railway**
- **Render**

## 📋 项目结构

```
telecom-formatter/
├── main.ts              # 主服务器文件
├── types.ts             # TypeScript 类型定义
├── utils.ts             # 工具函数
├── formatter.ts         # 数据格式化器
├── telecom.ts           # 电信接口客户端
├── cache.ts             # KV 缓存管理
├── deno.json            # Deno 项目配置
├── .gitignore           # Git 忽略文件
└── README.md            # 项目说明
```

## 🔧 配置选项

### 环境变量

| 变量名 | 必需 | 默认值 | 说明 |
|--------|------|--------|------|
| `TELECOM_PHONENUM` | ✅ | - | 电信手机号（11位数字） |
| `TELECOM_PASSWORD` | ✅ | - | 服务密码（6位数字） |
| `API_BASE` | ❌ | `https://dx.ll.sd` | ChinaTelecomMonitor接口地址 |
| `CACHE_TIME` | ❌ | `600000` | 缓存时间（毫秒） |
| `PORT` | ❌ | `8000` | 服务端口 |

### 性能调优

1. **缓存时间调整**：
   - 生产环境：建议10-30分钟 (`600000-1800000`)
   - 开发环境：建议1-5分钟 (`60000-300000`)

2. **并发优化**：
   - 核心接口（summary、fluxPackage）并行调用
   - 扩展接口（importantData、shareUsage）允许失败

## 🐛 故障排除

### 常见问题

1. **环境变量未设置**
   ```
   错误: 请设置环境变量 TELECOM_PHONENUM 和 TELECOM_PASSWORD
   解决: 检查环境变量配置是否正确
   ```

2. **手机号或密码格式错误**
   ```
   错误: 手机号格式不正确 / 密码必须为6位数字
   解决: 确认手机号为11位数字，密码为6位数字
   ```

3. **接口调用失败**
   ```
   错误: 获取基本信息失败: HTTP错误! status: 500
   解决: 检查 API_BASE 地址是否正确，原接口是否正常
   ```

4. **缓存服务不可用**
   ```
   错误: 缓存服务不可用
   解决: Deno Deploy 会自动提供 KV 服务，本地开发需要 Deno 1.32+
   ```

### 调试模式

启用详细日志：
```bash
deno run --allow-net --allow-env --allow-read --allow-write --log-level=info main.ts
```

### 健康检查

访问 `/status` 接口查看服务状态：
```json
{
  "service": "电信套餐查询格式化服务",
  "version": "2.0.0",
  "cache": {
    "healthy": true,
    "latency": 12
  },
  "telecom": {
    "summary": true,
    "fluxPackage": true,
    "overall": true
  },
  "overall": true
}
```

## 📄 许可证

本项目基于原 ChinaTelecomMonitor 项目，遵循相同的开源许可证。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

## 📞 支持

如果你在使用过程中遇到任何问题，请：
1. 查看本文档的故障排除部分
2. 访问 `/status` 接口检查服务状态
3. 提交 GitHub Issue 并附上详细的错误信息

---

**注意**：本项目仅供学习和个人使用，请确保遵守中国电信的服务条款。 