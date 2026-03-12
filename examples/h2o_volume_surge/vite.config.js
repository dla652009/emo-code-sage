import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import AutoImport from 'unplugin-auto-import/vite';
// import {createStyleImportPlugin,AndDesignVueResolve} from 'vite-plugin-style-import';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
import WindiCSS from 'vite-plugin-windicss';
import { fileURLToPath } from 'url';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3005
  },
  // envDir: path.resolve(__dirname, 'env'),
  envDir: fileURLToPath(new URL('./env', import.meta.url)),
  base: './',
  resolve: {
    alias: {
      // '@': path.resolve(__dirname, 'src'),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // Polyfill Node's stream for browser bundling (fix lib-storage chunker import)
      'stream': 'stream-browserify'
    }
  },
  plugins: [
    vue(),
    WindiCSS(),
    AutoImport({
      imports: ['vue', 'vue-router', 'vuex'],
      dts: 'src/types/import/auto-imports.d.ts',
      resolvers: [AntDesignVueResolver()]
    }),
    Components({
      resolvers: [AntDesignVueResolver({ importStyle: false })],
      dts: false
    })
    /* createStyleImportPlugin({
      resolves: [
        AndDesignVueResolve(),
      ],
      libs: [
        {
          libraryName: 'ant-design-vue',
          esModule: true,
          resolveStyle: (name) => {
            return `ant-design-vue/es/${name}/style/index`
          }
        }
      ]
    }) */
  ],
  css: {
    // preprocessorOptions: {
    //   scss: {
    //     additionalData: `@import "@/scss/variables.scss";`
    //   }
    // }
  }
});
