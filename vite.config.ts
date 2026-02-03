import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv, PluginOption } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

function resolveNodePath (relativePath: string) {
  return fileURLToPath(new URL(relativePath, import.meta.url))
}
function vitePluginHtmlTemplate(config: Record<string, any>)  {
  config = config || {}
  let env: any;
  const result: PluginOption = {
    name: 'rollup-plugin-html-template',
    enforce: 'pre',
    configResolved: function (viteConfig: any) {
      env = loadEnv(viteConfig.mode, viteConfig.envDir);
    },
    transformIndexHtml: {
      async handler(html: string, ctx: any) {
        const url = ctx.filename;
        if (!/.html.*$/.test(url)) return html;
        html = html.replace(/({%\s*)(.*?)(\s*%})/g, function (_, prefix, name, suffix) {
          const val = config[name] ?? env[name];
          return val
        });

        return html;
      }
    }
  };
  return result
}

// 变量存放目录
const envDir = 'env'

// https://vite.dev/config/
export default defineConfig(function ({ mode }) {
  const env = loadEnv(mode, resolveNodePath(envDir))

  function getPublicPath () {
    if(env.VITE_ROUTER_MODE === 'hash') {
      return './'
    } else {
      return env.VITE_ROUTER_BASE
    }
  }

  console.log("环境变量", env)
  return {
    server: {
      port: Number(env.VITE_DEV_PORT),
      strictPort: true,
      open: false,
      host: '0.0.0.0',
      proxy: {
        [`${env.VITE_HOST_01_NAME}`]: {
          target: env.VITE_HOST_01_TARGET,
          changeOrigin: true,
          timeout: 0,
          secure: false,
          rewrite: function (path) {
            const reg = new RegExp(`^${env.VITE_HOST_01_NAME}`)
            return path.replace(reg, '')
          },
        },
      },
    },
    envDir,
    base: getPublicPath(),
    plugins: [
      vitePluginHtmlTemplate({
        // 可自行配置其他变量
        VITE_BUILD_TIME: new Date().getTime()
      }),
      vue(),
      vueJsx()
    ],
    css: {
      postcss: {
        plugins: [],
      },
    },
    resolve: {
      alias: {
        '@': resolveNodePath('./src'),
        '@bestime/nine-ui-vue3': resolveNodePath('./src/plugins/jcy/nine-ui-vue3'),
        '@bestime/scroll-bar': resolveNodePath('./src/plugins/jcy/scroll-bar'),
      },
    },
    build: {
      target: 'chrome61',
      cssTarget: 'chrome61',
      assetsDir: 'packed',
      rollupOptions: {
        output: {
          manualChunks: {
            mc_1: [ 'vue' ],
            mc_2: [ 'dayjs', 'axios', 'vue-router' ],
            mc_3: [ 'lodash-es', 'vue-i18n'],
            mc_4: [ 'element-plus'],
          }
        }
      }
    },
  }
})
