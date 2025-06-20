/**
 * 通知发送模块 - 支持钉钉和Telegram机器人发送
 */

// 通知平台类型
export type NotificationPlatform = 'dingtalk' | 'telegram' | 'both';

// 发送结果接口
export interface SendResult {
  platform: string;
  success: boolean;
  message?: string;
  error?: string;
}

// 通知发送配置
export interface NotificationConfig {
  dingtalkWebhook?: string;
  telegramBotToken?: string;
  telegramChatId?: string;
}

/**
 * 钉钉机器人发送类
 */
class DingTalkNotifier {
  private webhook: string;

  constructor(webhook: string) {
    this.webhook = webhook;
  }

  /**
   * 发送文本消息到钉钉
   */
  async sendMessage(message: string): Promise<SendResult> {
    try {
      // 钉钉消息格式
      const payload = {
        msgtype: 'text',
        text: {
          content: message
        }
      };

      const response = await fetch(this.webhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.errcode === 0) {
        console.log('✅ 钉钉消息发送成功');
        return {
          platform: 'dingtalk',
          success: true,
          message: '钉钉消息发送成功'
        };
      } else {
        console.error('❌ 钉钉消息发送失败:', result);
        return {
          platform: 'dingtalk',
          success: false,
          error: `钉钉发送失败: ${result.errmsg || '未知错误'}`
        };
      }
    } catch (error) {
      console.error('❌ 钉钉发送异常:', error);
      return {
        platform: 'dingtalk',
        success: false,
        error: `钉钉发送异常: ${error.message}`
      };
    }
  }

  /**
   * 发送Markdown格式消息到钉钉
   */
  async sendMarkdownMessage(title: string, message: string): Promise<SendResult> {
    try {
      const payload = {
        msgtype: 'markdown',
        markdown: {
          title: title,
          text: message
        }
      };

      const response = await fetch(this.webhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.errcode === 0) {
        console.log('✅ 钉钉Markdown消息发送成功');
        return {
          platform: 'dingtalk',
          success: true,
          message: '钉钉Markdown消息发送成功'
        };
      } else {
        console.error('❌ 钉钉Markdown消息发送失败:', result);
        return {
          platform: 'dingtalk',
          success: false,
          error: `钉钉Markdown发送失败: ${result.errmsg || '未知错误'}`
        };
      }
    } catch (error) {
      console.error('❌ 钉钉Markdown发送异常:', error);
      return {
        platform: 'dingtalk',
        success: false,
        error: `钉钉Markdown发送异常: ${error.message}`
      };
    }
  }
}

/**
 * Telegram机器人发送类
 */
class TelegramNotifier {
  private botToken: string;
  private baseUrl: string;

  constructor(botToken: string) {
    this.botToken = botToken;
    this.baseUrl = `https://api.telegram.org/bot${botToken}`;
  }

  /**
   * 发送文本消息到Telegram
   */
  async sendMessage(chatId: string, message: string, parseMode: 'Markdown' | 'HTML' | null = null): Promise<SendResult> {
    try {
      const payload: any = {
        chat_id: chatId,
        text: message,
      };

      if (parseMode) {
        payload.parse_mode = parseMode;
      }

      const response = await fetch(`${this.baseUrl}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.ok) {
        console.log('✅ Telegram消息发送成功');
        return {
          platform: 'telegram',
          success: true,
          message: 'Telegram消息发送成功'
        };
      } else {
        console.error('❌ Telegram消息发送失败:', result);
        return {
          platform: 'telegram',
          success: false,
          error: `Telegram发送失败: ${result.description || '未知错误'}`
        };
      }
    } catch (error) {
      console.error('❌ Telegram发送异常:', error);
      return {
        platform: 'telegram',
        success: false,
        error: `Telegram发送异常: ${error.message}`
      };
    }
  }
}

/**
 * 统一通知发送管理器
 */
export class NotificationManager {
  private config: NotificationConfig;
  private dingTalkNotifier?: DingTalkNotifier;
  private telegramNotifier?: TelegramNotifier;

  constructor() {
    this.config = this.loadConfig();
    this.initializeNotifiers();
  }

  /**
   * 从环境变量加载配置
   */
  private loadConfig(): NotificationConfig {
    return {
      dingtalkWebhook: Deno.env.get('DINGTALK_WEBHOOK'),
      telegramBotToken: Deno.env.get('TELEGRAM_BOT_TOKEN'),
      telegramChatId: Deno.env.get('TELEGRAM_CHAT_ID'),
    };
  }

  /**
   * 初始化通知器
   */
  private initializeNotifiers(): void {
    if (this.config.dingtalkWebhook) {
      this.dingTalkNotifier = new DingTalkNotifier(this.config.dingtalkWebhook);
      console.log('📱 钉钉通知器已初始化');
    }

    if (this.config.telegramBotToken) {
      this.telegramNotifier = new TelegramNotifier(this.config.telegramBotToken);
      console.log('🤖 Telegram通知器已初始化');
    }
  }

  /**
   * 获取可用的通知平台
   */
  getAvailablePlatforms(): string[] {
    const platforms: string[] = [];
    if (this.dingTalkNotifier) platforms.push('dingtalk');
    if (this.telegramNotifier) platforms.push('telegram');
    return platforms;
  }

  /**
   * 发送通知到指定平台
   */
  async sendNotification(
    platform: NotificationPlatform,
    message: string,
    chatId?: string,
    useMarkdown: boolean = false
  ): Promise<SendResult[]> {
    const results: SendResult[] = [];

    if (platform === 'dingtalk' || platform === 'both') {
      if (this.dingTalkNotifier) {
        // 格式化钉钉消息
        const dingTalkMessage = this.formatMessageForDingTalk(message);
        
        let result: SendResult;
        if (useMarkdown) {
          result = await this.dingTalkNotifier.sendMarkdownMessage('电信套餐查询', dingTalkMessage);
        } else {
          result = await this.dingTalkNotifier.sendMessage(dingTalkMessage);
        }
        results.push(result);
      } else {
        results.push({
          platform: 'dingtalk',
          success: false,
          error: '钉钉Webhook未配置'
        });
      }
    }

    if (platform === 'telegram' || platform === 'both') {
      if (this.telegramNotifier) {
        const targetChatId = chatId || this.config.telegramChatId;
        if (targetChatId) {
          // 格式化Telegram消息
          const telegramMessage = this.formatMessageForTelegram(message);
          
          const result = await this.telegramNotifier.sendMessage(
            targetChatId,
            telegramMessage,
            useMarkdown ? 'Markdown' : null
          );
          results.push(result);
        } else {
          results.push({
            platform: 'telegram',
            success: false,
            error: 'Telegram Chat ID未配置'
          });
        }
      } else {
        results.push({
          platform: 'telegram',
          success: false,
          error: 'Telegram Bot Token未配置'
        });
      }
    }

    return results;
  }

  /**
   * 格式化钉钉消息
   */
  private formatMessageForDingTalk(message: string): string {
    // 钉钉特殊字符处理
    let formatted = message;
    
    // 添加时间戳
    const timestamp = new Date().toLocaleString('zh-CN', { 
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    formatted += `\n\n📅 查询时间：${timestamp}`;
    
    return formatted;
  }

  /**
   * 格式化Telegram消息
   */
  private formatMessageForTelegram(message: string): string {
    // Telegram特殊字符转义
    let formatted = message;
    
    // 转义Markdown特殊字符（如果使用Markdown模式）
    // formatted = formatted.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1');
    
    // 添加时间戳
    const timestamp = new Date().toLocaleString('zh-CN', { 
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    formatted += `\n\n📅 查询时间：${timestamp}`;
    
    return formatted;
  }

  /**
   * 测试通知配置
   */
  async testNotification(platform: NotificationPlatform, chatId?: string): Promise<SendResult[]> {
    const testMessage = `🧪 测试消息\n\n这是一条来自电信套餐查询系统的测试消息。\n\n如果您收到此消息，说明通知配置正常。`;
    
    return await this.sendNotification(platform, testMessage, chatId);
  }
}

// 创建全局通知管理器实例
export const notificationManager = new NotificationManager(); 