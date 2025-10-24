import axios from 'axios'
import ElementUI from 'element-ui'
import { Message } from 'element-ui'

// 创建 axios 实例
const request = axios.create({
  baseURL: process.env.VUE_APP_BASE_API + '/api',
  timeout: 30000
})

// 请求拦截器
request.interceptors.request.use(config => {
  config.headers['Content-Type'] = 'application/json;charset=utf-8'
  const token = localStorage.getItem("token")
  if (token) {
    config.headers['token'] = token
  }
  return config
}, error => {
  return Promise.reject(error)
})

// 响应拦截器
request.interceptors.response.use(
  response => {
    let res = response.data
    if (typeof res === 'string') {
      res = res ? JSON.parse(res) : res
    }
    return res
  },
  error => {
    console.error('response error:', error)
    Message.error('サーバー接続に失敗しました。')
    return Promise.reject(error)
  }
)

export default request
