<template>
  <el-menu
    :default-active="activeMenu"
    class="el-menu-vertical-demo"
    :collapse="isCollapse"
    @open="handleOpen"
    @close="handleClose"
    router
  >
    <!-- 首页 -->
    <el-menu-item index="/">
      <el-icon><HomeFilled /></el-icon>
      <template #title>首页</template>
    </el-menu-item>

    <!-- 财务菜单 -->
    <el-sub-menu index="finance">
      <template #title>
        <el-icon><Money /></el-icon>
        <span>财务菜单</span>
      </template>
      <el-menu-item index="/finance/budget">预算管理</el-menu-item>
      <el-menu-item index="/finance/expense">费用报销</el-menu-item>
      <el-menu-item index="/finance/report">财务报表</el-menu-item>
    </el-sub-menu>

    <!-- 采购菜单 -->
    <el-sub-menu index="purchase">
      <template #title>
        <el-icon><ShoppingCart /></el-icon>
        <span>采购菜单</span>
      </template>
      <el-menu-item index="/purchase/requisition">采购申请</el-menu-item>
      <el-menu-item index="/purchase/order">采购订单</el-menu-item>
      <el-menu-item index="/purchase/inventory">库存管理</el-menu-item>
      <el-menu-item index="/purchase/report">采购报表</el-menu-item>
    </el-sub-menu>

    <!-- 系统设置 -->
    <el-menu-item index="/settings">
      <el-icon><Setting /></el-icon>
      <template #title>系统设置</template>
    </el-menu-item>
  </el-menu>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  HomeFilled,
  Money,
  ShoppingCart,
  Setting
} from '@element-plus/icons-vue'

const isCollapse = ref(false)
const route = useRoute()

// 计算当前激活的菜单
const activeMenu = computed(() => {
  const path = route.path
  if (path.startsWith('/finance')) return 'finance'
  if (path.startsWith('/purchase')) return 'purchase'
  return path
})

const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}

const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
</script>
