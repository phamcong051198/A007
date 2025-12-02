import { resolve } from 'path'

import react from '@vitejs/plugin-react'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@/browserWindows': resolve('src/main/browserWindows'),
        '@/utils': resolve('src/main/utils'),
        '@/worker': resolve('src/main/worker'),
        '@config': resolve('src/config'),
        '@db': resolve('src/db'),
        '@shared': resolve('src/shared')
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    assetsInclude: 'src/renderer/assets/**',
    optimizeDeps: {
      exclude: [
        'node_modules/.cache',
        'chunk-MTDYGCFE.js',
        'chunk-KFEKTWHE.js',
        'chunk-T62427UU.js',
        'chunk-EB56G645.js',
        'chunk-CXVDXNMW.js',
        'chunk-NE2IJQC7.js',
        'chunk-3OL7OPAJ.js'
      ]
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@/assets': resolve('src/renderer/src/assets'),
        '@/components': resolve('src/renderer/src/components'),
        '@/hooks': resolve('src/renderer/src/hooks'),
        '@/lib': resolve('src/renderer/src/lib'),
        '@/store': resolve('src/renderer/src/store'),
        '@renderer': resolve('src/renderer/src'),
        '@shared': resolve('src/shared')
      }
    }
  }
})
