import { _Number, checkPhone, isNull, trim } from "@bestime/utils_base";

/**
 * 表单验证：数字。供element-plus 或 element-ui使用
 * @param min 最小值
 * @param max 最大值
 * @param isInt 是否为整数
 * @param canZero 可以为零
 * @returns 验证的回调函数
 * 
 * @example
 * ```
 * const rules = {
 *    tzLiang: {
 *       required: true,
 *       trigger: 'blur',
 *       validator: validateNumberLimit(-10, 40, true, false)
 *     },
 *  }
 * ```
 */
export default function elValidatePhone (typeName: string) {
  return function (rule: any, value: any, callback: any) {
    if (isNull(value) || value === "") {
      if(rule.required) {
        rule.message = `请输入${typeName}`
        callback(rule.message)
      } else {
        callback()
      }      
    } else if (checkPhone(value)) {
      callback()
    } else {
      rule.message = `${typeName}格式不正确`
      callback(rule.message)
    }
  };
}