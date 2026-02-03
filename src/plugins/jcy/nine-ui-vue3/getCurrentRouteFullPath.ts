import type { Router, RouteRecordRaw } from 'vue-router';

/**
 * 通过浏览器地址栏获取当前vue路由fullPath
 * @param router 路由实例
 * @returns 重定向 fromPath（当前浏览器地址栏的地址与vue路由不匹配时，可用此地址重定向）
 */
export default function getCurrentRouteFullPath (router: Router) {
  const base = router.options.history.base
  const isHash = /#$/.test(base)
  let fullPath = ''
  const cPath = router.currentRoute.value.path
  if(isHash) {
    fullPath = window.location.hash.replace(/.*#(.*?)(\?.*)?$/, '$1')
  } else {
    fullPath = window.location.pathname.replace(new RegExp(base), '')
  }
  return cPath === fullPath && fullPath !== '' ? void 0 : fullPath
}