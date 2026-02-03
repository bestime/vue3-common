import { _Number, isLikeNumber, isNull, trim } from "@bestime/utils_base";

export default function elValidateEmail (typeName: string) {
  return function (rule: any, value: any, callback: any) {
    if (isNull(value) || value === "") {
      if(rule.required) {
        console.log(22)
        rule.message = `请输入${typeName}`
        callback(rule.message)
      } else {
        callback()
      }      
    } else if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trim(value))) {
      callback()
    } else {
      rule.message = `${typeName}格式不正确`
      callback(rule.message)
    }
  };
}