
import { deepFindItem, isArray, treeFilter } from '@bestime/utils_base';
import type { RouteRecordRaw } from 'vue-router';

/**
 * 按路由名对路由表进行筛选，
 * @param data 路由配置表
 * @param routeNames 路由名
 * @returns 过滤后的数组
 */
export default function filterPermissionRoutes (data: Array<RouteRecordRaw>, routeNames: string[]) {
  const newList = treeFilter(data, function (item) {
    let isSafeIn = routeNames.includes(item.name as string)
    if(!isSafeIn && isArray(item.children)) {
      const it = deepFindItem(item.children, function (cd) {
        return routeNames.includes(cd.name as string)
      })
      return !!it
    }
    return isSafeIn
  })
  return newList
}