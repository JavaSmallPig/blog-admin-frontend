import request from '@/utils/request'


// 获取文件列表
export function getFileListApi(params: any) {
  return request({
    url: '/file/list',
    method: 'get',
    params
  })
}

// 上传文件
export function uploadApi(data: FormData, type: string = 'image') {
  return request({
    url: '/file/upload',
    method: 'post',
    headers: { "Content-Type": "multipart/form-data" },
    data,
    params: { type: type }
  })
}

// 批量上传文件
export function batchUploadApi(data: FormData, type: string = 'image') {
  return request({
    url: '/file/batch-upload',
    method: 'post',
    headers: { "Content-Type": "multipart/form-data" },
    data,
    params: { type: type }
  })
}

// 删除文件
export function deleteFileApi(url: string) {
  return request({
    url: `/file/delete`,
    method: 'get',
    params: { url:url }
  })
}

// 获取云存储配置
export function getOssConfigApi() {
  return request({
    url: '/file/getOssConfig',
    method: 'get'
  })
}

// 添加云存储配置
export function addOssApi(data: any) {
  return request({
    url: '/file/addOss',
    method: 'post', 
    data
  })
}
// 更新云存储配置
export function updateOssApi(data: any) {
  return request({
    url: '/file/updateOss',
    method: 'put', 
    data
  })
}




