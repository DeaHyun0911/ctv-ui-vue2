/**
 * CtvQueryFilter Wrapper
 * Vue 컴포넌트를 내부적으로 사용하지만, 바닐라 JS API를 제공
 *
 * 사용법:
 * const filter = new CtvQueryFilter({
 *     container: '#queryFilter',
 *     columns: 4,
 *     fields: [...]
 * });
 */

import { createApp } from 'vue';
import CtvQueryFilterComponent from '@/components/core/CtvQueryFilter.vue';

class CtvQueryFilter {
    constructor(config = {}) {
        this.config = config;
        this.container = null;
        this.app = null;
        this.componentInstance = null;

        this._init();
    }

    /**
     * 초기화
     * @private
     */
    _init() {
        // 컨테이너 요소 찾기
        const containerSelector = this.config.container || '#queryFilter';
        this.container = typeof containerSelector === 'string'
            ? document.querySelector(containerSelector)
            : containerSelector;

        if (!this.container) {
            console.error(`[CtvQueryFilter] 컨테이너를 찾을 수 없습니다: ${containerSelector}`);
            return;
        }

        // Vue 앱 생성 및 마운트
        this._createVueApp();
    }

    /**
     * Vue 앱 생성 및 마운트
     * @private
     */
    _createVueApp() {
        // 콤보 데이터 처리
        const processedConfig = this._processConfig(this.config);

        this.app = createApp({
            components: {
                CtvQueryFilterComponent
            },
            data() {
                return {
                    filterConfig: processedConfig
                };
            },
            template: `
                <CtvQueryFilterComponent
                    ref="filterRef"
                    :config="filterConfig"
                    @search="handleSearch"
                    @reset="handleReset"
                    @change="handleChange"
                />
            `,
            methods: {
                handleSearch(params) {
                    // 외부 콜백 호출
                    if (typeof this.filterConfig.onSearch === 'function') {
                        this.filterConfig.onSearch(params);
                    }
                },
                handleReset() {
                    if (typeof this.filterConfig.onReset === 'function') {
                        this.filterConfig.onReset();
                    }
                },
                handleChange(formData) {
                    if (typeof this.filterConfig.onChange === 'function') {
                        this.filterConfig.onChange(formData);
                    }
                }
            },
            mounted() {
                // 컴포넌트 인스턴스 참조 저장
                const wrapper = this.$options._wrapper;
                if (wrapper) {
                    wrapper.componentInstance = this.$refs.filterRef;
                }
            }
        });

        // wrapper 참조 전달
        this.app._wrapper = this;

        // 마운트
        this.app.mount(this.container);
    }

    /**
     * 설정 처리
     * @private
     */
    _processConfig(config) {
        const processed = { ...config };

        // comboIndex가 있는 필드에 전역 콤보 데이터 연결
        if (processed.fields && Array.isArray(processed.fields)) {
            processed.fields = processed.fields.map(field => {
                if (field.comboIndex !== undefined && typeof window.gGridComboData !== 'undefined') {
                    const comboData = window.gGridComboData[field.comboIndex];
                    if (comboData && Array.isArray(comboData)) {
                        return {
                            ...field,
                            options: comboData.map(item => ({
                                value: item.value || item.CODE,
                                text: item.text || item.NAME
                            }))
                        };
                    }
                }
                return field;
            });
        }

        return processed;
    }

    /**
     * 필터 데이터 가져오기
     */
    getData() {
        if (this.componentInstance && typeof this.componentInstance.getData === 'function') {
            return this.componentInstance.getData();
        }
        return {};
    }

    /**
     * 조회 실행
     */
    search() {
        if (this.componentInstance && typeof this.componentInstance.handleSearch === 'function') {
            this.componentInstance.handleSearch();
        }
    }

    /**
     * 초기화
     */
    reset() {
        if (this.componentInstance && typeof this.componentInstance.handleReset === 'function') {
            this.componentInstance.handleReset();
        }
    }

    /**
     * 필드 값 설정
     */
    setValue(field, value) {
        if (this.componentInstance && this.componentInstance.formData) {
            this.componentInstance.formData[field] = value;
        }
    }

    /**
     * 필드 값 가져오기
     */
    getValue(field) {
        if (this.componentInstance && this.componentInstance.formData) {
            return this.componentInstance.formData[field];
        }
        return null;
    }

    /**
     * 파괴
     */
    destroy() {
        if (this.app) {
            this.app.unmount();
            this.app = null;
            this.componentInstance = null;
        }
    }
}

export default CtvQueryFilter;
