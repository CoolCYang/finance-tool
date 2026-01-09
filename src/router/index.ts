import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: () => import('~/views/index.vue')
  },
  // 财务菜单路由
  {
    path: '/finance/budget',
    name: 'budget',
    component: () => import('~/views/finance/Budget.vue')
  },
  {
    path: '/finance/expense',
    name: 'expense',
    component: () => import('~/views/finance/Expense.vue')
  },
  {
    path: '/finance/report',
    name: 'report',
    component: () => import('~/views/finance/Report.vue')
  },
  // 采购菜单路由
  {
    path: '/purchase/requisition',
    name: 'requisition',
    component: () => import('~/views/purchase/Requisition.vue')
  },
  {
    path: '/purchase/order',
    name: 'order',
    component: () => import('~/views/purchase/Order.vue')
  },
  {
    path: '/purchase/inventory',
    name: 'inventory',
    component: () => import('~/views/purchase/Inventory.vue')
  },
  {
    path: '/purchase/report',
    name: 'purchaseReport',
    component: () => import('~/views/purchase/PurchaseReport.vue')
  },
  // 系统设置路由
  {
    path: '/settings',
    name: 'settings',
    component: () => import('~/views/Settings.vue')
  }
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
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
