import { ElMessage } from 'element-plus'
import {
  SupplierData,
  PriceTrend,
  PriceTrendAnalysis,
  SheetData
} from '../types'

// 提取日期部分（用于价格走势分析）
export const extractDate = (dateValue: any): string => {
  if (!dateValue) return ''
  if (typeof dateValue === 'string') {
    // 尝试从字符串中提取日期部分
    const dateMatch = dateValue.match(/\d{4}[-/]\d{1,2}[-/]\d{1,2}/)
    if (dateMatch) return dateMatch[0]
  }
  // 对于数值类型的日期（Excel日期），转换为字符串
  return String(dateValue)
}

// 从日期字符串提取年份
export const getYearFromDate = (dateString: string): number => {
  if (!dateString) return 0
  const yearMatch = dateString.match(/\d{4}/)
  return yearMatch ? parseInt(yearMatch[0], 10) : 0
}

// 获取单元格数值
export const getCellValue = (
  row: Record<string, any>,
  header: string,
  defaultValue: any = 0
): any => {
  const value = row[header]
  if (value === null || value === undefined || value === '') {
    return defaultValue
  }
  return value
}

// 转换为数字
export const toNumber = (value: any, defaultValue: number = 0): number => {
  if (value === null || value === undefined || value === '') {
    return defaultValue
  }
  if (typeof value === 'number') {
    return isFinite(value) ? value : defaultValue
  }
  // 尝试从字符串中提取数字
  const numStr = String(value).replace(/[^\d.-]/g, '')
  const num = parseFloat(numStr)
  return isNaN(num) || !isFinite(num) ? defaultValue : num
}

// 分析价格走势，计算每年的年初和年终价格
export const analyzePriceTrend = (
  priceTrend: PriceTrend[]
): PriceTrendAnalysis[] => {
  if (!priceTrend || priceTrend.length === 0) {
    return []
  }

  // 按年份分组
  const yearGroups = new Map<number, PriceTrend[]>()

  for (const trend of priceTrend) {
    const year = getYearFromDate(trend.date)
    if (year > 0) {
      if (!yearGroups.has(year)) {
        yearGroups.set(year, [])
      }
      yearGroups.get(year)?.push(trend)
    }
  }

  // 对每个年份进行分析
  const analysisResult: PriceTrendAnalysis[] = []

  yearGroups.forEach((trends, year) => {
    // 按日期排序
    trends.sort((a, b) => a.date.localeCompare(b.date))

    if (trends.length > 0) {
      const startTrend = trends[0]
      const endTrend = trends[trends.length - 1]

      // 确保价格是有效数字
      const startPrice = isFinite(startTrend.price) ? startTrend.price : NaN
      const endPrice = isFinite(endTrend.price) ? endTrend.price : NaN

      // 避免除以零和无效计算
      const changeAmount =
        isFinite(startPrice) && isFinite(endPrice) ? endPrice - startPrice : NaN
      const changePercentage =
        isFinite(startPrice) && isFinite(endPrice) && startPrice > 0
          ? (changeAmount / startPrice) * 100
          : NaN

      // 添加所有年份的数据，即使部分值无效（前端会处理显示）
      analysisResult.push({
        year,
        startPrice,
        endPrice,
        changeAmount,
        changePercentage,
        startDate: startTrend.date,
        endDate: endTrend.date
      })
    }
  })

  // 按年份排序
  analysisResult.sort((a, b) => a.year - b.year)

  return analysisResult
}

// 将树状数据转换为扁平化表格数据
export const convertToFlattenedData = (
  suppliers: SupplierData[]
): Record<string, any>[] => {
  const flattened: Record<string, any>[] = []

  suppliers.forEach((supplier) => {
    supplier.inventories.forEach((inventory) => {
      inventory.specifications.forEach((specification) => {
        // 为每个规格型号创建一行数据
        const row: Record<string, any> = {
          供应商简称: supplier.supplierName,
          存货名称: inventory.inventoryName,
          规格型号:
            specification.specification === '无规格型号'
              ? ''
              : specification.specification,
          采购数量: specification.quantity,
          采购总价: specification.totalAmount,
          类别均价: specification.averagePrice,
          供应商总数量: supplier.quantity,
          供应商总金额: supplier.totalAmount,
          供应商均价: supplier.averagePrice,
          存货总数量: inventory.quantity,
          存货总金额: inventory.totalAmount,
          存货均价: inventory.averagePrice
        }

        // 添加年度价格走势分析
        // 保留完整的priceTrendAnalysis数组用于后续处理
        row.priceTrendAnalysis = specification.priceTrendAnalysis

        // 同时添加拆分的年度价格趋势列（兼容旧代码）
        specification.priceTrendAnalysis.forEach((trend) => {
          // 确保所有价格相关数据都是有效数字，无效数据显示为0或空
          row[`${trend.year}年年初价格`] = isFinite(trend.startPrice)
            ? trend.startPrice
            : 0
          row[`${trend.year}年年终价格`] = isFinite(trend.endPrice)
            ? trend.endPrice
            : 0
          row[`${trend.year}年价格变化`] = isFinite(trend.changeAmount)
            ? trend.changeAmount
            : 0
          row[`${trend.year}年价格变化率`] = isFinite(trend.changePercentage)
            ? `${trend.changePercentage.toFixed(2)}%`
            : '0.00%'
        })

        flattened.push(row)
      })
    })
  })

  return flattened
}

// 获取所有唯一列名的函数
export const getAllUniqueColumns = (data: Record<string, any>[]): string[] => {
  const columns = new Set<string>()

  data.forEach((row) => {
    Object.keys(row).forEach((key) => {
      if (key !== undefined && key !== null) {
        columns.add(key)
      }
    })
  })

  return Array.from(columns)
}
