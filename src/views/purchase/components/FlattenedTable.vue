<template>
  <div class="classification-table flex flex-col mt-4">
    <div class="flex justify-between items-center mb-3">
      <h3 class="text-lg font-bold">聚类统计表格</h3>
      <div class="text-sm text-gray-600">
        共 {{ flattenedData.length }} 条记录
      </div>
    </div>

    <div class="table-action-bar mb-2 flex justify-end gap-2">
      <el-button type="success" @click="exportToExcel">
        <el-icon><Document /></el-icon> 导出Excel
      </el-button>
    </div>

    <div class="table-container flex-1 mt-2">
      <template v-if="flattenedData.length > 0">
        <el-auto-resizer>
          <template #default="{ height, width }">
            <AgGridVue
              ref="agGrid"
              :rowData="flattenedData"
              :columnDefs="columnDefs"
              :style="{ height: height + 'px', width: width + 'px' }"
              class="ag-theme-quartz"
              :defaultColDef="defaultColDef"
              :domLayout="'normal'"
              :pagination="true"
              :paginationPageSize="paginationPageSize"
              :paginationPageSizeSelector="paginationPageSizeSelector"
              :rowModelType="rowModelType"
              :suppressPropertyNamesCheck="true"
              :suppressAggFuncInHeader="true"
              @grid-ready="onGridReady"
            />
          </template>
        </el-auto-resizer>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { ElButton, ElIcon, ElMessage, ElAutoResizer } from 'element-plus'
import { Document } from '@element-plus/icons-vue'
import * as XLSX from 'xlsx'

// 导入AG Grid相关
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'
import { AgGridVue } from 'ag-grid-vue3'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'

// 注册AG Grid模块
ModuleRegistry.registerModules([AllCommunityModule])

interface Props {
  flattenedData: Record<string, any>[]
}

const props = defineProps<Props>()

// AG Grid配置
const agGrid = ref(null)
const gridApi = ref(null)
const gridColumnApi = ref(null)

// 分页配置
const paginationPageSize = ref(50)
const paginationPageSizeSelector = ref([10, 25, 50, 100, 500, 1000])

// 虚拟滚动配置
const rowModelType = ref('clientSide')

// 获取价格趋势分析中的所有年份
const getAllUniqueYears = computed(() => {
  const years = new Set<string>()
  props.flattenedData.forEach((row) => {
    // 只从priceTrendAnalysis中提取年份信息
    if (row.priceTrendAnalysis && Array.isArray(row.priceTrendAnalysis)) {
      row.priceTrendAnalysis.forEach((analysis) => {
        if (analysis.year) {
          years.add(`${analysis.year}年`)
        }
      })
    }
  })
  return Array.from(years).sort() // 按年份排序
})

// 列定义
const columnDefs = computed(() => {
  // 固定列
  const fixedColumns = [
    {
      field: '供应商简称',
      headerName: '供应商简称',
      width: 180,
      pinned: 'left',
      sortable: true,
      filter: true
    },
    {
      field: '存货名称',
      headerName: '存货名称',
      width: 240,
      pinned: 'left',
      sortable: true,
      filter: true
    },
    {
      field: '规格型号',
      headerName: '规格型号',
      width: 200,
      pinned: 'left',
      sortable: true,
      filter: true
    },
    {
      field: '采购数量',
      headerName: '采购数量',
      width: 120,
      align: 'right',
      sortable: true,
      filter: true,
      valueFormatter: (params: any) => {
        return params.value ? params.value.toLocaleString() : ''
      }
    },
    {
      field: '采购总价',
      headerName: '采购总价',
      width: 140,
      align: 'right',
      sortable: true,
      filter: true,
      valueFormatter: (params: any) => {
        return params.value ? params.value.toFixed(4) : '0.0000'
      }
    },
    {
      field: '类别均价',
      headerName: '类别均价',
      width: 120,
      align: 'right',
      sortable: true,
      filter: true,
      valueFormatter: (params: any) => {
        return params.value ? params.value.toFixed(4) : '0.0000'
      }
    }
  ]

  // 年度价格分析列
  const yearColumns = getAllUniqueYears.value.map((year) => {
    // 提取年份数字，用于从priceTrendAnalysis中查找数据
    const yearNum = parseInt(year.replace('年', ''), 10)
    return {
      // 使用动态字段名生成函数，而不是直接映射字段
      field: year,
      headerName: `${year}价格对比`, // 明确列名为"年份价格对比"
      width: 220,
      align: 'right',
      sortable: true,
      filter: true,
      valueGetter: (params: any) => {
        // 从priceTrendAnalysis中提取对应年份的价格趋势数据
        if (
          params.data.priceTrendAnalysis &&
          Array.isArray(params.data.priceTrendAnalysis)
        ) {
          const yearData = params.data.priceTrendAnalysis.find(
            (analysis) => analysis.year === yearNum
          )
          return yearData
            ? {
                startPrice: yearData.startPrice,
                endPrice: yearData.endPrice,
                changeAmount: yearData.changeAmount,
                changePercentage: yearData.changePercentage
              }
            : '-'
        }
        return '-'
      },
      valueFormatter: (params: any) => {
        // 格式化显示价格趋势范围，确保数字格式一致
        if (
          params.value !== '-' &&
          params.value !== undefined &&
          params.value.startPrice !== undefined &&
          params.value.endPrice !== undefined &&
          params.value.changeAmount !== undefined &&
          params.value.changePercentage !== undefined &&
          isFinite(params.value.startPrice) &&
          isFinite(params.value.endPrice) &&
          isFinite(params.value.changeAmount) &&
          isFinite(params.value.changePercentage)
        ) {
          return `${params.value.startPrice.toFixed(4)}~${params.value.endPrice.toFixed(4)}
(±${params.value.changeAmount.toFixed(4)}, ${params.value.changePercentage.toFixed(2)}%)`
        }
        return '-'
      },
      cellStyle: (params: any) => {
        // 根据价格变化率设置字体颜色
        if (
          params.value !== '-' &&
          params.value !== undefined &&
          params.value.changePercentage !== undefined &&
          isFinite(params.value.changePercentage)
        ) {
          if (params.value.changePercentage > 0) {
            // 价格上涨，红色字体
            return { color: '#ff4d4f' }
          } else if (params.value.changePercentage < 0) {
            // 价格下跌，绿色字体
            return { color: '#52c41a' }
          }
        }
        // 默认颜色
        return null
      }
    }
  })

  // 供应商和存货汇总信息列
  const summaryColumns = [
    {
      field: '供应商总数量',
      headerName: '供应商总数量',
      width: 140,
      align: 'right',
      sortable: true,
      filter: true,
      valueFormatter: (params: any) => {
        return params.value ? params.value.toLocaleString() : ''
      }
    },
    {
      field: '供应商总金额',
      headerName: '供应商总金额',
      width: 140,
      align: 'right',
      sortable: true,
      filter: true,
      valueFormatter: (params: any) => {
        return params.value ? params.value.toFixed(4) : '0.0000'
      }
    },
    {
      field: '供应商均价',
      headerName: '供应商均价',
      width: 120,
      align: 'right',
      sortable: true,
      filter: true,
      valueFormatter: (params: any) => {
        return params.value ? params.value.toFixed(4) : '0.0000'
      }
    },
    {
      field: '存货总数量',
      headerName: '存货总数量',
      width: 140,
      align: 'right',
      sortable: true,
      filter: true,
      valueFormatter: (params: any) => {
        return params.value ? params.value.toLocaleString() : ''
      }
    },
    {
      field: '存货总金额',
      headerName: '存货总金额',
      width: 140,
      align: 'right',
      sortable: true,
      filter: true,
      valueFormatter: (params: any) => {
        return params.value ? params.value.toFixed(4) : '0.0000'
      }
    },
    {
      field: '存货均价',
      headerName: '存货均价',
      width: 120,
      align: 'right',
      sortable: true,
      filter: true,
      valueFormatter: (params: any) => {
        return params.value ? params.value.toFixed(4) : '0.0000'
      }
    }
  ]

  // 合并所有列
  return [...fixedColumns, ...yearColumns, ...summaryColumns]
})

// 默认列定义
const defaultColDef = {
  sortable: true,
  filter: true,
  resizable: true,
  flex: 1,
  minWidth: 100
}

// 网格准备就绪
const onGridReady = (params: any) => {
  gridApi.value = params.api
  gridColumnApi.value = params.columnApi
}

// 导出Excel
const exportToExcel = () => {
  if (!props.flattenedData.length) {
    ElMessage.warning('没有数据可以导出')
    return
  }

  try {
    // 准备导出数据，只包含columnDefs中定义的列
    const exportData = props.flattenedData.map((row) => {
      const exportRow = {}
      columnDefs.value.forEach((col) => {
        const headerName = col.headerName
        if (col.valueGetter) {
          // 对于使用valueGetter的列（如年份均价）
          const params = { data: row }
          const value = col.valueGetter(params)
          // 使用valueFormatter格式化值
          let formattedValue = col.valueFormatter
            ? col.valueFormatter({ value })
            : value
          // 替换Excel中的换行符为空格，确保格式正确
          if (typeof formattedValue === 'string') {
            formattedValue = formattedValue.replace(/\n/g, ' ')
          }
          exportRow[headerName] = formattedValue
        } else if (col.field) {
          // 对于直接映射字段的列
          exportRow[headerName] = row[col.field]
        }
      })
      return exportRow
    })

    // 创建工作簿
    const wb = XLSX.utils.book_new()
    // 将数据转换为工作表
    const ws = XLSX.utils.json_to_sheet(exportData)
    // 将工作表添加到工作簿
    XLSX.utils.book_append_sheet(wb, ws, '聚类统计表格')

    // 获取价格对比列的索引
    let priceColumns: number[] = []

    // 遍历所有单元格，查找表头行
    const headers: { [key: string]: any } = {}
    Object.keys(ws).forEach((key) => {
      // 表头通常在第一行（行号1）
      if (/^[A-Z]+1$/.test(key)) {
        const cell = ws[key]
        headers[key] = cell
      }
    })

    // 遍历列头查找价格对比列
    Object.keys(headers).forEach((headerKey) => {
      const cell = headers[headerKey]
      if (
        cell &&
        cell.v &&
        typeof cell.v === 'string' &&
        cell.v.includes('价格对比')
      ) {
        // 提取列索引（A, B, C...）
        const colIndex = headerKey.match(/[A-Z]+/)?.[0]
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

    // 导出文件
    XLSX.writeFile(
      wb,
      `采购分类统计表格_${new Date().toISOString().slice(0, 10)}.xlsx`
    )
    ElMessage.success('Excel导出成功')
  } catch (error) {
    console.error('导出Excel失败:', error)
    ElMessage.error('Excel导出失败，请重试')
  }
}

// 添加deactivate方法以支持keep-alive的清理需求
const deactivate = () => {
  if (gridApi.value) {
    gridApi.value.stopEditing()
    gridApi.value.clearSelection()
    gridApi.value.setFilterModel(null)
    gridApi.value.setSortModel([])
  }
}

// 暴露方法给父组件
defineExpose({
  deactivate,
  gridApi,
  gridColumnApi
})
</script>

<style scoped>
.classification-table {
  min-height: 300px;
}

.table-header-cell {
  background-color: #f5f7fa;
  font-weight: bold;
}

.table-row {
  cursor: pointer;
}

.table-row:hover {
  background-color: #f0f9ff;
}
</style>
