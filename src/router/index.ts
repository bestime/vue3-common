
import { PERMISSIONID_SHARE } from '@/utils/constant'
import { createRouter, createWebHashHistory, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routerMode = import.meta.env.VITE_ROUTER_MODE
const baseUrl = import.meta.env.BASE_URL


export const routeList: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'ROUTE_ROOT',
    redirect: {
      name: 'ROUTE_HOME_MAPSCALEPOINTLINECONFIG'
    },
    meta: {
      permissionId: PERMISSIONID_SHARE
    },
  },
  {
    path: '/Home',
    name: 'ROUTE_APP_ROOT',
    meta: {
      permissionId: PERMISSIONID_SHARE
    },
    component: () => import('@/pages/Ready/index.vue'),
    children: [
      {
        path: '/MapScalePointLineConfig',
        name: 'ROUTE_HOME_MAPSCALEPOINTLINECONFIG',
        component: () => import("@/pages/MapScalePointLineConfig/index.vue"),
        meta: {
          permissionId: PERMISSIONID_SHARE
        },
      },
      
    ]
  },
]

function checkRepeatRoutes () {
  const registerNames: string[] = []
  jUtilsBase.forEachTree(routeList, function (item) {
    const name = item.name as string
    if(registerNames.includes(name)) {
      throw `路由名 "${name}" 重复，请更改`;
    } else {
      registerNames.push(name)
    }
  }) 
  const inited = jUtilsBase.treeFilter(routeList, function (item) {
    return item.meta?.permissionId === PERMISSIONID_SHARE
  })
  return inited
}

const router = createRouter({
  strict: true,
  history: routerMode === 'history' ? createWebHistory(baseUrl) : createWebHashHistory(),
  routes: checkRepeatRoutes(),
})

export default router
