<template>
  <div class="finance-budget">
    <h1>预算管理</h1>
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>预算管理功能</span>
        </div>
      </template>
      <div class="card-content">
        <p>这里是预算管理页面，您可以查看和管理公司的预算信息。</p>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
// 预算管理组件逻辑
</script>

<style scoped>
.finance-budget {
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