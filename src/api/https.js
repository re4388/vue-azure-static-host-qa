import axios from 'axios'

const errorHandle = (status, msg) => {
}

const userRequest = axios.create({
  baseURL: './api',
  headers: { 'Content-Type': 'application/json' }
})

userRequest.interceptors.request.use((config) => {
  return config
}, (error) => {
  return error
})

userRequest.interceptors.response.use((response) => {
  if (response.data.status) {
    return response.data.data
  } else {
    throw new Error(response.data.status + ' ' + response.data.message)
  }
}, (error) => {
  const { response } = error
  if (response) {
    errorHandle(response.status, response.data.error)
  }
  throw new Error(error)
})

export default function (method, url, data = null) {
  method = method.toLowerCase()
  if (method === 'post') {
    if (data) {
      return userRequest.post(url, data)
    } else {
      return userRequest.post(url)
    }
  } else if (method === 'get') {
    return userRequest.get(url, { params: data })
  } else if (method === 'delete') {
    return userRequest.delete(url, { params: data })
  } else if (method === 'put') {
    return userRequest.put(url, data)
  }
}
