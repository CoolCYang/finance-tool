<template>
  <el-config-provider namespace="ep">
    <div class="flex p-2 h-full box-border">
      <RouterView v-slot="{ Component }">
        <template v-if="Component">
          <Transition mode="out-in">
            <KeepAlive>
              <Suspense>
                <!-- 主要内容 -->
                <component :is="Component"></component>

                <!-- 加载中状态 -->
                <template #fallback> 正在加载... </template>
              </Suspense>
            </KeepAlive>
          </Transition>
        </template>
      </RouterView>
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
