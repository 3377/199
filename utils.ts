/**
 * 增强版流量单位转换和实用工具函数
 */

// 将KB转换为指定单位
export function convertFlow(sizeKB: number, targetUnit: 'KB' | 'MB' | 'GB' = 'GB', decimal: number = 2): string {
  let result: number;
  
  switch (targetUnit.toUpperCase()) {
    case 'KB':
      result = sizeKB;
      break;
    case 'MB':
      result = sizeKB / 1024;
      break;
    case 'GB':
      result = sizeKB / (1024 * 1024);
      break;
    default:
      result = sizeKB;
  }
  
  return result.toFixed(decimal);
}

// 智能流量单位选择和格式化
export function formatFlow(sizeKB: number, decimal: number = 2): string {
  if (sizeKB < 1024) {
    return `${convertFlow(sizeKB, 'KB', 0)}KB`;
  } else if (sizeKB < 1024 * 1024) {
    return `${convertFlow(sizeKB, 'MB', decimal)}MB`;
  } else {
    return `${convertFlow(sizeKB, 'GB', decimal)}GB`;
  }
}

// 格式化余额（分转元）
export function formatBalance(balanceInCents: number): string {
  return (balanceInCents / 100).toFixed(2);
}

// 获取流量包图标
export function getFlowPackageIcon(title: string): string {
  if (title.includes('国内')) {
    return '🇨🇳';
  } else if (title.includes('专用')) {
    return '📺';
  } else if (title.includes('5G')) {
    return '🚀';
  } else if (title.includes('定向')) {
    return '🎯';
  } else {
    return '🌎';
  }
}

// 创建进度条
export function createProgressBar(used: number, total: number, length: number = 10): string {
  if (total <= 0) return '▓'.repeat(length);
  
  const percentage = Math.min(used / total, 1);
  const filledLength = Math.floor(percentage * length);
  const emptyLength = length - filledLength;
  
  let progressBar = '';
  
  // 根据使用比例选择不同颜色的进度条
  if (percentage < 0.5) {
    progressBar = '🟩'.repeat(filledLength) + '⬜'.repeat(emptyLength);
  } else if (percentage < 0.8) {
    progressBar = '🟨'.repeat(filledLength) + '⬜'.repeat(emptyLength);
  } else if (percentage < 1.0) {
    progressBar = '🟧'.repeat(filledLength) + '⬜'.repeat(emptyLength);
  } else {
    progressBar = '🟥'.repeat(length);
  }
  
  return progressBar;
}

// 创建简单ASCII进度条（兼容性更好）
export function createSimpleProgressBar(used: number, total: number, length: number = 20): string {
  if (total <= 0) return '█'.repeat(length);
  
  const percentage = Math.min(used / total, 1);
  const filledLength = Math.floor(percentage * length);
  const emptyLength = length - filledLength;
  
  return '█'.repeat(filledLength) + '░'.repeat(emptyLength);
}

// 计算使用百分比
export function calculatePercentage(used: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min((used / total) * 100, 100);
}

// 获取余额状态
export function getBalanceStatus(balance: number): 'sufficient' | 'low' | 'critical' {
  if (balance >= 5000) return 'sufficient';  // 50元以上
  if (balance >= 1000) return 'low';         // 10-50元
  return 'critical';                         // 10元以下
}

// 获取余额状态图标
export function getBalanceIcon(balance: number): string {
  const status = getBalanceStatus(balance);
  switch (status) {
    case 'sufficient': return '💰';
    case 'low': return '⚠️';
    case 'critical': return '🚨';
  }
}

// 计算日均流量使用
export function calculateDailyAvgFlow(usedFlow: number, createTime: string): number {
  const now = new Date();
  const dataTime = new Date(createTime);
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // 计算从月初到数据创建时间的天数
  const daysFromMonthStart = Math.max(1, Math.ceil((dataTime.getTime() - currentMonthStart.getTime()) / (1000 * 60 * 60 * 24)));
  
  return usedFlow / daysFromMonthStart;
}

// 计算套餐剩余天数
export function calculateRemainingDays(): number {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const diffTime = nextMonth.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// 获取流量使用趋势
export function getFlowTrend(dailyAvg: number, remaining: number, totalFlow: number): 'normal' | 'high' | 'very_high' {
  const projectedMonthlyUsage = dailyAvg * 30;
  const usageRatio = projectedMonthlyUsage / totalFlow;
  
  if (usageRatio > 1.5) return 'very_high';
  if (usageRatio > 1.2) return 'high';
  return 'normal';
}

// 获取趋势图标和提示
export function getTrendIcon(trend: 'normal' | 'high' | 'very_high'): string {
  switch (trend) {
    case 'normal': return '📊';
    case 'high': return '📈';
    case 'very_high': return '🔥';
  }
}

// 格式化时间为北京时间
export function formatTimestamp(timestamp?: string): string {
  if (!timestamp) {
    return getBeijingTime();
  }
  return timestamp;
}

// 获取当前北京时间
export function getBeijingTime(): string {
  const now = new Date();
  const beijingTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
  return beijingTime.toISOString().slice(0, 19).replace('T', ' ');
}

// 生成随机诗句和格言
export function getRandomPoetry(): string {
  const poems = [
    "前不见古人,后不见来者.念天地之悠悠,独怆然而涕下.    ----登幽州台歌",
    "海内存知己,天涯若比邻.    ----送杜少府之任蜀州", 
    "山重水复疑无路,柳暗花明又一村.    ----游山西村",
    "长风破浪会有时,直挂云帆济沧海.    ----行路难",
    "会当凌绝顶,一览众山小.    ----望岳",
    "落红不是无情物,化作春泥更护花.    ----己亥杂诗",
    "千里之行,始于足下.    ----道德经",
    "学而时习之,不亦说乎.    ----论语",
    "路漫漫其修远兮,吾将上下而求索.    ----离骚",
    "天行健,君子以自强不息.    ----周易"
  ];
  
  return poems[Math.floor(Math.random() * poems.length)];
}

// 生成使用提醒
export function getUsageReminder(balanceStatus: string, flowTrend: string, remainingDays: number): string {
  const reminders = [];
  
  if (balanceStatus === 'critical') {
    reminders.push('⚠️ 余额不足，建议及时充值');
  } else if (balanceStatus === 'low') {
    reminders.push('💡 余额偏低，请注意充值');
  }
  
  if (flowTrend === 'very_high') {
    reminders.push('🔥 流量使用过快，请注意控制');
  } else if (flowTrend === 'high') {
    reminders.push('📈 流量使用较快，请适度控制');
  }
  
  if (remainingDays <= 3) {
    reminders.push('📅 套餐即将到期，请关注续费');
  }
  
  return reminders.length > 0 ? reminders.join(' | ') : '✅ 一切正常，继续享受服务';
}

// 验证环境变量
export function validateConfig(): { phonenum: string; password: string; apiBase: string; cacheTime: number } {
  const phonenum = Deno.env.get('TELECOM_PHONENUM');
  const password = Deno.env.get('TELECOM_PASSWORD');
  
  if (!phonenum || !password) {
    throw new Error('请设置环境变量 TELECOM_PHONENUM 和 TELECOM_PASSWORD');
  }
  
  if (!/^1[3-9]\d{9}$/.test(phonenum)) {
    throw new Error('手机号格式不正确');
  }
  
  if (!/^\d{6}$/.test(password)) {
    throw new Error('密码必须为6位数字');
  }
  
  const apiBase = Deno.env.get('API_BASE') || 'https://dx.ll.sd';
  const cacheTime = parseInt(Deno.env.get('CACHE_TIME') || '600000'); // 默认10分钟
  
  return {
    phonenum,
    password,
    apiBase,
    cacheTime
  };
}

// 创建装饰性分隔线
export function createSeparator(char: string = '─', length: number = 30): string {
  return char.repeat(length);
}

// 格式化大数字（添加千分位分隔符）
export function formatLargeNumber(num: number): string {
  return num.toLocaleString('zh-CN');
} 