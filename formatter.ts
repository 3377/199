import type { SummaryData, FluxPackageData, UsageStats, ImportantData, ShareUsageData } from './types.ts';
import { 
  convertFlow, 
  formatFlow, 
  formatBalance, 
  getFlowPackageIcon, 
  getRandomPoetry,
  formatTimestamp,
  createProgressBar,
  createSimpleProgressBar,
  calculatePercentage,
  getBalanceStatus,
  getBalanceIcon,
  calculateDailyAvgFlow,
  calculateRemainingDays,
  getFlowTrend,
  getTrendIcon,
  getUsageReminder,
  createSeparator,
  formatLargeNumber,
  maskPhoneNumber,
  formatPackageDate,
  getPackageStatus,
  formatTimeDiff
} from './utils.ts';

/**
 * 增强版数据格式化器 - 将JSON数据转换为美观的文本格式
 */
export class EnhancedDataFormatter {
  
  // 计算使用统计
  private calculateUsageStats(summary: SummaryData): UsageStats {
    const balanceStatus = getBalanceStatus(summary.balance);
    const voiceUsagePercent = summary.voiceTotal > 0 ? calculatePercentage(summary.voiceUsage, summary.voiceTotal) : 0;
    const flowUsagePercent = calculatePercentage(summary.commonUse, summary.commonTotal);
    const dailyAvgFlow = calculateDailyAvgFlow(summary.commonUse, summary.createTime);
    const remainingDays = calculateRemainingDays();
    const flowTrend = getFlowTrend(dailyAvgFlow, remainingDays, summary.commonTotal);
    
    return {
      balanceStatus,
      voiceUsagePercent,
      flowUsagePercent,
      dailyAvgFlow,
      remainingDays,
      flowTrend
    };
  }
  
  // 格式化基本信息部分（增强版）
  private formatEnhancedBasicInfo(summary: SummaryData, stats: UsageStats): string {
    const balance = formatBalance(summary.balance);
    const balanceIcon = getBalanceIcon(summary.balance);
    
    // 通话信息带进度条
    let voiceInfo = `${summary.voiceUsage} min`;
    if (summary.voiceTotal > 0) {
      const voiceProgress = createSimpleProgressBar(summary.voiceUsage, summary.voiceTotal, 10);
      voiceInfo = `${summary.voiceUsage} / ${summary.voiceTotal} min [${voiceProgress}] ${stats.voiceUsagePercent.toFixed(1)}%`;
    }
    
    // 总流量信息带进度条
    const isOverFlow = summary.flowOver > 0;
    const flowIcon = isOverFlow ? '🔴' : '🟢';
    const flowProgress = createSimpleProgressBar(summary.commonUse, summary.commonTotal, 15);
    
    let commonFlowInfo: string;
    if (isOverFlow) {
      commonFlowInfo = `-${convertFlow(summary.flowOver, 'GB', 2)} / ${convertFlow(summary.commonTotal, 'GB', 2)} GB ${flowIcon}
    [${flowProgress}] 超出${calculatePercentage(summary.flowOver, summary.commonTotal).toFixed(1)}%`;
    } else {
      commonFlowInfo = `${convertFlow(summary.commonUse, 'GB', 2)} / ${convertFlow(summary.commonTotal, 'GB', 2)} GB ${flowIcon}
    [${flowProgress}] ${stats.flowUsagePercent.toFixed(1)}%`;
    }
    
    // 专用流量信息
    let specialFlowInfo = '';
    if (summary.specialTotal > 0) {
      const specialProgress = createSimpleProgressBar(summary.specialUse, summary.specialTotal, 10);
      const specialPercent = calculatePercentage(summary.specialUse, summary.specialTotal);
      specialFlowInfo = `
  - 专用：${convertFlow(summary.specialUse, 'GB', 2)} / ${convertFlow(summary.specialTotal, 'GB', 2)} GB
    [${specialProgress}] ${specialPercent.toFixed(1)}%`;
    }
    
    // 使用统计信息
    const trendIcon = getTrendIcon(stats.flowTrend);
    const dailyAvgFormatted = formatFlow(stats.dailyAvgFlow);
    
    return `📱 手机：${maskPhoneNumber(summary.phonenum)}
${balanceIcon} 余额：¥${balance} (${getBalanceStatus(summary.balance) === 'sufficient' ? '充足' : getBalanceStatus(summary.balance) === 'low' ? '偏低' : '不足'})
📞 通话：${voiceInfo}
🌐 总流量
  - 通用：${commonFlowInfo}${specialFlowInfo}

📊 使用分析
${trendIcon} 日均流量：${dailyAvgFormatted} | 剩余天数：${stats.remainingDays}天
📈 使用趋势：${stats.flowTrend === 'normal' ? '正常' : stats.flowTrend === 'high' ? '偏高' : '过高'}`;
  }
  
  // 格式化流量包详细信息（增强版）
  private formatEnhancedFluxPackageDetails(fluxPackageData: FluxPackageData): string {
    if (!fluxPackageData.responseData?.data?.productOFFRatable?.ratableResourcePackages) {
      return '❌ 流量包信息获取失败';
    }
    
    const packages = fluxPackageData.responseData.data.productOFFRatable.ratableResourcePackages;
    let result = '';
    let totalPackages = 0;
    let activePackages = 0;
    let expiredPackages = 0;
    let soonExpirePackages = 0;
    
    // 收集所有流量包信息用于排序
    const allPackages: Array<{
      group: string;
      icon: string;
      product: any;
      expireDays?: number;
    }> = [];
    
    // 收集所有流量包
    for (const packageGroup of packages) {
      const packageIcon = getFlowPackageIcon(packageGroup.title);
      
      for (const product of packageGroup.productInfos) {
        const packageStatus = getPackageStatus(product.expireDate);
        allPackages.push({
          group: packageGroup.title,
          icon: packageIcon,
          product,
          expireDays: packageStatus.days
        });
      }
    }
    
    // 按到期时间排序（即将到期的在前）
    allPackages.sort((a, b) => {
      if (a.expireDays === null && b.expireDays === null) return 0;
      if (a.expireDays === null) return 1;
      if (b.expireDays === null) return -1;
      return (a.expireDays || 0) - (b.expireDays || 0);
    });
    
    let currentGroup = '';
    
    for (const item of allPackages) {
      const { group, icon, product } = item;
      totalPackages++;
      
      // 显示分组标题
      if (currentGroup !== group) {
        currentGroup = group;
        result += `\n${icon} ${group}\n`;
      }
      
      // 获取流量包状态信息，优先使用outOfServiceTime，其次使用expireDate
      const expireDate = product.outOfServiceTime || product.expireDate;
      const packageStatus = getPackageStatus(expireDate);
      const statusInfo = packageStatus.days !== undefined ? ` ${formatTimeDiff(packageStatus.days)}` : '';
      
      // 统计各类流量包
      if (packageStatus.status === '已过期') {
        expiredPackages++;
      } else if (packageStatus.status === '即将到期') {
        soonExpirePackages++;
      }
      
      if (product.infiniteTitle) {
        // 无限流量包
        result += `  🔹 [${product.title}] ${product.infiniteTitle}${product.infiniteValue}${product.infiniteUnit}/无限\n`;
        result += `      ${packageStatus.icon} ${packageStatus.status}${statusInfo}\n`;
        
        // 显示时间信息（如果有）
        if (product.orderTime || product.effectDate || product.expireDate || product.outOfServiceTime) {
          result += `      📅 `;
          if (product.orderTime) result += `订购：${formatPackageDate(product.orderTime)} `;
          if (product.effectDate) result += `生效：${formatPackageDate(product.effectDate)} `;
          if (product.outOfServiceTime) {
            result += `失效：${formatPackageDate(product.outOfServiceTime)}`;
          } else if (product.expireDate) {
            result += `到期：${formatPackageDate(product.expireDate)}`;
          }
          result += `\n`;
        }
        
        activePackages++;
      } else if (product.leftTitle && product.leftHighlight && product.rightCommon) {
        // 普通流量包 - 解析使用量和总量
        const usageMatch = product.leftHighlight.match(/(\d+(?:\.\d+)?)(KB|MB|GB)/);
        const totalMatch = product.rightCommon.match(/(\d+(?:\.\d+)?)(KB|MB|GB)/);
        
        if (usageMatch && totalMatch) {
          // 转换为KB进行计算
          const usageKB = this.convertToKB(parseFloat(usageMatch[1]), usageMatch[2]);
          const totalKB = this.convertToKB(parseFloat(totalMatch[1]), totalMatch[2]);
          const percent = calculatePercentage(usageKB, totalKB);
          const progress = createSimpleProgressBar(usageKB, totalKB, 8);
          
          result += `  🔹 [${product.title}] ${product.leftTitle}${product.leftHighlight}/${product.rightCommon}\n`;
          result += `      [${progress}] ${percent.toFixed(1)}% 已使用\n`;
          result += `      ${packageStatus.icon} ${packageStatus.status}${statusInfo}\n`;
          
          // 显示时间信息（如果有）
          if (product.orderTime || product.effectDate || product.expireDate || product.outOfServiceTime) {
            result += `      📅 `;
            if (product.orderTime) result += `订购：${formatPackageDate(product.orderTime)} `;
            if (product.effectDate) result += `生效：${formatPackageDate(product.effectDate)} `;
            if (product.outOfServiceTime) {
              result += `失效：${formatPackageDate(product.outOfServiceTime)}`;
            } else if (product.expireDate) {
              result += `到期：${formatPackageDate(product.expireDate)}`;
            }
            result += `\n`;
          }
          
          if (usageKB > 0 && packageStatus.status !== '已过期') activePackages++;
        } else {
          result += `  🔹 [${product.title}] ${product.leftTitle}${product.leftHighlight}/${product.rightCommon}\n`;
          result += `      ${packageStatus.icon} ${packageStatus.status}${statusInfo}\n`;
          
          // 显示时间信息（如果有）
          if (product.orderTime || product.effectDate || product.expireDate || product.outOfServiceTime) {
            result += `      📅 `;
            if (product.orderTime) result += `订购：${formatPackageDate(product.orderTime)} `;
            if (product.effectDate) result += `生效：${formatPackageDate(product.effectDate)} `;
            if (product.outOfServiceTime) {
              result += `失效：${formatPackageDate(product.outOfServiceTime)}`;
            } else if (product.expireDate) {
              result += `到期：${formatPackageDate(product.expireDate)}`;
            }
            result += `\n`;
          }
        }
      }
    }
    
    // 添加增强的流量包统计
    result += `\n📦 流量包统计：共${totalPackages}个`;
    result += ` | ✅ 活跃${activePackages}个`;
    if (soonExpirePackages > 0) result += ` | ⚠️ 即将到期${soonExpirePackages}个`;
    if (expiredPackages > 0) result += ` | ❌ 已过期${expiredPackages}个`;
    result += `\n`;
    
    return result.trim();
  }
  
  // 转换流量单位为KB
  private convertToKB(value: number, unit: string): number {
    switch (unit.toUpperCase()) {
      case 'KB': return value;
      case 'MB': return value * 1024;
      case 'GB': return value * 1024 * 1024;
      default: return value;
    }
  }
  
  // 格式化共享套餐信息
  private formatShareUsage(shareUsageData?: ShareUsageData): string {
    if (!shareUsageData?.responseData?.data?.shareTypeBeans) {
      return '';
    }
    
    let result = '\n👥 共享套餐信息\n';
    const shareTypes = shareUsageData.responseData.data.shareTypeBeans;
    
    for (const shareType of shareTypes) {
      result += `\n🔗 ${shareType.shareTypeName}\n`;
      
      for (const usageInfo of shareType.shareUsageInfos) {
        result += `  📋 ${usageInfo.shareUsageName}\n`;
        
        for (const amount of usageInfo.shareUsageAmounts) {
          const phoneDisplay = amount.phoneNum.substring(0, 3) + '****' + amount.phoneNum.substring(7);
          const percent = calculatePercentage(amount.usageAmount, amount.totalAmount);
          const progress = createSimpleProgressBar(amount.usageAmount, amount.totalAmount, 6);
          
          result += `    📱 ${phoneDisplay}: [${progress}] ${percent.toFixed(1)}%\n`;
        }
      }
    }
    
    return result;
  }
  
  // 格式化账户详细信息
  private formatImportantData(importantData?: ImportantData): string {
    if (!importantData?.responseData?.data) {
      return '';
    }
    
    let result = '\n📋 账户详细信息\n';
    const data = importantData.responseData.data;
    
    // 实时费用信息（优先显示）
    if (data.realtimeFees) {
      result += `\n💸 ${data.realtimeFees.title}\n`;
      result += `  📊 ${data.realtimeFees.subTitle}：${data.realtimeFees.subTitleHh}\n`;
    }
    
    // 月费构成信息
    if (data.monthlyFees && data.monthlyFees.length > 0) {
      result += `\n💰 月费构成\n`;
      for (const fee of data.monthlyFees) {
        const progress = createSimpleProgressBar(parseInt(fee.barPercent), 100, 10);
        result += `  📋 ${fee.title} (${fee.subTilte})\n`;
        result += `      [${progress}] ${fee.barRightSubTitle}\n`;
      }
    }
    
    // 云盘空间信息
    if (data.cloudStorage && data.cloudStorage.length > 0) {
      result += `\n☁️ 云盘空间\n`;
      for (const storage of data.cloudStorage) {
        const percent = parseInt(storage.barPercent);
        const progress = createSimpleProgressBar(percent, 100, 15);
        result += `  📂 ${storage.title}\n`;
        result += `      ${storage.leftTitle}：${storage.leftTitleHh} | ${storage.rightTitle}：${storage.rightTitleHh}\n`;
        result += `      [${progress}] ${percent}% 已使用 ${storage.rightTitleEnd}\n`;
      }
    }
    
    // 会员信息
    if (data.memberInfo) {
      result += `\n👤 会员信息\n`;
      if (data.memberInfo.memberName) {
        result += `  📝 会员名称：${data.memberInfo.memberName}\n`;
      }
      if (data.memberInfo.memberGrade) {
        result += `  ⭐ 会员等级：${data.memberInfo.memberGrade}\n`;
      }
    }
    
    // 账户信息
    if (data.accountInfo) {
      result += `\n🏦 账户信息\n`;
      if (data.accountInfo.accountStatus) {
        result += `  📊 账户状态：${data.accountInfo.accountStatus}\n`;
      }
      if (data.accountInfo.creditLevel) {
        result += `  💳 信用等级：${data.accountInfo.creditLevel}\n`;
      }
    }
    
    // 余额信息
    if (data.balanceInfo) {
      result += `\n💵 详细余额\n`;
      if (data.balanceInfo.realBalance !== undefined) {
        result += `  💰 实际余额：¥${(data.balanceInfo.realBalance / 100).toFixed(2)}\n`;
      }
      if (data.balanceInfo.creditBalance !== undefined) {
        result += `  🏧 信用额度：¥${(data.balanceInfo.creditBalance / 100).toFixed(2)}\n`;
      }
    }
    
    // 如果没有任何有效信息，返回空字符串
    if (result === '\n📋 账户详细信息\n') {
      return '';
    }
    
    return result;
  }
  
  // 主格式化方法（增强版）
  public formatEnhancedTelecomData(
    summary: SummaryData, 
    fluxPackage: FluxPackageData,
    importantData?: ImportantData,
    shareUsage?: ShareUsageData
  ): string {
    const stats = this.calculateUsageStats(summary);
    
    const title = '【✨ 电信套餐用量监控（增强版）✨】';
    const separator = createSeparator('═', 45);
    const basicInfo = this.formatEnhancedBasicInfo(summary, stats);
    const fluxDetails = this.formatEnhancedFluxPackageDetails(fluxPackage);
    const importantInfo = this.formatImportantData(importantData);
    const shareInfo = this.formatShareUsage(shareUsage);
    const queryTime = `⏰ 查询时间：${formatTimestamp(summary.createTime)}`;
    const reminder = `💡 温馨提示：${getUsageReminder(stats.balanceStatus, stats.flowTrend, stats.remainingDays)}`;
    const poetry = `📜 ${getRandomPoetry()}`;
    
    // 数据来源标识
    const dataSource = `📊 数据来源：${importantData ? '完整API数据' : '基础API数据'}${shareUsage ? ' + 共享套餐数据' : ''}`;
    
    let result = `${title}\n${separator}\n\n${basicInfo}`;
    
    // 套餐详细信息（增强查询独有）
    if (importantInfo) {
      result += `\n\n${separator}${importantInfo}`;
    }
    
    // 流量包明细
    if (fluxDetails && !fluxDetails.includes('❌')) {
      result += `\n\n${separator}\n【📦 流量包明细】\n${fluxDetails}`;
    }
    
    // 共享套餐信息
    if (shareInfo) {
      result += `\n\n${separator}${shareInfo}`;
    }
    
    result += `\n\n${separator}\n${dataSource}\n${queryTime}\n${reminder}\n\n${poetry}\n${separator}`;
    
    return result;
  }
  
  // 简化版格式化（兼容原版）
  public formatTelecomData(summary: SummaryData, fluxPackage: FluxPackageData): string {
    const stats = this.calculateUsageStats(summary);
    const title = '【电信套餐用量监控】';
    const basicInfo = this.formatBasicInfo(summary);
    const fluxDetails = this.formatFluxPackageDetails(fluxPackage);
    const queryTime = `查询时间：${formatTimestamp(summary.createTime)}`;
    const poetry = getRandomPoetry();
    
    let result = `${title}\n\n${basicInfo}`;
    
    if (fluxDetails && fluxDetails !== '流量包信息获取失败') {
      result += `\n\n【流量包明细】\n\n${fluxDetails}`;
    }
    
    result += `\n\n${queryTime}\n\n${poetry}`;
    
    return result;
  }
  
  // 原版基本信息格式化（保持兼容性）
  private formatBasicInfo(summary: SummaryData): string {
    const balance = formatBalance(summary.balance);
    
    const voiceInfo = summary.voiceTotal > 0 
      ? `${summary.voiceUsage} / ${summary.voiceTotal} min`
      : `${summary.voiceUsage} min`;
    
    const isOverFlow = summary.flowOver > 0;
    const flowIcon = isOverFlow ? '🔴' : '🟢';
    
    let commonFlowInfo: string;
    if (isOverFlow) {
      commonFlowInfo = `-${convertFlow(summary.flowOver, 'GB', 2)} / ${convertFlow(summary.commonTotal, 'GB', 2)} GB ${flowIcon}`;
    } else {
      commonFlowInfo = `${convertFlow(summary.commonUse, 'GB', 2)} / ${convertFlow(summary.commonTotal, 'GB', 2)} GB ${flowIcon}`;
    }
    
    let specialFlowInfo = '';
    if (summary.specialTotal > 0) {
      specialFlowInfo = `\n  - 专用：${convertFlow(summary.specialUse, 'GB', 2)} / ${convertFlow(summary.specialTotal, 'GB', 2)} GB`;
    }
    
    return `📱 手机：${maskPhoneNumber(summary.phonenum)}
💰 余额：${balance}
📞 通话：${voiceInfo}
🌐 总流量
  - 通用：${commonFlowInfo}${specialFlowInfo}`;
  }
  
  // 原版流量包格式化（保持兼容性）
  private formatFluxPackageDetails(fluxPackageData: FluxPackageData): string {
    if (!fluxPackageData.responseData?.data?.productOFFRatable?.ratableResourcePackages) {
      return '流量包信息获取失败';
    }
    
    const packages = fluxPackageData.responseData.data.productOFFRatable.ratableResourcePackages;
    let result = '';
    
    for (const packageGroup of packages) {
      const packageIcon = getFlowPackageIcon(packageGroup.title);
      result += `\n${packageIcon}${packageGroup.title}\n`;
      
      for (const product of packageGroup.productInfos) {
        if (product.infiniteTitle) {
          result += `🔹[${product.title}]${product.infiniteTitle}${product.infiniteValue}${product.infiniteUnit}/无限\n`;
        } else if (product.leftTitle && product.leftHighlight && product.rightCommon) {
          result += `🔹[${product.title}]${product.leftTitle}${product.leftHighlight}/${product.rightCommon}\n`;
        }
      }
    }
    
    return result.trim();
  }
  
  // 格式化为HTML（可选，用于Web显示）
  public formatTelecomDataAsHtml(summary: SummaryData, fluxPackage: FluxPackageData, enhanced: boolean = false): string {
    const textData = enhanced 
      ? this.formatEnhancedTelecomData(summary, fluxPackage)
      : this.formatTelecomData(summary, fluxPackage);
    
    return `<pre style="font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; 
                        white-space: pre-wrap; 
                        line-height: 1.6; 
                        background: #f5f5f5; 
                        padding: 20px; 
                        border-radius: 8px; 
                        border-left: 4px solid #007acc;
                        color: #333;
                        font-size: 14px;">${textData}</pre>`;
  }
  
  // 获取简化的状态信息（用于API状态检查）
  public getStatusSummary(summary: SummaryData): string {
    const balance = formatBalance(summary.balance);
    const flowUsed = convertFlow(summary.commonUse, 'GB', 2);
    const flowTotal = convertFlow(summary.commonTotal, 'GB', 2);
    const isOverFlow = summary.flowOver > 0;
    const stats = this.calculateUsageStats(summary);
    
    return `📱 ${maskPhoneNumber(summary.phonenum)} | 💰 ¥${balance} | 🌐 ${flowUsed}/${flowTotal}GB ${isOverFlow ? '🔴' : '🟢'} | 📊 ${stats.flowUsagePercent.toFixed(1)}%`;
  }
}

// 创建全局格式化器实例
export const formatter = new EnhancedDataFormatter(); 