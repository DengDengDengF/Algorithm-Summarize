![1773971891422.png](https://picui.ogmua.cn/s1/2026/03/20/69bca9637e2b1.webp)

```js
let occupy = {
  bucket: null,
  waiting: null,
  unlock: null
}

async function lock(bucket) {
  if (occupy.bucket === bucket) {
    // 已经是当前 bucket → 执行刷新
    if (!occupy.waiting) {
      occupy.waiting = new Promise(resolve => {
        occupy.unlock = resolve
      })
    }

    try {
      await fetch('/api/assymeRole')
    } finally {
      occupy.unlock()
      occupy.bucket = null
      occupy.waiting = null
    }
  } else {
    // 别的请求 → 等
    if (occupy.waiting) {
      await occupy.waiting
    }
  }
}
```





#### 以上属于过度设计 

```js
//这样设计才简单
import { getTemporaryKeyRequest } from '@/api/upload'
let clientPromise: any = null

export const useClient = (signal?: any) => {
  if (!clientPromise) {
    clientPromise = getTemporaryKeyRequest(signal)
      .then(({ code, data, message }) => {
        if (code !== 0) throw message
        const { credentials, region, endpoint, bucket } = data
        const {
          AccessKeyId: accessKeyId,
          SecretAccessKey: accessKeySecret,
          SessionToken: stsToken
        } = credentials
        return {
          region,
          endpoint,
          accessKeyId,
          accessKeySecret,
          stsToken,
          bucket
        }
      })
      .finally(() => {
        clientPromise = null
      })
  }
  return clientPromise  //让调用useClient的多个函数去等待同一个promise
}

```

