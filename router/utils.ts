import { RouteRecordRaw } from 'vue-router'

// 通过path获取父级
export function getParentRoutesByPath(path: string, routes: RouteRecordRaw[]) {
  // 深度遍历查找
  function dfs(
    routes: RouteRecordRaw[],
    path: string,
    parents: RouteRecordRaw[]
  ) {
    for (let i = 0; i < routes.length; i++) {
      const item = routes[i]
      // 找到path则返回父级path
      if (item.path === path) return parents
      // children不存在或为空则不递归
      if (!item.children || !item.children.length) continue
      // 往下查找时将当前path入栈
      parents.push(item)

      if (dfs(item.children, path, parents).length) return parents
      // 深度遍历查找未找到时当前path 出栈
      parents.pop()
    }

    // 未找到时返回空数组
    return []
  }

  return dfs(routes, path, [])
}

// 查找对应path的路由信息
export function findRouteByPath(path: string, routes: RouteRecordRaw[]) {
  let res = routes.find((item: { path: string }) => item.path == path)
  if (res) {
    return res
  } else {
    for (let i = 0; i < routes.length; i++) {
      if (
        routes[i].children instanceof Array &&
        routes[i].children.length > 0
      ) {
        res = findRouteByPath(path, routes[i].children)
        if (res) {
          return res
        }
      }
    }
    return null
  }
}
