import { getLanguage } from "@/utils/tools";
import {createI18n} from "vue-i18n";

export type TLocals = 'zh' | 'en'

const defaultLang = getLanguage()

console.log("defaultLang", defaultLang)

/**
 * 全局i18n配置
 * ```
 * 1. 添加global前缀是为了在代码中更好的区分数据来源
 * 2. legacy必须为false
 * 3. 默认缓存了上一次的语言选择
 * ```
 */
const i18n = createI18n({
  locale: defaultLang,
  fallbackLocale: defaultLang,
  legacy: false,
  globalInjection: false,
  messages: {
    zh: {
      global: {
        systemName: '管理后台模板',
        errorMessageNull: '未知消息'
      }
    },
    en: {
      global: {
        systemName: 'Manage Template',
        errorMessageNull: 'no message'
      }
    }
  }
});

export default i18n