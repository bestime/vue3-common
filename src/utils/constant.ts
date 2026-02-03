/** 服务端设置token的键 */
export const TOKEN_KEY = 'Token'

/** 缓存当前i18n选择的语言 */
export const LANGUAGE_KEY = 'Language'

/** 是否开发模式 */
export const IS_DEV = import.meta.env.VITE_APP_RUNMODE === '测试版'

/** 路由权限：开发中-打包正式环境会自动隐藏，不必说动改代码 */
export const PERMISSID_DEV = 'PERKEY_TEST'

/** 路由权限：公共页面 */
export const PERMISSIONID_SHARE = 'PERKEY_SHARE'