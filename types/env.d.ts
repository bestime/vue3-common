/// <reference types="vite/client" />


interface ImportMetaEnv {
  /** vue-rotuer 的 baseUrl */
  readonly VITE_ROUTER_BASE: string
  /** 服务器01在部署地址 */
  readonly VITE_HOST_01_NAME: string

  /** 服务器01在本地开发时的接口前缀 */
  readonly VITE_HOST_01_API: string

  /** APP模式 */
  readonly VITE_APP_RUNMODE: string
  
  /** vue-rotuer 路由模式 */
  readonly VITE_ROUTER_MODE: 'hash' | 'history'  
}