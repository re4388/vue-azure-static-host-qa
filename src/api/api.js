import request from './https.js'

export const API = {
  download: (jobId) => {
    let filename = 'search_result.csv'
    let url = '/download/' + jobId
    const pom = document.createElement('a')
    pom.setAttribute('href', './api/' + url)
    pom.setAttribute('download', filename)

    if (document.createEvent) {
      const event = document.createEvent('MouseEvents')
      event.initEvent('click', true, true)
      pom.dispatchEvent(event)
    } else {
      pom.click()
    }
  },
  submit: (data) => request('post', '/inference', data),
  checkStatus: (jobId) => request('get', '/inference/' + jobId),
  kill: (jobId) => request('delete', '/inference/' + jobId)
}
