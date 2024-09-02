<template>
  <div class="w-full flex flex-col p-2 box-border">
    <div
      class="bg-white border-1 p-2 border-solid border-gray-2 shadow-md overflow-hidden"
    >
      <el-form class="flex flex-wrap" label-suffix="：" inline>
        <el-form-item label="设置固定列">
          <el-select
            v-model="fixedColumns"
            placeholder="请选择筛选过滤项"
            style="width: 240px"
            multiple
            collapse-tags
            collapse-tags-tooltip
          >
            <el-option
              v-for="item in columns"
              :key="item"
              :label="item.headerName"
              :value="item.headerName"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="筛选过滤项">
          <el-select
            v-model="filterKey"
            placeholder="请选择筛选过滤项"
            style="width: 240px"
          >
            <el-option
              v-for="item in columns"
              :key="item"
              :label="item.headerName"
              :value="item.headerName"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="筛选过滤关键词">
          <el-input
            style="width: 240px"
            v-model="keyword"
            placeholder="请输入需要筛选的关键词"
          />
        </el-form-item>

        <el-form-item label="表头所在行">
          <el-input-number v-model="headerRowIndex" :min="0" />
        </el-form-item>

        <el-form-item>
          <el-upload
            v-model:file-list="file"
            action=""
            :auto-upload="false"
            :show-file-list="false"
            accept=".xlsx, .xls,.csv"
            :on-change="handleFileUpload"
          >
            <el-button type="primary">上传数据</el-button>
          </el-upload>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="exportExcel">导出Excel</el-button>
        </el-form-item>

        <el-form-item>
          <span class="mr-2" v-for="(item, index) in priceList" :key="index">
            <span>总{{ item.headerName }}：</span>
            <span class="text-green-5">
              {{ getTableDataTotal(item.headerName) }}
            </span>
          </span>
        </el-form-item>
      </el-form>
    </div>

    <el-tabs
      class="bg-white mt-2"
      v-model="activeName"
      closable
      type="card"
      @edit="handleTabsEdit"
    >
      <el-tab-pane
        v-for="(item, index) in fileList"
        :key="index"
        :label="item.fileName"
        :name="item.fileName"
      ></el-tab-pane>
    </el-tabs>

    <div
      class="flex-auto p-4 bg-white border-1 border-solid border-gray-2 border-t-0 shadow-md overflow-hidden"
      style="height: 0"
      v-loading="loading"
    >
      <el-auto-resizer>
        <template #default="{ height, width }">
          <AgGridVue
            v-if="tableData.length"
            :rowData="tableData"
            :columnDefs="columnsData"
            :style="{ height: height + 'px' }"
            class="ag-theme-quartz"
          />
        </template>
      </el-auto-resizer>
    </div>
  </div>
</template>

<script setup lang="tsx">
import { computed, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import Dayjs from 'dayjs'
import { saveAs } from 'file-saver'

import useIndexDB from '../hooks/indexDB.ts'

import type { TabPaneName } from 'element-plus'

import 'ag-grid-community/styles/ag-grid.css' // Mandatory CSS required by the Data Grid
import 'ag-grid-community/styles/ag-theme-quartz.css' // Optional Theme applied to the Data Grid
import { AgGridVue } from 'ag-grid-vue3' // Vu
import { table } from 'console'

const activeName = ref('')
const file = ref([])

const loading = ref<boolean>(false)

const headerRowIndex = ref(4)
const filterKey = ref('')
const keyword = ref('')
const fixedColumns = ref([])

const IndexDB = useIndexDB()
const fileList = computed(() => IndexDB.fileList.value)

const maxWidth = ['备注', '商品名称', '业务描述']

const activeTable = computed(
  () => fileList.value.find((item) => item.fileName === activeName.value) || {}
)

function isString(value) {
  return Object.prototype.toString.call(value) === '[object String]'
}

const getColumnWidth = (headerLabel) => {
  if (!isString(headerLabel)) {
    return 150
  }

  if (headerLabel === '序号') {
    return 50
  } else if (headerLabel.includes('号')) {
    return 200
  } else if (headerLabel.includes('时间')) {
    return 220
  }

  return maxWidth.includes(headerLabel) ? 350 : 150
}

function getHighlightHtml(content, keyword) {
  if (keyword) {
    const target = `<span style='color: red'>${keyword}</span>`
    const replaceStr = content.replace(keyword, target)
    return replaceStr
  } else {
    return content
  }
}

const getCellRender = (params) => {
  const headerLabel = params.column.colId
  const cellData = params.value

  if (!isString(headerLabel)) {
    return cellData
  }

  if (headerLabel.includes('时间')) {
    return Dayjs(cellData).format('YYYY-MM-DD HH:mm:ss') || ''
  } else if (headerLabel.includes('号')) {
    return cellData
  } else {
    if (filterKey.value && filterKey.value === headerLabel && keyword.value) {
      return getHighlightHtml(cellData, keyword.value)
    } else {
      return cellData
    }
  }
}

const getColumnFixed = (headerLabel) => {
  if (fixedColumns.value.includes(headerLabel)) {
    return 'right'
  }
}

const columns = computed(() => {
  const result =
    activeTable.value?.headers?.map((headerLabel, columnIndex) => ({
      field: headerLabel,
      headerName: headerLabel,
      width: getColumnWidth(headerLabel),
      cellRenderer: getCellRender,
      pinned: getColumnFixed(headerLabel) ? 'right' : '' //
    })) || []

  result.unshift({
    headerName: '序号',
    valueGetter: 'node.rowIndex + 1',
    width: 80 // 设置序号列的宽度为100像素
  })

  return result
})
const columnsData = computed(() => columns.value?.map((item) => item) || [])

const tableData = computed(
  () =>
    activeTable.value?.data?.filter((item) =>
      filterKey.value && keyword.value
        ? item[filterKey.value]?.includes(keyword.value)
        : true
    ) || []
)

const priceList = computed(() =>
  columns.value.filter((item) =>
    isString(item?.headerName) ? item.headerName.includes('额') : false
  )
)

const getTableDataTotal = (key) => {
  return tableData.value
    ?.reduce((total, current) => {
      const count = Number(current[key])
      return total + count
    }, 0)
    .toFixed(2)
}

const handleFileUpload = async (file: Event) => {
  readFile(file)
}

const readFile = async (file) => {
  if (!file) {
    ElMessage('亲，请先上传数据哦~')
    return
  }

  loading.value = true

  const raw = file.raw
  const headers = []
  const tableData = []

  if (file.name.endsWith('.csv')) {
    const text = await raw.text()
    const results = Papa.parse(text, { header: true })
    headers.push(...Object.keys(results.data[0]))
    tableData.push(...results.data)
  } else if (file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
    const data = new Uint8Array(await raw.arrayBuffer())
    const workbook = XLSX.read(data, { type: 'array' })

    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

    headers.push(...json[headerRowIndex.value])

    for (let i = headerRowIndex.value + 1; i < json.length; i++) {
      const row = json[i]
      const rowData = {}
      headers.forEach((header, index) => {
        rowData[header] = row[index] || ''
      })
      tableData.push(rowData)
    }
  } else {
    ElMessage('不支持的文件类型')
    loading.value = false
    return
  }

  const result = {
    fileName: file.name,
    headers: headers,
    data: tableData
  }

  await IndexDB.storeData(result)
  IndexDB.fileList.value.push(result)
  activeName.value = file.name
  loading.value = false
}

const handleTabsEdit = async (
  targetName: TabPaneName | undefined,
  action: 'remove' | 'add'
) => {
  if (action == 'remove') {
    await IndexDB.deleteData(targetName)
    await IndexDB.getStoreAll()
    if (activeName.value === targetName) {
      activeName.value = fileList.value.length ? fileList.value[0].fileName : ''
    }
  }
}

const exportExcel = async () => {
  if (!tableData.value.length) {
    ElMessage('没有数据哦，不可以导出')
    return
  }
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Sheet 1')

  // 添加表头
  worksheet.addRow(activeTable.value?.headers)

  // 添加数据
  tableData.value.forEach((row) => {
    worksheet.addRow(Object.values(row))
  })

  // 设置列宽
  worksheet.columns.forEach((column) => {
    column.width = 30
  })

  // 生成Excel文件
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  const fileName =
    filterKey.value && keyword.value
      ? `${filterKey.value}-${keyword.value}-筛选数据`
      : activeName.value
  saveAs(blob, `${fileName}.xlsx`)
}

onMounted(async () => {
  await IndexDB.getStoreAll()
  if (fileList.value.length) {
    activeName.value = fileList.value[0].fileName
  }
})
</script>

<style lang="scss" scoped>
:deep(.el-tabs--card) {
  .el-tabs__header {
    margin-bottom: 0;
  }
}
</style>
