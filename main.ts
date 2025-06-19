import type { ApiResponse, UserConfig, MultiUserConfig } from './types.ts';
import { parseMultiUserConfig, getUserConfig, validateConfig, maskPhoneNumber } from './utils.ts';
import { EnhancedTelecomClient } from './telecom.ts';
import { formatter } from './formatter.ts';
import { getCacheManager } from './cache.ts';
import { authManager } from './auth.ts';
import { generateMainPage, generateJsonPage } from './templates.ts';

/**
 * 增强版电信套餐查询格式化服务
 */

// 配置验证和初始化
let multiConfig: MultiUserConfig;
let telecomClients: Map<string, EnhancedTelecomClient> = new Map();

try {
  multiConfig = parseMultiUserConfig();
  
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
} catch (error) {
  console.error('❌ 服务启动失败:', error);
  throw new Error(`服务初始化失败: ${error.message}`);
}

// 主要查询处理函数
async function handleQuery(enhanced: boolean = false, forceRefresh: boolean = false, phonenum?: string): Promise<ApiResponse> {
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
    
    // 检查是否强制刷新
    if (!forceRefresh) {
      // 尝试从缓存获取数据
      const cachedData = await cacheManager.get(targetPhone);
      if (cachedData && cachedData.formattedText) {
        console.log(`📦 使用缓存数据 (${maskPhoneNumber(targetPhone)})`);
        return {
          success: true,
          data: cachedData.formattedText,
          cached: true,
          phonenum: targetPhone
        };
      }
    } else {
      console.log(`🔄 强制刷新 (${maskPhoneNumber(targetPhone)})`);
    }
    
    console.log(`🔍 缓存未命中，从API获取新数据 (${maskPhoneNumber(targetPhone)})`);
    
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
      await cacheManager.set(targetPhone, {
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
      cached: false,
      phonenum: targetPhone
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
    
    // 尝试从缓存获取数据
    const cachedData = await cacheManager.get(targetPhone);
    if (cachedData) {
      console.log(`📦 使用缓存JSON数据 (${maskPhoneNumber(targetPhone)})`);
      return {
        success: true,
        data: JSON.stringify({
          summary: cachedData.summary,
          fluxPackage: cachedData.fluxPackage,
          importantData: cachedData.importantData,
          shareUsage: cachedData.shareUsage,
          timestamp: cachedData.timestamp
        }, null, 2),
        cached: true,
        phonenum: targetPhone
      };
    }
    
    console.log(`🔍 缓存未命中，从API获取新JSON数据 (${maskPhoneNumber(targetPhone)})`);
    
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
    
    const statusData = {
      service: '电信套餐查询格式化服务',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      users: multiConfig.users.length,
      cache: {
        healthy: cacheHealth.isHealthy,
        latency: cacheHealth.latency,
        stats: cacheStats
      },
      telecom: telecomStatuses,
      overall: cacheHealth.isHealthy && Object.values(telecomStatuses).some((status: any) => status.overall)
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

// POST查询处理函数
async function handlePostQuery(request: Request): Promise<ApiResponse> {
  try {
    let postData: any = {};
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      postData = await request.json();
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      for (const [key, value] of formData.entries()) {
        postData[key] = value.toString();
      }
    }
    
    const { phonenum, enhanced = false, format = 'formatted' } = postData;
    
    if (!phonenum) {
      return {
        success: false,
        error: '请提供手机号参数 (phonenum)',
        cached: false
      };
    }
    
    // 验证手机号是否在配置中
    const userConfig = getUserConfig(phonenum);
    if (!userConfig) {
      return {
        success: false,
        error: `手机号 ${maskPhoneNumber(phonenum)} 未在配置中`,
        cached: false,
        phonenum
      };
    }
    
    // 根据format参数决定返回格式
    if (format === 'json') {
      const result = await handleJsonQuery(phonenum);
      return {
        ...result,
        data: result.success ? JSON.parse(result.data || '{}') : result.data
      };
    } else {
      // 返回格式化文本
      const result = await handleQuery(enhanced === true || enhanced === 'true', false, phonenum);
      return result;
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

// 从cookie中获取session ID
function getSessionFromCookie(request: Request): string | null {
  const cookie = request.headers.get('cookie');
  if (!cookie) return null;
  
  const match = cookie.match(/session=([^;]+)/);
  return match ? match[1] : null;
}

// 设置session cookie
function setSessionCookie(sessionId: string): string {
  return `session=${sessionId}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`;
}

// 检查认证
function requireAuth(request: Request): { authenticated: boolean; sessionId?: string } {
  const sessionId = getSessionFromCookie(request);
  if (!sessionId) {
    return { authenticated: false };
  }
  
  const isValid = authManager.validateSession(sessionId);
  return { authenticated: isValid, sessionId };
}

// 处理登录
async function handleLogin(request: Request): Promise<Response> {
  if (request.method === 'GET') {
    return new Response(authManager.generateLoginPage(), {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
  
  if (request.method === 'POST') {
    const formData = await request.formData();
    const password = formData.get('password')?.toString() || '';
    
    if (authManager.validatePassword(password)) {
      const sessionId = authManager.createSession();
      return new Response('', {
        status: 302,
        headers: {
          'Location': '/',
          'Set-Cookie': setSessionCookie(sessionId)
        }
      });
    } else {
      return new Response(authManager.generateLoginPage('密码错误，请重试'), {
        status: 401,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }
  }
  
  return new Response('Method not allowed', { status: 405 });
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
  
  // 处理登录相关路径
  if (pathname === '/auth/login' || pathname === '/login') {
    return handleLogin(request);
  }
  
  // 检查认证
  const auth = requireAuth(request);
  if (!auth.authenticated) {
    return new Response('', {
      status: 302,
      headers: { 'Location': '/auth/login' }
    });
  }
  
  // 检查是否强制刷新
  const forceRefresh = url.searchParams.has('refresh') || url.searchParams.has('force');
  // 获取指定的手机号
  const phonenum = url.searchParams.get('phone') || undefined;
  
  let result: ApiResponse;
  let responseType: 'html' | 'json' | 'text' = 'html';
  let title = '电信套餐查询';
  
  try {
    switch (pathname) {
      case '/':
        // 重定向到基础查询
        const redirectUrl = phonenum ? `/query?phone=${phonenum}` : '/query';
        return new Response('', {
          status: 302,
          headers: { 'Location': redirectUrl }
        });
        
      case '/query':
        // 基础查询接口
        result = await handleQuery(false, forceRefresh, phonenum);
        title = '基础套餐查询';
        responseType = 'html';
        break;
        
      case '/enhanced':
        // 增强查询接口
        result = await handleQuery(true, forceRefresh, phonenum);
        title = '增强套餐查询';
        responseType = 'html';
        break;
        
      case '/json':
        // JSON数据接口
        result = await handleJsonQuery(phonenum);
        responseType = 'json';
        break;
        
      case '/status':
      case '/health':
        // 状态检查接口
        result = await handleStatus();
        title = '系统状态';
        responseType = url.searchParams.has('format') && url.searchParams.get('format') === 'json' ? 'json' : 'html';
        break;
        
      case '/api/query':
        // POST API查询接口
        if (method === 'POST') {
          result = await handlePostQuery(request);
          responseType = 'json';
        } else {
          result = {
            success: false,
            error: '此接口仅支持POST方法',
            cached: false
          };
        }
        break;
        
      case '/clear-cache':
        // 清除缓存接口
        if (method === 'POST' || method === 'GET') {
          result = await handleClearCache();
          title = '缓存管理';
          responseType = 'html';
        } else {
          result = {
            success: false,
            error: '此接口仅支持GET/POST方法',
            cached: false
          };
        }
        break;
        
      default:
        result = {
          success: false,
          error: `未知的接口路径: ${pathname}\n\n可用接口:\n- /query (基础查询)\n- /enhanced (增强查询)\n- /json (JSON数据)\n- /status (系统状态)\n- /clear-cache (清除缓存)`,
          cached: false
        };
        responseType = 'html';
        title = '页面未找到';
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
  const status = result.success ? 200 : (pathname === '/clear-cache' && result.success === false) ? 404 : 400;
  
  let responseData: string;
  let contentType: string;
  
  if (responseType === 'json') {
    // JSON响应
    if (pathname === '/json') {
      const cacheManager = await getCacheManager();
      const targetPhone = phonenum || multiConfig.defaultUser;
      const cachedData = await cacheManager.get(targetPhone);
      const jsonData = cachedData || { error: '没有可用数据' };
      responseData = generateJsonPage(jsonData);
      contentType = 'text/html; charset=utf-8';
    } else {
      responseData = result.success ? (result.data || '') : JSON.stringify({error: result.error}, null, 2);
      contentType = 'application/json; charset=utf-8';
    }
  } else if (responseType === 'html') {
    // HTML响应
    const content = result.success ? (result.data || '') : (result.error || '');
    const currentUser = result.phonenum || phonenum;
    responseData = generateMainPage(content, title, multiConfig.users, currentUser);
    contentType = 'text/html; charset=utf-8';
  } else {
    // 纯文本响应
    responseData = result.success ? (result.data || '') : (result.error || '');
    contentType = 'text/plain; charset=utf-8';
  }
  
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