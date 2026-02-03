import { deepFindTreePath, isArray } from '@bestime/utils_base'

export { default as JyButton } from './JyButton/index.vue'
export { default as filterPermissionRoutes } from './filterPermissionRoutes'
export { default as updatePermissionRoutes } from './updatePermissionRoutes'
export { default as getCurrentRouteFullPath } from './getCurrentRouteFullPath'
export { default as elValidateNumberLimit } from './elValidateNumberLimit'
export { default as elValidatePhone } from './elValidatePhone'
export { default as elValidateEmail } from './elValidateEmail'
export { default as NineSizeBox } from './NineSizeBox/index.vue'
export { default as NineHeroWidget } from './NineHeroWidget/index.vue'


export interface IMenuItem {
  /** 菜单的路由名称 */
  routeName: string,
  /** 菜单显示名称 */
  label: string,
  /** 不显示在菜单中的子页面 */
  hidden?: boolean
  children?: IMenuItem[],

  /** 权限ID（与后端约定） */
  permissionId?: string
}

/**
 * 查找当前高亮的ID，以最后一级为准
 * @param menuList 
 * @param currentRouteName 
 * @returns 
 */
export function getActiveMenuId (menuList: IMenuItem[], currentRouteName: string) {
  const path = getActiveMenuPath(menuList, currentRouteName)
  let currentMenuId: string | undefined

  if(path) {
    for(let index = path.length-1; index>=0; index--) {
      if(!path[index].hidden) {
        currentMenuId = path[index].routeName
        break;
      }
    }
  }
  return currentMenuId
}

export function getActiveMenuPath (menuList: IMenuItem[], currentRouteName: string) {
  return deepFindTreePath(menuList, function (item) {
    return currentRouteName === item.routeName
  }, {
    id: 'routeName',
    children: 'children'
  })
}


export function isActiveMenu (menuList: IMenuItem[], currentRouteName: string, muenId: string) {
  const path: IMenuItem[] = getActiveMenuPath(menuList, currentRouteName) ?? []
  if(isArray(path) && path.length) {
    return path.some(function (item) {
      return item.routeName === muenId
    })
  }
  return false
}

/**
 * 是否显示子菜单（过滤掉hidden项后，如果children不为0，则表示有）
 * @param item 
 * @returns 
 */
export function hasMenuChildren (item: IMenuItem) {
  return isArray(item.children) && item.children.filter(function (c) {
    return !c.hidden
  }).length > 0
}