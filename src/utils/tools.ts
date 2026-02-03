import type { TLocals } from "@/i18n";
import { LANGUAGE_KEY, TOKEN_KEY } from "./constant";

/**
 * 移除当前账户token 
 * @returns 
 */
export function removeToken () {
  jUtilsBrowser.removeCookie(TOKEN_KEY)
}

/**
 * 等待函数
 * @param millisecond 
 * @returns 
 */
export async function sleep (millisecond: number) {
  return new Promise(function (resolve) {
    setTimeout(resolve, millisecond)
  })
}

/**
 * 缓存当前使用的语言
 * @returns 
 */
export function setLanguage (name: string) {
  jUtilsBrowser.setStorage(LANGUAGE_KEY, name)
}

/**
 * 获取上次使用的语言
 * @returns 
 */
export function getLanguage() {
  const locale = (jUtilsBrowser.getStorage(LANGUAGE_KEY) || 'zh') as TLocals
  document.querySelector('html')?.setAttribute('lang', locale);  
  return locale
}