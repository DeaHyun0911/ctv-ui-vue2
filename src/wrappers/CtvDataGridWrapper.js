/**
 * CtvDataGrid Wrapper
 * Vue 컴포넌트를 내부적으로 사용하지만, 바닐라 JS API를 제공
 *
 * 사용법:
 * const grid = new CtvDataGrid({
 *     container: '#grid1',
 *     dataQuery: { ... },
 *     saveQuery: { ... },
 *     buildGridConfig: () => ({ columns: [...] })
 * });
 */

import { createApp } from 'vue';
import CtvDataGridComponent from '@/components/core/CtvDataGrid.vue';

class CtvDataGrid {
    constructor(config = {}) {
        this.config = config;
        this.container = null;
        this.app = null;
        this.componentInstance = null;
        this.datagrid = null; // SBGrid3 인스턴스

        this._init();
    }

    /**
     * 초기화
     * @private
     */
    _init() {
        // 컨테이너 요소 찾기
        const containerSelector = this.config.container || '#grid1';
        this.container = typeof containerSelector === 'string'
            ? document.querySelector(containerSelector)
            : containerSelector;

        if (!this.container) {
            console.error(`[CtvDataGrid] 컨테이너를 찾을 수 없습니다: ${containerSelector}`);
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
        // 고유 ID 생성
        const gridId = this.config.id || `grid_${Date.now()}`;

        this.app = createApp({
            components: {
                CtvDataGridComponent
            },
            data() {
                return {
                    gridConfig: this.config,
                    gridId: gridId
                };
            },
            template: `
                <CtvDataGridComponent
                    ref="gridRef"
                    :grid-id="gridId"
                    :config="gridConfig"
                    @ready="handleReady"
                    @query-success="handleQuerySuccess"
                    @save-success="handleSaveSuccess"
                    @row-click="handleRowClick"
                    @row-dblclick="handleRowDblClick"
                />
            `,
            methods: {
                handleReady(datagrid) {
                    // wrapper에 datagrid 인스턴스 저장
                    const wrapper = this.$options._wrapper;
                    if (wrapper) {
                        wrapper.datagrid = datagrid;
                    }

                    // 외부 콜백 호출
                    if (typeof this.gridConfig.onGridReady === 'function') {
                        this.gridConfig.onGridReady(datagrid);
                    }
                },
                handleQuerySuccess({ result, data, params }) {
                    if (typeof this.gridConfig.onDataLoaded === 'function') {
                        this.gridConfig.onDataLoaded(data, result);
                    }
                },
                handleSaveSuccess(result) {
                    if (typeof this.gridConfig.saveQuery?.onSuccess === 'function') {
                        this.gridConfig.saveQuery.onSuccess(result, this);
                    }
                },
                handleRowClick(rowData) {
                    if (typeof this.gridConfig.onRowClick === 'function') {
                        this.gridConfig.onRowClick(rowData);
                    }
                },
                handleRowDblClick(rowData) {
                    if (typeof this.gridConfig.onRowDblClick === 'function') {
                        this.gridConfig.onRowDblClick(rowData);
                    }
                }
            },
            mounted() {
                // 컴포넌트 인스턴스 참조 저장
                const wrapper = this.$options._wrapper;
                if (wrapper) {
                    wrapper.componentInstance = this.$refs.gridRef;
                }
            }
        });

        // wrapper 참조 전달
        this.app.config.globalProperties._wrapper = this;
        this.app._wrapper = this;

        // 마운트
        this.app.mount(this.container);
    }

    /**
     * 조회
     */
    async query(params = {}) {
        if (this.componentInstance && typeof this.componentInstance.query === 'function') {
            return await this.componentInstance.query(params);
        }
        return null;
    }

    /**
     * 저장
     */
    async save() {
        if (this.componentInstance && typeof this.componentInstance.save === 'function') {
            return await this.componentInstance.save();
        }
        return null;
    }

    /**
     * 데이터 설정
     */
    setData(data) {
        if (this.componentInstance && typeof this.componentInstance.setData === 'function') {
            this.componentInstance.setData(data);
        }
    }

    /**
     * 데이터 가져오기
     */
    getData() {
        if (this.componentInstance && typeof this.componentInstance.getData === 'function') {
            return this.componentInstance.getData();
        }
        return [];
    }

    /**
     * 재조회
     */
    async reload() {
        if (this.componentInstance && typeof this.componentInstance.reloadData === 'function') {
            return await this.componentInstance.reloadData();
        }
        return null;
    }

    /**
     * 행 추가
     */
    addRow(data = {}) {
        if (this.datagrid && typeof SBGrid3 !== 'undefined') {
            // defaultValue 함수가 있으면 호출
            let defaultData = data;
            if (typeof this.config.defaultValue === 'function') {
                const state = { datagrid: this.datagrid };
                defaultData = { ...this.config.defaultValue(this, state), ...data };
            }

            SBGrid3.addRow(this.datagrid, defaultData);
        }
    }

    /**
     * 행 삭제
     */
    deleteRow(rowIndex) {
        if (this.datagrid && typeof SBGrid3 !== 'undefined') {
            SBGrid3.deleteRow(this.datagrid, rowIndex);
        }
    }

    /**
     * 선택된 행 삭제
     */
    deleteSelectedRows() {
        if (this.datagrid && typeof SBGrid3 !== 'undefined') {
            const selectedRows = SBGrid3.getCheckedRows(this.datagrid);
            if (selectedRows && selectedRows.length > 0) {
                selectedRows.forEach(row => {
                    SBGrid3.deleteRow(this.datagrid, row.rowIndex);
                });
            }
        }
    }

    /**
     * 툴박스 인스턴스 반환
     */
    get tool() {
        return this.componentInstance?.toolBoxInstance || null;
    }

    /**
     * 파괴
     */
    destroy() {
        if (this.app) {
            this.app.unmount();
            this.app = null;
            this.componentInstance = null;
            this.datagrid = null;
        }
    }
}

export default CtvDataGrid;
