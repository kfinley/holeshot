import { defineConfig } from 'vite';
import path from 'path';
import { createVuePlugin } from 'vite-plugin-vue2';
import md2Vue2Plugin from 'vite-plugin-md2vue2';
import emoji from 'markdown-it-emoji';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  build: {
    // target: 'es2020',
    chunkSizeWarningLimit: 600,
    cssCodeSplit: false,
  },
  // optimizeDeps: {
  //   esbuildOptions: {
  //     target: 'es2020',
  //   }
  // },
  plugins: [
    md2Vue2Plugin({
      // https://markdown-it.docschina.org/
      markdownItOptions: {
        linkify: true,
        typographer: true,
      },
      markdownItPlugins: [emoji],
    }),
    VitePWA({
      // mode: 'development', // process.env.NODE_ENV,
      // base: '/',
      // includeAssets: [/]
      registerType: 'autoUpdate',
      // devOptions: {
      //   enabled: true,
      // },
      manifest: {
        name: 'Holeshot-BMX',
        short_name: 'Holeshot-BMX',
        description: 'Holeshot-BMX - Racing Scheduler & Coach in your pocket',
        theme_color: '#ffffff',
        start_url: '/scheduler?utm_source=standalone&utm_medium=1.0.0',
        icons: [
          {
            src: '/icons/apple-icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
    // VitePWA(),
    createVuePlugin(),
  ],
  server: {
    port: 8080,
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "src/styles/_variables.scss"; 
        @import "src/styles/_breakpoint.scss";
        @import "src/styles/_bootstrap.scss";
        @import "src/styles/_global.scss";`,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/'),
    },
  },
  define: {
    'process.env': process.env,
  },
});
