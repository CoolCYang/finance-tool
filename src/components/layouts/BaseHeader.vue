<template>
  <header class="base-header">
    <div class="header-left">
      <h1 class="app-title">财务工具系统</h1>
    </div>
    <div class="header-center">
      <div class="breadcrumb">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-if="currentMenu">{{ currentMenu }}</el-breadcrumb-item>
          <el-breadcrumb-item v-if="currentSubMenu">{{ currentSubMenu }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>
    <div class="header-right">
      <!-- 页面历史记录 -->
      <el-dropdown class="history-dropdown">
        <span class="history-info">
          <el-icon><Clock /></el-icon>
          <span>历史记录</span>
          <el-icon class="el-icon--right"><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item v-if="historyList.length === 0" disabled>暂无历史记录</el-dropdown-item>
            <el-dropdown-item 
              v-for="(item, index) in historyList" 
              :key="index"
              @click="navigateTo(item.path)"
            >
              <div class="history-item">
                <span class="history-title">{{ item.title }}</span>
                <span class="history-time">{{ formatTime(item.timestamp) }}</span>
              </div>
            </el-dropdown-item>
            <el-dropdown-item divided @click="clearHistory">
              <el-icon><Delete /></el-icon>
              <span>清空历史记录</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      
      <!-- 用户信息 -->
      <el-dropdown>
        <span class="user-info">
          <el-icon><User /></el-icon>
          <span>管理员</span>
          <el-icon class="el-icon--right"><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>个人中心</el-dropdown-item>
            <el-dropdown-item>设置</el-dropdown-item>
            <el-dropdown-item divided>退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { User, ArrowDown, Clock, Delete } from "@element-plus/icons-vue";

const route = useRoute();
const router = useRouter();

// 页面历史记录数据结构
interface HistoryItem {
  path: string;
  title: string;
  timestamp: number;
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
  '/settings': '系统设置'
};

// 页面历史记录数组
const historyList = ref<HistoryItem[]>([]);

// 计算当前菜单和子菜单名称
const currentMenu = computed(() => {
  const path = route.path;
  if (path.startsWith('/finance')) return '财务菜单';
  if (path.startsWith('/purchase')) return '采购菜单';
  if (path === '/settings') return '系统设置';
  return '';
});

const currentSubMenu = computed(() => {
  const path = route.path;
  const pathMap: Record<string, string> = {
    '/finance/budget': '预算管理',
    '/finance/expense': '费用报销',
    '/finance/report': '财务报表',
    '/purchase/requisition': '采购申请',
    '/purchase/order': '采购订单',
    '/purchase/inventory': '库存管理',
    '/settings': '系统设置'
  };
  return pathMap[path] || '';
});

// 格式化时间
const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
};

// 添加到历史记录
const addToHistory = () => {
  const path = route.path;
  const title = pageTitles[path] || '未知页面';
  
  // 检查是否已存在相同路径的记录，存在则移除
  const existingIndex = historyList.value.findIndex(item => item.path === path);
  if (existingIndex !== -1) {
    historyList.value.splice(existingIndex, 1);
  }
  
  // 添加到历史记录开头
  historyList.value.unshift({
    path,
    title,
    timestamp: Date.now()
  });
  
  // 限制历史记录数量为 10 条
  if (historyList.value.length > 10) {
    historyList.value = historyList.value.slice(0, 10);
  }
};

// 导航到历史记录
const navigateTo = (path: string) => {
  router.push(path);
};

// 清空历史记录
const clearHistory = () => {
  historyList.value = [];
};

// 监听路由变化，添加到历史记录
watch(
  () => route.path,
  () => {
    addToHistory();
  },
  { immediate: true }
);

// 组件挂载时初始化
onMounted(() => {
  addToHistory();
});
</script>

<style scoped>
.base-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.header-left .app-title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
  margin: 0;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.history-dropdown, .user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.3s;
}

.history-dropdown:hover, .user-info:hover {
  background-color: #f5f7fa;
}

.history-info, .user-info {
  display: flex;
  align-items: center;
}

.history-info .el-icon, .user-info .el-icon {
  margin-right: 4px;
}

.history-info .el-icon--right, .user-info .el-icon--right {
  margin-left: 4px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 200px;
}

.history-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-time {
  font-size: 12px;
  color: #909399;
}
</style>