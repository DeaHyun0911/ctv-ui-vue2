import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
    plugins: [vue()],
    build: {
        lib: {
            entry: resolve(__dirname, 'src/main.js'),
            name: 'CtvUI',
            formats: ['iife'],
            fileName: () => 'ctv-ui-vue.js'
        },
        outDir: '../js',
        emptyOutDir: false,
        sourcemap: true,
        minify: false, // 개발 중에는 false, 배포 시 'esbuild'
        rollupOptions: {
            // Vue를 번들에 포함 (온프레미스 환경 지원 - CDN 불필요)
            external: [],
            output: {
                // IIFE로 빌드하여 window 객체에 자동 할당
                extend: true,
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name === 'style.css') return 'ctv-ui-vue.css';
                    return assetInfo.name;
                }
            }
        }
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
            // 템플릿 컴파일러 포함 전체 Vue 빌드 사용 (HTML에서 직접 템플릿 사용 가능)
            'vue': 'vue/dist/vue.esm-bundler.js'
        }
    },
    define: {
        // 프로덕션 빌드 최적화
        __VUE_OPTIONS_API__: true,
        __VUE_PROD_DEVTOOLS__: false,
        // process.env 대체 (브라우저 환경에서는 process 객체 없음)
        'process.env.NODE_ENV': JSON.stringify('production')
    }
});
