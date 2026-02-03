
import router, { routeList } from '../router'
import axios, { type AxiosResponse } from 'axios';
import { type AxiosRequestConfig, AxiosError } from 'axios';
import i18n, { type TLocals } from '@/i18n';
import { ElMessage } from 'element-plus';

const { t } = i18n.global;

interface IErrorMessage {
  code: string,
  message: string,
  url: string,
}


const httpWhiteCode = ['ERR_CANCELED', 'ECONNABORTED']
const errorCode: Array<string| number> = [500, 'ILLEGAL_ACCESS']
const routerMode = import.meta.env.VITE_ROUTER_MODE
const localHostPrefix = routerMode ==='hash' ? './' : import.meta.env.VITE_ROUTER_BASE



type TRequestFullOptions = AxiosRequestConfig & {
  baseURL: keyof typeof prefixMap;
  url: string;
  disableErrorAlert?: boolean
  responseParse?: (response: any) => any
  /** 自行处理的错误消息code（不要全局错误提示） */
  excludeErrorCodes?: Array<string | number>
  method?: 'POST' | 'DELETE'
}

/** 不允调用者传入以下参数 */
export type IRquestBase = Omit<TRequestFullOptions, 'url' | 'baseURL' | 'method' | 'cancelToken' | 'env' | 'family' | 'lookup' | 'cancelToken' | 'proxy' | 'httpsAgent' | 'httpAgent' | 'responseParse'>

const prefixMap = {
  '@host01_api': import.meta.env.VITE_HOST_01_NAME + import.meta.env.VITE_HOST_01_API,
  '@local': localHostPrefix.replace(/\/$/, ''),
  '@fullLocal': localHostPrefix.replace(/\/$/, ''),
  '@app_root': import.meta.env.VITE_ROUTER_BASE,
};

console.log("prefixMap", prefixMap)
export interface RequestPagerResult<T> {
  code: number;
  message: string;
  data: {
    pageNum: number;
    pageTotal: number;
    data: T;
  };
}

/**
 * 请求接口的的入口函数。
 * 注：不建议在里面处理loading和弹窗等和业务相关的操作！可以吧不同的事件通过订阅模式通知出去
 * @param options
 * @returns
 */
export default async function request<T>(options: TRequestFullOptions): Promise<AxiosResponse<T>> {  
  return axios<T>({
    baseURL: '',
    timeout: options.timeout ?? 60 * 1000,
    signal: options.signal,
    method: options.method,
    url: serverURL(options.baseURL, options.url),
    data: options.data,
    params: options.params,
    withCredentials: options.withCredentials,
    responseType: options.responseType,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
      ...options.headers
    }
  }).then(function (response: any) {
    if(options.responseParse) {
      response = options.responseParse(response)
    }    
    
    const code = response.data?.data?.resultCode ?? response.data?.resultCode ?? response?.data?.code
    const isHost01Error = response?.data?.data?.success === false || response?.data?.success === false || errorCode.includes(code)    
    
    if(isHost01Error) {
      const message = response.data?.message ?? response.data?.description ?? '服务器未知错误'
      const error: AxiosError = new AxiosError(message, code, response.config, response);
      return Promise.reject(error)
    }

    return response
  }).catch(async function (resp: AxiosError) {
    if(resp?.response?.data) {
      const isBolb = jUtilsBase.getType(resp?.response?.data) === 'Blob'
      if(isBolb) {
        // @ts-ignore
        const yyy = await resp?.response?.data?.text?.()
        resp.response.data = jUtilsBase._KvPair(yyy)
      }
    }
    const data: undefined|Record<string, any> = resp.response?.data as any
    const error:IErrorMessage = {
      code: data?.code ?? resp.code,
      message:data?.message || resp.message || t('global.errorMessageNull'),
      url: resp.config?.url ?? ''
    }
    if(error.code === 'UN_AUTHENTICATED') {
      const login = routeList.find((c: any)=>c.name === 'ROUTE_LOGIN_ROOT')!
      const uPd = router.resolve(login)
      window.location.href =uPd.href
    } else if(!options.disableErrorAlert && !options.excludeErrorCodes?.includes(error.code) && !httpWhiteCode.includes(error.code)) {
      ElMessage.error(error.message)
    }
    return Promise.reject(error);
  })
}

/**
 * 项目中的路径转换统一入口，用于处理不同环境变量下的url地址
 * @param prefix
 * @param path
 * @returns
 */
export function serverURL(prefix: keyof typeof prefixMap, path: string) {
  let pv = prefixMap[prefix]
  if(prefix === '@fullLocal') {
    pv = window.location.origin + import.meta.env.VITE_ROUTER_BASE
  }
  return pv + path;
}

/**
 * 请求前端本地文件数据
 * @param relativePath
 * @returns
 */
export async function requestLocalFile<T>(relativePath: string, query?: Record<string, any>){  
  return request<T>({
    baseURL: '@local',
    url: relativePath,    
    params: query
  })
}