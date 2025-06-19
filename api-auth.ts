/**
 * API 认证模块
 * 处理用户登录、Token 验证和白名单检查
 */

import type { LoginRequest, LoginResponse, SessionInfo } from './api-types.ts';
import { getSessionManager } from './session.ts';
import { transNumber, encryptRSA, generateTimestamp, generateTimestamp13, DEFAULT_PUBLIC_KEY } from './crypto.ts';
import { isPhoneInWhitelist } from './utils.ts';

/**
 * 电信认证客户端
 * 负责处理用户登录认证和会话管理
 */
export class TelecomAuthClient {
  private apiBase: string;
  
  constructor(apiBase: string = 'https://dx.ll.sd') {
    this.apiBase = apiBase;
  }
  
  /**
   * 处理用户登录
   */
  async login(loginData: LoginRequest, clientIp?: string): Promise<LoginResponse> {
    try {
      // 检查白名单
      if (!isPhoneInWhitelist(loginData.phonenum)) {
        return {
          success: false,
          message: '手机号不在允许的白名单中'
        };
      }
      
      // 验证登录凭据
      const authResult = await this.authenticateUser(loginData.phonenum, loginData.password);
      if (!authResult.success) {
        return {
          success: false,
          message: authResult.message
        };
      }
      
      // 生成 Token
      const token = this.generateToken(loginData.phonenum);
      
      // 创建会话
      const sessionManager = await getSessionManager();
      const sessionCreated = await sessionManager.createSession(loginData.phonenum, token, clientIp);
      
      if (!sessionCreated) {
        return {
          success: false,
          message: '创建用户会话失败'
        };
      }
      
      const now = Date.now();
      const expires = now + (24 * 60 * 60 * 1000); // 24小时后过期
      
      console.log(`🔐 用户登录成功: ${this.maskPhoneNumber(loginData.phonenum)}`);
      
      return {
        success: true,
        message: '登录成功',
        token,
        expires,
        phonenum: loginData.phonenum
      };
      
    } catch (error) {
      console.error('登录处理失败:', error);
      return {
        success: false,
        message: `登录失败: ${error.message}`
      };
    }
  }
  
  /**
   * 验证用户Token
   */
  async validateToken(phonenum: string, token: string): Promise<boolean> {
    try {
      const sessionManager = await getSessionManager();
      return await sessionManager.validateSession(phonenum, token);
    } catch (error) {
      console.error('Token验证失败:', error);
      return false;
    }
  }
  
  /**
   * 获取会话信息
   */
  async getSessionInfo(phonenum: string): Promise<SessionInfo | null> {
    try {
      const sessionManager = await getSessionManager();
      return await sessionManager.getSession(phonenum);
    } catch (error) {
      console.error('获取会话信息失败:', error);
      return null;
    }
  }
  
  /**
   * 刷新Token
   */
  async refreshToken(phonenum: string): Promise<string | null> {
    try {
      const sessionManager = await getSessionManager();
      const sessionInfo = await sessionManager.getSession(phonenum);
      
      if (!sessionInfo) {
        return null;
      }
      
      // 生成新Token
      const newToken = this.generateToken(phonenum);
      
      // 更新会话
      const success = await sessionManager.createSession(phonenum, newToken, sessionInfo.ip);
      
      return success ? newToken : null;
    } catch (error) {
      console.error('刷新Token失败:', error);
      return null;
    }
  }
  
  /**
   * 注销用户
   */
  async logout(phonenum: string): Promise<boolean> {
    try {
      const sessionManager = await getSessionManager();
      return await sessionManager.deleteSession(phonenum);
    } catch (error) {
      console.error('注销失败:', error);
      return false;
    }
  }
  
  /**
   * 验证用户登录凭据
   * 通过调用实际的登录API进行验证
   */
  private async authenticateUser(phonenum: string, password: string): Promise<{ success: boolean; message: string }> {
    try {
      // 准备登录数据
      const timestamp = generateTimestamp();
      const timestamp13 = generateTimestamp13();
      
      // 对手机号和密码进行 Caesar 密码转换
      const transPhonenum = transNumber(phonenum);
      const transPassword = transNumber(password);
      
      // RSA 加密
      const encryptedPhone = await encryptRSA(transPhonenum, DEFAULT_PUBLIC_KEY);
      const encryptedPassword = await encryptRSA(transPassword, DEFAULT_PUBLIC_KEY);
      
      // 构建请求体
      const requestBody = {
        phonenum: encryptedPhone,
        password: encryptedPassword,
        timestamp: timestamp,
        timestamp13: timestamp13
      };
      
      console.log(`🔍 验证用户登录: ${this.maskPhoneNumber(phonenum)}`);
      
      // 发送登录请求
      const response = await fetch(`${this.apiBase}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        return {
          success: false,
          message: `登录请求失败: HTTP ${response.status}`
        };
      }
      
      const result = await response.json();
      
      if (result.success) {
        return {
          success: true,
          message: '登录验证成功'
        };
      } else {
        return {
          success: false,
          message: result.message || '登录验证失败'
        };
      }
      
    } catch (error) {
      console.error('用户认证失败:', error);
      return {
        success: false,
        message: `认证过程出错: ${error.message}`
      };
    }
  }
  
  /**
   * 生成访问Token
   */
  private generateToken(phonenum: string): string {
    const timestamp = Date.now().toString();
    const randomStr = Math.random().toString(36).substring(2);
    const tokenData = `${phonenum}:${timestamp}:${randomStr}`;
    
    // 使用简单的 Base64 编码作为Token
    return btoa(tokenData);
  }
  
  /**
   * 掩码手机号
   */
  private maskPhoneNumber(phone: string): string {
    if (!phone || phone.length < 7) {
      return phone;
    }
    
    if (phone.length === 11) {
      return phone.slice(0, 3) + '****' + phone.slice(-4);
    } else {
      return phone.slice(0, 3) + '****' + phone.slice(-2);
    }
  }
}

// 全局认证客户端实例
let authClientInstance: TelecomAuthClient | null = null;

/**
 * 获取认证客户端实例（单例模式）
 */
export function getAuthClient(apiBase?: string): TelecomAuthClient {
  if (!authClientInstance) {
    authClientInstance = new TelecomAuthClient(apiBase);
  }
  return authClientInstance;
} 