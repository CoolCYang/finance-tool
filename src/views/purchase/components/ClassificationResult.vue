<template>
  <div
    class="classification-result flex flex-col mt-4"
    v-if="supplierData.length > 0"
  >
    <h3 class="text-lg font-bold mb-3">分类统计结果</h3>

    <el-collapse class="flex-1 overflow-y-auto">
      <!-- 供应商展开面板 -->
      <el-collapse-item
        v-for="(supplier, supplierIndex) in supplierData"
        :key="supplierIndex"
        :title="`${supplier.supplierName} - 总数量: ${supplier.quantity} - 总金额: ${supplier.totalAmount.toFixed(4)} - 均价: ${supplier.averagePrice.toFixed(4)}`"
      >
        <el-collapse>
          <!-- 存货展开面板 -->
          <el-collapse-item
            v-for="(inventory, inventoryIndex) in supplier.inventories"
            :key="inventoryIndex"
            :title="`${inventory.inventoryName} - 数量: ${inventory.quantity} - 金额: ${inventory.totalAmount.toFixed(4)} - 均价: ${inventory.averagePrice.toFixed(4)}`"
          >
            <!-- 规格型号表格 -->
            <el-table
              :data="inventory.specifications"
              border
              stripe
              size="small"
              class="mt-2"
            >
              <el-table-column
                prop="specification"
                label="规格型号"
                width="200"
              />
              <el-table-column
                prop="quantity"
                label="采购数量"
                width="120"
                align="right"
              />
              <el-table-column
                prop="totalAmount"
                label="采购总价"
                width="120"
                align="right"
              >
                <template #default="scope">
                  {{ scope.row.totalAmount.toFixed(4) }}
                </template>
              </el-table-column>
              <el-table-column
                prop="averagePrice"
                label="类别均价"
                width="120"
                align="right"
              >
                <template #default="scope">
                  {{ scope.row.averagePrice.toFixed(4) }}
                </template>
              </el-table-column>
              <!-- 单价走势对比列 -->
              <el-table-column label="单价走势对比" width="200" align="center">
                <template #default="scope">
                  <div v-if="scope.row.priceTrendAnalysis.length > 0">
                    <div class="price-trend-comparison">
                      <div
                        v-for="(
                          trend, index
                        ) in scope.row.priceTrendAnalysis.slice(-2)"
                        :key="index"
                        class="year-trend"
                      >
                        <div class="year-label">{{ trend.year }}年</div>
                        <div class="price-range">
                          <span class="start-price">{{
                            isFinite(trend.startPrice)
                              ? trend.startPrice.toFixed(4)
                              : '-'
                          }}</span>
                          <span class="arrow">→</span>
                          <span
                            class="end-price"
                            :class="
                              isFinite(trend.changeAmount) &&
                              trend.changeAmount >= 0
                                ? 'price-up'
                                : 'price-down'
                            "
                          >
                            {{
                              isFinite(trend.endPrice)
                                ? trend.endPrice.toFixed(4)
                                : '-'
                            }}
                          </span>
                        </div>
                        <div
                          class="change-rate"
                          :class="
                            isFinite(trend.changeAmount) &&
                            trend.changeAmount >= 0
                              ? 'rate-up'
                              : 'rate-down'
                          "
                        >
                          {{
                            isFinite(trend.changeAmount) &&
                            isFinite(trend.changePercentage)
                              ? (trend.changeAmount >= 0 ? '↑' : '↓') +
                                Math.abs(trend.changePercentage).toFixed(2) +
                                '%'
                              : '-'
                          }}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-gray-500">无数据</div>
                </template>
              </el-table-column>
              <el-table-column label="每笔交易单价走势" min-width="400">
                <template #default="scope">
                  <div v-if="scope.row.priceTrend.length > 0">
                    <div
                      v-for="(transaction, index) in scope.row.priceTrend"
                      :key="index"
                      class="transaction-price-item"
                    >
                      <span class="date-info">{{ transaction.date }}</span>
                      <span class="price-info">{{
                        transaction.price.toFixed(4)
                      }}</span>
                    </div>
                  </div>
                  <div v-else class="text-gray-500">无交易记录</div>
                </template>
              </el-table-column>
              <el-table-column label="价格走势分析" min-width="400">
                <template #default="scope">
                  <div v-if="scope.row.priceTrendAnalysis.length > 0">
                    <!-- 整体趋势 -->
                    <div class="mb-2 p-2 bg-gray-50 rounded">
                      <strong>整体趋势:</strong>
                      <span
                        :class="
                          scope.row.priceTrendAnalysis[
                            scope.row.priceTrendAnalysis.length - 1
                          ].changeAmount >= 0
                            ? 'text-red-600'
                            : 'text-green-600'
                        "
                      >
                        {{
                          scope.row.priceTrendAnalysis[
                            scope.row.priceTrendAnalysis.length - 1
                          ].changeAmount >= 0
                            ? '↑'
                            : '↓'
                        }}
                        价格{{
                          scope.row.priceTrendAnalysis[
                            scope.row.priceTrendAnalysis.length - 1
                          ].changeAmount >= 0
                            ? '上涨'
                            : '下降'
                        }}
                      </span>
                    </div>

                    <!-- 年度走势 -->
                    <div
                      v-for="(trend, trendIndex) in scope.row
                        .priceTrendAnalysis"
                      :key="trendIndex"
                      class="flex items-center justify-between mb-1 p-1 hover:bg-gray-50 rounded"
                    >
                      <span class="text-gray-700">
                        {{ trend.year }}年: {{ trend.startDate }} ~
                        {{ trend.endDate }}
                      </span>
                      <div class="flex items-center" style="gap: 8px">
                        <span>年初: {{ trend.startPrice.toFixed(4) }}</span>
                        <span>年终: {{ trend.endPrice.toFixed(4) }}</span>
                        <span
                          :class="
                            trend.changeAmount >= 0
                              ? 'text-red-600 font-medium'
                              : 'text-green-600 font-medium'
                          "
                        >
                          {{ trend.changeAmount >= 0 ? '↑' : '↓' }}
                          {{ trend.changeAmount >= 0 ? '+' : ''
                          }}{{ trend.changeAmount.toFixed(4) }} ({{
                            trend.changeAmount >= 0 ? '+' : ''
                          }}{{ trend.changePercentage.toFixed(4) }}%)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-gray-500 py-2">无价格走势数据</div>
                </template>
              </el-table-column>
            </el-table>
          </el-collapse-item>
        </el-collapse>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { ElButton, ElIcon, ElMessage } from 'element-plus'
import { Document } from '@element-plus/icons-vue'
import * as XLSX from 'xlsx'
import { SupplierData, FlatClassificationData } from '../types'

// Props
const props = defineProps<{
  supplierData: SupplierData[]
}>()

// 将嵌套数据扁平化为表格数据
const flattenedData = computed<FlatClassificationData[]>(() => {
  const result: FlatClassificationData[] = []

  props.supplierData.forEach((supplier) => {
    supplier.inventories.forEach((inventory) => {
      inventory.specifications.forEach((specification) => {
        // 创建扁平数据记录
        const flatRecord: FlatClassificationData = {
          // 供应商信息
          supplierName: supplier.supplierName,
          supplierTotalQuantity: supplier.quantity,
          supplierTotalAmount: supplier.totalAmount,
          supplierAveragePrice: supplier.averagePrice,

          // 存货信息
          inventoryName: inventory.inventoryName,
          inventoryTotalQuantity: inventory.quantity,
          inventoryTotalAmount: inventory.totalAmount,
          inventoryAveragePrice: inventory.averagePrice,

          // 规格型号信息
          specification: specification.specification,
          specificationQuantity: specification.quantity,
          specificationTotalAmount: specification.totalAmount,
          specificationAveragePrice: specification.averagePrice,

          // 价格走势信息
          priceTrend: specification.priceTrend,
          priceTrendAnalysis: specification.priceTrendAnalysis
        }

        result.push(flatRecord)
      })
    })
  })

  return result
})

// 导出Excel功能
const exportToExcel = () => {
  if (!flattenedData.value.length) {
    ElMessage.warning('没有数据可以导出')
    return
  }

  try {
    // 准备导出数据，包含价格走势对比
    const exportData = flattenedData.value.map((item) => {
      const exportRow: any = {
        供应商名称: item.supplierName,
        供应商总数量: item.supplierTotalQuantity,
        供应商总金额: item.supplierTotalAmount.toFixed(4),
        供应商均价: item.supplierAveragePrice.toFixed(4),
        存货名称: item.inventoryName,
        存货总数量: item.inventoryTotalQuantity,
        存货总金额: item.inventoryTotalAmount.toFixed(4),
        存货均价: item.inventoryAveragePrice.toFixed(4),
        规格型号: item.specification,
        规格数量: item.specificationQuantity,
        规格总金额: item.specificationTotalAmount.toFixed(4),
        规格均价: item.specificationAveragePrice.toFixed(4)
      }

      // 添加价格走势对比数据（最近两年）
      if (item.priceTrendAnalysis && Array.isArray(item.priceTrendAnalysis)) {
        const recentTrends = item.priceTrendAnalysis.slice(-2)
        recentTrends.forEach((trend) => {
          if (trend.year) {
            const yearLabel = `${trend.year}年价格对比`
            if (
              isFinite(trend.startPrice) &&
              isFinite(trend.endPrice) &&
              isFinite(trend.changePercentage)
            ) {
              exportRow[yearLabel] =
                `${trend.startPrice.toFixed(4)}→${trend.endPrice.toFixed(4)}
(±${trend.changeAmount.toFixed(4)}, ${trend.changePercentage.toFixed(2)}%)`
            } else {
              exportRow[yearLabel] = '-'
            }
          }
        })
      }

      return exportRow
    })

    // 创建工作簿和工作表
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)

    // 获取价格对比列的索引
    const headers = Object.keys(ws).filter((key) => key.startsWith('A1:'))
    let priceColumns: number[] = []

    // 遍历列头查找价格对比列
    headers.forEach((header) => {
      const cell = ws[header]
      if (
        cell &&
        cell.v &&
        typeof cell.v === 'string' &&
        cell.v.includes('价格对比')
      ) {
        // 提取列索引（A, B, C...）
        const colIndex = header.match(/[A-Z]+/)?.[0]
        if (colIndex) {
          // 转换为数字索引（A=1, B=2...）
          let numIndex = 0
          for (let i = 0; i < colIndex.length; i++) {
            numIndex = numIndex * 26 + (colIndex.charCodeAt(i) - 64)
          }
          priceColumns.push(numIndex)
        }
      }
    })

    // 为价格对比列添加红绿色样式
    const rows = Object.keys(ws).filter((key) => /^[A-Z]+\d+$/.test(key))
    rows.forEach((rowKey) => {
      // 解析行号
      const rowNum = parseInt(rowKey.match(/\d+/)?.[0] || '0')
      if (rowNum <= 1) return // 跳过表头行

      // 解析列索引
      const colMatch = rowKey.match(/[A-Z]+/)?.[0]
      if (!colMatch) return

      let colIndex = 0
      for (let i = 0; i < colMatch.length; i++) {
        colIndex = colIndex * 26 + (colMatch.charCodeAt(i) - 64)
      }

      // 检查是否为价格对比列
      if (priceColumns.includes(colIndex)) {
        const cell = ws[rowKey]
        if (cell && cell.v && typeof cell.v === 'string') {
          // 解析变化率数据
          const percentageMatch = cell.v.match(/([+-]?\d+\.\d+)%/)
          if (percentageMatch) {
            const changePercentage = parseFloat(percentageMatch[1])

            // 根据变化率设置字体颜色
            if (changePercentage > 0) {
              // 价格上涨，红色字体
              cell.s = {
                font: {
                  color: { rgb: 'FF4D4F' } // 红色
                }
              }
            } else if (changePercentage < 0) {
              // 价格下跌，绿色字体
              cell.s = {
                font: {
                  color: { rgb: '52C41A' } // 绿色
                }
              }
            }
          }
        }
      }
    })

    // 将工作表添加到工作簿
    XLSX.utils.book_append_sheet(wb, ws, '分类统计结果')

    // 导出文件
    XLSX.writeFile(
      wb,
      `采购分类统计结果_${new Date().toISOString().slice(0, 10)}.xlsx`
    )

    ElMessage.success('Excel导出成功')
  } catch (error) {
    console.error('导出Excel失败:', error)
    ElMessage.error('Excel导出失败，请重试')
  }
}

// 添加deactivate方法以支持keep-alive的清理需求
const deactivate = () => {
  // 清理操作，如果有的话
}

// 暴露方法给父组件
defineExpose({
  deactivate
})
</script>

<style scoped>
.classification-result {
  margin-top: 20px;
  height: 800px;
}

.classification-result h3 {
  color: #333;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 15px;
}

.text-red-600 {
  color: #ff4d4f;
}

.text-green-600 {
  color: #52c41a;
}

.text-gray-500 {
  color: #8c8c8c;
}

.transaction-price-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 3px 0;
  font-size: 13px;
}

.transaction-price-item:hover {
  background-color: #f5f7fa;
}

.date-info {
  color: #666;
}

.price-info {
  font-weight: 500;
  color: #333;
}

/* 单价走势对比样式 */
.price-trend-comparison {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px;
}

.year-trend {
  text-align: center;
  padding: 4px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.year-label {
  font-size: 12px;
  font-weight: 500;
  color: #666;
  margin-bottom: 2px;
}

.price-range {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 12px;
  margin: 2px 0;
}

.start-price {
  color: #666;
}

.arrow {
  color: #999;
  font-size: 10px;
}

.end-price {
  font-weight: 500;
}

.price-up {
  color: #ff4d4f;
}

.price-down {
  color: #52c41a;
}

.change-rate {
  font-size: 11px;
  font-weight: 500;
  margin-top: 2px;
}

.rate-up {
  color: #ff4d4f;
}

.rate-down {
  color: #52c41a;
}

:deep(.el-table) {
  margin-bottom: 15px;
  border-radius: 4px;
  overflow: hidden;
}

:deep(.el-table__header-wrapper) {
  background-color: #fafafa;
}

:deep(.el-table th.el-table__cell) {
  font-weight: 600;
  color: #333;
  background-color: #fafafa;
}

:deep(.el-table__body-wrapper) {
  background-color: #fff;
}

:deep(.el-collapse-item__header) {
  font-weight: 600;
  color: #333;
}

:deep(.el-collapse-item__content) {
  padding: 15px 0;
}
</style>
