import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Configuración de desarrollo
  server: {
    port: 5173,
    host: true,
    hmr: {
      overlay: false
    }
  },

  // Optimizaciones de build
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    
    // Configuración de Rollup para optimización
    rollupOptions: {
      output: {
        // Code splitting manual para chunks optimizados
        manualChunks: {
          // Vendor chunk para librerías externas
          vendor: ['react', 'react-dom', 'react-router-dom'],
          
          // UI chunk para componentes de interfaz
          ui: ['framer-motion'],
          
          // Utils chunk para utilidades
          utils: ['axios'],
          
          // Charts chunk para librerías de gráficos
          charts: ['chart.js', 'react-chartjs-2'],
          
          // PDF chunk para generación de PDFs
          pdf: ['jspdf', 'jspdf-autotable'],
          
          // Icons chunk para iconos
          icons: ['@heroicons/react']
        },
        
        // Nombres de archivos optimizados
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
            return `assets/images/[name]-[hash].${ext}`;
          }
          
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            return `assets/fonts/[name]-[hash].${ext}`;
          }
          
          if (/\.(css)$/i.test(assetInfo.name)) {
            return `assets/css/[name]-[hash].${ext}`;
          }
          
          return `assets/[name]-[hash].${ext}`;
        }
      }
    },
    
    // Configuración de Terser para minificación avanzada
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
        passes: 2
      },
      mangle: {
        safari10: true
      },
      format: {
        comments: false
      }
    },
    
    // Límite de advertencia de tamaño de chunk
    chunkSizeWarningLimit: 1000
  },

  // Optimización de dependencias
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      'framer-motion',
      'chart.js',
      'react-chartjs-2',
      'sweetalert2',
      'gsap',
      'jspdf',
      'jspdf-autotable',
      'xlsx',
      '@heroicons/react'
    ]
  },

  // Configuración CSS
  css: {
    devSourcemap: false,
    preprocessorOptions: {
      css: {
        charset: false
      }
    }
  },

  // Assets incluidos
  assetsInclude: ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif'],

  // Alias de rutas
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@contexts': path.resolve(__dirname, 'src/contexts'),
      '@assets': path.resolve(__dirname, 'src/assets')
    }
  },

  // Variables globales
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development')
  }
})