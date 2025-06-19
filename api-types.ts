/**
 * API 相关的 TypeScript 类型定义
 * 包含登录、请求、响应等所有 API 接口类型
 */

// ============ 登录相关类型 ============

/**
 * 登录请求体
 */
export interface LoginRequest {
  phonenum: string;    // 手机号
  password: string;    // 密码
}

/**
 * 登录响应
 */
export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;      // 成功时返回的访问令牌
  expires?: number;    // Token 过期时间戳
  phonenum?: string;   // 登录的手机号
}

// ============ API 请求相关类型 ============

/**
 * 通用 API 请求体
 */
export interface ApiRequest {
  phonenum: string;    // 手机号
  token: string;       // 访问令牌
}

/**
 * 通用 API 响应
 */
export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;          // 具体的数据内容
  cached?: boolean;    // 是否来自缓存
  timestamp?: number;  // 响应时间戳
}

// ============ 特定 API 响应类型 ============

/**
 * 套餐信息查询响应
 */
export interface QryImportantDataResponse extends ApiResponse {
  data?: {
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
  };
}

/**
 * 流量包查询响应
 */
export interface UserFluxPackageResponse extends ApiResponse {
  data?: {
    productOFFRatable?: {
      ratableResourcePackages?: Array<{
        title: string;              // 流量包组标题
        productInfos: Array<{
          title: string;            // 流量包名称
          leftTitle?: string;       // 左侧标题
          leftHighlight?: string;   // 左侧高亮文本
          rightCommon?: string;     // 右侧通用文本
          infiniteTitle?: string;   // 无限流量标题
          infiniteValue?: string;   // 无限流量值
          infiniteUnit?: string;    // 无限流量单位
        }>;
      }>;
    };
  };
}

/**
 * 共享流量查询响应
 */
export interface QryShareUsageResponse extends ApiResponse {
  data?: {
    sharePhoneBeans?: Array<{
      sharePhoneNum: string;      // 共享手机号
      phoneName?: string;         // 手机别名
    }>;
    shareTypeBeans?: Array<{
      shareTypeName: string;      // 共享类型名称
      shareUsageInfos: Array<{
        shareUsageName: string;   // 使用项目名称
        shareUsageAmounts: Array<{
          phoneNum: string;       // 手机号
          usageAmount: number;    // 使用量
          totalAmount: number;    // 总量
        }>;
      }>;
    }>;
  };
}

/**
 * 综合信息查询响应
 */
export interface SummaryResponse extends ApiResponse {
  data?: {
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
    flowItems: Array<{
      name: string;             // 流量类型名称
      use: number;              // 流量包已使用量（KB）
      balance: number;          // 流量包剩余量（KB），当为负值时则是超流量
      total: number;            // 流量包总量（KB）
    }>;
  };
}

// ============ 会话管理相关类型 ============

/**
 * 会话信息
 */
export interface SessionInfo {
  phonenum: string;     // 关联的手机号
  token: string;        // 访问令牌
  loginTime: number;    // 登录时间戳
  expiresAt: number;    // 过期时间戳
  lastUsed: number;     // 最后使用时间戳
  ip?: string;          // 登录IP地址
}

/**
 * 会话统计信息
 */
export interface SessionStats {
  totalSessions: number;        // 总会话数
  activeSessions: number;       // 活跃会话数
  expiredSessions: number;      // 过期会话数
  sessionsByPhone: Record<string, number>;  // 按手机号分组的会话数
}

/**
 * 会话管理响应
 */
export interface SessionManagementResponse {
  success: boolean;
  message: string;
  stats?: SessionStats;         // 统计信息
  cleaned?: number;             // 清理的会话数
}

// ============ 错误相关类型 ============

/**
 * API 错误类型
 */
export interface ApiError {
  code: string;         // 错误代码
  message: string;      // 错误信息
  details?: any;        // 错误详情
}

/**
 * 认证错误
 */
export interface AuthError extends ApiError {
  code: 'AUTH_FAILED' | 'TOKEN_EXPIRED' | 'TOKEN_INVALID' | 'PHONE_NOT_ALLOWED';
}

/**
 * 请求错误
 */
export interface RequestError extends ApiError {
  code: 'INVALID_REQUEST' | 'MISSING_PARAMETER' | 'INVALID_PARAMETER';
}

/**
 * 服务错误
 */
export interface ServiceError extends ApiError {
  code: 'SERVICE_UNAVAILABLE' | 'NETWORK_ERROR' | 'UNKNOWN_ERROR';
}

// ============ 工具类型 ============

/**
 * 可选的请求参数
 */
export type OptionalRequestParams = {
  forceRefresh?: boolean;       // 是否强制刷新
  includeCache?: boolean;       // 是否包含缓存信息
};

/**
 * 分页参数
 */
export interface PaginationParams {
  page?: number;                // 页码（从1开始）
  pageSize?: number;            // 每页大小
}

/**
 * 排序参数
 */
export interface SortParams {
  sortBy?: string;              // 排序字段
  sortOrder?: 'asc' | 'desc';   // 排序方向
} 