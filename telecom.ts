import type { SummaryData, FluxPackageData, ImportantData, ShareUsageData, Config } from './types.ts';

/**
 * 增强版电信接口客户端
 */
export class EnhancedTelecomClient {
  private config: Config;
  
  constructor(config: Config) {
    this.config = config;
  }
  
  // 调用summary接口获取套餐基础信息
  async getSummary(): Promise<SummaryData> {
    const url = `${this.config.apiBase}/summary?phonenum=${this.config.phonenum}&password=${this.config.password}`;
    
    console.log(`正在调用summary接口: ${url.replace(/phonenum=\d+/, 'phonenum=***').replace(/password=\d+/, 'password=***')}`);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Summary接口调用成功');
      return data;
    } catch (error) {
      console.error('❌ 调用summary接口失败:', error);
      throw error;
    }
  }
  
  // 调用userFluxPackage接口获取流量包信息（带重试机制）
  async getFluxPackage(retryCount: number = 0): Promise<FluxPackageData> {
    const maxRetries = 3;
    const retryDelay = 1000; // 1秒延迟
    const url = `${this.config.apiBase}/userFluxPackage?phonenum=${this.config.phonenum}&password=${this.config.password}`;
    
    console.log(`正在调用userFluxPackage接口${retryCount > 0 ? ` (重试第${retryCount}次)` : ''}: ${url.replace(/phonenum=\d+/, 'phonenum=***').replace(/password=\d+/, 'password=***')}`);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        // 详细处理不同的HTTP错误状态
        const errorMessage = `HTTP error! status: ${response.status}`;
        console.error(`❌ userFluxPackage接口返回错误: ${response.status} ${response.statusText}`);
        
        // 特殊处理400错误（可能是请求频率限制或参数问题）
        if (response.status === 400) {
          console.warn('⚠️ HTTP 400错误可能原因：请求频率过快、参数错误或服务暂时不可用');
          
          // 对于400错误，如果还有重试次数，等待后重试
          if (retryCount < maxRetries) {
            console.log(`🔄 等待${retryDelay}ms后重试...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay * (retryCount + 1))); // 递增延迟
            return this.getFluxPackage(retryCount + 1);
          }
        }
        
        // 对于5xx服务器错误，也进行重试
        if (response.status >= 500 && retryCount < maxRetries) {
          console.log(`🔄 服务器错误，等待${retryDelay}ms后重试...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay * (retryCount + 1)));
          return this.getFluxPackage(retryCount + 1);
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json() as FluxPackageData;
      console.log(`✅ FluxPackage接口调用成功${retryCount > 0 ? ` (经过${retryCount}次重试)` : ''}`);
      return data;
    } catch (error) {
      // 网络错误或其他异常，进行重试
      if (retryCount < maxRetries && (error.name === 'TypeError' || error.message.includes('fetch'))) {
        console.warn(`⚠️ 网络错误，等待${retryDelay}ms后重试: ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, retryDelay * (retryCount + 1)));
        return this.getFluxPackage(retryCount + 1);
      }
      
      console.error(`❌ 调用userFluxPackage接口失败${retryCount > 0 ? ` (已重试${retryCount}次)` : ''}:`, error);
      throw error;
    }
  }
  
  // 调用qryImportantData接口获取套餐详细信息
  async getImportantData(): Promise<ImportantData | null> {
    const url = `${this.config.apiBase}/qryImportantData?phonenum=${this.config.phonenum}&password=${this.config.password}`;
    
    console.log(`正在调用qryImportantData接口: ${url.replace(/phonenum=\d+/, 'phonenum=***').replace(/password=\d+/, 'password=***')}`);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        console.warn(`⚠️ qryImportantData接口调用失败: ${response.status}`);
        return null;
      }
      
      const data = await response.json() as ImportantData;
      console.log('✅ ImportantData接口调用成功');
      return data;
    } catch (error) {
      console.warn('⚠️ 调用qryImportantData接口失败，将跳过该数据:', error.message);
      return null;
    }
  }
  
  // 调用qryShareUsage接口获取共享套餐信息
  async getShareUsage(): Promise<ShareUsageData | null> {
    const url = `${this.config.apiBase}/qryShareUsage?phonenum=${this.config.phonenum}&password=${this.config.password}`;
    
    console.log(`正在调用qryShareUsage接口: ${url.replace(/phonenum=\d+/, 'phonenum=***').replace(/password=\d+/, 'password=***')}`);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        console.warn(`⚠️ qryShareUsage接口调用失败: ${response.status}`);
        return null;
      }
      
      const data = await response.json() as ShareUsageData;
      console.log('✅ ShareUsage接口调用成功');
      return data;
    } catch (error) {
      console.warn('⚠️ 调用qryShareUsage接口失败，将跳过该数据:', error.message);
      return null;
    }
  }
  
  // 获取完整数据（调用所有可用接口）
  async getFullData(): Promise<{ 
    summary: SummaryData; 
    fluxPackage: FluxPackageData;
    importantData?: ImportantData;
    shareUsage?: ShareUsageData;
  }> {
    console.log('🚀 开始获取完整电信数据...');
    
    try {
      // 核心接口并行调用（必须成功）
      const [summary, fluxPackage] = await Promise.all([
        this.getSummary(),
        this.getFluxPackage()
      ]);
      
      console.log('✅ 核心数据获取成功，开始获取扩展数据...');
      
      // 扩展接口并行调用（允许失败）
      const [importantData, shareUsage] = await Promise.allSettled([
        this.getImportantData(),
        this.getShareUsage()
      ]);
      
             const result = {
         summary,
         fluxPackage,
         importantData: importantData.status === 'fulfilled' ? (importantData.value || undefined) : undefined,
         shareUsage: shareUsage.status === 'fulfilled' ? (shareUsage.value || undefined) : undefined
       };
      
      console.log('🎉 完整数据获取完成');
      return result;
    } catch (error) {
      console.error('❌ 获取完整数据失败:', error);
      throw error;
    }
  }
  
  // 获取基础数据（兼容原版，只调用必要接口）
  async getBasicData(): Promise<{ summary: SummaryData; fluxPackage: FluxPackageData }> {
    console.log('📋 开始获取基础电信数据...');
    
    try {
      // 并行调用两个核心接口
      const [summary, fluxPackage] = await Promise.all([
        this.getSummary(),
        this.getFluxPackage()
      ]);
      
      console.log('✅ 基础数据获取成功');
      return { summary, fluxPackage };
    } catch (error) {
      console.error('❌ 获取基础数据失败:', error);
      throw error;
    }
  }
  
  // 测试连接
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 正在测试连接...');
      await this.getSummary();
      console.log('✅ 连接测试成功');
      return true;
    } catch (error) {
      console.error('❌ 连接测试失败:', error);
      return false;
    }
  }
  
  // 获取接口健康状态
  async getHealthStatus(): Promise<{
    summary: boolean;
    fluxPackage: boolean;
    importantData: boolean;
    shareUsage: boolean;
    overall: boolean;
  }> {
    console.log('🏥 正在检查接口健康状态...');
    
    const results = {
      summary: false,
      fluxPackage: false,
      importantData: false,
      shareUsage: false,
      overall: false
    };
    
    try {
      // 测试summary接口
      try {
        await this.getSummary();
        results.summary = true;
      } catch (error) {
        console.warn('⚠️ Summary接口不可用');
      }
      
      // 测试fluxPackage接口
      try {
        await this.getFluxPackage();
        results.fluxPackage = true;
      } catch (error) {
        console.warn('⚠️ FluxPackage接口不可用');
      }
      
      // 测试importantData接口
      try {
        const data = await this.getImportantData();
        results.importantData = data !== null;
      } catch (error) {
        console.warn('⚠️ ImportantData接口不可用');
      }
      
      // 测试shareUsage接口
      try {
        const data = await this.getShareUsage();
        results.shareUsage = data !== null;
      } catch (error) {
        console.warn('⚠️ ShareUsage接口不可用');
      }
      
      // 整体健康状态（至少summary和fluxPackage可用）
      results.overall = results.summary && results.fluxPackage;
      
      console.log('📊 健康检查完成:', results);
      return results;
    } catch (error) {
      console.error('❌ 健康检查失败:', error);
      return results;
    }
  }
}

// 兼容性：保持原TelecomClient类
export class TelecomClient extends EnhancedTelecomClient {
  // 保持原有接口不变，用于向后兼容
} 