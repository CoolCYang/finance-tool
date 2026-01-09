<template>
  <div class="purchase-order">
    <h1>采购订单</h1>
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>采购订单功能</span>
        </div>
      </template>
      <div class="card-content">
        <p>这里是采购订单页面，您可以查看和管理采购订单信息。</p>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
// 采购订单组件逻辑
</script>

<style scoped>
.purchase-order {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  margin-top: 16px;
}
</style>