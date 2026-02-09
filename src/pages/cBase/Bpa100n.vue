<template>
  <div class="bpa100n-page">
    <!-- 조회 필터 -->
    <CtvQueryFilter
      ref="filterRef"
      :config="filterConfig"
      :grid-instance="gridInstance"
      @search="handleSearch"
    />

    <!-- 데이터 그리드 -->
    <CtvDataGrid
      ref="gridRef"
      grid-id="grid1"
      :config="gridConfig"
      @ready="handleGridReady"
      @query-success="handleQuerySuccess"
      @save-success="handleSaveSuccess"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import CtvQueryFilter from '@/components/core/CtvQueryFilter.vue';
import CtvDataGrid from '@/components/core/CtvDataGrid.vue';

/**
 * @program Bpa100n
 * @title 프로그램 등록
 * @author CTV - 최대현
 */

// ==============================================
// Refs
// ==============================================
const filterRef = ref(null);
const gridRef = ref(null);
const gridInstance = computed(() => {
  if (!gridRef.value) return null;
  return {
    datagrid: gridRef.value.datagrid,
    query: gridRef.value.query,
    save: gridRef.value.save,
    getData: gridRef.value.getData,
    setData: gridRef.value.setData,
    reloadData: gridRef.value.reloadData
  };
});

// ==============================================
// 데이터 설정
// ==============================================
const CONFIG = {
  // 콤보 파라미터 설정
  comboParams: [
    { "CODE": "B100", "FLAG": "0" },   // 0 : 솔루션구분
    { "CODE": "0100", "FLAG": "0" },   // 1 : 신고사업장
    { "CODE": "0200", "FLAG": "0" },   // 2 : 사업장
    { "CODE": "B019", "FLAG": "0-Y" }, // 3 : 메뉴대분류
    { "CODE": "B020", "FLAG": "0" },   // 4 : 프로그램사용권한
    { "CODE": "B017", "FLAG": "0" },   // 5 : 프로그램타입
    { "CODE": "B003", "FLAG": "0" },   // 6 : 소스폴더
    { "CODE": "B031", "FLAG": "0" },   // 7 : 사용유무
    { "CODE": "B050", "FLAG": "0" },   // 8 : 업무모듈구분
  ],

  // API 설정
  api: {
    path: 'Bpa100n.ashx',
    query: 'UfnQuery',  // 프로그램 조회
    save: 'UfnSave'     // 프로그램 저장
  }
};

// 전역 콤보 데이터 (초기화 후 로드됨)
const gGridComboData = ref([]);

// ==============================================
// 컴포넌트 설정
// ==============================================

/**
 * 조회조건 설정
 */
const filterConfig = reactive({
  columns: 5,
  fields: [
    {
      field: 'MC_MENU',
      title: '매뉴대분류',
      type: 'select',
      comboIndex: 3,
      options: [] // 초기화 후 채워짐
    },
    {
      field: 'MC_PGM_TYPE',
      title: '프로그램타입',
      type: 'select',
      comboIndex: 5,
      options: []
    },
    {
      field: 'ID_PGM',
      title: '프로그램ID',
      type: 'input',
    },
    {
      field: 'NM_KOR_PGM',
      title: '프로그램명',
      type: 'input',
    },
  ]
});

/**
 * 그리드 설정
 */
const gridConfig = reactive({
  toolBox: {
    left: [
      { tool: 'setting', position: 'before' }
    ]
  },
  dataQuery: {
    path: CONFIG.api.path,
    funcNm: CONFIG.api.query,
    bParam: (queryData) => [
      top.gSInfo?.ERPSDB || '',
      queryData.ID_PGM || '',
      queryData.NM_KOR_PGM || '',
      queryData.MC_MENU || '',
      queryData.MC_PGM_TYPE || '',
    ],
  },
  saveQuery: {
    path: CONFIG.api.path,
    funcNm: CONFIG.api.save,
    bParam: [top.gSInfo?.ERPSDB || '', '', '']
  },
  buildGridConfig: buildGridConfig,
  defaultValue: getDefaultValue,
  settingMenuItems: [
    {
      type: 'switch',
      title: '메뉴 그룹설정',
      name: 'showGroup',
      value: 'group',
      checked: false,
      onChange: onGroup
    },
    {
      type: 'check',
      title: '사용가능만 보기',
      name: 'showUseYn',
      checked: false,
      onChange: onUseYn
    },
  ],
});

/**
 * 그리드 컬럼 설정
 */
function buildGridConfig(state) {
  return {
    defaultUnit: '%',
    columns: [
      {
        field: 'MC_MENU',
        caption: '메뉴대분류',
        colType: 'C|NN|STR|M|SP',
        inputCombo: gGridComboData.value[3],
        groupTitle: {
          aggregates: [{
            func: (rows) => rows[0]?.NM_KOR_PGM,
            field: 'MC_MENU'
          }],
          title: { template: `{{MC_MENU}}` }
        },
      },
      { field: 'ID_PGM_TOP', caption: '상위ID', colType: 'STR|C|NN|S' },
      { field: 'NO_PGM', caption: '순서', colType: 'NUM|C|NN|XS' },
      {
        field: 'ID_PGM',
        caption: '프로그램ID',
        colType: "STR|L|NN|M",
        cellTemplate: '#movePgm',
        colCss: (data) => data.NO_PGM === 0 ? 'icon-hidden' : '',
      },
      { field: 'NM_KOR_PGM', caption: '프로그램명(한국어)', colType: 'STR|L|NN|XL' },
      { field: 'NM_ENG_PGM', caption: '프로그램명(영어)', colType: 'STR|L|XL' },
      { field: 'NM_CHN_PGM', caption: '프로그램명(중국어)', colType: 'STR|L|XL' },
      { field: 'MC_AMD_TYPE', caption: '권한분류', colType: 'STR|C|NN|M', type: 'combo', combo: gGridComboData.value[4] },
      {
        field: 'MC_PGM_TYPE',
        caption: '타입',
        colType: 'STR|C|NN|M',
        type: 'combo',
        inputCombo: gGridComboData.value[5],
        itemContent: (label, value) => `${value} | ${label}`
      },
      { field: 'PGM_FOLDER', caption: '폴더', colType: 'STR|C|NN|M', type: 'combo', combo: gGridComboData.value[6] },
      { field: 'YN_USE', caption: '사용유무', colType: 'STR|C|NN|S', type: 'combo', combo: gGridComboData.value[7] },
      { field: 'MC_MODL_TYPE', caption: '업무모듈구분', colType: 'STR|C|NN|M', type: 'combo', combo: gGridComboData.value[8] },
      { field: 'DT_PATCH_FIR', caption: '최초패치일자', colType: 'STR|H|EX' },
      { field: 'DT_PATCH_LST', caption: '최종패치일자', colType: 'STR|H|EX' },
      { field: 'BIGO', caption: '비고', colType: 'STR|L|XL|SP' },
      { field: 'TM_REG', caption: '등록일시', colType: 'STR|H|EX' },
      { field: 'TM_UPT', caption: '수정일시', colType: 'STR|H|EX' },
      { field: 'ROWID', caption: '행ID', colType: 'STR|H|EX' },
    ],
    rowCss: (data) => data.NO_PGM == 0 ? 'row-highlight' : '',
  };
}

/**
 * 행 추가시 기본값
 */
function getDefaultValue(grid, state) {
  const focusValue = typeof SBGrid3 !== 'undefined'
    ? (SBGrid3.getFocusedValue(state.datagrid) || SBGrid3.getRowByIndex(grid.datagrid, 0)?.data)
    : null;

  const defaultData = focusValue || {
    MC_MENU: "",
    ID_PGM_TOP: "",
    NO_PGM: 0,
    MC_PGM_TYPE: "",
    PGM_FOLDER: "",
    YN_USE: "Y"
  };

  const { MC_MENU, ID_PGM_TOP, NO_PGM, MC_PGM_TYPE, PGM_FOLDER, YN_USE } = defaultData;

  return {
    MC_MENU,
    ID_PGM_TOP,
    NO_PGM: NO_PGM + 1,
    MC_PGM_TYPE,
    PGM_FOLDER,
    YN_USE
  };
}

// ==============================================
// Event Handlers
// ==============================================

/**
 * 그룹 설정 활성화/비활성화
 */
function onGroup(checked) {
  if (!gridRef.value?.datagrid) return;

  if (checked) {
    SBGrid3.setGroup(gridRef.value.datagrid, [{ field: "MC_MENU", isOpen: true }]);
  } else {
    SBGrid3.setGroup(gridRef.value.datagrid, []);
  }
}

/**
 * 사용가능만 필터
 */
function onUseYn(checked) {
  if (!gridRef.value?.datagrid) return;

  if (checked) {
    SBGrid3.setFilter(gridRef.value.datagrid, 'YN_USE', {
      field: 'YN_USE',
      operator: 'IsEqualTo',
      values: 'Y'
    });
  } else {
    SBGrid3.setFilter(gridRef.value.datagrid, 'YN_USE');
  }
}

/**
 * 프로그램 이동
 */
function movePgm(pgmId) {
  if (!gridRef.value?.datagrid) return;

  const focusValue = SBGrid3.getFocusedValue(gridRef.value.datagrid);

  // HID 타입이거나 사용유무가 'N'인 경우 프로그램 오픈하지 않음
  if (focusValue.MC_PGM_TYPE === "HID" || focusValue.YN_USE !== "Y") {
    return;
  }

  if (typeof top !== 'undefined' && top.gTopAces?.mMain?.open) {
    top.gTopAces.mMain.open(pgmId);
  }
}

/**
 * 조회 버튼 클릭
 */
function handleSearch(params) {
  console.log('[Bpa100n] 조회 실행:', params);
}

/**
 * 그리드 준비 완료
 */
function handleGridReady(datagrid) {
  console.log('[Bpa100n] 그리드 준비 완료:', datagrid);
}

/**
 * 조회 성공
 */
function handleQuerySuccess({ result, data, params }) {
  console.log('[Bpa100n] 조회 성공:', { result, data, params });
}

/**
 * 저장 성공
 */
function handleSaveSuccess(result) {
  console.log('[Bpa100n] 저장 성공:', result);
}

// ==============================================
// 초기화
// ==============================================

/**
 * 페이지 초기화
 */
async function init() {
  try {
    // 프로그램 이동 템플릿 로드
    if (typeof CTV_Templates !== 'undefined') {
      CTV_Templates.load(['movePgm']);
    }

    // 콤보 데이터 로드
    if (typeof CtvPageUtils !== 'undefined' && CtvPageUtils.loadComboData) {
      await CtvPageUtils.loadComboData(CONFIG.comboParams);

      // 전역 콤보 데이터를 로컬로 복사
      if (typeof window.gGridComboData !== 'undefined') {
        gGridComboData.value = window.gGridComboData;

        // 필터 옵션 업데이트
        filterConfig.fields.forEach(field => {
          if (field.comboIndex !== undefined) {
            const comboData = gGridComboData.value[field.comboIndex];
            if (comboData && Array.isArray(comboData)) {
              field.options = comboData.map(item => ({
                value: item.value || item.CODE,
                text: item.text || item.NAME
              }));
            }
          }
        });
      }
    }

  } catch (error) {
    console.error('[Bpa100n] 초기화 중 에러:', error);
  }
}

// 외부에서 접근 가능한 함수 노출 (window 객체에 등록)
if (typeof window !== 'undefined') {
  window.ufnMovePgmId = (sPgmId) => {
    movePgm(sPgmId);
  };
}

onMounted(() => {
  init();
});

// Expose methods for external access
defineExpose({
  movePgm,
  gridRef,
  filterRef,
  gridInstance
});
</script>

<style scoped>
.bpa100n-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  padding: 10px;
  gap: 10px;
}

/* 행 하이라이트 스타일 */
:deep(.row-highlight) {
  background-color: #f0f8ff !important;
  font-weight: bold;
}

/* 아이콘 숨김 스타일 */
:deep(.icon-hidden) {
  visibility: hidden;
}
</style>
