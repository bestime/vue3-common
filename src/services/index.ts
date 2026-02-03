import { removeToken } from "@/utils/tools"
import request, { type IRquestBase } from "../request"

interface IJavaResponse<T = unknown> {
  code: number
  data: T
  message: string
}

interface IJavaData02Resp<T> {
  resultCode: 'SUCCESS' | string
  message: string
  data: T
}

export function apiLoginAccessibleOrganizations(options?: IRquestBase) {
  removeToken()
  return request<string>({
    baseURL: '@host01_api',
    url: '/login/accessible-organizations',
    method: 'POST',
    ...options,
  })
}


export async function apiLoginDoLogin(options?: IRquestBase) {
  return request<
    IJavaResponse<{
      token: string
      user: Record<string, any>
      permissions: Record<string, any>[]
    }>
  >({
    baseURL: '@host01_api',
    url: '/login/do-login',
    method: 'POST',
    ...options,
  })
}

export async function apiThreemeetingArchiveGetThreeMeetingArchiveList(options?: IRquestBase) {
  return request<IJavaData02Resp<Record<string, any>[]>>({
    baseURL: '@host01_api',
    method: 'POST',
    url: '/threemeeting/archive/getThreeMeetingArchiveList',
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  })
}

export async function apiLoginLogout() {
  await request<string>({
    baseURL: '@host01_api',
    url: '/login/logout',
    method: 'POST',
  }).catch(function () {
    removeToken()
  })
}


export async function apiLoginLoginResultData() {
  return request<
    IJavaResponse<{
      token: string
      user: Record<string, any>
      permissions: Record<string, any>[]
    } | undefined>
  >({
    baseURL: '@host01_api',
    method: 'POST',
    url: '/login/login-result-data',
    headers: {
      'Content-Type': 'application/json',
    },
    excludeErrorCodes: ['UN_AUTHENTICATED'],
    responseParse: function (resp) {
      let isSuccess = true
      if (!resp.data) {
        resp.data = {
          message: '登录信息已失效',
          resultCode: 'UN_AUTHENTICATED',
          success: false,
          permissions: [],
        }
        isSuccess = false
      }
      // @ts-ignore
      resp.data = {
        // @ts-ignore
        data: resp.data,
      }

      if (!isSuccess) return resp
      return resp
    },
  })
}