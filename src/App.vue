<template>
  <el-config-provider namespace="ep">
    <div class="flex p-2 h-full box-border">
      <RouterView />
    </div>
  </el-config-provider>
</template>

<style>
#app {
  height: 100%;
  overflow: hidden;
  background-color: #f5f5f5;
}
</style>
