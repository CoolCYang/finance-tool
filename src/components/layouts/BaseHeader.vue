<script lang="ts" setup>
  import { toggleDark } from '~/composables'
</script>

<template>
  <div class="w-auto flex justify-between">
    <el-menu class="flex-1 px-2" mode="horizontal">
      <el-menu-item index="1">财务报表</el-menu-item>
    </el-menu>

    <button
      class="border-none bg-transparent cursor-pointer"
      style="height: var(--ep-menu-item-height)"
      @click="toggleDark()"
    >
      <i inline-flex i="dark:ep-moon ep-sunny" />
    </button>
  </div>
</template>
