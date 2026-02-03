import { _Number, isLikeNumber, isNull } from "@bestime/utils_base";

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
export default function elValidateNumberLimit (min?: number| undefined, max?: number | undefined, isInt?: boolean, canZero = true) {
  let range = ''
  if(!isNull(min) && !isNull(max)) {
    range = `且范围为${min}至${max}`
  } else if(!isNull(min)) {
    range = `且最小值为${min}`
  } else if (!isNull(max)) {
    range = `且最大值为${max}`
  }

  const numPrefix = isInt ? '整数' : '数字'

  const errorMessage = `请输入${numPrefix}${range}`

  return function (rule: any, value: any, callback: any) {
    
    if (isNull(value) || value === "") {
      if(rule.required) {
        callback(errorMessage)
      } else {
        callback()
      }      
    } else if (isLikeNumber(value)) {
      const v = _Number(value)
      if(!canZero && !v) {
        callback(errorMessage)
      } else  if(isInt && v % 1){
        callback(errorMessage)
      } else if(isNull(min) && isNull(max)) {
        callback()
      } else if(!isNull(min) && !isNull(max) && (v<min ||v>max))  {
        callback(errorMessage)
      }else if(!isNull(min) && v < min) {
        callback(errorMessage)
      } else if(!isNull(max) && v > max) {
        callback(errorMessage)
      } else {
        callback();
      }
    } else {
      callback(errorMessage)
    }
  };
}
