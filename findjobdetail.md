

[TOC]

## Echarts做法

```js
options:{
    //查文档得出的一些参数
}
initEcharts(){
      //获取dom对象，dom对象必须有宽高。
      let chartDom=document.getElementById('main');
      //echarts初始化
      let myChart=echarts.init(chartDom);
      //这里可以调接口回显数据 用async await;
      //有了数据后，填入option
      this.option && myChart.setOption(this.option);
}
```

## 防止跨站攻击XSS

```JS
防止跨站脚本攻击（XSS）是前端开发中非常重要的一部分，以下是几种防止 XSS 攻击的常见方法：

1. **输入验证**：对用户输入的数据进行验证和过滤，确保只接受预期格式的数据。可以使用正则表达式来验证输入是否符合预期的格式，例如只允许数字、字母和特定字符等。
    function validateUsername(username) {
        // 定义用户名验证规则：只能由字母、数字、下划线组成，长度在 6 到 12 个字符之间
        const usernamePattern = /^[a-zA-Z0-9_]{6,12}$/;

        // 使用正则表达式进行验证
        if (usernamePattern.test(username)) {
            return true; // 符合规则，验证通过
        } else {
            return false; // 不符合规则，验证失败
        }
    }

2. **转义字符**：在将用户输入的内容展示在页面上之前，对特殊字符进行转义处理。比如将 `<` 替换为 `&lt;`，将 `>` 替换为 `&gt;`，这样可以防止浏览器将输入内容解释为HTML代码。
    <template>
      <div>
        <!-- 使用v-html指令插入经过转义处理的用户输入内容 -->
        <div v-html="escapedUserInput"></div>
      </div>
    </template>

    <script>
    export default {
      data() {
        return {
          userInput: "<script>alert('XSS攻击！');</script>"
        };
      },
      computed: {
        // 计算属性用于返回经过转义处理后的用户输入内容
        escapedUserInput() {
          // 使用replace()方法将特殊字符替换为对应的HTML实体
          return this.userInput.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }
      }
    };
    </script>

3. **内容安全策略（CSP）**：使用内容安全策略来限制页面可以加载和执行的资源，包括脚本、样式表、图片等。CSP 可以防止插入恶意脚本和执行未经授权的行为。
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' https://cdnjs.cloudflare.com; style-src 'self' https://maxcdn.bootstrapcdn.com; img-src 'self' data:;">

4. **HTTP Only Cookie**：在设置 Cookie 时，使用 HTTP Only 属性来限制 Cookie 只能通过 HTTP 请求发送，防止恶意脚本通过 document.cookie 来访问和窃取 Cookie。
  Set-Cookie: sessionId=abc123; HttpOnly

5. **X-XSS-Protection 头部**：在 HTTP 响应中设置 X-XSS-Protection 头部，启用浏览器的内置 XSS 过滤器，可以防止一些简单的 XSS 攻击。
response:{
    X-XSS-Protection: 1; mode=block
}
1; mode=block：启用XSS过滤器，并且在检测到XSS攻击时强制浏览器阻止页面加载

6. **使用安全框架和库**：使用一些成熟的安全框架和库来处理用户输入和输出，这些框架和库通常已经实现了一些常见的安全防护措施，能够有效地防止 XSS 攻击。

通过采取这些防范措施，可以有效地减少前端应用程序受到 XSS 攻击的风险。
```

## 跨站请求伪造CSRF

```JS
CSRF Token 是一种防范跨站请求伪造（Cross-Site Request Forgery，CSRF）攻击的安全机制。在CSRF攻击中，攻击者通过诱使用户在登录状态下访问恶意网站，从而在用户不知情的情况下执行某些操作（如发送请求）来攻击受害者。

前端通常可以通过以下方式来解决CSRF（跨站请求伪造）：

1. **同源策略**：浏览器的同源策略限制了来自不同源（域、协议、端口）的页面之间的交互，从而减少了CSRF攻击的风险。

2. **CSRF Token**：在发起请求时，前端可以生成一个随机的CSRF令牌，并将其包含在请求中。服务器在接收到请求时会验证该令牌的有效性，如果验证失败，则拒绝该请求。

3. **Cookie设置**：设置Cookie为HttpOnly和Secure，这样可以防止CSRF攻击者通过JavaScript读取和篡改Cookie。
  res.cookie('sessionId', 'abc123', {
    httpOnly: true, // 设置为HttpOnly
    secure: true // 设置为Secure
  });
```

## webpack	

```js
图片优化：url-loader:适合小图片,阈值以下，转base64,减少请求次数
        image-webpack-loader:压缩超过limit阈值的大图片
        结合使用
按需引入：elmentui按需引入，部分组件      
提取公共代码：splitChunksPlugin,拆分规则：{
             1.块被多处引用或者来自 node_modules 目录
             2.块压缩前的大小
             3.按需加载的块并行请求数
             4.初始化加载的块并行请求数
             等参数
            }
启用HTTP2:确保服务器支持http2，vue.js配置文件切换到https连接
启用gzip:compression-webpack-plugin,Vue打包过程就压缩好，就可以缓解一些服务器CPU的压力，压缩成.gz格式，可以设置阈值。

react suspense + lazy异步组件，减少首页白屏：
还能通过suspense嵌套加载多个异步组件
import React, { lazy, Suspense } from 'react';

const LazyComponent = lazy(() => import('./LazyComponent'));

function App() {
  return (
    <div>
      //fallback定义加载中的组件，onRenderCallback指定一个回调函数，在组件渲染完成后会被调用。在回调函数中，我们可以执行一些预加载的操作，从而提高页面的加载速度。18版本没有
      <Suspense onRenderCallback={() => console.log('Rendered!')  fallback={<div>Loading...</div>}> ，
           <LazyComponent />//加载完成后渲染
      </Suspense>
    </div>
  );
}

export default App;

```

## vite 和 webpack区别

```
webpack，在开发环境，需要在内存中储存所有的模块，
vite，在开发环境，利用现代浏览器功能，进行实时编译和打包，减少打包冗余操作，提高打包速度。
vite 在生产环境下，也可以利用浏览器缓存机制，减少对静态资源的请求，提高页面加载速度。

```

### spa首屏速度慢

```js
1.路由懒加载  
routes:[ 
    path: 'Blogs',
    name: 'ShowBlogs',
    component: () => import('./components/ShowBlogs.vue')
]
2.合理利用localstorage
3.ui框架按需加载
4.A.js文件被多个路由使用，造成了重复下载
  在webpack的config文件中，修改CommonsChunkPlugin的配置
  {
      minChunks: 3
  }
   minChunks为3表示会把使用3次及以上的包抽离出来，放进公共依赖文件，避免了重复加载组件
5.图片压缩，
  雪碧图，减少http请求
  url-loader:设置一个阈值，小于阈值的图片转base64
  image-webpack-loader:超过这个阈值的图片，进行压缩
6.开启gzip压缩，
  compression-webpack-plugin：,Vue打包过程就压缩好，就可以缓解一些服务器CPU的压力，压缩成.gz格式，可以设置阈值。
7.使用ssr,服务端渲染，使用Nuxt.js实现服务端渲染。
```

