# CTV UI Vue2 마이그레이션 가이드

바닐라 JS로 작성된 기존 페이지를 Vue 2로 리팩토링하는 가이드입니다.

## 목차

1. [개요](#개요)
2. [주요 변경사항](#주요-변경사항)
3. [마이그레이션 단계](#마이그레이션-단계)
4. [예시 비교](#예시-비교)
5. [API 참조](#api-참조)

---

## 개요

기존 바닐라 JS 기반 CtvDataGrid와 CtvQueryFilter를 Vue 2 컴포넌트로 마이그레이션합니다.

### 주요 이점

- **반응형 데이터**: Vue의 반응형 시스템으로 상태 관리 간소화
- **컴포넌트 재사용**: 필터와 그리드를 독립적인 컴포넌트로 분리
- **타입 안정성**: defineProps, defineEmits로 명확한 인터페이스 정의
- **유지보수성**: 선언적 템플릿으로 가독성 향상

---

## 주요 변경사항

### 1. IIFE 패턴 → Vue 컴포넌트

**Before (바닐라 JS)**
```javascript
const Bpa100n = (function () {
    let _filter = null;
    let _grid = null;

    function init() {
        _filter = new CtvQueryFilter(setFilter());
        _grid = new CtvDataGrid(setGrid());
    }

    return { init };
})();

window.onload = () => Bpa100n.init();
```

**After (Vue)**
```vue
<template>
  <div class="bpa100n-page">
    <CtvQueryFilter ref="filterRef" :config="filterConfig" />
    <CtvDataGrid ref="gridRef" :config="gridConfig" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const filterRef = ref(null);
const gridRef = ref(null);

onMounted(() => {
  // 초기화 로직
});
</script>
```

### 2. 설정 객체 → Reactive Config

**Before**
```javascript
function setFilter() {
    return {
        container: '#queryFilter',
        columns: 5,
        fields: [...]
    };
}
```

**After**
```javascript
const filterConfig = reactive({
  columns: 5,
  fields: [...]
});
```

### 3. DOM 직접 조작 → 템플릿 바인딩

**Before**
```javascript
const container = document.querySelector('#grid1');
const grid = new CtvDataGrid({ container, ... });
```

**After**
```vue
<CtvDataGrid ref="gridRef" grid-id="grid1" :config="gridConfig" />
```

---

## 마이그레이션 단계

### Step 1: 파일 구조 설정

기존:
```
sample/
  └── Bpa100n.js
```

변경 후:
```
src/
  └── pages/
      └── cBase/
          └── Bpa100n.vue
```

### Step 2: Import 문 추가

```vue
<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import CtvQueryFilter from '@/components/core/CtvQueryFilter.vue';
import CtvDataGrid from '@/components/core/CtvDataGrid.vue';
</script>
```

### Step 3: 상태 변수 변환

```javascript
// Before
let _filter = null;
let _grid = null;

// After
const filterRef = ref(null);
const gridRef = ref(null);
```

### Step 4: 설정 함수 → Reactive 객체

```javascript
// Before
function setFilter() {
    return {
        container: '#queryFilter',
        fields: [...]
    };
}

// After
const filterConfig = reactive({
  fields: [...]
});
```

### Step 5: 이벤트 핸들러 연결

```vue
<template>
  <CtvDataGrid
    @ready="handleGridReady"
    @query-success="handleQuerySuccess"
    @save-success="handleSaveSuccess"
  />
</template>

<script setup>
function handleGridReady(datagrid) {
  console.log('그리드 준비:', datagrid);
}

function handleQuerySuccess({ result, data }) {
  console.log('조회 성공:', data);
}
</script>
```

### Step 6: 초기화 로직

```javascript
// Before
function init() {
    CTV_Templates.load(['movePgm']);
    await CtvPageUtils.loadComboData(CONFIG.comboParams);
    _filter = new CtvQueryFilter(setFilter());
    _grid = new CtvDataGrid(setGrid());
}

// After
onMounted(async () => {
  if (typeof CTV_Templates !== 'undefined') {
    CTV_Templates.load(['movePgm']);
  }

  if (typeof CtvPageUtils !== 'undefined') {
    await CtvPageUtils.loadComboData(CONFIG.comboParams);
  }
});
```

---

## 예시 비교

### 완전한 예시: Bpa100n 페이지

#### Before: Bpa100n.js (바닐라 JS)

```javascript
const Bpa100n = (function () {
    let _filter = null;
    let _grid = null;

    const CONFIG = {
        comboParams: [
            { "CODE": "B100", "FLAG": "0" },
            // ...
        ],
        api: {
            path: 'Bpa100n.ashx',
            query: 'UfnQuery',
            save: 'UfnSave'
        }
    };

    function setFilter() {
        return {
            container: '#queryFilter',
            columns: 5,
            fields: [
                {
                    field: 'MC_MENU',
                    title: '매뉴대분류',
                    type: 'select',
                    comboIndex: 3,
                },
                // ...
            ]
        };
    }

    function setGrid() {
        return {
            container: '#grid1',
            toolBox: {
                left: [
                    { tool: 'setting', position: 'before' }
                ]
            },
            dataQuery: {
                path: CONFIG.api.path,
                funcNm: CONFIG.api.query,
                bParam: (queryData) => [
                    top.gSInfo[ERPSDB],
                    queryData.ID_PGM,
                    queryData.NM_KOR_PGM,
                    queryData.MC_MENU,
                    queryData.MC_PGM_TYPE,
                ],
            },
            saveQuery: {
                path: CONFIG.api.path,
                funcNm: CONFIG.api.save,
                bParam: [top.gSInfo[ERPSDB], '', '']
            },
            buildGridConfig: setGridCols,
            defaultValue: setDefaultValue,
        };
    }

    function setGridCols(state) {
        return {
            defaultUnit: '%',
            columns: [
                {
                    field: 'MC_MENU',
                    caption: '메뉴대분류',
                    colType: 'C|NN|STR|M|SP',
                    inputCombo: gGridComboData[3],
                },
                // ...
            ]
        };
    }

    async function init() {
        CTV_Templates.load(['movePgm']);
        await CtvPageUtils.loadComboData(CONFIG.comboParams);
        _filter = new CtvQueryFilter(setFilter());
        _grid = new CtvDataGrid(setGrid());
    }

    return { init };
})();

window.onload = () => Bpa100n.init();
```

#### After: Bpa100n.vue (Vue 2)

```vue
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
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import CtvQueryFilter from '@/components/core/CtvQueryFilter.vue';
import CtvDataGrid from '@/components/core/CtvDataGrid.vue';

// Refs
const filterRef = ref(null);
const gridRef = ref(null);
const gridInstance = computed(() => ({
  datagrid: gridRef.value?.datagrid,
  query: gridRef.value?.query,
  save: gridRef.value?.save,
}));

// 설정
const CONFIG = {
  comboParams: [
    { "CODE": "B100", "FLAG": "0" },
    // ...
  ],
  api: {
    path: 'Bpa100n.ashx',
    query: 'UfnQuery',
    save: 'UfnSave'
  }
};

const gGridComboData = ref([]);

// 필터 설정
const filterConfig = reactive({
  columns: 5,
  fields: [
    {
      field: 'MC_MENU',
      title: '매뉴대분류',
      type: 'select',
      comboIndex: 3,
      options: []
    },
    // ...
  ]
});

// 그리드 설정
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
});

function buildGridConfig(state) {
  return {
    defaultUnit: '%',
    columns: [
      {
        field: 'MC_MENU',
        caption: '메뉴대분류',
        colType: 'C|NN|STR|M|SP',
        inputCombo: gGridComboData.value[3],
      },
      // ...
    ]
  };
}

function getDefaultValue(grid, state) {
  // 기본값 로직
}

// 이벤트 핸들러
function handleSearch(params) {
  console.log('조회:', params);
}

function handleGridReady(datagrid) {
  console.log('그리드 준비:', datagrid);
}

function handleQuerySuccess({ result, data }) {
  console.log('조회 성공:', data);
}

// 초기화
async function init() {
  if (typeof CTV_Templates !== 'undefined') {
    CTV_Templates.load(['movePgm']);
  }

  if (typeof CtvPageUtils !== 'undefined') {
    await CtvPageUtils.loadComboData(CONFIG.comboParams);
    if (typeof window.gGridComboData !== 'undefined') {
      gGridComboData.value = window.gGridComboData;
    }
  }
}

onMounted(() => {
  init();
});

defineExpose({
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
  padding: 10px;
  gap: 10px;
}
</style>
```

---

## API 참조

### CtvQueryFilter Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `config` | Object | Yes | - | 필터 설정 객체 |
| `gridInstance` | Object | No | null | 연결된 그리드 인스턴스 |

#### Config 구조

```typescript
{
  columns: number,        // 그리드 컬럼 수 (기본: 4)
  labelWidth: string,     // 레이블 너비 (기본: '100px')
  gap: string,            // 필드 간격 (기본: '5px 10px')
  buttons: boolean,       // 버튼 표시 여부 (기본: true)
  fields: Array<{
    field: string,        // 필드명
    title: string,        // 레이블
    type: 'input' | 'select' | 'date' | 'check',
    placeholder?: string,
    disabled?: boolean,
    autoQuery?: boolean,  // 변경 시 자동 조회
    span?: number,        // 컬럼 span
    comboIndex?: number,  // 콤보 데이터 인덱스
    options?: Array<{value: string, text: string}>
  }>
}
```

### CtvQueryFilter Events

| Event | Payload | Description |
|-------|---------|-------------|
| `search` | `params: Object` | 조회 버튼 클릭 |
| `reset` | - | 초기화 버튼 클릭 |
| `change` | `formData: Object` | 필드 값 변경 |

### CtvDataGrid Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `config` | Object | Yes | - | 그리드 설정 객체 |
| `gridId` | String | Yes | - | 그리드 고유 ID |
| `gridHeight` | String | No | '100%' | 그리드 높이 |

#### Config 구조

```typescript
{
  toolBox: {
    left: Array,          // 왼쪽 버튼 배열
    right: Array,         // 오른쪽 버튼 배열
    title: string         // 툴박스 제목
  },
  dataQuery: {
    path: string,         // API 경로
    funcNm: string,       // 함수명
    bParam: Array | Function,  // 파라미터
    dataName: string,     // 데이터 필드명 (기본: 'rsData01')
    autoActive: boolean   // 조회 후 자동 활성화 (기본: true)
  },
  saveQuery: {
    path: string,
    funcNm: string,
    bParam: Array | Function,
    reloadAfterSave: boolean,  // 저장 후 재조회 (기본: true)
    onValueCheck: Function,
    onValueConvert: Function,
    onSuccess: Function,
    onError: Function
  },
  buildGridConfig: Function,  // 그리드 컬럼 생성 함수
  defaultValue: Function,     // 행 추가 시 기본값
  settingMenuItems: Array,    // 설정 메뉴 항목
  editable: boolean,          // 편집 가능 여부
  autoLoad: boolean,          // 자동 로드 (기본: true)
  height: string,             // 그리드 높이
  comboData: Array            // 콤보 데이터
}
```

### CtvDataGrid Events

| Event | Payload | Description |
|-------|---------|-------------|
| `ready` | `datagrid: Object` | 그리드 준비 완료 |
| `query-success` | `{result, data, params}` | 조회 성공 |
| `save-success` | `result: Object` | 저장 성공 |
| `row-click` | `rowData: Object` | 행 클릭 |
| `row-dblclick` | `rowData: Object` | 행 더블클릭 |
| `toolbox-action` | `{action, btn}` | 툴박스 액션 |

### CtvDataGrid Methods (ref로 접근)

```javascript
const gridRef = ref(null);

// 조회
await gridRef.value.query(params);

// 저장
await gridRef.value.save();

// 데이터 설정
gridRef.value.setData(data);

// 데이터 가져오기
const data = gridRef.value.getData();

// 재조회
await gridRef.value.reloadData();
```

---

## 체크리스트

마이그레이션 완료 전 확인사항:

- [ ] IIFE 패턴을 Vue 컴포넌트로 변환
- [ ] 전역 변수 사용을 ref/reactive로 변경
- [ ] DOM 직접 조작을 템플릿 바인딩으로 변경
- [ ] 이벤트 핸들러 연결 확인
- [ ] 콤보 데이터 로딩 확인
- [ ] API 호출 테스트 (조회/저장)
- [ ] 그리드 설정 메뉴 동작 확인
- [ ] 외부 함수 노출 (window 객체) 확인
- [ ] 스타일 적용 확인

---

## 문제 해결

### 1. 콤보 데이터가 로드되지 않음

**원인**: 전역 `gGridComboData` 변수를 참조하지 못함

**해결**:
```javascript
const gGridComboData = ref([]);

onMounted(async () => {
  await CtvPageUtils.loadComboData(CONFIG.comboParams);
  if (typeof window.gGridComboData !== 'undefined') {
    gGridComboData.value = window.gGridComboData;
  }
});
```

### 2. 그리드 메서드에 접근 불가

**원인**: ref가 아직 초기화되지 않음

**해결**:
```javascript
const gridInstance = computed(() => {
  if (!gridRef.value) return null;
  return {
    datagrid: gridRef.value.datagrid,
    query: gridRef.value.query,
    save: gridRef.value.save
  };
});
```

### 3. SBGrid3 함수 호출 에러

**원인**: SBGrid3 라이브러리가 로드되지 않음

**해결**:
```javascript
function onGroup(checked) {
  if (!gridRef.value?.datagrid || typeof SBGrid3 === 'undefined') return;

  if (checked) {
    SBGrid3.setGroup(gridRef.value.datagrid, [{ field: "MC_MENU" }]);
  }
}
```

---

## 추가 리소스

- [Vue 2 공식 문서](https://v2.vuejs.org/)
- [Composition API RFC](https://v3.vuejs.org/guide/composition-api-introduction.html)
- [CTV UI 컴포넌트 문서](./COMPONENTS.md)

---

## 지원

문제가 발생하거나 질문이 있는 경우:

1. 이슈 트래커: [GitHub Issues](https://github.com/your-repo/issues)
2. 내부 문의: CTV 개발팀
