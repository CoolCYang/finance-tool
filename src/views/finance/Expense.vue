<template>
  <div class="finance-expense">
    <h1>费用报销</h1>
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>费用报销功能</span>
        </div>
      </template>
      <div class="card-content">
        <p>这里是费用报销页面，您可以提交和查看费用报销申请。</p>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
// 费用报销组件逻辑
</script>

<style scoped>
.finance-expense {
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