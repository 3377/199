import type { CachedData, SummaryData, FluxPackageData, ImportantData, ShareUsageData } from './types.ts';

/**
 * KV缓存管理器
 */
export class CacheManager {
  private kv: any;
  private cachePrefix = 'telecom_data:';
  
  constructor(kv: any) {
    this.kv = kv;
  }
  
  // 生成缓存键
  private getCacheKey(phonenum: string): string {
    return `${this.cachePrefix}${phonenum}`;
  }
  
  // 获取缓存数据
  async get(phonenum: string): Promise<CachedData | null> {
    try {
      const result = await this.kv.get([this.getCacheKey(phonenum)]);
      if (!result.value) {
        return null;
      }
      
      const cachedData = result.value as CachedData;
      
      // 检查缓存是否过期（默认2分钟，更实时）
      const now = Date.now();
      const cacheAge = now - cachedData.timestamp;
      const maxAge = parseInt(globalThis.Deno?.env?.get?.('CACHE_TIME') || '120000'); // 2分钟
      
      if (cacheAge > maxAge) {
        console.log(`缓存已过期，年龄: ${Math.floor(cacheAge / 1000)}秒，最大年龄: ${Math.floor(maxAge / 1000)}秒`);
        await this.delete(phonenum);
        return null;
      }
      
      console.log(`✅ 使用缓存数据，剩余有效期: ${Math.floor((maxAge - cacheAge) / 1000)}秒`);
      return cachedData;
    } catch (error) {
      console.error('❌ 获取缓存失败:', error);
      return null;
    }
  }
  
  // 设置缓存数据
  async set(phonenum: string, data: Omit<CachedData, 'timestamp'>): Promise<void> {
    try {
      const cachedData: CachedData = {
        ...data,
        timestamp: Date.now()
      };
      
      await this.kv.set([this.getCacheKey(phonenum)] as any, cachedData);
      console.log('✅ 缓存数据已保存');
    } catch (error) {
      console.error('❌ 保存缓存失败:', error);
      throw error;
    }
  }
  
  // 删除缓存数据
  async delete(phonenum: string): Promise<void> {
    try {
      await this.kv.delete([this.getCacheKey(phonenum)]);
      console.log('🗑️ 缓存数据已删除');
    } catch (error) {
      console.error('❌ 删除缓存失败:', error);
    }
  }
  
  // 清空所有缓存
  async clear(): Promise<void> {
    try {
      const iterator = this.kv.list({ prefix: [this.cachePrefix] as any });
      const keys = [];
      for await (const { key } of iterator) {
        keys.push(key);
      }
      
              if (keys.length > 0) {
          const tx = this.kv.atomic();
          for (const key of keys) {
            tx.delete(key as any);
          }
          await tx.commit();
        console.log(`🗑️ 已清空 ${keys.length} 个缓存条目`);
      } else {
        console.log('📭 没有需要清空的缓存');
      }
    } catch (error) {
      console.error('❌ 清空缓存失败:', error);
      throw error;
    }
  }
  
  // 获取缓存统计信息
  async getStats(): Promise<{
    totalEntries: number;
    totalSize: number;
    oldestEntry: Date | null;
    newestEntry: Date | null;
  }> {
    try {
      const stats = {
        totalEntries: 0,
        totalSize: 0,
        oldestEntry: null as Date | null,
        newestEntry: null as Date | null
      };
      
      const iterator = this.kv.list({ prefix: [this.cachePrefix] });
      
      for await (const { value } of iterator) {
        if (value) {
          stats.totalEntries++;
          const cachedData = value as CachedData;
          const entryDate = new Date(cachedData.timestamp);
          
          if (!stats.oldestEntry || entryDate < stats.oldestEntry) {
            stats.oldestEntry = entryDate;
          }
          
          if (!stats.newestEntry || entryDate > stats.newestEntry) {
            stats.newestEntry = entryDate;
          }
          
          // 估算大小（简单的JSON字符串长度）
          stats.totalSize += JSON.stringify(value).length;
        }
      }
      
      return stats;
    } catch (error) {
      console.error('❌ 获取缓存统计失败:', error);
      return {
        totalEntries: 0,
        totalSize: 0,
        oldestEntry: null,
        newestEntry: null
      };
    }
  }
  
  // 检查缓存健康状态
  async healthCheck(): Promise<{
    isHealthy: boolean;
    canRead: boolean;
    canWrite: boolean;
    canDelete: boolean;
    latency: number;
  }> {
    const startTime = Date.now();
    const testKey = `${this.cachePrefix}health_check_${Date.now()}`;
    const testData = { test: true, timestamp: Date.now() };
    
    let canRead = false;
    let canWrite = false;
    let canDelete = false;
    
    try {
      // 测试写入
      await this.kv.set([testKey], testData);
      canWrite = true;
      
      // 测试读取
      const readResult = await this.kv.get([testKey]);
      canRead = readResult.value !== null;
      
      // 测试删除
      await this.kv.delete([testKey]);
      canDelete = true;
      
      // 验证删除成功
      const verifyResult = await this.kv.get([testKey]);
      canDelete = verifyResult.value === null;
      
    } catch (error) {
      console.error('❌ 缓存健康检查失败:', error);
    }
    
    const latency = Date.now() - startTime;
    const isHealthy = canRead && canWrite && canDelete;
    
    return {
      isHealthy,
      canRead,
      canWrite,
      canDelete,
      latency
    };
  }
}

// 全局缓存管理器实例
let globalCacheManager: CacheManager | null = null;

// 获取缓存管理器实例
export async function getCacheManager(): Promise<CacheManager> {
  if (!globalCacheManager) {
    try {
      const kv = await (globalThis as any).Deno.openKv();
      globalCacheManager = new CacheManager(kv);
      console.log('✅ KV缓存管理器初始化成功');
    } catch (error) {
      console.error('❌ KV缓存管理器初始化失败:', error);
      throw new Error('缓存服务不可用');
    }
  }
  
  return globalCacheManager;
} 