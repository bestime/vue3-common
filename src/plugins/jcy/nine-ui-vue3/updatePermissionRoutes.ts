import { type Router, type RouteRecordRaw } from 'vue-router';
import filterPermissionRoutes from './filterPermissionRoutes';
import { forEachTree, isNull, isString, parseQuery } from '@bestime/utils_base';
import { last } from 'lodash-es';
import getCurrentRouteFullPath from './getCurrentRouteFullPath'

/**
 * 更新路由表，只保留有权限的路由
 * @param router 路由实例
 * @param allRoutes 所有路由配置表
 * @param routeNames 有权限的路由名
 */
export default async function updatePermissionRoutes (router: Router, allRoutes: Array<RouteRecordRaw>, routeNames: string[], redirect?: boolean) {
  redirect = isNull(redirect) ? true : redirect
  
  const newRoutes = filterPermissionRoutes(allRoutes, routeNames)
  const oldRoutes = router.getRoutes()
  
  for(let a =0;a<oldRoutes.length;a++) {
    const na = oldRoutes[a]!.name
    if(isString(na) && !routeNames.includes(na)) {
      router.removeRoute(na)
    }
  }
  
  forEachTree(newRoutes, function (item, parent) {
    if(item.name && !router.hasRoute(item.name)) {
      const lastParent = last(parent)?.name
      if(lastParent) {
        router.addRoute(lastParent, item)
      } else {
        router.addRoute(item)
      }      
    }
  })


  // console.log('redirect', redirect)
  if(redirect) {
    const fromPath = getCurrentRouteFullPath(router)
    if(fromPath) {
      const toRoute = router.getRoutes().find(function (c) {
        return c.path === fromPath
      })
      if(toRoute) {
        const query = parseQuery(window.location.href)
        // console.log("query", query)
        // @ts-ignore
        toRoute.query = query
        await router.replace(toRoute)
      }
    }
  }
}