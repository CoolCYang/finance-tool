<template>
  <div class="settings">
    <h1>系统设置</h1>
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>系统设置功能</span>
        </div>
      </template>
      <div class="card-content">
        <p>这里是系统设置页面，您可以配置系统的各项参数和选项。</p>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
// 系统设置组件逻辑
</script>

<style scoped>
.settings {
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