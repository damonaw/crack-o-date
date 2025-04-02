import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: '.',
  publicDir: 'static',
  server: {
    port: 8000
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  resolve: {
    alias: {
      'mathjs': resolve(__dirname, 'node_modules/mathjs/lib/esm/index.js')
    }
  }
}) 