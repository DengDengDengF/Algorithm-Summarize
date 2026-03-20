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

