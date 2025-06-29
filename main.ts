import type { ApiResponse, UserConfig, MultiUserConfig } from './types.ts';
import type { LoginRequest, LoginResponse, ApiRequest, SessionManagementResponse } from './api-types.ts';
import { maskPhoneNumber } from './utils.ts';
import { EnhancedTelecomClient } from './telecom.ts';
import { formatter } from './formatter.ts';
import { getCacheManager } from './cache.ts';
import { authManager } from './auth.ts';
import { generateMainPage, generateJsonPage } from './templates.ts';
import { loadConfig, getConfigManager } from './config-manager.ts';
import { TelecomAuthClient, getAuthClient } from './api-auth.ts';
import { TelecomApiClient, getApiClient } from './api-client.ts';
import { getSessionManager } from './session.ts';
import { notificationManager, type NotificationPlatform, type SendResult } from './notification.ts';

/**
 * 增强版电信套餐查询格式化服务
 */

// 配置验证和初始化
let multiConfig: MultiUserConfig;
let telecomClients: Map<string, EnhancedTelecomClient> = new Map();

try {
  // 使用新的配置管理器加载配置
  multiConfig = await loadConfig();
  
  // 为每个用户创建客户端
  for (const user of multiConfig.users) {
    const client = new EnhancedTelecomClient({
      phonenum: user.phonenum,
      password: user.password,
      apiBase: multiConfig.apiBase,
      cacheTime: multiConfig.cacheTime
    });
    telecomClients.set(user.phonenum, client);
  }
  
  console.log(`🚀 服务启动成功，已配置 ${multiConfig.users.length} 个用户:`);
  multiConfig.users.forEach(user => {
    console.log(`📱 用户: ${user.displayName}`);
  });
  
  console.log('\n📡 可用接口:');
  console.log('📊 格式化查询:');
  console.log('  • GET  /query     - 基础查询');
  console.log('  • GET  /enhanced  - 增强查询');
  console.log('  • GET  /json      - JSON数据');
  console.log('  • GET  /status    - 状态检查');
  console.log('  • GET  /clear-cache - 清理缓存');
  
  console.log('🔧 原始API (兼容Python版本):');
  console.log('  • POST /api/login             - 用户登录');
  console.log('  • POST /api/qryImportantData  - 套餐信息');
  console.log('  • POST /api/userFluxPackage   - 流量包查询');
  console.log('  • POST /api/qryShareUsage     - 共享流量');
  console.log('  • POST /api/summary           - 综合信息');
  
  console.log('🤖 机器人专用API:');
  console.log('  • POST /api/bot               - 机器人聚合数据接口');
  
  console.log('⚙️  会话管理:');
  console.log('  • GET  /api/session/stats     - 会话统计');
  console.log('  • GET  /api/session/clean     - 清理过期');
  console.log('  • GET  /api/session/clear     - 清除所有');
  console.log('-----------------------------------\n');
} catch (error) {
  console.error('❌ 服务启动失败:', error);
  throw new Error(`服务初始化失败: ${error.message}`);
}

// 主要查询处理函数
async function handleQuery(enhanced: boolean = false, forceRefresh: boolean = false, phonenum?: string): Promise<ApiResponse & { queryTimestamp?: number }> {
  try {
    // 确定要查询的手机号
    const targetPhone = phonenum || multiConfig.defaultUser;
    const telecomClient = telecomClients.get(targetPhone);
    
    if (!telecomClient) {
      return {
        success: false,
        error: `未找到手机号 ${maskPhoneNumber(targetPhone)} 的配置`,
        cached: false,
        phonenum: targetPhone
      };
    }
    
    const cacheManager = await getCacheManager();
    
    // 修复缓存键：直接传递组合键给缓存管理器
    const cacheKey = enhanced ? `${targetPhone}:enhanced` : `${targetPhone}:basic`;
    
    // 检查是否强制刷新
    if (!forceRefresh) {
      // 尝试从缓存获取数据 - 使用新的get方法
      const cachedData = await cacheManager.getWithCustomKey(cacheKey);
      if (cachedData && cachedData.formattedText) {
        console.log(`📦 使用${enhanced ? '增强' : '基础'}查询缓存数据 (${maskPhoneNumber(targetPhone)})`);
        return {
          success: true,
          data: cachedData.formattedText,
          cached: true,
          phonenum: targetPhone,
          queryTimestamp: cachedData.timestamp // 使用缓存的时间戳
        };
      }
    } else {
      console.log(`🔄 强制刷新${enhanced ? '增强' : '基础'}查询 (${maskPhoneNumber(targetPhone)})`);
    }
    
    console.log(`🔍 ${enhanced ? '增强' : '基础'}查询缓存未命中，从API获取新数据 (${maskPhoneNumber(targetPhone)})`);
    
    // 根据查询类型获取不同数据
    let formattedText: string;
    let cacheData: any;
    const queryTimestamp = Date.now(); // 记录实际查询时间
    
    if (enhanced) {
      // 增强查询：获取完整数据
      const fullData = await telecomClient.getFullData();
      
      formattedText = formatter.formatEnhancedTelecomData(
        fullData.summary, 
        fullData.fluxPackage,
        fullData.importantData,
        fullData.shareUsage
      );
      
      cacheData = {
        summary: fullData.summary,
        fluxPackage: fullData.fluxPackage,
        importantData: fullData.importantData,
        shareUsage: fullData.shareUsage,
        formattedText,
        queryType: 'enhanced',
        timestamp: queryTimestamp
      };
    } else {
      // 基础查询：获取核心数据 + 详细信息汇总
      const basicData = await telecomClient.getBasicData();
      const importantData = await telecomClient.getImportantData();
      
      formattedText = formatter.formatBasicSummary(basicData.summary, basicData.fluxPackage, importantData || undefined);
      
      cacheData = {
        summary: basicData.summary,
        fluxPackage: basicData.fluxPackage,
        importantData: importantData,
        formattedText,
        queryType: 'basic',
        timestamp: queryTimestamp
      };
    }
    
    // 保存到对应的缓存键
    try {
      await cacheManager.setWithCustomKey(cacheKey, cacheData);
      console.log(`💾 ${enhanced ? '增强' : '基础'}查询数据已缓存`);
    } catch (cacheError) {
      console.warn('⚠️ 保存缓存失败:', cacheError);
    }
    
    return {
      success: true,
      data: formattedText,
      cached: false,
      phonenum: targetPhone,
      queryTimestamp: queryTimestamp // 返回实际查询时间戳
    };
  } catch (error) {
    console.error('❌ 查询处理失败:', error);
    return {
      success: false,
      error: error.message,
      cached: false,
      phonenum: phonenum || multiConfig.defaultUser
    };
  }
}

// JSON数据查询处理函数
async function handleJsonQuery(phonenum?: string): Promise<ApiResponse> {
  try {
    // 确定要查询的手机号
    const targetPhone = phonenum || multiConfig.defaultUser;
    const telecomClient = telecomClients.get(targetPhone);
    
    if (!telecomClient) {
      return {
        success: false,
        error: `未找到手机号 ${maskPhoneNumber(targetPhone)} 的配置`,
        cached: false,
        phonenum: targetPhone
      };
    }
    
    const cacheManager = await getCacheManager();
    
    // JSON查询优先使用增强查询缓存，包含完整数据
    let cachedData = await cacheManager.getWithCustomKey(`${targetPhone}:enhanced`);
    
    if (cachedData) {
      console.log(`📦 使用增强查询缓存JSON数据 (${maskPhoneNumber(targetPhone)})`);
      const jsonData = {
        summary: cachedData.summary,
        fluxPackage: cachedData.fluxPackage,
        importantData: cachedData.importantData,
        shareUsage: cachedData.shareUsage,
        timestamp: cachedData.timestamp,
        dataSource: 'enhanced_cache'
      };
      return {
        success: true,
        data: jsonData,
        cached: true,
        phonenum: targetPhone
      };
    }
    
    // 如果没有增强查询缓存，尝试基础查询缓存
    cachedData = await cacheManager.getWithCustomKey(`${targetPhone}:basic`);
    if (cachedData) {
      console.log(`📦 使用基础查询缓存JSON数据 (${maskPhoneNumber(targetPhone)})`);
      const jsonData = {
        summary: cachedData.summary,
        fluxPackage: cachedData.fluxPackage,
        timestamp: cachedData.timestamp,
        dataSource: 'basic_cache'
      };
      return {
        success: true,
        data: jsonData,
        cached: true,
        phonenum: targetPhone
      };
    }
    
    console.log(`🔍 缓存未命中，从API获取新JSON数据 (${maskPhoneNumber(targetPhone)})`);
    
    // 获取完整数据用于JSON显示
    const fullData = await telecomClient.getFullData();
    
    const jsonData = {
      summary: fullData.summary,
      fluxPackage: fullData.fluxPackage,
      importantData: fullData.importantData,
      shareUsage: fullData.shareUsage,
      timestamp: Date.now(),
      dataSource: 'api_fresh'
    };
    
    return {
      success: true,
      data: jsonData,
      cached: false,
      phonenum: targetPhone
    };
  } catch (error) {
    console.error('❌ JSON查询处理失败:', error);
    return {
      success: false,
      error: error.message,
      cached: false,
      phonenum: phonenum || multiConfig.defaultUser
    };
  }
}

// 状态检查处理函数
async function handleStatus(): Promise<ApiResponse> {
  try {
    const cacheManager = await getCacheManager();
    const cacheHealth = await cacheManager.healthCheck();
    const cacheStats = await cacheManager.getStats();
    
    // 获取所有用户的健康状态
    const telecomStatuses: any = {};
    for (const [phonenum, client] of telecomClients.entries()) {
      try {
        telecomStatuses[maskPhoneNumber(phonenum)] = await client.getHealthStatus();
      } catch (error) {
        telecomStatuses[maskPhoneNumber(phonenum)] = {
          overall: false,
          error: error.message
        };
      }
    }
    
    // 获取配置管理器状态
    const configManager = await getConfigManager();
    const configInfo = await configManager.getConfigForManagement();
    const envChanged = await configManager.hasEnvConfigChanged();
    
    const statusData = {
      service: {
        status: 'running',
        version: '2.0.0 Enhanced',
        uptime: 'N/A',
        timestamp: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
      },
      config: {
        userCount: multiConfig.users.length,
        defaultUser: maskPhoneNumber(multiConfig.defaultUser),
        apiBase: multiConfig.apiBase,
        cacheTime: multiConfig.cacheTime,
        hasWebPassword: !!multiConfig.webPassword,
        kvConfigExists: configInfo.hasKvConfig,
        envConfigExists: configInfo.hasEnvConfig,
        envConfigChanged: envChanged,
        lastSync: configInfo.lastSync
      },
      cache: {
        health: cacheHealth,
        stats: cacheStats
      },
      telecom: telecomStatuses
    };
    
    return {
      success: true,
      data: statusData,
      cached: false
    };
  } catch (error) {
    console.error('❌ 状态检查失败:', error);
    return {
      success: false,
      error: error.message,
      cached: false
    };
  }
}

// 清除缓存处理函数
async function handleClearCache(): Promise<ApiResponse> {
  try {
    const cacheManager = await getCacheManager();
    await cacheManager.clear();
    
    console.log('🗑️ 已清除所有缓存（包括基础查询和增强查询缓存）');
    
    return {
      success: true,
      data: '✅ 缓存已清除（基础查询缓存 + 增强查询缓存）',
      cached: false
    };
  } catch (error) {
    console.error('❌ 清除缓存失败:', error);
    return {
      success: false,
      error: error.message,
      cached: false
    };
  }
}

// 配置管理处理函数
async function handleConfigManagement(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const method = request.method;
  
  try {
    const configManager = await getConfigManager();
    
    if (method === 'GET') {
      // 获取配置信息
      const configInfo = await configManager.getConfigForManagement();
      
      const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>配置管理 - 电信套餐查询</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
            color: #333;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }
        h1 { color: #667eea; margin-bottom: 20px; text-align: center; }
        h2 { color: #555; margin: 20px 0 10px 0; }
        .config-section {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
            border-left: 4px solid #667eea;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            margin-left: 10px;
        }
        .status-success { background: #d4edda; color: #155724; }
        .status-warning { background: #fff3cd; color: #856404; }
        .status-info { background: #d1ecf1; color: #0c5460; }
        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin: 5px;
            text-decoration: none;
            display: inline-block;
            font-size: 14px;
            transition: all 0.3s ease;
        }
        .btn-primary { background: #667eea; color: white; }
        .btn-warning { background: #ffc107; color: #212529; }
        .btn-danger { background: #dc3545; color: white; }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
        pre { background: #f1f3f4; padding: 10px; border-radius: 4px; overflow-x: auto; font-size: 13px; }
        .back-link { margin-bottom: 20px; }
        .back-link a { color: #667eea; text-decoration: none; }
        .back-link a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <div class="back-link">
            <a href="/">← 返回主页</a>
        </div>
        
        <h1>⚙️ 配置管理</h1>
        
        <h2>KV存储配置 ${configInfo.hasKvConfig ? '<span class="status-badge status-success">已配置</span>' : '<span class="status-badge status-warning">未配置</span>'}</h2>
        <div class="config-section">
            ${configInfo.kvConfig ? `
                <p><strong>手机号:</strong> ${configInfo.kvConfig.phoneNumbers}</p>
                <p><strong>密码:</strong> ${configInfo.kvConfig.passwords}</p>
                <p><strong>API地址:</strong> ${configInfo.kvConfig.apiBase || 'https://dx.ll.sd'}</p>
                <p><strong>缓存时间:</strong> ${configInfo.kvConfig.cacheTime || 2} 分钟</p>
                <p><strong>Web密码:</strong> ${configInfo.kvConfig.webPassword ? '已设置' : '未设置'}</p>
                <p><strong>最后同步:</strong> ${configInfo.lastSync || '未知'}</p>
            ` : '<p>KV存储中暂无配置数据</p>'}
            
            <div style="margin-top: 10px;">
                <button class="btn btn-warning" onclick="resyncFromEnv()">🔄 从环境变量同步</button>
                <button class="btn btn-danger" onclick="clearKvConfig()">🗑️ 清除KV配置</button>
            </div>
        </div>
        
        <h2>环境变量配置 ${configInfo.hasEnvConfig ? '<span class="status-badge status-success">已配置</span>' : '<span class="status-badge status-warning">未配置</span>'}</h2>
        <div class="config-section">
            ${configInfo.envConfig ? `
                <p><strong>手机号:</strong> ${configInfo.envConfig.phoneNumbers}</p>
                <p><strong>密码:</strong> ${configInfo.envConfig.passwords}</p>
                <p><strong>API地址:</strong> ${configInfo.envConfig.apiBase || 'https://dx.ll.sd'}</p>
                <p><strong>缓存时间:</strong> ${configInfo.envConfig.cacheTime || 2} 分钟</p>
                <p><strong>Web密码:</strong> ${configInfo.envConfig.webPassword ? '已设置' : '未设置'}</p>
            ` : '<p>环境变量未配置完整</p>'}
        </div>
        
        <h2>操作说明</h2>
        <div class="config-section">
            <p><strong>配置优先级:</strong> KV存储 → 环境变量</p>
            <p><strong>自动同步:</strong> 首次启动时会自动从环境变量同步到KV</p>
            <p><strong>手动同步:</strong> 点击"从环境变量同步"按钮可重新同步</p>
            <p><strong>在线编辑:</strong> 可以直接在KV存储中编辑配置（需要通过API）</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
            <a href="/" class="btn btn-primary">返回主页</a>
            <a href="/status" class="btn btn-primary">查看状态</a>
        </div>
    </div>
    
    <script>
        async function resyncFromEnv() {
            if (!confirm('确定要从环境变量重新同步配置吗？这会覆盖当前KV配置。')) return;
            
            try {
                const response = await fetch('/config/sync', { method: 'POST' });
                const result = await response.json();
                
                if (result.success) {
                    alert('✅ 配置同步成功！');
                    location.reload();
                } else {
                    alert('❌ 配置同步失败: ' + result.error);
                }
            } catch (error) {
                alert('❌ 请求失败: ' + error.message);
            }
        }
        
        async function clearKvConfig() {
            if (!confirm('确定要清除KV配置吗？这会导致服务回退到使用环境变量。')) return;
            
            try {
                const response = await fetch('/config/clear', { method: 'POST' });
                const result = await response.json();
                
                if (result.success) {
                    alert('✅ KV配置已清除！');
                    location.reload();
                } else {
                    alert('❌ 清除失败: ' + result.error);
                }
            } catch (error) {
                alert('❌ 请求失败: ' + error.message);
            }
        }
    </script>
</body>
</html>`;
      
      return new Response(html, { 
        headers: { 'Content-Type': 'text/html; charset=utf-8' } 
      });
      
    } else if (method === 'POST') {
      const action = url.pathname.split('/').pop();
      
      if (action === 'sync') {
        // 重新从环境变量同步
        await configManager.resyncFromEnv();
        return new Response(JSON.stringify({ success: true, message: '配置已同步' }), {
          headers: { 'Content-Type': 'application/json' }
        });
        
      } else if (action === 'clear') {
        // 清除KV配置
        const cleared = await configManager.clearKvConfig();
        return new Response(JSON.stringify({ 
          success: cleared, 
          message: cleared ? '配置已清除' : '清除失败' 
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
        
      } else if (action === 'update') {
        // 更新配置（从请求体获取新配置）
        const body = await request.json();
        await configManager.updateConfig(body);
        return new Response(JSON.stringify({ success: true, message: '配置已更新' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    return new Response('Not Found', { status: 404 });
    
  } catch (error) {
    console.error('❌ 配置管理处理失败:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// 机器人专用查询处理函数
async function handleBotQuery(request: Request): Promise<ApiResponse> {
  try {
    const body = await request.json();
    const { 
      phonenum, 
      password, 
      type = 'basic', 
      send_type, 
      chat_id, 
      use_markdown = false 
    } = body;
    
    if (!phonenum || !password) {
      return {
        success: false,
        error: '请提供手机号和密码',
        cached: false
      };
    }
    
    // 为机器人API创建临时客户端（不需要预配置）
    const telecomClient = new EnhancedTelecomClient({
      phonenum: phonenum,
      password: password,
      apiBase: multiConfig.apiBase,
      cacheTime: multiConfig.cacheTime
    });
    
    // 根据类型生成不同的机器人数据
    let formattedText: string;
    
    if (type === 'enhanced') {
      // 增强版机器人数据：完整详细信息
      const fullData = await telecomClient.getFullData();
      formattedText = formatter.formatEnhancedTelecomData(
        fullData.summary, 
        fullData.fluxPackage,
        fullData.importantData,
        fullData.shareUsage
      );
    } else if (type === 'compact') {
      // 紧凑版机器人数据：仅核心信息，适合钉钉/TG通知
      const basicData = await telecomClient.getBasicData();
      formattedText = formatter.formatCompactForBot(basicData.summary, basicData.fluxPackage);
    } else {
      // 基础版机器人数据：包含关键详细信息汇总
      const basicData = await telecomClient.getBasicData();
      const importantData = await telecomClient.getImportantData();
      formattedText = formatter.formatBasicSummary(basicData.summary, basicData.fluxPackage, importantData || undefined);
    }
    
    // 构建基础响应
    let response: ApiResponse = {
      success: true,
      data: formattedText,
      cached: false,
      phonenum: maskPhoneNumber(phonenum),
      timestamp: new Date().toISOString()
    };
    
    // 如果指定了发送类型，则发送通知
    if (send_type && ['dingtalk', 'telegram', 'both'].includes(send_type)) {
      console.log(`📤 开始发送通知到: ${send_type}`);
      
      try {
        const sendResults = await notificationManager.sendNotification(
          send_type as NotificationPlatform,
          formattedText,
          chat_id,
          use_markdown
        );
        
        // 添加发送结果到响应中
        const sendSummary = {
          platform: send_type,
          results: sendResults,
          total_sent: sendResults.filter(r => r.success).length,
          total_failed: sendResults.filter(r => !r.success).length
        };
        
        response.send_results = sendSummary;
        
        // 如果所有发送都失败，更新主响应状态
        if (sendSummary.total_sent === 0 && sendSummary.total_failed > 0) {
          response.success = false;
          response.error = `查询成功但通知发送失败: ${sendResults.map(r => r.error).filter(Boolean).join(', ')}`;
        } else if (sendSummary.total_failed > 0) {
          response.warning = `部分通知发送失败: ${sendResults.filter(r => !r.success).map(r => r.error).join(', ')}`;
        }
        
        console.log(`📤 通知发送完成: 成功${sendSummary.total_sent}个，失败${sendSummary.total_failed}个`);
        
      } catch (sendError) {
        console.error('❌ 通知发送异常:', sendError);
        response.warning = `通知发送异常: ${sendError.message}`;
      }
    }
    
    return response;
    
  } catch (error) {
    console.error('❌ 机器人查询处理失败:', error);
    return {
      success: false,
      error: error.message,
      cached: false
    };
  }
}

// POST查询处理函数
async function handlePostQuery(request: Request): Promise<ApiResponse> {
  try {
    const body = await request.json();
    const { phonenum, password, enhanced = false } = body;
    
    if (!phonenum || !password) {
      return {
        success: false,
        error: '请提供手机号和密码',
        cached: false
      };
    }
    
    // 为POST查询创建临时客户端（不需要预配置）
    const telecomClient = new EnhancedTelecomClient({
      phonenum: phonenum,
      password: password,
      apiBase: multiConfig.apiBase,
      cacheTime: multiConfig.cacheTime
    });
    
    // 直接获取数据并格式化
    try {
      let formattedText: string;
      const queryTimestamp = Date.now();
      
      if (enhanced) {
        // 增强查询：获取完整数据
        const fullData = await telecomClient.getFullData();
        formattedText = formatter.formatEnhancedTelecomData(
          fullData.summary, 
          fullData.fluxPackage,
          fullData.importantData,
          fullData.shareUsage
        );
      } else {
        // 基础查询：获取核心数据 + 详细信息汇总
        const basicData = await telecomClient.getBasicData();
        const importantData = await telecomClient.getImportantData();
        formattedText = formatter.formatBasicSummary(basicData.summary, basicData.fluxPackage, importantData || undefined);
      }
      
      return {
        success: true,
        data: formattedText,
        cached: false,
        phonenum: maskPhoneNumber(phonenum),
        timestamp: new Date().toISOString()
      };
    } catch (clientError) {
      return {
        success: false,
        error: `查询失败: ${clientError.message}`,
        cached: false,
        phonenum: maskPhoneNumber(phonenum)
      };
    }
    
  } catch (error) {
    console.error('❌ POST查询处理失败:', error);
    return {
      success: false,
      error: error.message,
      cached: false
    };
  }
}

// 获取会话cookie
function getSessionFromCookie(request: Request): string | null {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;
  
  const cookies = cookieHeader.split(';').map(c => c.trim());
  const sessionCookie = cookies.find(c => c.startsWith('session='));
  
  return sessionCookie ? sessionCookie.split('=')[1] : null;
}

// 设置会话cookie
function setSessionCookie(sessionId: string): string {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24小时
  return `session=${sessionId}; Path=/; Expires=${expires.toUTCString()}; HttpOnly; SameSite=Strict`;
}

// 认证检查
function requireAuth(request: Request): { authenticated: boolean; sessionId?: string } {
  if (!multiConfig.webPassword) {
    return { authenticated: true };
  }
  
  const sessionId = getSessionFromCookie(request);
  if (sessionId && authManager.validateSession(sessionId)) {
    return { authenticated: true, sessionId };
  }
  
  return { authenticated: false };
}

// ============ 新增 API 处理函数 ============

// API 登录处理
async function handleApiLogin(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({
      success: false,
      message: '仅支持 POST 请求'
    }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  try {
    const loginData: LoginRequest = await request.json();
    
    if (!loginData.phonenum || !loginData.password) {
      return new Response(JSON.stringify({
        success: false,
        message: '手机号和密码不能为空'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 获取客户端IP
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    // 使用认证客户端处理登录
    const authClient = getAuthClient(multiConfig.apiBase);
    const result = await authClient.login(loginData, clientIp);
    
    const statusCode = result.success ? 200 : 401;
    
    return new Response(JSON.stringify(result), {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('API登录处理失败:', error);
    return new Response(JSON.stringify({
      success: false,
      message: `登录处理失败: ${error.message}`
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// API 查询处理
async function handleApiQuery(request: Request, endpoint: string): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({
      success: false,
      message: '仅支持 POST 请求'
    }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  try {
    const requestData: ApiRequest = await request.json();
    
    if (!requestData.phonenum || !requestData.token) {
      return new Response(JSON.stringify({
        success: false,
        message: '手机号和Token不能为空'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 验证Token
    const authClient = getAuthClient(multiConfig.apiBase);
    const isValidToken = await authClient.validateToken(requestData.phonenum, requestData.token);
    
    if (!isValidToken) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Token无效或已过期'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 执行API调用
    const apiClient = getApiClient(multiConfig.apiBase);
    let result;
    
    switch (endpoint) {
      case 'qryImportantData':
        result = await apiClient.qryImportantData(requestData);
        break;
      case 'userFluxPackage':
        result = await apiClient.userFluxPackage(requestData);
        break;
      case 'qryShareUsage':
        result = await apiClient.qryShareUsage(requestData);
        break;
      case 'summary':
        result = await apiClient.summary(requestData);
        break;
      default:
        return new Response(JSON.stringify({
          success: false,
          message: `未知的API端点: ${endpoint}`
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
    }
    
    const statusCode = result.success ? 200 : 500;
    
    return new Response(JSON.stringify(result), {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error(`API查询处理失败 (${endpoint}):`, error);
    return new Response(JSON.stringify({
      success: false,
      message: `查询处理失败: ${error.message}`
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// 会话管理处理
async function handleSessionManagement(request: Request, action: string): Promise<Response> {
  if (request.method !== 'GET' && request.method !== 'POST') {
    return new Response(JSON.stringify({
      success: false,
      message: '仅支持 GET 或 POST 请求'
    }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  try {
    const sessionManager = await getSessionManager();
    let result: SessionManagementResponse;
    
    switch (action) {
      case 'stats':
        const stats = await sessionManager.getStats();
        result = {
          success: true,
          message: '获取会话统计成功',
          stats
        };
        break;
        
      case 'clean':
        const cleaned = await sessionManager.cleanExpiredSessions();
        result = {
          success: true,
          message: `已清理 ${cleaned} 个过期会话`,
          cleaned
        };
        break;
        
      case 'clear':
        const cleared = await sessionManager.clearAllSessions();
        result = {
          success: true,
          message: `已清除所有 ${cleared} 个会话`,
          cleaned: cleared
        };
        break;
        
      default:
        return new Response(JSON.stringify({
          success: false,
          message: `未知的会话管理操作: ${action}`
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
    }
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error(`会话管理处理失败 (${action}):`, error);
    return new Response(JSON.stringify({
      success: false,
      message: `会话管理失败: ${error.message}`
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// 登录处理
async function handleLogin(request: Request): Promise<Response> {
  if (request.method === 'GET') {
    const loginHtml = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>登录 - 电信套餐查询</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .login-card {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 15px;
            padding: 40px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            width: 100%;
            max-width: 400px;
        }
        h1 { text-align: center; color: #667eea; margin-bottom: 30px; }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 5px; color: #555; font-weight: 500; }
        input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 16px; }
        input:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); }
        .btn { width: 100%; padding: 12px; background: #667eea; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; transition: all 0.3s ease; }
        .btn:hover { background: #5a6fd8; transform: translateY(-1px); }
        .error { color: #dc3545; margin-top: 10px; font-size: 14px; }
    </style>
</head>
<body>
    <div class="login-card">
        <h1>🔐 用户登录</h1>
        <form method="POST" action="/login">
            <div class="form-group">
                <label for="password">访问密码</label>
                <input type="password" id="password" name="password" required>
            </div>
            <button type="submit" class="btn">登录</button>
            <div class="error" id="error" style="display: none;"></div>
        </form>
    </div>
</body>
</html>`;
    
    return new Response(loginHtml, { 
      headers: { 'Content-Type': 'text/html; charset=utf-8' } 
    });
  }
  
  if (request.method === 'POST') {
    const formData = await request.formData();
    const password = formData.get('password')?.toString();
    
    if (password === multiConfig.webPassword) {
      const sessionId = authManager.createSession();
      return new Response('', {
        status: 302,
        headers: {
          'Location': '/',
          'Set-Cookie': setSessionCookie(sessionId)
        }
      });
    } else {
      return new Response('Unauthorized', { status: 401 });
    }
  }
  
  return new Response('Method Not Allowed', { status: 405 });
}

// 主请求处理函数
async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const method = request.method;
  
  // 处理登录页面（不需要认证）
  if (url.pathname === '/login') {
    return await handleLogin(request);
  }
  
  // 机器人专用API路由（不需要认证）
  if (url.pathname === '/api/bot') {
    const result = await handleBotQuery(request);
    return new Response(JSON.stringify(result), { 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
  
  // 原有API路由（不需要认证，保持向后兼容）
  if (url.pathname === '/api/query' && (method === 'GET' || method === 'POST')) {
    let result: ApiResponse;
    
    if (method === 'GET') {
      const phoneParam = url.searchParams.get('phonenum');
      const enhanced = url.searchParams.get('enhanced') === 'true';
      result = await handleQuery(enhanced, false, phoneParam || undefined);
    } else {
      result = await handlePostQuery(request);
    }
    
    return new Response(JSON.stringify(result), { 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
  
  // API 登录路由（不需要认证）
  if (url.pathname === '/api/login') {
    return await handleApiLogin(request);
  }
  
  // 认证检查
  const authResult = requireAuth(request);
  if (!authResult.authenticated) {
    return Response.redirect(new URL('/login', request.url).toString(), 302);
  }
  
  try {
    // 配置管理相关路由
    if (url.pathname.startsWith('/config')) {
      return await handleConfigManagement(request);
    }
    
    // 获取查询参数
    const phoneParam = url.searchParams.get('phone');
    const refreshParam = url.searchParams.get('refresh');
    const forceRefresh = refreshParam === '1' || refreshParam === 'true';
    
    // 路由处理
    if (url.pathname === '/' && method === 'GET') {
      const result = await handleQuery(false, false, phoneParam || undefined);
      const content = result.success ? result.data as string : `❌ 查询失败: ${result.error}`;
      const queryTimestamp = result.success ? (result as any).queryTimestamp : undefined;
      const html = generateMainPage(content, '电信套餐查询', multiConfig.users, phoneParam || multiConfig.defaultUser, multiConfig.cacheTime, queryTimestamp);
      return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }
    
    if (url.pathname === '/query' && method === 'GET') {
      const result = await handleQuery(false, forceRefresh, phoneParam || undefined);
      const content = result.success ? result.data as string : `❌ 查询失败: ${result.error}`;
      const queryTimestamp = result.success ? (result as any).queryTimestamp : undefined;
      const html = generateMainPage(content, '基础查询结果', multiConfig.users, phoneParam || multiConfig.defaultUser, multiConfig.cacheTime, queryTimestamp);
      return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }
    
    if (url.pathname === '/enhanced' && method === 'GET') {
      const result = await handleQuery(true, forceRefresh, phoneParam || undefined);
      const content = result.success ? result.data as string : `❌ 查询失败: ${result.error}`;
      const queryTimestamp = result.success ? (result as any).queryTimestamp : undefined;
      const html = generateMainPage(content, '增强查询结果', multiConfig.users, phoneParam || multiConfig.defaultUser, multiConfig.cacheTime, queryTimestamp);
      return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }
    
    if (url.pathname === '/json' && method === 'GET') {
      const result = await handleJsonQuery(phoneParam || undefined);
      if (result.success) {
        const html = generateJsonPage(result.data);
        return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      } else {
        return new Response(JSON.stringify({ error: result.error }), { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' } 
        });
      }
    }
    
    if (url.pathname === '/status' && method === 'GET') {
      const result = await handleStatus();
      if (result.success) {
        const html = generateJsonPage(result.data);
        return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      } else {
        return new Response(JSON.stringify({ error: result.error }), { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' } 
        });
      }
    }
    
    if (url.pathname === '/clear-cache' && method === 'GET') {
      const result = await handleClearCache();
      const content = result.success ? result.data as string : `❌ 操作失败: ${result.error}`;
      const html = generateMainPage(content, '缓存清理结果', multiConfig.users, phoneParam || multiConfig.defaultUser, multiConfig.cacheTime);
      return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }
    
    // ============ 其他 API 路由 ============
    
    // API 查询路由
    if (url.pathname === '/api/qryImportantData') {
      return await handleApiQuery(request, 'qryImportantData');
    }
    
    if (url.pathname === '/api/userFluxPackage') {
      return await handleApiQuery(request, 'userFluxPackage');
    }
    
    if (url.pathname === '/api/qryShareUsage') {
      return await handleApiQuery(request, 'qryShareUsage');
    }
    
    if (url.pathname === '/api/summary') {
      return await handleApiQuery(request, 'summary');
    }
    
    // 会话管理路由
    if (url.pathname === '/api/session/stats') {
      return await handleSessionManagement(request, 'stats');
    }
    
    if (url.pathname === '/api/session/clean') {
      return await handleSessionManagement(request, 'clean');
    }
    
    if (url.pathname === '/api/session/clear') {
      return await handleSessionManagement(request, 'clear');
    }
    
    return new Response('Not Found', { status: 404 });
    
  } catch (error) {
    console.error('❌ 请求处理失败:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}

// 导出处理函数
export default { fetch: handleRequest }; 