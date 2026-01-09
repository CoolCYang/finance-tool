<template>
  <div>
    <div class="upload-container flex items-center gap-2">
      <el-upload
        v-model:file-list="fileList"
        action=""
        :auto-upload="false"
        accept=".xlsx, .xls,.csv"
        :show-file-list="false"
        :on-change="handleFileUpload"
      >
        <el-button type="primary" :loading="loading"
          >选择并读取Excel文件</el-button
        >
      </el-upload>

      <el-dropdown
        v-if="cachedFileList.length > 0"
        @command="loadFileFromCache"
      >
        <el-button type="primary" plain :loading="loadingCache">
          从缓存加载文件
          <el-icon class="el-icon--right"><arrow-down /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="(file, index) in cachedFileList"
              :key="index"
              :command="file.fileName"
            >
              {{ file.fileName }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <el-button v-else type="primary" plain :loading="loadingCache" disabled>
        暂无缓存文件
      </el-button>
    </div>

    <div class="status-info" v-if="status">
      {{ status }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import useIndexDB from '~/hooks/indexDB.ts'
import { FileData } from '../types'

// Props
const props = defineProps<{
  loading: boolean
  loadingCache: boolean
}>()

// Emits
const emit = defineEmits<{
  'file-uploaded': [file: any]
  'file-loaded-from-cache': [fileName: string]
  'status-update': [status: string]
}>()

// 加载状态
const loading = ref(false)
const loadingCache = ref(false)
const status = ref('')
const fileList = ref([])

// indexDB 相关
const {
  fileList: cachedFileList,
  getStoreAll,
  storeData,
  retrieveData
} = useIndexDB()

// 加载缓存文件列表
const loadCachedFiles = async () => {
  loadingCache.value = true
  try {
    await getStoreAll()
    status.value = `已加载 ${cachedFileList.value.length} 个缓存文件`
    emit('status-update', status.value)
  } catch (error) {
    console.error('加载缓存文件失败:', error)
    ElMessage.error('加载缓存文件失败: ' + (error as Error).message)
  } finally {
    loadingCache.value = false
  }
}

// 从缓存中加载单个文件
const loadFileFromCache = async (fileName: string) => {
  try {
    await retrieveData(fileName)
    const cachedData = cachedFileList.value.find((f) => f.fileName === fileName)
    if (cachedData) {
      // 触发文件从缓存加载事件
      emit('file-loaded-from-cache', cachedData)

      ElMessage.success(`已从缓存加载文件: ${fileName}`)
      status.value = `已加载缓存文件: ${fileName}`
      emit('status-update', status.value)
    }
  } catch (error) {
    console.error('从缓存加载文件失败:', error)
    ElMessage.error('从缓存加载文件失败: ' + (error as Error).message)
  }
}

// 处理文件上传
const handleFileUpload = (uploadFile: any) => {
  emit('status-update', '文件上传触发，等待后续处理...')
  // 这里只触发上传事件，实际文件处理逻辑在父组件中实现
  emit('file-uploaded', uploadFile)
}

// 组件挂载时加载缓存文件列表
onMounted(async () => {
  await loadCachedFiles()
})
</script>

<style scoped>
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
</style>
