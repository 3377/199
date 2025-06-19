/**
 * 会话管理模块
 * 使用 Deno KV 存储管理用户登录会话
 */

import type { SessionInfo, SessionStats } from './api-types.ts';
import { getCacheManager } from './cache.ts';

/**
 * 会话管理器
 * 负责管理用户登录Token的存储、验证和清理
 */
export class SessionManager {
  private kv: any;
  private initialized = false;
  
  // 会话过期时间：24小时
  private static readonly SESSION_EXPIRES = 24 * 60 * 60 * 1000;
  
  /**
   * 初始化会话管理器
   */
  private async init() {
    if (!this.initialized) {
      this.kv = await getCacheManager();
      this.initialized = true;
    }
  }
  
  /**
   * 创建新会话
   */
  async createSession(phonenum: string, token: string, ip?: string): Promise<boolean> {
    await this.init();
    
    try {
      const now = Date.now();
      const sessionInfo: SessionInfo = {
        phonenum,
        token,
        loginTime: now,
        expiresAt: now + SessionManager.SESSION_EXPIRES,
        lastUsed: now,
        ip
      };
      
      // 使用手机号作为key存储会话信息
      const sessionKey = `session:${phonenum}`;
      await this.kv.set(sessionKey, sessionInfo);
      
      console.log(`✅ 会话已创建: ${this.maskPhoneNumber(phonenum)}`);
      return true;
    } catch (error) {
      console.error('创建会话失败:', error);
      return false;
    }
  }
  
  /**
   * 验证会话
   */
  async validateSession(phonenum: string, token: string): Promise<boolean> {
    await this.init();
    
    try {
      const sessionKey = `session:${phonenum}`;
      const result = await this.kv.get(sessionKey);
      
      if (!result || !result.value) {
        return false;
      }
      
      const sessionInfo: SessionInfo = result.value;
      
      // 检查Token是否匹配
      if (sessionInfo.token !== token) {
        return false;
      }
      
      // 检查是否过期
      if (Date.now() > sessionInfo.expiresAt) {
        // 过期则删除会话
        await this.deleteSession(phonenum);
        return false;
      }
      
      // 更新最后使用时间
      sessionInfo.lastUsed = Date.now();
      await this.kv.set(sessionKey, sessionInfo);
      
      return true;
    } catch (error) {
      console.error('验证会话失败:', error);
      return false;
    }
  }
  
  /**
   * 获取会话信息
   */
  async getSession(phonenum: string): Promise<SessionInfo | null> {
    await this.init();
    
    try {
      const sessionKey = `session:${phonenum}`;
      const result = await this.kv.get(sessionKey);
      
      if (!result || !result.value) {
        return null;
      }
      
      const sessionInfo: SessionInfo = result.value;
      
      // 检查是否过期
      if (Date.now() > sessionInfo.expiresAt) {
        await this.deleteSession(phonenum);
        return null;
      }
      
      return sessionInfo;
    } catch (error) {
      console.error('获取会话失败:', error);
      return null;
    }
  }
  
  /**
   * 删除会话
   */
  async deleteSession(phonenum: string): Promise<boolean> {
    await this.init();
    
    try {
      const sessionKey = `session:${phonenum}`;
      await this.kv.delete(sessionKey);
      
      console.log(`🗑️ 会话已删除: ${this.maskPhoneNumber(phonenum)}`);
      return true;
    } catch (error) {
      console.error('删除会话失败:', error);
      return false;
    }
  }
  
  /**
   * 清理过期会话
   */
  async cleanExpiredSessions(): Promise<number> {
    await this.init();
    
    try {
      let cleanedCount = 0;
      const now = Date.now();
      
      // 遍历所有会话键
      const iter = this.kv.list({ prefix: ['session:'] });
      for await (const entry of iter) {
        const sessionInfo: SessionInfo = entry.value;
        
        if (sessionInfo && now > sessionInfo.expiresAt) {
          await this.kv.delete(entry.key);
          cleanedCount++;
        }
      }
      
      if (cleanedCount > 0) {
        console.log(`🧹 已清理 ${cleanedCount} 个过期会话`);
      }
      
      return cleanedCount;
    } catch (error) {
      console.error('清理过期会话失败:', error);
      return 0;
    }
  }
  
  /**
   * 获取会话统计信息
   */
  async getStats(): Promise<SessionStats> {
    await this.init();
    
    try {
      const stats: SessionStats = {
        totalSessions: 0,
        activeSessions: 0,
        expiredSessions: 0,
        sessionsByPhone: {}
      };
      
      const now = Date.now();
      
      // 遍历所有会话
      const iter = this.kv.list({ prefix: ['session:'] });
      for await (const entry of iter) {
        const sessionInfo: SessionInfo = entry.value;
        
        if (!sessionInfo) continue;
        
        stats.totalSessions++;
        
        // 统计按手机号分组
        const maskedPhone = this.maskPhoneNumber(sessionInfo.phonenum);
        stats.sessionsByPhone[maskedPhone] = (stats.sessionsByPhone[maskedPhone] || 0) + 1;
        
        // 检查是否过期
        if (now > sessionInfo.expiresAt) {
          stats.expiredSessions++;
        } else {
          stats.activeSessions++;
        }
      }
      
      return stats;
    } catch (error) {
      console.error('获取会话统计失败:', error);
      return {
        totalSessions: 0,
        activeSessions: 0,
        expiredSessions: 0,
        sessionsByPhone: {}
      };
    }
  }
  
  /**
   * 清除所有会话
   */
  async clearAllSessions(): Promise<number> {
    await this.init();
    
    try {
      let clearedCount = 0;
      
      // 遍历所有会话键并删除
      const iter = this.kv.list({ prefix: ['session:'] });
      for await (const entry of iter) {
        await this.kv.delete(entry.key);
        clearedCount++;
      }
      
      if (clearedCount > 0) {
        console.log(`🗑️ 已清除所有 ${clearedCount} 个会话`);
      }
      
      return clearedCount;
    } catch (error) {
      console.error('清除所有会话失败:', error);
      return 0;
    }
  }
  
  /**
   * 刷新会话过期时间
   */
  async refreshSession(phonenum: string): Promise<boolean> {
    await this.init();
    
    try {
      const sessionInfo = await this.getSession(phonenum);
      if (!sessionInfo) {
        return false;
      }
      
      // 更新过期时间和最后使用时间
      const now = Date.now();
      sessionInfo.expiresAt = now + SessionManager.SESSION_EXPIRES;
      sessionInfo.lastUsed = now;
      
      const sessionKey = `session:${phonenum}`;
      await this.kv.set(sessionKey, sessionInfo);
      
      return true;
    } catch (error) {
      console.error('刷新会话失败:', error);
      return false;
    }
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

// 全局会话管理器实例
let sessionManagerInstance: SessionManager | null = null;

/**
 * 获取会话管理器实例（单例模式）
 */
export async function getSessionManager(): Promise<SessionManager> {
  if (!sessionManagerInstance) {
    sessionManagerInstance = new SessionManager();
  }
  return sessionManagerInstance;
} 