<template>
  <el-config-provider namespace="ep">
    <div class="flex p-2 h-full box-border">
      <Excel />
    </div>
  </el-config-provider>
</template>
<script lang="ts" setup>
import Excel from './components/Excel.vue'
</script>
<style>
#app {
  height: 100%;
  overflow: hidden;
  background-color: #f5f5f5;
}
</style>
