<template>
  <div class="purchase-inventory">
    <h1>库存管理</h1>
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>库存管理功能</span>
        </div>
      </template>
      <div class="card-content">
        <p>这里是库存管理页面，您可以查看和管理库存信息。</p>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
// 库存管理组件逻辑
</script>

<style scoped>
.purchase-inventory {
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