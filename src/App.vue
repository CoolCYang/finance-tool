<template>
  <el-config-provider namespace="ep" :theme="themeConfig">
    <div class="app-container h-full">
      <!-- 顶部栏 -->
      <BaseHeader />

      <div class="main-container">
        <!-- 侧边导航菜单 -->
        <aside class="sidebar">
          <BaseSide />
        </aside>
        <!-- 右侧主内容区域 -->
        <div class="right-content">
          <!-- Tab栏 -->
          <div class="tab-container">
            <el-tabs
              v-model:active-name="activeTab"
              type="card"
              closable
              @tab-remove="handleTabRemove"
              @tab-click="handleTabClick"
              class="app-tabs"
            >
              <el-tab-pane
                v-for="tab in tabs"
                :key="tab.path"
                :label="tab.title"
                :name="tab.path"
              ></el-tab-pane>
            </el-tabs>
          </div>
          <!-- 路由页面内容 -->
          <main class="main-content">
            <keep-alive>
              <router-view v-slot="{ Component }">
                <component :is="Component" />
              </router-view>
            </keep-alive>
          </main>
        </div>
      </div>
    </div>
  </el-config-provider>
</template>
<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseSide from './components/layouts/BaseSide.vue'
import BaseHeader from './components/layouts/BaseHeader.vue'
import type { TabPaneName } from 'element-plus/es/components/tabs/src/tab-pane'

const route = useRoute()
const router = useRouter()

// 主题配置 - 确定系统色系
const themeConfig = {
  token: {
    // 主色系 - 蓝色系，专业、可信赖
    colorPrimary: '#1890ff',
    // 辅助色
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#f5222d',
    colorInfo: '#1890ff',
    // 中性色
    colorTextBase: '#262626',
    colorTextSecondary: '#595959',
    colorTextTertiary: '#8c8c8c',
    colorTextQuaternary: '#bfbfbf',
    // 背景色
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBgLayout: '#f0f2f5',
    // 边框色
    colorBorder: '#e8e8e8',
    colorBorderSecondary: '#f0f0f0',
    // 阴影
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    boxShadowSecondary: '0 4px 16px rgba(0, 0, 0, 0.1)'
  }
}

// 页面标题映射
const pageTitles: Record<string, string> = {
  '/': '首页',
  '/finance/budget': '预算管理',
  '/finance/expense': '费用报销',
  '/finance/report': '财务报表',
  '/purchase/requisition': '采购申请',
  '/purchase/order': '采购订单',
  '/purchase/inventory': '库存管理',
  '/purchase/report': '采购报表',
  '/settings': '系统设置'
}

// Tab数据结构
interface TabItem {
  path: string
  title: string
}

// Tab列表
const tabs = ref<TabItem[]>([])

// 当前激活的Tab
const activeTab = ref('')

// 添加Tab
const addTab = (path: string) => {
  const title = pageTitles[path] || '未知页面'

  // 检查Tab是否已存在
  const existingTab = tabs.value.find((tab) => tab.path === path)
  if (!existingTab) {
    tabs.value.push({
      path,
      title
    })
  }

  // 激活当前Tab
  activeTab.value = path
}

// 处理Tab关闭
const handleTabRemove = (path: TabPaneName) => {
  const index = tabs.value.findIndex((tab) => tab.path === path)
  if (index === -1) return

  tabs.value.splice(index, 1)

  // 如果关闭的是当前激活的Tab，则激活上一个Tab
  if (activeTab.value === String(path) && tabs.value.length > 0) {
    const newActiveIndex = index > 0 ? index - 1 : 0
    activeTab.value = tabs.value[newActiveIndex].path
    router.push(tabs.value[newActiveIndex].path)
  }
  // 如果关闭后没有Tab，则跳转到首页
  else if (tabs.value.length === 0) {
    router.push('/')
    activeTab.value = ''
  }
}

// 处理Tab点击
const handleTabClick = (tab: any) => {
  router.push(tab.paneName)
}

// 监听路由变化，添加Tab
watch(
  () => route.path,
  (newPath) => {
    addTab(newPath)
  },
  { immediate: true }
)

// 组件挂载时初始化
onMounted(() => {
  addTab(route.path)
})
</script>
<style lang="scss">
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  height: 100%;
  overflow: hidden;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue',
    Arial, sans-serif;
  background-color: #f0f2f5;
}

/* 主容器布局 */
.app-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background-color: #f0f2f5;
}

/* 主内容区域布局 */
.main-container {
  display: flex;
  flex: 1;
  height: calc(100% - 60px);
  overflow: hidden;
  background-color: #f0f2f5;
}

/* 侧边栏样式 */
.sidebar {
  width: 200px;
  background-color: #ffffff;
  border-right: 1px solid #e8e8e8;
  height: 100%;
  overflow: auto;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.sidebar:hover {
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.08);
}

/* 右侧内容区域 - 包含Tab栏和主页面内容 */
.right-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background-color: #f0f2f5;
}

/* Tab栏容器 */
.tab-container {
  .ep-tabs {
    background-color: #ffffff;

    .ep-tabs__header {
      margin: 0;
    }
  }
}

/* Tab栏样式 */
.app-tabs {
  height: 100%;
}

.app-tabs :deep(.el-tabs__header) {
  margin: 0;
  height: 48px;
  line-height: 48px;
  background-color: #ffffff;
  border-bottom: 1px solid #e8e8e8;
}

.app-tabs :deep(.el-tabs__nav-wrap) {
  height: 48px;
  line-height: 48px;
  background-color: #ffffff;
}

.app-tabs :deep(.el-tab-pane) {
  height: 100%;
}

/* 激活的Tab样式 */
.app-tabs :deep(.el-tabs__item.is-active) {
  color: #1890ff;
  font-weight: 500;
}

.app-tabs :deep(.el-tabs__active-bar) {
  background-color: #1890ff;
}

/* Tab关闭按钮样式 */
.app-tabs :deep(.el-icon-close) {
  color: #8c8c8c;
  font-size: 12px;
  transition: color 0.3s;
}

.app-tabs :deep(.el-icon-close:hover) {
  color: #595959;
}

/* 主页面内容区域 */
.main-content {
  flex: 1;
  padding: 24px;
  overflow: auto;
  background-color: #f0f2f5;
  height: calc(100% - 48px);
}

/* 滚动条样式优化 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 页面过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
