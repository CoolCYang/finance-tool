<template>
  <div class="purchase-requisition">
    <h1>采购申请</h1>
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>采购申请功能</span>
        </div>
      </template>
      <div class="card-content">
        <p>这里是采购申请页面，您可以提交和管理采购申请。</p>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
// 采购申请组件逻辑
</script>

<style scoped>
.purchase-requisition {
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