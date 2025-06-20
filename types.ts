// 电信接口数据类型定义
export interface SummaryData {
  phonenum: string;           // 手机号码
  balance: number;            // 账户余额（分）
  voiceUsage: number;         // 语音通话已使用时长（分钟）
  voiceTotal: number;         // 语音通话总时长（分钟）
  flowUse: number;            // 总流量已使用量（KB）
  flowTotal: number;          // 总流量总量（KB）
  flowOver: number;           // 总流量超量（KB）
  commonUse: number;          // 通用流量已使用量（KB）
  commonTotal: number;        // 通用流量总量（KB）
  commonOver: number;         // 通用流量超量（KB）
  specialUse: number;         // 专用流量已使用量（KB）
  specialTotal: number;       // 专用流量总量（KB）
  createTime: string;         // 数据创建时间
  flowItems: FlowItem[];      // 流量类型列表
}

export interface FlowItem {
  name: string;               // 流量类型名称
  use: number;                // 流量包已使用量（KB）
  balance: number;            // 流量包剩余量（KB），当为负值时则是超流量
  total: number;              // 流量包总量（KB）
}

// 流量包详细信息
export interface FluxPackageData {
  responseData: {
    data: {
      productOFFRatable: {
        ratableResourcePackages: FluxPackageGroup[];
      };
    };
  };
}

export interface FluxPackageGroup {
  title: string;              // 流量包组标题
  productInfos: FluxPackageItem[];
}

export interface FluxPackageItem {
  title: string;              // 流量包名称
  leftTitle?: string;         // 左侧标题
  leftHighlight?: string;     // 左侧高亮文本
  rightCommon?: string;       // 右侧通用文本
  infiniteTitle?: string;     // 无限流量标题
  infiniteValue?: string;     // 无限流量值
  infiniteUnit?: string;      // 无限流量单位
  effectDate?: string;        // 生效日期
  expireDate?: string;        // 过期日期
  orderTime?: string;         // 订购时间
  packageStatus?: string;     // 套餐状态
  outOfServiceTime?: string;  // 失效时间
}

// 重要数据详情
export interface ImportantData {
  responseData: {
    data: {
      memberInfo?: {
        memberGrade?: string;     // 会员等级
        memberName?: string;      // 会员名称
      };
      accountInfo?: {
        accountStatus?: string;   // 账户状态
        creditLevel?: string;     // 信用等级
      };
      balanceInfo?: {
        realBalance?: number;     // 实际余额
        creditBalance?: number;   // 信用额度
      };
      cloudStorage?: CloudStorageInfo[];  // 云盘空间信息
      monthlyFees?: MonthlyFeeInfo[];      // 月费构成信息
      realtimeFees?: RealtimeFeeInfo;      // 实时费用信息
    };
  };
}

// 云盘空间信息
export interface CloudStorageInfo {
  title: string;              // 云盘类型名称
  subTitle?: string;          // 副标题
  barPercent: string;         // 使用百分比
  barRightCount?: string;     // 右侧计数
  leftTitle: string;          // 左侧标题（已用）
  leftTitleHh: string;        // 左侧高亮值（已用量）
  rightTitle: string;         // 右侧标题（剩余）
  rightTitleHh: string;       // 右侧高亮值（剩余量）
  rightTitleEnd: string;      // 总容量
}

// 月费构成信息
export interface MonthlyFeeInfo {
  title: string;              // 费用项目名称
  subTilte: string;           // 费用占比百分比
  barPercent: string;         // 进度条百分比
  barRightSubTitle: string;   // 费用金额
}

// 实时费用信息
export interface RealtimeFeeInfo {
  title: string;              // 标题
  subTitle: string;           // 副标题
  subTitleHh: string;         // 费用金额
  iconUrl?: string;           // 图标URL
}

// 共享套餐信息
export interface ShareUsageData {
  responseData: {
    data: {
      sharePhoneBeans?: SharePhoneBean[];
      shareTypeBeans?: ShareTypeBean[];
    };
  };
}

export interface SharePhoneBean {
  sharePhoneNum: string;      // 共享手机号
  phoneName?: string;         // 手机别名
}

export interface ShareTypeBean {
  shareTypeName: string;      // 共享类型名称
  shareUsageInfos: ShareUsageInfo[];
}

export interface ShareUsageInfo {
  shareUsageName: string;     // 使用项目名称
  shareUsageAmounts: ShareUsageAmount[];
}

export interface ShareUsageAmount {
  phoneNum: string;           // 手机号
  usageAmount: number;        // 使用量
  totalAmount: number;        // 总量
}

// 增强的缓存数据结构
export interface CachedData {
  summary: SummaryData;
  fluxPackage: FluxPackageData;
  importantData?: ImportantData;
  shareUsage?: ShareUsageData;
  timestamp: number;
  formattedText?: string;
}

// API响应
export interface ApiResponse {
  success: boolean;
  data?: string | object;
  error?: string;
  cached: boolean;
  phonenum?: string;
  timestamp?: string;
  warning?: string;  // 警告信息（如部分发送失败）
  send_results?: {   // 发送结果信息
    platform: string;
    results: any[];
    total_sent: number;
    total_failed: number;
  };
}

// 用户配置类型
export interface UserConfig {
  phonenum: string;
  password: string;
  displayName: string;
}

// 多用户配置类型
export interface MultiUserConfig {
  users: UserConfig[];
  defaultUser: string;
  apiBase: string;
  cacheTime: number;
  webPassword?: string;
}

// 环境变量配置
export interface Config {
  phonenum: string;
  password: string;
  apiBase: string;
  cacheTime: number;
}

// 使用统计
export interface UsageStats {
  balanceStatus: 'sufficient' | 'low' | 'critical';
  voiceUsagePercent: number;
  flowUsagePercent: number;
  dailyAvgFlow: number;        // 日均流量使用（KB）
  remainingDays: number;       // 套餐剩余天数
  flowTrend: 'normal' | 'high' | 'very_high';
} 