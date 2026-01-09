<template>
  <div class="table-container mt-2">
    <template v-if="tableData.length > 0">
      <el-auto-resizer>
        <template #default="{ height, width }">
          <AgGridVue
            ref="agGrid"
            :rowData="tableData"
            :columnDefs="columnDefs"
            :style="{ height: height + 'px', width: width + 'px' }"
            class="ag-theme-quartz"
            :defaultColDef="defaultColDef"
            :domLayout="'normal'"
            :pagination="true"
            :paginationPageSize="paginationPageSize"
            :paginationPageSizeSelector="paginationPageSizeSelector"
            :rowModelType="rowModelType"
            :cacheBlockSize="cacheBlockSize"
            :maxBlocksInCache="maxBlocksInCache"
            :suppressPropertyNamesCheck="true"
            :suppressAggFuncInHeader="true"
            :rowBuffer="0"
            @grid-ready="onGridReady"
          />
        </template>
      </el-auto-resizer>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { ElAutoResizer, ElEmpty } from 'element-plus'

// 导入AG Grid相关
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'
import { AgGridVue } from 'ag-grid-vue3'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'

// 注册AG Grid模块
ModuleRegistry.registerModules([AllCommunityModule])

interface Props {
  tableData: Record<string, any>[]
  columnDefs: any[]
  defaultColDef?: any
}

const props = withDefaults(defineProps<Props>(), {
  defaultColDef: () => ({
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
    minWidth: 100
  })
})

// AG Grid配置
const agGrid = ref(null)
const gridApi = ref(null)
const gridColumnApi = ref(null)

// 分页配置
const paginationPageSize = ref(50)
const paginationPageSizeSelector = ref([10, 25, 50, 100])

// 虚拟滚动配置
// 当直接提供rowData时，使用clientSide模式
const rowModelType = ref('clientSide')
// const cacheBlockSize = ref(100)
// const maxBlocksInCache = ref(2)

// 网格准备就绪
const onGridReady = (params: any) => {
  gridApi.value = params.api
  gridColumnApi.value = params.columnApi
}

// 暴露方法给父组件
const scrollToTop = () => {
  if (gridApi.value) {
    gridApi.value.ensureIndexVisible(0)
  }
}

const clearSelection = () => {
  if (gridApi.value) {
    gridApi.value.clearSelection()
  }
}

defineExpose({
  scrollToTop,
  clearSelection,
  gridApi,
  gridColumnApi
})
</script>

<style scoped>
.table-container {
  min-height: 400px;
  max-height: 600px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}
</style>
