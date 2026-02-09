/**
 * CTV UI Vue - Entry Point
 * 바닐라 JS API를 제공하면서 내부적으로 Vue를 사용하는 라이브러리
 */

import CtvQueryFilter from './wrappers/CtvQueryFilterWrapper.js';
import CtvDataGrid from './wrappers/CtvDataGridWrapper.js';
import CtvDataService from './services/CtvDataService.js';

// 전역으로 노출 (UMD 패턴)
if (typeof window !== 'undefined') {
    window.CtvQueryFilter = CtvQueryFilter;
    window.CtvDataGrid = CtvDataGrid;
    window.CtvDataService = CtvDataService;
}

// ES Module로도 export
export {
    CtvQueryFilter,
    CtvDataGrid,
    CtvDataService
};

export default {
    CtvQueryFilter,
    CtvDataGrid,
    CtvDataService
};
