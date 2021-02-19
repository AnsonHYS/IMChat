/**
 * 获取本地存储数据
 */
export const getItem = name => {
  // return JSON.parse(window.localStorage.getItem(name))
  return window.sessionStorage.getItem(name)
}

/**
 * 添加本地存储数据
 */
export const setItem = (name, data) => {
  window.sessionStorage.setItem(name, data)
  // window.localStorage.setItem(name, JSON.stringify(data))
}

/**
 * 删除本地存储数据
 */
export const removeItem = name => {
  window.sessionStorage.removeItem(name)
}

//  =======================================================搜索
/**
 * 获取本地存储数据
 */
export const getItemHistory = name => {
  return JSON.parse(window.localStorage.getItem(name))
  // return window.localStorage.getItem(name)
}

/**
 * 添加本地存储数据
 */
export const setItemHistory = (name, data) => {
  // window.localStorage.setItem(name, data)
  window.localStorage.setItem(name, JSON.stringify(data))
}

/**
 * 删除本地存储数据
 */
export const removeItemHistory = name => {
  window.localStorage.removeItem(name)
}
