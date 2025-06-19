import type { MultiUserConfig, UserConfig } from './types.ts';
import { getCacheManager } from './cache.ts';

/**
 * 配置管理器
 * 负责环境变量与KV存储的同步，以及配置的读取和更新
 */

const CONFIG_KEY = 'telecom_config';
const CONFIG_VERSION_KEY = 'telecom_config_version';

export interface StoredConfig {
  version: string;
  timestamp: number;
  phoneNumbers: string;
  passwords: string;
  apiBase?: string;
  cacheTime?: number;
  webPassword?: string;
  [key: string]: any;
}

export class ConfigManager {
  private kv: any;
  private initialized = false;
  
  constructor() {
    // 移除自动初始化
  }
  
  private async init() {
    if (!this.initialized) {
      this.kv = await getCacheManager();
      this.initialized = true;
    }
  }
  
  /**
   * 获取当前配置
   * 优先从KV读取，如果没有则从环境变量读取并同步到KV
   */
  async getConfig(): Promise<MultiUserConfig> {
    await this.init(); // 确保已初始化
    
    try {
      // 首先尝试从KV读取
      const storedConfig = await this.getStoredConfig();
      
      if (storedConfig) {
        console.log('📦 从KV加载配置');
        return this.parseStoredConfig(storedConfig);
      }
      
      // 如果KV中没有配置，则从环境变量读取并同步
      console.log('🔄 从环境变量同步配置到KV');
      return await this.syncFromEnvToKV();
      
    } catch (error) {
      console.warn('⚠️ 配置管理器异常，回退到环境变量:', error);
      return this.getEnvConfig();
    }
  }
  
  /**
   * 从KV获取存储的配置
   */
  private async getStoredConfig(): Promise<StoredConfig | null> {
    try {
      const config = await this.kv.get(CONFIG_KEY);
      return config?.value || null;
    } catch (error) {
      console.warn('读取KV配置失败:', error);
      return null;
    }
  }
  
  /**
   * 解析存储的配置为MultiUserConfig格式
   */
  private parseStoredConfig(config: StoredConfig): MultiUserConfig {
    const phoneNumbers = config.phoneNumbers.split(',').map(p => p.trim()).filter(Boolean);
    const passwords = config.passwords.split(',').map(p => p.trim()).filter(Boolean);
    
    if (phoneNumbers.length === 0) {
      throw new Error('手机号列表为空');
    }
    
    if (passwords.length !== phoneNumbers.length) {
      throw new Error(`手机号数量(${phoneNumbers.length})与密码数量(${passwords.length})不匹配`);
    }
    
    const users: UserConfig[] = phoneNumbers.map((phonenum, index) => ({
      phonenum,
      password: passwords[index],
      displayName: this.maskPhoneNumber(phonenum)
    }));
    
    return {
      users,
      defaultUser: phoneNumbers[0],
      apiBase: config.apiBase || 'https://dx.ll.sd',
      cacheTime: config.cacheTime || 2,
      webPassword: config.webPassword
    };
  }
  
  /**
   * 从环境变量读取配置
   */
  private getEnvConfig(): MultiUserConfig {
    const phoneNumbers = this.getEnv('TELECOM_PHONENUM');
    const passwords = this.getEnv('TELECOM_PASSWORD');
    
    if (!phoneNumbers || !passwords) {
      throw new Error('缺少必要的环境变量 TELECOM_PHONENUM 或 TELECOM_PASSWORD');
    }
    
    const phoneList = phoneNumbers.split(',').map(p => p.trim()).filter(Boolean);
    const passwordList = passwords.split(',').map(p => p.trim()).filter(Boolean);
    
    if (phoneList.length === 0) {
      throw new Error('TELECOM_PHONENUM 不能为空');
    }
    
    if (passwordList.length !== phoneList.length) {
      throw new Error(`手机号数量(${phoneList.length})与密码数量(${passwordList.length})不匹配`);
    }
    
    const users: UserConfig[] = phoneList.map((phonenum, index) => ({
      phonenum,
      password: passwordList[index],
      displayName: this.maskPhoneNumber(phonenum)
    }));
    
    return {
      users,
      defaultUser: phoneList[0],
      apiBase: this.getEnv('API_BASE') || 'https://dx.ll.sd',
      cacheTime: parseInt(this.getEnv('CACHE_TIME') || '2'),
      webPassword: this.getEnv('WEB_PASSWORD')
    };
  }
  
  /**
   * 从环境变量同步配置到KV
   */
  private async syncFromEnvToKV(): Promise<MultiUserConfig> {
    const envConfig = this.getEnvConfig();
    
    // 创建存储格式的配置
    const storedConfig: StoredConfig = {
      version: '1.0',
      timestamp: Date.now(),
      phoneNumbers: envConfig.users.map(u => u.phonenum).join(','),
      passwords: envConfig.users.map(u => u.password).join(','),
      apiBase: envConfig.apiBase,
      cacheTime: envConfig.cacheTime,
      webPassword: envConfig.webPassword
    };
    
    try {
      // 保存到KV
      await this.kv.set(CONFIG_KEY, storedConfig);
      await this.kv.set(CONFIG_VERSION_KEY, '1.0');
      
      console.log('✅ 配置已同步到KV存储');
    } catch (error) {
      console.warn('⚠️ 同步配置到KV失败:', error);
    }
    
    return envConfig;
  }
  
  /**
   * 更新配置到KV
   */
  async updateConfig(newConfig: Partial<StoredConfig>): Promise<boolean> {
    await this.init(); // 确保已初始化
    
    try {
      const currentConfig = await this.getStoredConfig() || {
        version: '1.0',
        timestamp: Date.now(),
        phoneNumbers: '',
        passwords: ''
      };
      
      const updatedConfig: StoredConfig = {
        ...currentConfig,
        ...newConfig,
        timestamp: Date.now()
      };
      
      // 验证配置
      this.validateStoredConfig(updatedConfig);
      
      // 保存到KV
      await this.kv.set(CONFIG_KEY, updatedConfig);
      
      console.log('✅ 配置已更新到KV存储');
      return true;
    } catch (error) {
      console.error('❌ 更新配置失败:', error);
      throw error;
    }
  }
  
  /**
   * 验证存储的配置
   */
  private validateStoredConfig(config: StoredConfig): void {
    if (!config.phoneNumbers || !config.passwords) {
      throw new Error('手机号和密码不能为空');
    }
    
    const phoneList = config.phoneNumbers.split(',').map(p => p.trim()).filter(Boolean);
    const passwordList = config.passwords.split(',').map(p => p.trim()).filter(Boolean);
    
    if (phoneList.length === 0) {
      throw new Error('至少需要一个手机号');
    }
    
    if (phoneList.length !== passwordList.length) {
      throw new Error('手机号和密码的数量必须一致');
    }
    
    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    for (const phone of phoneList) {
      if (!phoneRegex.test(phone)) {
        throw new Error(`手机号格式错误: ${phone}`);
      }
    }
    
    // 验证密码格式（6位数字）
    const passwordRegex = /^\d{6}$/;
    for (const password of passwordList) {
      if (!passwordRegex.test(password)) {
        throw new Error(`密码必须是6位数字: ${password}`);
      }
    }
  }
  
  /**
   * 获取配置管理页面的配置信息
   */
  async getConfigForManagement(): Promise<any> {
    await this.init(); // 确保已初始化
    
    try {
      const storedConfig = await this.getStoredConfig();
      const envConfig = this.getEnvConfigSafe();
      
      return {
        kvConfig: storedConfig ? {
          ...storedConfig,
          phoneNumbers: this.maskPhoneNumbers(storedConfig.phoneNumbers),
          passwords: '*'.repeat(storedConfig.passwords.length)
        } : null,
        envConfig: envConfig ? {
          phoneNumbers: this.maskPhoneNumbers(envConfig.users.map(u => u.phonenum).join(',')),
          passwords: '*'.repeat(envConfig.users.map(u => u.password).join(',').length),
          apiBase: envConfig.apiBase,
          cacheTime: envConfig.cacheTime,
          webPassword: envConfig.webPassword ? '*'.repeat(8) : undefined
        } : null,
        hasKvConfig: !!storedConfig,
        hasEnvConfig: !!envConfig,
        lastSync: storedConfig?.timestamp ? new Date(storedConfig.timestamp).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }) : null
      };
    } catch (error) {
      console.error('获取配置管理信息失败:', error);
      return {
        kvConfig: null,
        envConfig: null,
        hasKvConfig: false,
        hasEnvConfig: false,
        error: error.message
      };
    }
  }
  
  /**
   * 重新从环境变量同步配置
   */
  async resyncFromEnv(): Promise<MultiUserConfig> {
    await this.init(); // 确保已初始化
    console.log('🔄 重新从环境变量同步配置');
    return await this.syncFromEnvToKV();
  }
  
  /**
   * 清除KV中的配置
   */
  async clearKvConfig(): Promise<boolean> {
    await this.init(); // 确保已初始化
    
    try {
      await this.kv.delete(CONFIG_KEY);
      await this.kv.delete(CONFIG_VERSION_KEY);
      console.log('✅ 已清除KV配置');
      return true;
    } catch (error) {
      console.error('❌ 清除KV配置失败:', error);
      return false;
    }
  }
  
  /**
   * 检查环境变量是否有变化
   */
  async hasEnvConfigChanged(): Promise<boolean> {
    await this.init(); // 确保已初始化
    
    try {
      const storedConfig = await this.getStoredConfig();
      if (!storedConfig) return true;
      
      const envConfig = this.getEnvConfigSafe();
      if (!envConfig) return false;
      
      const currentEnvPhones = envConfig.users.map(u => u.phonenum).join(',');
      const currentEnvPasswords = envConfig.users.map(u => u.password).join(',');
      
      return (
        storedConfig.phoneNumbers !== currentEnvPhones ||
        storedConfig.passwords !== currentEnvPasswords ||
        storedConfig.apiBase !== envConfig.apiBase ||
        storedConfig.cacheTime !== envConfig.cacheTime ||
        storedConfig.webPassword !== envConfig.webPassword
      );
    } catch (error) {
      console.warn('检查环境变量变化失败:', error);
      return false;
    }
  }
  
  /**
   * 安全获取环境变量配置（不抛出异常）
   */
  private getEnvConfigSafe(): MultiUserConfig | null {
    try {
      return this.getEnvConfig();
    } catch (error) {
      return null;
    }
  }
  
  /**
   * 兼容性环境变量获取
   */
  private getEnv(key: string): string | undefined {
    try {
      return globalThis.Deno?.env?.get?.(key);
    } catch {
      return undefined;
    }
  }
  
  /**
   * 手机号遮盖显示
   */
  private maskPhoneNumber(phone: string): string {
    if (phone.length !== 11) return phone;
    return phone.slice(0, 3) + '****' + phone.slice(7);
  }
  
  /**
   * 批量手机号遮盖显示
   */
  private maskPhoneNumbers(phones: string): string {
    return phones.split(',')
      .map(p => this.maskPhoneNumber(p.trim()))
      .join(', ');
  }
}

// 单例模式
let configManagerInstance: ConfigManager | null = null;

export async function getConfigManager(): Promise<ConfigManager> {
  if (!configManagerInstance) {
    configManagerInstance = new ConfigManager();
  }
  return configManagerInstance;
}

/**
 * 获取配置的便捷函数
 */
export async function loadConfig(): Promise<MultiUserConfig> {
  const manager = await getConfigManager();
  return await manager.getConfig();
} 