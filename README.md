# vue3-antd-admin 后台管理系统通用模板

此项目是一个运营中心的`后台管理系统通用模板`，技术栈为 vue3、TS、element-plus、axios、dayjs、lodash-es、vue-router，集成了以下基础功能
- i18n多语言
- 登录、退出功能
- 权限功能、菜单的过滤
- 网络请求 request

## 各启动命令说明

### 1、npm run dev:jcy
  1. 这是我本地调试时用的环境配置：登录、退出等示例接口对接的是宽屏驾驶舱的测试环境。
  2. 需要自行实现代理：`http://127.0.0.1:5003/PROXY_DASHBOARD` 至 `https://dashboard.chinaenergydata.com/`。至于为什么不在项目本身的vite.config.ts中配置，是因为https代理比较麻烦，所以本地另外起了一个nginx。你也可采用其他方式。

### 2、npm run dev
  这个一般是给后端开发人员使用，已经配置齐全，只需要后端启动接口并修改 `env/.env` 中 `VITE_HOST_01_TARGET = "http://localhost:8885"` 为你对应的端口就行。

### 3、npm run build:test 打包测试环境
### 4、npm run build 打包正式环境

## 路由表配置的说明
  - 以防`路径改变`，所有路由跳转都采用`路由名`（有时候领导会觉得路径名取得不好看）
  - 关于meta以下配置参数说明
    - cache：是否缓存此路由
      - 仅对`ROUTE_APP_MANAGE`的直接子路由生效
      - 所以，路由表建议`平级`不要嵌套（菜单是否嵌套无所谓）
      - 如果开启，则对应`组件名`必须与`路由名相同`，例 `xxx.vue`
        ```vue
          <template></template>
          <script lang="ts" setup>
            defineOptions({
              name: 'ROUTE_HOME'
            })
          </script>        
        ```
    - deprecated： 是否废弃页面，用于临时屏蔽此路由
    - permissionId： 该路由对应的`权限名`，这个名字由运营中心配好了给到我们的
