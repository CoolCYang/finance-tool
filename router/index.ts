import { createRouter } from 'vue-router'
import { createWebHistory } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: () => import('~/views/index.vue')
  }
]

export const router = createRouter({
  history: createWebHistory('/finance-tool/'),
  routes: routes,
  strict: true,
  scrollBehavior(to, from, savedPosition) {
    return new Promise((resolve) => {
      if (savedPosition) {
        return savedPosition
      } else {
        if (from.meta.saveSrollTop) {
          const top =
            document.documentElement.scrollTop || document.body.scrollTop
          resolve({ left: 0, top })
        }
      }
    })
  }
})

router.beforeEach((to, from, next) => {
  next()
})

export default router
