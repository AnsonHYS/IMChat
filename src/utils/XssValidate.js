// 通过下面正则表达式验证
export function isSpecialCharacter(s) {
  let regEn = /[`&<>"']/im
  let regCn = /[·！#￥（——）：；“”‘、|《。》？、【】[\]]/im

  if (regEn.test(s)) { //|| regCn.test(s)
    return true;
  } else {
    return false;
  }
}
// 调用方法  判断是否满足条件
export function XSSvalidate(value) {
  if (!value) {
    return '内容为空！'
  } else {
    if (isSpecialCharacter(value)) {
      return '请不要输入&<>"\'特殊符号!'
    } else if (!value.trim().length) {
      return "请不要只输入空格!"
    } else {
      return ''
    }
  }
}
