import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0'
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 分離 React 相關庫
          react: ['react', 'react-dom'],
          // 分離 Ant Design
          antd: ['antd', '@ant-design/icons'],
          // 分離 Firebase
          firebase: ['firebase/app', 'firebase/firestore', 'firebase/auth'],
          // 分離 router 和其他工具庫
          router: ['react-router-dom'],
          utils: ['dayjs', 'react-hot-toast']
        }
      }
    },
    // 啟用 gzip 壓縮
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 移除 console.log
        drop_debugger: true
      }
    },
    // 設定合理的 chunk 大小警告
    chunkSizeWarningLimit: 1000
  },
  // 優化依賴預構建
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'antd',
      '@ant-design/icons',
      'firebase/app',
      'firebase/firestore', 
      'firebase/auth',
      'react-router-dom',
      'dayjs',
      'react-hot-toast'
    ]
  }
})
