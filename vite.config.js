import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
    plugins: [vue()],
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.js'),
            name: 'CtvUI',
            formats: ['umd', 'es'],
            fileName: (format) => {
                if (format === 'umd') return 'ctv-ui-vue.js';
                if (format === 'es') return 'ctv-ui-vue.esm.js';
                return 'ctv-ui-vue.js';
            }
        },
        outDir: 'dist',
        emptyOutDir: true,
        sourcemap: true,
        minify: false, // 개발 중에는 false, 배포 시 'esbuild'
        rollupOptions: {
            // Vue를 번들에 포함 (온프레미스 환경 지원 - CDN 불필요)
            external: [],
            output: {
                // UMD로 빌드하여 window 객체에 자동 할당
                globals: {
                    vue: 'Vue'
                },
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
            // 템플릿 컴파일러 포함 전체 Vue 빌드 사용 (런타임에서 템플릿 컴파일 가능)
            'vue': 'vue/dist/vue.esm-bundler.js'
        }
    },
    define: {
        // 프로덕션 빌드 최적화
        __VUE_OPTIONS_API__: true,
        __VUE_PROD_DEVTOOLS__: false,
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
        // process.env 대체 (브라우저 환경에서는 process 객체 없음)
        'process.env.NODE_ENV': JSON.stringify('production')
    }
});
