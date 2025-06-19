import type { ApiResponse } from './types.ts';
import { validateConfig, maskPhoneNumber } from './utils.ts';
import { EnhancedTelecomClient } from './telecom.ts';
import { formatter } from './formatter.ts';
import { getCacheManager } from './cache.ts';

/**
 * 增强版电信套餐查询格式化服务
 */

// 配置验证和初始化
let config: ReturnType<typeof validateConfig>;
let telecomClient: EnhancedTelecomClient;

try {
  config = validateConfig();
  telecomClient = new EnhancedTelecomClient(config);
  console.log(`🚀 服务启动成功，目标手机号: ${maskPhoneNumber(config.phonenum)}`);
} catch (error) {
  console.error('❌ 服务启动失败:', error);
  throw new Error(`服务初始化失败: ${error.message}`);
}

// 主要查询处理函数
async function handleQuery(enhanced: boolean = false): Promise<ApiResponse> {
  try {
    const cacheManager = await getCacheManager();
    
    // 尝试从缓存获取数据
    const cachedData = await cacheManager.get(config.phonenum);
    if (cachedData && cachedData.formattedText) {
      console.log('📦 使用缓存数据');
      return {
        success: true,
        data: cachedData.formattedText,
        cached: true
      };
    }
    
    console.log('🔍 缓存未命中，从API获取新数据');
    
    // 获取新数据
    const fullData = await telecomClient.getFullData();
    
    // 格式化数据
    const formattedText = enhanced 
      ? formatter.formatEnhancedTelecomData(
          fullData.summary, 
          fullData.fluxPackage,
          fullData.importantData,
          fullData.shareUsage
        )
      : formatter.formatTelecomData(fullData.summary, fullData.fluxPackage);
    
    // 保存到缓存
    try {
      await cacheManager.set(config.phonenum, {
        summary: fullData.summary,
        fluxPackage: fullData.fluxPackage,
        importantData: fullData.importantData,
        shareUsage: fullData.shareUsage,
        formattedText
      });
    } catch (cacheError) {
      console.warn('⚠️ 保存缓存失败:', cacheError);
    }
    
    return {
      success: true,
      data: formattedText,
      cached: false
    };
  } catch (error) {
    console.error('❌ 查询处理失败:', error);
    return {
      success: false,
      error: error.message,
      cached: false
    };
  }
}

// JSON数据查询处理函数
async function handleJsonQuery(): Promise<ApiResponse> {
  try {
    const cacheManager = await getCacheManager();
    
    // 尝试从缓存获取数据
    const cachedData = await cacheManager.get(config.phonenum);
    if (cachedData) {
      console.log('📦 使用缓存JSON数据');
      return {
        success: true,
        data: JSON.stringify({
          summary: cachedData.summary,
          fluxPackage: cachedData.fluxPackage,
          importantData: cachedData.importantData,
          shareUsage: cachedData.shareUsage,
          timestamp: cachedData.timestamp
        }, null, 2),
        cached: true
      };
    }
    
    console.log('🔍 缓存未命中，从API获取新JSON数据');
    
    // 获取新数据
    const fullData = await telecomClient.getFullData();
    
    const jsonData = {
      summary: fullData.summary,
      fluxPackage: fullData.fluxPackage,
      importantData: fullData.importantData,
      shareUsage: fullData.shareUsage,
      timestamp: Date.now()
    };
    
    return {
      success: true,
      data: JSON.stringify(jsonData, null, 2),
      cached: false
    };
  } catch (error) {
    console.error('❌ JSON查询处理失败:', error);
    return {
      success: false,
      error: error.message,
      cached: false
    };
  }
}

// 状态检查处理函数
async function handleStatus(): Promise<ApiResponse> {
  try {
    const cacheManager = await getCacheManager();
    const [cacheHealth, telecomHealth] = await Promise.all([
      cacheManager.healthCheck(),
      telecomClient.getHealthStatus()
    ]);
    
    const cacheStats = await cacheManager.getStats();
    
    const statusData = {
      service: '电信套餐查询格式化服务',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      cache: {
        healthy: cacheHealth.isHealthy,
        latency: cacheHealth.latency,
        stats: cacheStats
      },
      telecom: telecomHealth,
      overall: cacheHealth.isHealthy && telecomHealth.overall
    };
    
    return {
      success: true,
      data: JSON.stringify(statusData, null, 2),
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
    
    return {
      success: true,
      data: '缓存已清空',
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

// HTTP请求处理器
async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const method = request.method;
  
  // CORS头
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  
  // 处理OPTIONS预检请求
  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }
  
  let result: ApiResponse;
  
  try {
    switch (pathname) {
      case '/':
      case '/query':
        // 基础查询接口
        result = await handleQuery(false);
        break;
        
      case '/enhanced':
        // 增强查询接口
        result = await handleQuery(true);
        break;
        
      case '/json':
        // JSON数据接口
        result = await handleJsonQuery();
        break;
        
      case '/status':
      case '/health':
        // 状态检查接口
        result = await handleStatus();
        break;
        
      case '/clear-cache':
        // 清除缓存接口（仅支持POST）
        if (method === 'POST') {
          result = await handleClearCache();
        } else {
          result = {
            success: false,
            error: '此接口仅支持POST方法',
            cached: false
          };
        }
        break;
        
      default:
        result = {
          success: false,
          error: `未知的接口路径: ${pathname}`,
          cached: false
        };
    }
  } catch (error) {
    console.error('❌ 请求处理异常:', error);
    result = {
      success: false,
      error: '服务器内部错误',
      cached: false
    };
  }
  
  // 构建响应
  const status = result.success ? 200 : 400;
  const responseData = result.success ? result.data : result.error;
  
  // 根据路径决定Content-Type
  const isJsonResponse = pathname.includes('json') || pathname.includes('status') || pathname.includes('health');
  const contentType = isJsonResponse ? 'application/json; charset=utf-8' : 'text/plain; charset=utf-8';
  
  const headers = {
    ...corsHeaders,
    'Content-Type': contentType,
    'X-Cached': result.cached ? 'true' : 'false',
    'X-Timestamp': new Date().toISOString()
  };
  
  return new Response(responseData, {
    status,
    headers
  });
}

// 启动服务器
console.log('🎯 电信套餐查询格式化服务启动中...');
console.log('📋 可用接口:');
console.log('  GET  /query      - 基础套餐查询（兼容原版格式）');
console.log('  GET  /enhanced   - 增强套餐查询（进度条+统计分析）');
console.log('  GET  /json       - 原始JSON数据');
console.log('  GET  /status     - 服务状态检查');
console.log('  POST /clear-cache - 清除缓存');
console.log('🌐 支持CORS，可直接在浏览器中访问');

// Deno Deploy 兼容方式
export default {
  fetch: handleRequest
}; 