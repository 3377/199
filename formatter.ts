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
  calculateExpireDays,
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
  
  // 格式化增强版流量包详情 - 根据实际API数据结构重写
  private formatEnhancedFluxPackageDetails(fluxData?: FluxPackageData): string {
    if (!fluxData) {
      return '';
    }
    
    console.log('🔍 调试：流量包原始数据：', JSON.stringify(fluxData, null, 2));
    
    // 根据实际API数据结构解析数据
    let actualData: any = null;
    
    // 优先尝试从responseData.data获取
    if (fluxData.responseData?.data) {
      actualData = fluxData.responseData.data;
    }
    // 其次尝试从data字段获取
    else if ((fluxData as any).data) {
      actualData = (fluxData as any).data;
    }
    // 最后尝试根级别
    else {
      actualData = fluxData;
    }
    
    if (!actualData) {
      console.log('⚠️ 无法找到有效的流量包数据结构');
      return '';
    }
    
    console.log('🔍 解析出的流量包actualData：', JSON.stringify(actualData, null, 2));
    
    let result = '\n🚀 流量包详细信息\n';
    let packageCount = 0;
    
    // 解析主套餐信息（mainProductOFFInfo）
    if (actualData.mainProductOFFInfo) {
      const mainProduct = actualData.mainProductOFFInfo;
      result += `\n📋 主套餐信息\n`;
      result += `  📱 套餐名称：${mainProduct.productOFFName}\n`;
      if (mainProduct.shareTipDesc) {
        result += `  👥 ${mainProduct.shareTitle}：${mainProduct.shareTipDesc}\n`;
      }
    }
    
    // 解析流量包详情（从productOFFRatable.ratableResourcePackages获取）
    if (actualData.productOFFRatable?.ratableResourcePackages && Array.isArray(actualData.productOFFRatable.ratableResourcePackages)) {
      for (const category of actualData.productOFFRatable.ratableResourcePackages) {
        if (category.title && category.productInfos && Array.isArray(category.productInfos)) {
          result += `\n📊 ${category.title}\n`;
          
          // 总体使用情况
          if (category.leftStructure && category.rightStructure) {
            const usedNum = parseFloat(category.leftStructure.num) || 0;
            const remainNum = parseFloat(category.rightStructure.num) || 0;
            const totalNum = usedNum + remainNum;
            const usedPercent = totalNum > 0 ? Math.round((usedNum / totalNum) * 100) : 0;
            const progress = createSimpleProgressBar(usedPercent, 100, 20);
            
            result += `  📈 总体使用：${category.leftStructure.num}${category.leftStructure.unit} / ${totalNum}${category.leftStructure.unit}\n`;
            result += `  📊 [${progress}] ${usedPercent}% 已使用\n`;
          }
          
          // 各个流量包详情
          result += `\n  📦 流量包明细：\n`;
          
          // 按orderLevel排序
          const sortedPackages = category.productInfos.sort((a: any, b: any) => 
            (a.orderLevel || 999) - (b.orderLevel || 999)
          );
          
          for (const pkg of sortedPackages) {
            packageCount++;
            const usedPercent = parseInt(pkg.progressBar) || 0;
            const progress = createSimpleProgressBar(usedPercent, 100, 12);
             
            result += `\n    ${packageCount}. ${pkg.title}\n`;
            result += `      📊 [${progress}] ${usedPercent}% 已使用\n`;
            result += `      📱 ${pkg.leftTitle}：${pkg.leftHighlight} | ${pkg.rightTitle}：${pkg.rightHighlight}${pkg.rightCommon || ''}\n`;
             
            // 解析失效时间（outOfServiceTime字段）
            if (pkg.outOfServiceTime) {
              const expireText = formatPackageDate(pkg.outOfServiceTime);
              const expireDays = calculateExpireDays(pkg.outOfServiceTime);
              const statusInfo = getPackageStatus(pkg.outOfServiceTime);
               
              result += `      ⏰ ${expireText}\n`;
              result += `      ${statusInfo.icon} 状态：${statusInfo.status}\n`;
               
              if (expireDays !== null && expireDays > 0 && expireDays <= 30) {
                result += `      ⚠️ 还有 ${expireDays} 天到期，请及时续费！\n`;
              }
            }
            
            // 无限制流量包特殊处理
            if (pkg.isInfiniteAmount === "1" && pkg.infiniteTitle) {
              result += `      ♾️ ${pkg.infiniteTitle}：${pkg.infiniteValue}${pkg.infiniteUnit}\n`;
            }
            
            // 包状态
            if (pkg.isInvalid === "1") {
              result += `      ❌ 状态：已失效\n`;
            } else {
              result += `      ✅ 状态：有效\n`;
            }
            
            // 图标信息
            if (pkg.titleIcon) {
              const iconType = pkg.titleIcon.includes('JZYX') ? '📈 精准营销' : 
                             pkg.titleIcon.includes('ZTC') ? '🎯 专属包' : '📱 通用包';
              result += `      🏷️ 类型：${iconType}\n`;
            }
          }
        }
      }
    }
    
    // 如果没有找到流量包，尝试从其他可能的位置解析
    if (packageCount === 0) {
      console.log('🔍 尝试从其他位置解析流量包数据...');
      
      // 尝试直接从fluxPackages数组解析（如果存在）
      if (actualData.fluxPackages && Array.isArray(actualData.fluxPackages)) {
        result += `\n📦 流量包列表\n`;
        
        for (let i = 0; i < actualData.fluxPackages.length; i++) {
          const pkg = actualData.fluxPackages[i];
          packageCount++;
          
          result += `\n  ${packageCount}. ${pkg.packageName || pkg.title}\n`;
          
          if (pkg.totalFlow && pkg.usedFlow) {
            const usedPercent = calculatePercentage(pkg.usedFlow, pkg.totalFlow);
            const progress = createSimpleProgressBar(usedPercent, 100, 15);
            
            result += `    📊 [${progress}] ${usedPercent}% 已使用\n`;
            result += `    📱 已用：${formatFlow(pkg.usedFlow)} | 剩余：${formatFlow(pkg.totalFlow - pkg.usedFlow)} | 总量：${formatFlow(pkg.totalFlow)}\n`;
          }
          
          // 解析失效时间
          const expireTime = pkg.outOfServiceTime || pkg.expireDate || pkg.effectDate;
          if (expireTime) {
            const expireText = formatPackageDate(expireTime);
            const expireDays = calculateExpireDays(expireTime);
            const status = getPackageStatus(expireTime);
            
            result += `    ⏰ ${expireText}\n`;
            result += `    ${status.icon} 状态：${status.status}\n`;
          }
          
          if (pkg.packageStatus) {
            result += `    📄 状态：${pkg.packageStatus}\n`;
          }
        }
      }
      
      // 如果还是没有找到，显示调试信息
      if (packageCount === 0) {
        console.log('⚠️ 未找到可解析的流量包信息');
        result += `\n⚠️ 暂无可显示的流量包详细信息\n`;
        result += `🔍 数据结构键：${Object.keys(actualData).join(', ')}\n`;
        
        if (actualData.productOFFRatable) {
          result += `📊 产品信息键：${Object.keys(actualData.productOFFRatable).join(', ')}\n`;
        }
      }
    }
    
    // 添加使用提示（如果存在）
    if (actualData.tips) {
      result += `\n💡 使用说明\n`;
      const tips = actualData.tips.split('\n').filter((tip: string) => tip.trim());
      for (let i = 0; i < Math.min(tips.length, 5); i++) {
        result += `  ${i + 1}. ${tips[i].trim()}\n`;
      }
    }
    
    // 语音播报信息（如果存在）
    if (actualData.voiceMessage && packageCount > 0) {
      result += `\n🔊 语音播报摘要\n`;
      result += `  📢 ${actualData.voiceMessage.substring(0, 100)}${actualData.voiceMessage.length > 100 ? '...' : ''}\n`;
    }
    
    // 统计信息
    if (packageCount > 0) {
      result += `\n📈 统计概览\n`;
      result += `  📦 总流量包数量：${packageCount}个\n`;
      
      // 计算即将到期的流量包数量
      let expiringSoon = 0;
      if (actualData.productOFFRatable?.ratableResourcePackages) {
        for (const category of actualData.productOFFRatable.ratableResourcePackages) {
          if (category.productInfos) {
            for (const pkg of category.productInfos) {
              if (pkg.outOfServiceTime) {
                const expireDays = calculateExpireDays(pkg.outOfServiceTime);
                if (expireDays !== null && expireDays <= 30 && expireDays > 0) {
                  expiringSoon++;
                }
              }
            }
          }
        }
      }
      
      if (expiringSoon > 0) {
        result += `  ⚠️ 即将到期：${expiringSoon}个 (30天内)\n`;
      }
    }
    
    return packageCount > 0 ? result : '';
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
  
  // 格式化账户详细信息 - 根据实际API数据结构完全重写
  private formatImportantData(importantData?: ImportantData): string {
    if (!importantData) {
      return '';
    }
    
    console.log('🔍 调试：importantData 原始数据：', JSON.stringify(importantData, null, 2));
    
    // 根据实际API数据结构解析数据
    let actualData: any = null;
    
    // 优先尝试从responseData.data获取
    if (importantData.responseData?.data) {
      actualData = importantData.responseData.data;
    }
    // 其次尝试从data字段获取
    else if ((importantData as any).data) {
      actualData = (importantData as any).data;
    }
    // 最后尝试根级别
    else {
      actualData = importantData;
    }
    
    if (!actualData) {
      console.log('⚠️ 无法找到有效的数据结构');
      return '';
    }
    
    console.log('🔍 解析出的 actualData：', JSON.stringify(actualData, null, 2));
    
    let result = '\n📋 账户详细信息\n';
    let hasContent = false;
    
    // 1. 解析实时费用信息（balanceInfo.phoneBillRegion）
    if (actualData.balanceInfo?.phoneBillRegion) {
      const phoneBill = actualData.balanceInfo.phoneBillRegion;
      result += `\n💸 ${phoneBill.title}\n`;
      result += `  📊 ${phoneBill.subTitle}：${phoneBill.subTitleHh}\n`;
      hasContent = true;
      console.log('✅ 找到实时费用信息');
    }
    
    // 2. 解析月费构成信息（balanceInfo.phoneBillBars）
    if (actualData.balanceInfo?.phoneBillBars && Array.isArray(actualData.balanceInfo.phoneBillBars)) {
      result += `\n💰 月费构成\n`;
      for (const fee of actualData.balanceInfo.phoneBillBars) {
        if (fee.title && fee.barRightSubTitle) {
          const percent = parseInt(fee.barPercent) || 0;
          const progress = createSimpleProgressBar(percent, 100, 10);
          result += `  📋 ${fee.title} (${fee.subTilte || fee.subTitle || percent + '%'})\n`;
          result += `      [${progress}] ${fee.barRightSubTitle}\n`;
        }
      }
      hasContent = true;
      console.log('✅ 找到月费构成信息');
    }
    
    // 3. 解析云盘空间信息（storageInfo.flowList）
    if (actualData.storageInfo?.flowList && Array.isArray(actualData.storageInfo.flowList)) {
      result += `\n☁️ 云盘空间\n`;
      for (const storage of actualData.storageInfo.flowList) {
        if (storage.title && storage.leftTitleHh && storage.rightTitleHh) {
          const percent = parseInt(storage.barPercent) || 0;
          const progress = createSimpleProgressBar(percent, 100, 15);
          result += `  📂 ${storage.title}\n`;
          result += `      ${storage.leftTitle}：${storage.leftTitleHh} | ${storage.rightTitle}：${storage.rightTitleHh}\n`;
          result += `      [${progress}] ${percent}% 已使用${storage.rightTitleEnd ? ' ' + storage.rightTitleEnd : ''}\n`;
        }
      }
      hasContent = true;
      console.log('✅ 找到云盘空间信息');
    }
    
    // 4. 解析账户余额详情（balanceInfo.indexBalanceDataInfo）
    if (actualData.balanceInfo?.indexBalanceDataInfo) {
      const balanceInfo = actualData.balanceInfo.indexBalanceDataInfo;
      result += `\n💵 账户余额详情\n`;
      result += `  💰 可用余额：¥${balanceInfo.balance}\n`;
      if (balanceInfo.arrear && balanceInfo.arrear !== '0.00') {
        result += `  🔴 欠费金额：¥${balanceInfo.arrear}\n`;
      }
      hasContent = true;
      console.log('✅ 找到账户余额详情');
    }
    
    // 5. 解析积分信息（integralInfo）
    if (actualData.integralInfo?.integral) {
      result += `\n🎁 积分信息\n`;
      result += `  ⭐ 剩余积分：${actualData.integralInfo.integral}分\n`;
      hasContent = true;
      console.log('✅ 找到积分信息');
    }
    
    // 6. 解析流量详情（flowInfo.flowList） - 可能包含流量包细节
    if (actualData.flowInfo?.flowList && Array.isArray(actualData.flowInfo.flowList)) {
      result += `\n📊 流量详细统计\n`;
      for (const flow of actualData.flowInfo.flowList) {
        if (flow.title && flow.leftTitleHh && flow.rightTitleHh) {
          const percent = parseInt(flow.barPercent) || 0;
          const progress = createSimpleProgressBar(percent, 100, 12);
          result += `  📱 ${flow.title}\n`;
          result += `      ${flow.leftTitle}：${flow.leftTitleHh} | ${flow.rightTitle}：${flow.rightTitleHh}\n`;
          result += `      [${progress}] ${percent}% 已使用${flow.rightTitleEnd ? ' ' + flow.rightTitleEnd : ''}\n`;
        }
      }
      hasContent = true;
      console.log('✅ 找到流量详细统计');
    }
    
    // 7. 解析语音详情（voiceInfo.voiceBars）
    if (actualData.voiceInfo?.voiceBars && Array.isArray(actualData.voiceInfo.voiceBars)) {
      result += `\n📞 语音详细统计\n`;
      for (const voice of actualData.voiceInfo.voiceBars) {
        if (voice.title && voice.leftTitleHh && voice.rightTitleHh) {
          const percent = parseInt(voice.barPercent) || 0;
          const progress = createSimpleProgressBar(percent, 100, 12);
          result += `  📞 ${voice.title}\n`;
          result += `      ${voice.leftTitle}：${voice.leftTitleHh} | ${voice.rightTitle}：${voice.rightTitleHh}\n`;
          result += `      [${progress}] ${percent}% 已使用${voice.rightTitleEnd ? ' ' + voice.rightTitleEnd : ''}\n`;
        }
      }
      hasContent = true;
      console.log('✅ 找到语音详细统计');
    }
    
    // 8. 解析存储空间总览（storageInfo.storageDataInfo）
    if (actualData.storageInfo?.storageDataInfo) {
      const storageData = actualData.storageInfo.storageDataInfo;
      result += `\n💾 存储空间总览\n`;
      if (storageData.balance) {
        const balanceBytes = parseInt(storageData.balance);
        const balanceGB = (balanceBytes / 1024 / 1024 / 1024).toFixed(2);
        result += `  ☁️ ${storageData.title}：${balanceGB}GB\n`;
      }
      hasContent = true;
      console.log('✅ 找到存储空间总览');
    }
    
    // 9. 解析总用量信息（flowInfo.flowRegion）
    if (actualData.flowInfo?.flowRegion) {
      const flowRegion = actualData.flowInfo.flowRegion;
      result += `\n📈 总用量信息\n`;
      result += `  📊 ${flowRegion.title}：${flowRegion.subTitle} ${flowRegion.subTitleHh}\n`;
      hasContent = true;
      console.log('✅ 找到总用量信息');
    }
    
    // 10. 解析语音总用量信息（voiceInfo.voiceRegion）
    if (actualData.voiceInfo?.voiceRegion) {
      const voiceRegion = actualData.voiceInfo.voiceRegion;
      result += `\n📞 语音总用量信息\n`;
      result += `  📊 ${voiceRegion.title}：${voiceRegion.subTitle} ${voiceRegion.subTitleHh}\n`;
      hasContent = true;
      console.log('✅ 找到语音总用量信息');
    }
    
    // 如果还是没有内容，显示调试信息帮助排查
    if (!hasContent) {
      console.log('⚠️ 未找到预期的数据结构，显示可用的数据键');
      result += `\n⚠️ 暂无可显示的账户详细信息\n`;
      result += `🔍 可用数据结构：\n`;
      
      // 显示主要数据结构的键
      const dataKeys = Object.keys(actualData);
      result += `  📊 主要数据键：${dataKeys.join(', ')}\n`;
      
      if (actualData.balanceInfo && typeof actualData.balanceInfo === 'object') {
        const balanceKeys = Object.keys(actualData.balanceInfo);
        result += `  💰 余额信息键：${balanceKeys.join(', ')}\n`;
      }
      
      if (actualData.flowInfo && typeof actualData.flowInfo === 'object') {
        const flowKeys = Object.keys(actualData.flowInfo);
        result += `  📱 流量信息键：${flowKeys.join(', ')}\n`;
      }
      
      if (actualData.storageInfo && typeof actualData.storageInfo === 'object') {
        const storageKeys = Object.keys(actualData.storageInfo);
        result += `  ☁️ 存储信息键：${storageKeys.join(', ')}\n`;
      }
      
      if (actualData.voiceInfo && typeof actualData.voiceInfo === 'object') {
        const voiceKeys = Object.keys(actualData.voiceInfo);
        result += `  📞 语音信息键：${voiceKeys.join(', ')}\n`;
      }
    }
    
    return hasContent ? result : '';
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