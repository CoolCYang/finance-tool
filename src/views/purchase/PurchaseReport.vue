<template>
  <div class="purchase-report">
    <!-- 文件上传组件 -->
    <file-uploader
      :loading="loading"
      :loading-cache="loadingCache"
      @file-uploaded="handleFileUploaded"
      @file-loaded-from-cache="handleFileLoadedFromCache"
      @status-update="status = $event"
    />

    <!-- 文件Tab切换 -->
    <el-tabs
      v-if="files.length > 0"
      class="files-tabs-container mb-2"
      v-model:active="currentFileIndex"
      @tab-change="handleFileChange"
    >
      <el-tab-pane
        v-for="(file, index) in files"
        :key="index"
        :label="file.fileName"
        :closable="true"
        @tab-remove="handleFileRemove(index)"
      >
      </el-tab-pane>
    </el-tabs>

    <!-- 操作按钮区域 -->
    <div class="action-container mt-2" v-if="currentTableData.length > 0">
      <el-button type="primary" @click="classifyData" :loading="isClassifying">
        数据分类与分析
      </el-button>
      <span v-if="classificationStatus" class="ml-2 text-sm text-gray-600">{{
        classificationStatus
      }}</span>
    </div>

    <!-- 组件切换Tabs -->
    <el-tabs
      v-if="files.length > 0"
      class="component-tabs-container mt-2"
      v-model:active="currentComponentTab"
      @tab-change="handleComponentTabChange"
    >
      <!-- 原始数据Tab -->
      <el-tab-pane label="原始数据" name="raw-data"></el-tab-pane>
      <!-- 聚类统计表格Tab -->
      <el-tab-pane label="聚类统计表格" name="clustering-result"></el-tab-pane>
      <!-- 分类统计结果Tab -->
      <el-tab-pane
        label="分类统计结果"
        name="classification-result"
      ></el-tab-pane>
    </el-tabs>

    <!-- Tab内容区域 -->
    <div class="flex-1">
      <!-- 原始数据Tab -->
      <ag-grid-table
        v-if="currentComponentTab === 'raw-data'"
        :table-data="currentTableData"
        :column-defs="currentColumnDefs"
        :default-col-def="defaultColDef"
      />
      <!-- 聚类统计表格Tab -->
      <flattened-table
        v-else-if="currentComponentTab === 'clustering-result'"
        :flattened-data="flattenedData"
      />
      <!-- 分类统计结果Tab -->
      <classification-result
        v-else-if="currentComponentTab === 'classification-result'"
        :supplier-data="supplierData"
      />
    </div>

    <!-- 底部工作表Tabs -->
    <el-tabs
      v-if="files.length > 0"
      class="bottom-tabs-container mt-2"
      v-model:active="currentSheetTab"
      tab-position="bottom"
      @tab-change="handleSheetTabChange"
    >
      <!-- 工作表Tabs -->
      <el-tab-pane
        v-for="(sheet, index) in getCurrentSheetData()"
        :key="`sheet-${index}`"
        :label="sheet.sheetName"
        :name="`sheet-${index}`"
      >
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElTabs, ElTabPane } from 'element-plus'

import * as XLSX from 'xlsx'

// 导入indexDB hook
import useIndexDB from '~/hooks/indexDB.ts'

// 导入类型定义
import {
  FileData,
  SupplierData,
  SheetData,
  PriceTrend,
  PriceTrendAnalysis
} from './types'

// 导入工具函数
import {
  extractDate,
  getYearFromDate,
  getCellValue,
  toNumber,
  analyzePriceTrend,
  convertToFlattenedData
} from './utils/dataProcessor'

// 导入子组件
import FileUploader from './components/FileUploader.vue'
import ClassificationResult from './components/ClassificationResult.vue'
import FlattenedTable from './components/FlattenedTable.vue'
import AgGridTable from './components/AgGridTable.vue'

// 组件已通过导入自动注册，可以直接在模板中使用

// 加载状态
const loading = ref(false)

// 状态信息
const status = ref('')

// indexDB 相关
const { storeData } = useIndexDB()

// 缓存数据加载状态
const loadingCache = ref(false)

// 多文件支持
const files = ref<FileData[]>([])
const currentFileIndex = ref(0)

// 当前表格数据
const currentTableData = ref<Record<string, any>[]>([])
const currentHeaders = ref<string[]>([])

// 分类数据
const supplierData = ref<SupplierData[]>([])

// 扁平化表格数据
const flattenedData = ref<Record<string, any>[]>([])

// 分类统计状态
const isClassifying = ref(false)
const classificationStatus = ref('')

// 获取当前文件
const getCurrentFile = () => files.value[currentFileIndex.value]

// 获取当前文件的工作表数据
const getCurrentSheetData = () => {
  const file = getCurrentFile()
  return file ? file.sheetData : []
}

// 获取当前选中的工作表索引
const getCurrentSheetIndex = () => {
  const file = getCurrentFile()
  return file ? file.currentSheetIndex : 0
}

// 获取当前工作表
const getCurrentSheet = () => {
  const sheetData = getCurrentSheetData()
  const sheetIndex = getCurrentSheetIndex()
  return sheetData[sheetIndex]
}

// 数据分类处理
const classifyData = async () => {
  if (currentTableData.value.length === 0) {
    ElMessage.warning('没有数据可以分类')
    return
  }

  isClassifying.value = true
  classificationStatus.value = '正在进行数据分类...'

  try {
    // 首先确定关键列的表头
    const supplierHeader =
      currentHeaders.value.find((h) => h.includes('供应商简称')) ||
      currentHeaders.value.find((h) => h.includes('供应商')) ||
      ''
    const inventoryHeader =
      currentHeaders.value.find((h) => h.includes('存货名称')) ||
      currentHeaders.value.find((h) => h.includes('商品名称')) ||
      ''
    const specificationHeader =
      currentHeaders.value.find((h) => h.includes('规格型号')) || ''
    const quantityHeader =
      currentHeaders.value.find((h) => h.includes('数量')) || ''
    const priceHeader =
      currentHeaders.value.find((h) => h.includes('单价')) ||
      currentHeaders.value.find((h) => h.includes('价格')) ||
      ''
    const amountHeader =
      currentHeaders.value.find((h) => h.includes('金额')) ||
      currentHeaders.value.find((h) => h.includes('总价')) ||
      ''
    const dateHeader =
      currentHeaders.value.find((h) => h.includes('日期')) ||
      currentHeaders.value.find((h) => h.includes('时间')) ||
      ''

    if (!supplierHeader || !inventoryHeader) {
      ElMessage.error('无法确定供应商或存货名称的表头，请检查数据格式')
      return
    }

    // 创建供应商映射，用于快速查找和更新
    const supplierMap = new Map<string, SupplierData>()

    // 遍历所有数据行
    for (const row of currentTableData.value) {
      // 提取关键信息
      const supplierName = String(
        getCellValue(row, supplierHeader, '未知供应商')
      ).trim()
      const inventoryName = String(
        getCellValue(row, inventoryHeader, '未知存货')
      ).trim()
      const specification = String(
        getCellValue(row, specificationHeader, '')
      ).trim()
      const quantity = toNumber(getCellValue(row, quantityHeader))
      const price = toNumber(getCellValue(row, priceHeader))
      const amount = toNumber(getCellValue(row, amountHeader))
      const date = extractDate(getCellValue(row, dateHeader, ''))

      // 计算金额（如果没有直接提供）
      const totalAmount = amount > 0 ? amount : quantity * price

      // 获取或创建供应商数据
      let supplier = supplierMap.get(supplierName)
      if (!supplier) {
        supplier = {
          supplierName,
          inventories: [],
          quantity: 0,
          totalAmount: 0,
          averagePrice: 0
        }
        supplierMap.set(supplierName, supplier)
      }

      // 获取或创建存货数据
      let inventory = supplier.inventories.find(
        (inv) => inv.inventoryName === inventoryName
      )
      if (!inventory) {
        inventory = {
          inventoryName,
          specifications: [],
          quantity: 0,
          totalAmount: 0,
          averagePrice: 0,
          rows: []
        }
        supplier.inventories.push(inventory)
      }

      // 获取或创建规格型号数据
      // 规格型号为空时，使用默认值并归类到存货名称
      const specKey = specification || '无规格型号'
      let spec = inventory.specifications.find(
        (s) => s.specification === specKey
      )
      if (!spec) {
        spec = {
          specification: specKey,
          quantity: 0,
          totalAmount: 0,
          averagePrice: 0,
          priceTrend: [],
          priceTrendAnalysis: [],
          rows: []
        }
        inventory.specifications.push(spec)
      }

      // 更新规格型号数据
      spec.quantity += quantity
      spec.totalAmount += totalAmount
      spec.averagePrice =
        spec.quantity > 0 ? spec.totalAmount / spec.quantity : 0
      spec.rows.push(row)

      // 更新价格走势
      const existingTrend = spec.priceTrend.find((t) => t.date === date)
      if (existingTrend) {
        existingTrend.quantity += quantity
        existingTrend.totalAmount += totalAmount
        existingTrend.price = existingTrend.totalAmount / existingTrend.quantity
      } else if (date) {
        spec.priceTrend.push({
          date,
          price: totalAmount / quantity,
          quantity,
          totalAmount
        })
      }

      // 更新存货数据
      inventory.quantity += quantity
      inventory.totalAmount += totalAmount
      inventory.averagePrice =
        inventory.quantity > 0 ? inventory.totalAmount / inventory.quantity : 0
      inventory.rows.push(row)

      // 更新供应商数据
      supplier.quantity += quantity
      supplier.totalAmount += totalAmount
      supplier.averagePrice =
        supplier.quantity > 0 ? supplier.totalAmount / supplier.quantity : 0
    }

    // 将供应商映射转换为数组并排序
    const sortedSuppliers = Array.from(supplierMap.values()).sort((a, b) =>
      a.supplierName.localeCompare(b.supplierName)
    )

    // 对每个供应商的存货进行排序
    sortedSuppliers.forEach((supplier) => {
      supplier.inventories.sort((a, b) =>
        a.inventoryName.localeCompare(b.inventoryName)
      )

      // 对每个存货的规格型号进行排序
      supplier.inventories.forEach((inventory) => {
        inventory.specifications.sort((a, b) =>
          a.specification.localeCompare(b.specification)
        )

        // 对价格走势按日期排序并分析
        inventory.specifications.forEach((spec) => {
          spec.priceTrend.sort((a, b) => a.date.localeCompare(b.date))
          // 分析价格走势，计算年初年终价格变化
          spec.priceTrendAnalysis = analyzePriceTrend(spec.priceTrend)
        })
      })
    })

    // 更新分类数据
    supplierData.value = sortedSuppliers

    // 转换为扁平化表格数据
    flattenedData.value = convertToFlattenedData(sortedSuppliers)

    classificationStatus.value = `分类完成，共找到 ${sortedSuppliers.length} 个供应商`
    ElMessage.success('数据分类完成')
  } catch (error) {
    console.error('数据分类失败:', error)
    ElMessage.error('数据分类失败: ' + (error as Error).message)
  } finally {
    isClassifying.value = false
  }
}

// 默认列配置
const defaultColDef = {
  resizable: true,
  sortable: true,
  filter: true,
  floatingFilter: true,
  tooltipComponentParams: {
    tooltipLocation: 'top',
    tooltipDisabled: false,
    tooltipShowDelay: 500
  },
  // 优化渲染性能
  suppressFieldDotNotation: true,
  suppressTextFormatter: true
}

// 特殊宽度设置
const specialColumnWidths: Record<string, number> = {
  序号: 80,
  备注: 350,
  商品名称: 350,
  业务描述: 350,
  规格型号: 350,
  供应商简称: 350
}

// 获取列宽度
const getColumnWidth = (headerLabel: string): number => {
  // 检查是否有特殊宽度配置
  if (specialColumnWidths[headerLabel]) {
    return specialColumnWidths[headerLabel]
  }

  // 根据列名内容设置宽度
  if (headerLabel.includes('号')) {
    return 200
  } else if (headerLabel.includes('时间') || headerLabel.includes('日期')) {
    return 220
  }

  // 默认宽度
  return 150
}

// 当前列定义
const currentColumnDefs = ref<any[]>([])

// 生成列定义
  const generateColumnDefs = () => {
    // 添加序号列
    const columns: any[] = [
      {
        headerName: '序号',
        valueGetter: 'node.rowIndex + 1',
        width: 80,
        pinned: 'left'
      }
    ]

    // 添加数据列
    currentHeaders.value.forEach((header) => {
      // 检测是否为金额列
      const isAmountColumn = /金额|总价|单价|均价/.test(header)
      
      // 创建列定义
      const columnDef = {
        field: header,
        headerName: header,
        width: getColumnWidth(header),
        // 确保内容正确显示
        cellRenderer: (params: any) => {
          const value = params.value
          if (value === null || value === undefined) return ''
          return String(value)
        }
      }
      
      // 如果是金额列，添加valueFormatter以保留4位小数
      if (isAmountColumn) {
        columnDef.valueFormatter = (params: any) => {
          const value = Number(params.value)
          if (isNaN(value)) return params.value
          return value.toFixed(4)
        }
      }
      
      columns.push(columnDef)
    })

    currentColumnDefs.value = columns
  }

// 组件切换Tab
const currentComponentTab = ref('raw-data')

// 工作表切换Tab
const currentSheetTab = ref('sheet-0')

// 监听组件切换Tab
const handleComponentTabChange = (tabName: string) => {
  currentComponentTab.value = tabName
}

// 监听工作表Tab切换
const handleSheetTabChange = (tabName: string) => {
  currentSheetTab.value = tabName

  // 切换工作表
  const sheetIndex = parseInt(tabName.replace('sheet-', ''), 10)
  handleSheetChange(sheetIndex)
}

// 网格就绪事件

// 按需加载工作表数据
const loadSheetData = async (fileIndex: number, sheetIndex: number) => {
  const file = files.value[fileIndex]
  if (!file) return

  const sheet = file.sheetData[sheetIndex]
  if (!sheet || sheet.isLoaded) return

  try {
    // 读取完整数据
    const rawArrayData = XLSX.utils.sheet_to_json(sheet.worksheet, {
      header: 1, // 使用第一行作为表头
      range: undefined, // 读取所有数据
      defval: '' // 空单元格的默认值
    })

    if (rawArrayData.length <= 1) {
      // 只有表头或空表
      sheet.data = []
    } else {
      // 提取数据行并转换为对象格式
      const dataRows = rawArrayData.slice(1)
      const objectData = dataRows.map((row: any[]) => {
        const rowObj: Record<string, any> = {}
        sheet.headers.forEach((header: string, i: number) => {
          rowObj[header] = row[i] !== undefined ? row[i] : ''
        })
        return rowObj
      })
      sheet.data = objectData
    }

    sheet.isLoaded = true
    sheet.rawData = rawArrayData

    // 如果是当前选中的文件和工作表，更新当前表格数据
    if (
      currentFileIndex.value === fileIndex &&
      file.currentSheetIndex === sheetIndex
    ) {
      currentHeaders.value = sheet.headers
      currentTableData.value = sheet.data
      generateColumnDefs()
    }
  } catch (error) {
    console.error(`加载工作表 ${sheet.sheetName} 数据失败:`, error)
    ElMessage.error(`加载工作表 ${sheet.sheetName} 数据失败`)
  }
}

// 切换工作表
const handleSheetChange = async (index: number) => {
  const file = getCurrentFile()
  if (!file) return

  // 如果是当前工作表，不需要切换
  if (file.currentSheetIndex === index) return

  file.currentSheetIndex = index

  const sheet = file.sheetData[index]
  if (!sheet) return

  // 如果数据未加载，先加载数据
  if (!sheet.isLoaded) {
    await loadSheetData(currentFileIndex.value, index)
  }

  // 只在数据真正变化时才更新
  if (JSON.stringify(currentHeaders.value) !== JSON.stringify(sheet.headers)) {
    currentHeaders.value = [...sheet.headers]
    generateColumnDefs()
  }

  // 使用数组引用替换，避免深度比较
  currentTableData.value = sheet.data
}

// 处理文件上传
const handleFileUploaded = async (uploadFile: any) => {
  if (!uploadFile || !uploadFile.raw) {
    ElMessage.warning('请选择要上传的文件')
    return
  }

  await processFile(uploadFile)
}

// 处理从缓存加载文件
const handleFileLoadedFromCache = async (cachedData: any) => {
  if (!cachedData) {
    ElMessage.warning('缓存文件数据无效')
    return
  }

  // 将缓存数据转换为应用所需的FileData格式
  const newFile: FileData = {
    fileName: cachedData.fileName,
    fileId: cachedData.fileId,
    sheetData: cachedData.sheetData,
    currentSheetIndex: cachedData.currentSheetIndex
  }

  // 添加到文件列表
  files.value.push(newFile)

  // 设置当前选中的文件
  currentFileIndex.value = files.value.length - 1

  // 加载第一个工作表的数据
  if (newFile.sheetData.length > 0) {
    await loadSheetData(currentFileIndex.value, 0)
  }
}

// 切换文件
const handleFileChange = (index: number) => {
  // 确保索引有效
  if (index < 0 || index >= files.value.length) return

  const file = files.value[index]
  if (!file) return

  const sheetIndex = file.currentSheetIndex
  const sheet = file.sheetData[sheetIndex]
  if (!sheet) return

  // 确保数据已加载
  if (!sheet.isLoaded) {
    loadSheetData(index, sheetIndex)
  } else {
    // 更新当前表格数据
    currentHeaders.value = [...sheet.headers]
    currentTableData.value = sheet.data
    generateColumnDefs()
  }
}

// 删除文件
const handleFileRemove = (index: number) => {
  // 确保索引有效
  if (index < 0 || index >= files.value.length) return

  // 删除文件
  files.value.splice(index, 1)

  // 如果删除的是当前文件，重新选择一个文件
  if (
    currentFileIndex.value === index ||
    currentFileIndex.value >= files.value.length
  ) {
    currentFileIndex.value = Math.max(0, files.value.length - 1)

    // 如果还有文件，加载第一个工作表数据
    if (files.value.length > 0) {
      const file = files.value[currentFileIndex.value]
      if (file && file.sheetData.length > 0) {
        const sheetIndex = file.currentSheetIndex
        const sheet = file.sheetData[sheetIndex]
        if (sheet) {
          // 确保数据已加载
          if (!sheet.isLoaded) {
            loadSheetData(currentFileIndex.value, sheetIndex)
          } else {
            // 更新当前表格数据
            currentHeaders.value = [...sheet.headers]
            currentTableData.value = sheet.data
            generateColumnDefs()

            // 数据已通过currentTableData响应式更新
          }
        }
      }
    } else {
      // 没有文件了，清空表格数据
      currentHeaders.value = []
      currentTableData.value = []
      currentColumnDefs.value = []

      // 数据已通过currentTableData响应式清空
    }
  } else if (currentFileIndex.value > index) {
    // 如果删除的文件在当前文件之前，调整当前文件索引
    currentFileIndex.value--
  }
}

// 处理文件内容 - 解析所有工作表数据
const processFile = async (uploadFile: any) => {
  loading.value = true
  status.value = '正在读取文件...'

  try {
    const rawFile = uploadFile.raw

    // 读取文件内容
    const fileContent = await rawFile.arrayBuffer()

    // 解析Excel文件
    const workbook = XLSX.read(fileContent, {
      type: 'array',
      raw: true, // 获取原始数据，不进行格式化
      codepage: 65001, // 支持UTF-8编码
      cellDates: false, // 不自动转换日期
      cellNF: false, // 不使用数字格式
      cellHTML: false // 不生成HTML
    })

    // 创建工作表数据数组
    const sheetDataArray: SheetData[] = []

    // 处理所有工作表
    workbook.SheetNames.forEach((sheetName, sheetIndex) => {
      const worksheet = workbook.Sheets[sheetName]

      // 只读取第一行作为表头
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
      const headersRange = { ...range, eR: range.sR } // 只读取第一行

      // 获取表头数据
      const headers =
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: headersRange,
          defval: ''
        })[0] || []

      // 创建工作表对象，但不加载完整数据
      sheetDataArray.push({
        sheetName,
        headers,
        data: [],
        isLoaded: false,
        worksheet
      })
    })

    // 创建文件数据对象
    const fileId =
      Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const newFile: FileData = {
      fileName: uploadFile.name,
      fileId,
      sheetData: sheetDataArray,
      currentSheetIndex: 0
    }

    // 添加到文件列表
    files.value.push(newFile)

    // 设置当前选中的文件
    currentFileIndex.value = files.value.length - 1

    // 加载第一个工作表的数据
    if (sheetDataArray.length > 0) {
      await loadSheetData(currentFileIndex.value, 0)
    }

    // 更新状态信息
    console.log(`成功读取文件: ${uploadFile.name}`)
    console.log(`工作表数量: ${workbook.SheetNames.length}`)
    console.log(`工作表名称: ${workbook.SheetNames.join(', ')}`)

    // 保存数据到缓存
    try {
      await storeData(newFile)
      await loadCachedFiles() // 更新缓存文件列表
      ElMessage.success(
        `文件读取完成并已缓存，共 ${workbook.SheetNames.length} 个工作表`
      )
    } catch (cacheError) {
      console.error('缓存文件失败:', cacheError)
      ElMessage.success(
        `文件读取完成，但缓存失败，共 ${workbook.SheetNames.length} 个工作表`
      )
    }

    status.value = `已读取 ${uploadFile.name}，共 ${workbook.SheetNames.length} 个工作表`
  } catch (error) {
    console.error('文件处理失败:', error)
    ElMessage.error('读取失败，请检查文件格式是否正确')
    status.value = '文件读取失败: ' + (error as Error).message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.purchase-report {
  padding: 20px;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
}

.upload-container {
  margin-bottom: 20px;
}

.status-info {
  padding: 10px;
  background-color: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 4px;
  color: #1890ff;
  margin-bottom: 10px;
}

.tabs-container {
  margin-bottom: 10px;
}

.files-tabs-container {
  margin-bottom: 10px;
  border-bottom: 1px solid #e8e8e8;
}

.files-tabs-container .el-tabs__nav-wrap::after {
  display: none;
}

.files-tabs-container .el-tabs__tab {
  font-weight: 500;
}

.table-container {
  height: 600px;
}

.action-container {
  margin-bottom: 20px;
}

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
.classification-table {
  height: 800px;
}
/* 调整表格样式 */
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

/* 调整列宽 */
@media (min-width: 1200px) {
  :deep(.el-table .el-table__header-wrapper th:nth-child(1)) {
    width: 200px;
  }

  :deep(.el-table .el-table__header-wrapper th:nth-child(2)),
  :deep(.el-table .el-table__header-wrapper th:nth-child(3)),
  :deep(.el-table .el-table__header-wrapper th:nth-child(4)) {
    width: 120px;
  }

  :deep(.el-table .el-table__header-wrapper th:nth-child(5)),
  :deep(.el-table .el-table__header-wrapper th:nth-child(6)) {
    min-width: 400px;
  }
}

/* 价格走势分析的样式 */
.price-trend-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
}

.price-trend-item:hover {
  background-color: #f5f7fa;
}

.year-info {
  font-weight: 500;
  color: #333;
}

.price-change {
  font-weight: 600;
}

.price-change.up {
  color: #ff4d4f;
}

.price-change.down {
  color: #52c41a;
}

/* 每笔交易单价走势的样式 */
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

.text-gray-500 {
  color: #8c8c8c;
}

.text-gray-600 {
  color: #666;
}

.text-sm {
  font-size: 14px;
}
</style>
