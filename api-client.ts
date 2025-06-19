/**
 * 电信 API 客户端
 * 实现与原 Python 版本完全兼容的 API 调用功能
 */

import type { 
  ApiRequest, 
  QryImportantDataResponse, 
  UserFluxPackageResponse, 
  QryShareUsageResponse, 
  SummaryResponse 
} from './api-types.ts';
import { transNumber, encryptRSA, generateTimestamp, generateTimestamp13, DEFAULT_PUBLIC_KEY } from './crypto.ts';

/**
 * 电信 API 客户端
 * 提供所有电信接口的调用方法
 */
export class TelecomApiClient {
  private apiBase: string;
  
  constructor(apiBase: string = 'https://dx.ll.sd') {
    this.apiBase = apiBase;
  }
  
  /**
   * 查询套餐信息
   */
  async qryImportantData(request: ApiRequest): Promise<QryImportantDataResponse> {
    try {
      console.log(`📊 查询套餐信息: ${this.maskPhoneNumber(request.phonenum)}`);
      
      const requestData = await this.prepareApiRequest(request);
      
      const response = await fetch(`${this.apiBase}/qryImportantData`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Authorization': `Bearer ${request.token}`
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        return {
          success: false,
          message: `请求失败: HTTP ${response.status}`,
          timestamp: Date.now()
        };
      }
      
      const result = await response.json();
      
      return {
        success: true,
        message: '查询成功',
        data: result.responseData?.data || result.data || result,
        timestamp: Date.now()
      };
      
    } catch (error) {
      console.error('查询套餐信息失败:', error);
      return {
        success: false,
        message: `查询失败: ${error.message}`,
        timestamp: Date.now()
      };
    }
  }
  
  /**
   * 查询流量包信息
   */
  async userFluxPackage(request: ApiRequest): Promise<UserFluxPackageResponse> {
    try {
      console.log(`📱 查询流量包: ${this.maskPhoneNumber(request.phonenum)}`);
      
      const requestData = await this.prepareApiRequest(request);
      
      const response = await fetch(`${this.apiBase}/userFluxPackage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Authorization': `Bearer ${request.token}`
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        return {
          success: false,
          message: `请求失败: HTTP ${response.status}`,
          timestamp: Date.now()
        };
      }
      
      const result = await response.json();
      
      return {
        success: true,
        message: '查询成功',
        data: result.responseData?.data || result.data || result,
        timestamp: Date.now()
      };
      
    } catch (error) {
      console.error('查询流量包失败:', error);
      return {
        success: false,
        message: `查询失败: ${error.message}`,
        timestamp: Date.now()
      };
    }
  }
  
  /**
   * 查询共享流量使用情况
   */
  async qryShareUsage(request: ApiRequest): Promise<QryShareUsageResponse> {
    try {
      console.log(`🔄 查询共享流量: ${this.maskPhoneNumber(request.phonenum)}`);
      
      const requestData = await this.prepareApiRequest(request);
      
      const response = await fetch(`${this.apiBase}/qryShareUsage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Authorization': `Bearer ${request.token}`
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        return {
          success: false,
          message: `请求失败: HTTP ${response.status}`,
          timestamp: Date.now()
        };
      }
      
      const result = await response.json();
      
      return {
        success: true,
        message: '查询成功',
        data: result.responseData?.data || result.data || result,
        timestamp: Date.now()
      };
      
    } catch (error) {
      console.error('查询共享流量失败:', error);
      return {
        success: false,
        message: `查询失败: ${error.message}`,
        timestamp: Date.now()
      };
    }
  }
  
  /**
   * 查询综合信息摘要
   */
  async summary(request: ApiRequest): Promise<SummaryResponse> {
    try {
      console.log(`📈 查询综合信息: ${this.maskPhoneNumber(request.phonenum)}`);
      
      const requestData = await this.prepareApiRequest(request);
      
      const response = await fetch(`${this.apiBase}/summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Authorization': `Bearer ${request.token}`
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        return {
          success: false,
          message: `请求失败: HTTP ${response.status}`,
          timestamp: Date.now()
        };
      }
      
      const result = await response.json();
      
      return {
        success: true,
        message: '查询成功',
        data: result.data || result,
        timestamp: Date.now()
      };
      
    } catch (error) {
      console.error('查询综合信息失败:', error);
      return {
        success: false,
        message: `查询失败: ${error.message}`,
        timestamp: Date.now()
      };
    }
  }
  
  /**
   * 准备API请求数据
   * 对手机号进行加密处理
   */
  private async prepareApiRequest(request: ApiRequest): Promise<any> {
    const timestamp = generateTimestamp();
    const timestamp13 = generateTimestamp13();
    
    // 对手机号进行 Caesar 密码转换
    const transPhonenum = transNumber(request.phonenum);
    
    // RSA 加密
    const encryptedPhone = await encryptRSA(transPhonenum, DEFAULT_PUBLIC_KEY);
    
    return {
      phonenum: encryptedPhone,
      timestamp: timestamp,
      timestamp13: timestamp13,
      token: request.token
    };
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
  
  /**
   * 健康检查
   */
  async healthCheck(): Promise<{ status: string; message: string; timestamp: number }> {
    try {
      const response = await fetch(`${this.apiBase}/health`, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (response.ok) {
        return {
          status: 'healthy',
          message: 'API服务正常',
          timestamp: Date.now()
        };
      } else {
        return {
          status: 'unhealthy',
          message: `API服务异常: HTTP ${response.status}`,
          timestamp: Date.now()
        };
      }
    } catch (error) {
      return {
        status: 'error',
        message: `API服务错误: ${error.message}`,
        timestamp: Date.now()
      };
    }
  }
}

// 全局 API 客户端实例
let apiClientInstance: TelecomApiClient | null = null;

/**
 * 获取 API 客户端实例（单例模式）
 */
export function getApiClient(apiBase?: string): TelecomApiClient {
  if (!apiClientInstance) {
    apiClientInstance = new TelecomApiClient(apiBase);
  }
  return apiClientInstance;
} 