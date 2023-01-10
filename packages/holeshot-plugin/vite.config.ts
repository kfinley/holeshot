import { defineConfig } from 'vite';
import path from 'path';
import { createVuePlugin } from 'vite-plugin-vue2';

export default defineConfig(
  {
    build: {
      // target: 'es2020',
      chunkSizeWarningLimit: 600,
      cssCodeSplit: false
    },
    // optimizeDeps: {
    //   esbuildOptions: {
    //     target: 'es2020',
    //   }
    // },
    plugins: [
      createVuePlugin(),
    ],
    server: {
      port: 8080
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "src/styles/_variables.scss"; @import "src/styles/_breakpoint.scss";`
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src/')
      },
    },
    define: {
      'process.env': process.env
    }
  });
