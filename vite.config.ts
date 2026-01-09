import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

import UnoCSS from '@unocss/vite'
import { presetUno } from '@unocss/preset-uno'
import { presetAttributify } from '@unocss/preset-attributify'
import { presetIcons } from '@unocss/preset-icons'
import { transformerDirectives } from '@unocss/transformer-directives'
import { transformerVariantGroup } from '@unocss/transformer-variant-group'

const pathSrc = path.resolve(__dirname, 'src')

// https://vitejs.dev/config/
export default defineConfig({
  base: '/finance-tool/',
  resolve: {
    alias: {
      '~/': `${pathSrc}/`
    }
  },

  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "~/styles/element/index.scss" as *;`
      }
    }
  },
  plugins: [
    vue(),
    vueJsx(),
    Components({
      // allow auto load markdown components under `./src/components/`
      extensions: ['vue', 'md'],
      // allow auto import and register components used in markdown
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
      resolvers: [
        ElementPlusResolver({
          importStyle: 'sass'
        })
      ],
      dts: 'src/components.d.ts'
    }),

    // https://github.com/unocss/unocss
    UnoCSS({
      presets: [
        presetUno(),
        presetIcons({
          scale: 1.2,
          warn: true
        })
      ]
    })
  ]
})
