# CTV UI Vue2 사용 예시

Vue 2로 작성된 CTV UI 컴포넌트의 다양한 사용 예시를 소개합니다.

## 목차

1. [기본 사용법](#기본-사용법)
2. [필터 + 그리드 조합](#필터--그리드-조합)
3. [커스텀 툴박스](#커스텀-툴박스)
4. [동적 컬럼 설정](#동적-컬럼-설정)
5. [이벤트 처리](#이벤트-처리)

---

## 기본 사용법

### 1. 단순 그리드

```vue
<template>
  <div class="page">
    <CtvDataGrid
      ref="gridRef"
      grid-id="simpleGrid"
      :config="gridConfig"
    />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import CtvDataGrid from '@/components/core/CtvDataGrid.vue';

const gridRef = ref(null);

const gridConfig = reactive({
  columns: [
    { field: 'id', caption: 'ID', colType: 'STR|C|NN|S' },
    { field: 'name', caption: '이름', colType: 'STR|L|NN|M' },
    { field: 'email', caption: '이메일', colType: 'STR|L|M' },
  ]
});
</script>
```

### 2. 단순 필터

```vue
<template>
  <div class="page">
    <CtvQueryFilter
      ref="filterRef"
      :config="filterConfig"
      @search="handleSearch"
    />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import CtvQueryFilter from '@/components/core/CtvQueryFilter.vue';

const filterRef = ref(null);

const filterConfig = reactive({
  columns: 3,
  fields: [
    {
      field: 'searchText',
      title: '검색어',
      type: 'input',
      placeholder: '이름 또는 이메일'
    },
    {
      field: 'status',
      title: '상태',
      type: 'select',
      options: [
        { value: '', text: '전체' },
        { value: 'Y', text: '활성' },
        { value: 'N', text: '비활성' }
      ]
    }
  ]
});

function handleSearch(params) {
  console.log('검색 조건:', params);
}
</script>
```

---

## 필터 + 그리드 조합

### 완전한 페이지 구성

```vue
<template>
  <div class="user-management-page">
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
      grid-id="userGrid"
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

// Refs
const filterRef = ref(null);
const gridRef = ref(null);

// 그리드 인스턴스 computed
const gridInstance = computed(() => {
  if (!gridRef.value) return null;
  return {
    datagrid: gridRef.value.datagrid,
    query: gridRef.value.query,
    save: gridRef.value.save,
    getData: gridRef.value.getData,
    setData: gridRef.value.setData
  };
});

// 필터 설정
const filterConfig = reactive({
  columns: 4,
  labelWidth: '80px',
  fields: [
    {
      field: 'userName',
      title: '사용자명',
      type: 'input',
      placeholder: '사용자명 입력'
    },
    {
      field: 'userType',
      title: '사용자유형',
      type: 'select',
      options: [
        { value: '', text: '전체' },
        { value: 'ADMIN', text: '관리자' },
        { value: 'USER', text: '일반사용자' }
      ]
    },
    {
      field: 'useYn',
      title: '사용여부',
      type: 'select',
      options: [
        { value: '', text: '전체' },
        { value: 'Y', text: '사용' },
        { value: 'N', text: '미사용' }
      ]
    },
    {
      field: 'regDate',
      title: '등록일',
      type: 'date'
    }
  ]
});

// 그리드 설정
const gridConfig = reactive({
  toolBox: {
    left: ['append', 'delete'],
    right: ['save', 'excel']
  },
  dataQuery: {
    path: 'User.ashx',
    funcNm: 'UfnQuery',
    bParam: (queryData) => [
      queryData.userName || '',
      queryData.userType || '',
      queryData.useYn || '',
      queryData.regDate || ''
    ]
  },
  saveQuery: {
    path: 'User.ashx',
    funcNm: 'UfnSave',
    bParam: [],
    reloadAfterSave: true
  },
  buildGridConfig: buildGridConfig,
  defaultValue: getDefaultValue
});

// 그리드 컬럼 설정
function buildGridConfig(state) {
  return {
    defaultUnit: '%',
    columns: [
      {
        field: 'userId',
        caption: '사용자ID',
        colType: 'STR|C|NN|M',
        width: 15
      },
      {
        field: 'userName',
        caption: '사용자명',
        colType: 'STR|L|NN|M',
        width: 20
      },
      {
        field: 'email',
        caption: '이메일',
        colType: 'STR|L|M',
        width: 25
      },
      {
        field: 'userType',
        caption: '사용자유형',
        colType: 'STR|C|NN|S',
        type: 'combo',
        combo: [
          { value: 'ADMIN', text: '관리자' },
          { value: 'USER', text: '일반사용자' }
        ],
        width: 15
      },
      {
        field: 'useYn',
        caption: '사용여부',
        colType: 'STR|C|NN|XS',
        type: 'combo',
        combo: [
          { value: 'Y', text: 'Y' },
          { value: 'N', text: 'N' }
        ],
        width: 10
      },
      {
        field: 'regDate',
        caption: '등록일',
        colType: 'STR|C|EX',
        width: 15
      }
    ]
  };
}

// 기본값 설정
function getDefaultValue(grid, state) {
  return {
    userId: '',
    userName: '',
    email: '',
    userType: 'USER',
    useYn: 'Y',
    regDate: new Date().toISOString().split('T')[0]
  };
}

// 이벤트 핸들러
function handleSearch(params) {
  console.log('[UserManagement] 조회 실행:', params);
}

function handleGridReady(datagrid) {
  console.log('[UserManagement] 그리드 준비:', datagrid);
}

function handleQuerySuccess({ result, data, params }) {
  console.log('[UserManagement] 조회 성공:', {
    총건수: data.length,
    데이터: data
  });
}

function handleSaveSuccess(result) {
  console.log('[UserManagement] 저장 성공:', result);
}

// 초기화
onMounted(() => {
  console.log('[UserManagement] 페이지 마운트');
});

defineExpose({
  gridRef,
  filterRef,
  gridInstance
});
</script>

<style scoped>
.user-management-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 15px;
  gap: 10px;
  background-color: #f5f5f5;
}
</style>
```

---

## 커스텀 툴박스

### 커스텀 버튼 추가

```javascript
const gridConfig = reactive({
  toolBox: {
    title: '사용자 관리',
    left: [
      // 기본 버튼 앞에 추가
      {
        tool: 'custom',
        position: 'before',
        label: '사용자 가져오기',
        icon: 'import',
        onClick: importUsers
      },
      'append',
      'delete',
      // 기본 버튼 뒤에 추가
      {
        tool: 'custom',
        label: '권한 일괄설정',
        icon: 'settings',
        onClick: bulkSetPermission
      }
    ],
    right: [
      {
        tool: 'custom',
        label: '미리보기',
        icon: 'eye',
        onClick: preview,
        position: 'before'
      },
      'save',
      'excel'
    ]
  },
  // ... 나머지 설정
});

function importUsers() {
  console.log('사용자 가져오기');
}

function bulkSetPermission() {
  console.log('권한 일괄설정');
}

function preview() {
  const data = gridRef.value.getData();
  console.log('미리보기:', data);
}
```

### 툴박스 숨김

```javascript
const gridConfig = reactive({
  toolBox: false,  // 툴박스 완전히 숨김
  // 또는
  toolBox: {
    left: [],   // 왼쪽 버튼 없음
    right: []   // 오른쪽 버튼 없음
  }
});
```

---

## 동적 컬럼 설정

### 조건부 컬럼 표시

```javascript
const isAdmin = ref(true);

function buildGridConfig(state) {
  const columns = [
    { field: 'userId', caption: '사용자ID', colType: 'STR|C|NN|M' },
    { field: 'userName', caption: '사용자명', colType: 'STR|L|NN|M' },
  ];

  // 관리자인 경우에만 추가 컬럼 표시
  if (isAdmin.value) {
    columns.push(
      { field: 'password', caption: '비밀번호', colType: 'STR|H|M' },
      { field: 'lastLoginIp', caption: '마지막로그인IP', colType: 'STR|C|M' }
    );
  }

  columns.push(
    { field: 'regDate', caption: '등록일', colType: 'STR|C|EX' }
  );

  return {
    defaultUnit: '%',
    columns
  };
}
```

### 콤보 데이터 동적 로딩

```javascript
const departmentOptions = ref([]);

onMounted(async () => {
  // 부서 목록 로드
  try {
    const result = await fetch('/api/departments').then(r => r.json());
    departmentOptions.value = result.map(dept => ({
      value: dept.deptCode,
      text: dept.deptName
    }));

    // 필터 필드 업데이트
    const deptField = filterConfig.fields.find(f => f.field === 'deptCode');
    if (deptField) {
      deptField.options = departmentOptions.value;
    }
  } catch (error) {
    console.error('부서 목록 로드 실패:', error);
  }
});

function buildGridConfig(state) {
  return {
    columns: [
      // ...
      {
        field: 'deptCode',
        caption: '부서',
        colType: 'STR|C|NN|M',
        type: 'combo',
        combo: departmentOptions.value
      }
    ]
  };
}
```

---

## 이벤트 처리

### 행 클릭 이벤트

```vue
<template>
  <CtvDataGrid
    ref="gridRef"
    grid-id="grid1"
    :config="gridConfig"
    @row-click="handleRowClick"
    @row-dblclick="handleRowDblClick"
  />
</template>

<script setup>
function handleRowClick(rowData) {
  console.log('행 클릭:', rowData);
  // 상세 정보 패널 업데이트 등
}

function handleRowDblClick(rowData) {
  console.log('행 더블클릭:', rowData);
  // 상세 페이지로 이동 또는 모달 열기
  openDetailModal(rowData);
}

function openDetailModal(data) {
  // 모달 오픈 로직
}
</script>
```

### 저장 전/후 처리

```javascript
const gridConfig = reactive({
  saveQuery: {
    path: 'User.ashx',
    funcNm: 'UfnSave',
    bParam: [],

    // 값 검증
    onValueCheck: (field, value, row) => {
      if (field === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return '올바른 이메일 형식이 아닙니다.';
        }
      }

      if (field === 'userId' && value.length < 4) {
        return '사용자ID는 4자 이상이어야 합니다.';
      }

      return null;  // 검증 통과
    },

    // 값 변환
    onValueConvert: (field, value) => {
      // 작은따옴표 처리
      if (typeof value === 'string') {
        return value.replace(/'/g, "′");
      }
      return value;
    },

    // 저장 성공 시
    onSuccess: async (result, context) => {
      console.log('저장 성공:', result);
      // 추가 작업 수행
      await sendNotification('사용자 정보가 업데이트되었습니다.');
    },

    // 저장 실패 시
    onError: (error, context) => {
      console.error('저장 실패:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  }
});

async function sendNotification(message) {
  // 알림 전송 로직
}
```

### 필터 변경 시 자동 조회

```javascript
const filterConfig = reactive({
  columns: 3,
  fields: [
    {
      field: 'category',
      title: '카테고리',
      type: 'select',
      autoQuery: true,  // 변경 즉시 조회
      options: [
        { value: '', text: '전체' },
        { value: 'A', text: '카테고리A' },
        { value: 'B', text: '카테고리B' }
      ]
    },
    {
      field: 'searchText',
      title: '검색어',
      type: 'input',
      placeholder: '검색어 입력 후 Enter'
      // autoQuery 없으면 Enter 키로만 조회
    }
  ]
});
```

### 그리드 설정 메뉴

```javascript
const gridConfig = reactive({
  settingMenuItems: [
    {
      type: 'switch',
      title: '그룹 표시',
      name: 'showGroup',
      value: 'group',
      checked: false,
      onChange: (checked) => {
        if (!gridRef.value?.datagrid) return;

        if (checked) {
          SBGrid3.setGroup(gridRef.value.datagrid, [
            { field: "category", isOpen: true }
          ]);
        } else {
          SBGrid3.setGroup(gridRef.value.datagrid, []);
        }
      }
    },
    {
      type: 'check',
      title: '삭제된 항목 표시',
      name: 'showDeleted',
      checked: false,
      onChange: (checked) => {
        if (!gridRef.value?.datagrid) return;

        SBGrid3.setHideDeleted(gridRef.value.datagrid, !checked);
      }
    },
    {
      type: 'check',
      title: '활성 항목만',
      name: 'activeOnly',
      checked: false,
      onChange: (checked) => {
        if (!gridRef.value?.datagrid) return;

        if (checked) {
          SBGrid3.setFilter(gridRef.value.datagrid, 'useYn', {
            field: 'useYn',
            operator: 'IsEqualTo',
            values: 'Y'
          });
        } else {
          SBGrid3.setFilter(gridRef.value.datagrid, 'useYn');
        }
      }
    }
  ]
});
```

---

## 프로그래매틱 제어

### ref를 통한 그리드 제어

```javascript
const gridRef = ref(null);

// 조회
async function search() {
  const params = {
    searchText: 'test',
    category: 'A'
  };
  await gridRef.value.query(params);
}

// 저장
async function save() {
  const result = await gridRef.value.save();
  if (result) {
    console.log('저장 완료');
  }
}

// 데이터 설정
function setGridData() {
  const data = [
    { id: 1, name: 'User1', email: 'user1@example.com' },
    { id: 2, name: 'User2', email: 'user2@example.com' }
  ];
  gridRef.value.setData(data);
}

// 데이터 가져오기
function getGridData() {
  const data = gridRef.value.getData();
  console.log('현재 그리드 데이터:', data);
  return data;
}

// 재조회
async function reload() {
  await gridRef.value.reloadData();
}

// SBGrid3 직접 접근
function directAccess() {
  const datagrid = gridRef.value.datagrid;
  if (datagrid) {
    // SBGrid3 API 직접 사용
    const focusedRow = SBGrid3.getFocusedValue(datagrid);
    console.log('포커스된 행:', focusedRow);
  }
}
```

### 필터 제어

```javascript
const filterRef = ref(null);

// 검색 실행
function executeSearch() {
  filterRef.value.handleSearch();
}

// 필터 초기화
function resetFilter() {
  filterRef.value.handleReset();
}

// 필터 데이터 가져오기
function getFilterData() {
  const data = filterRef.value.getData();
  console.log('현재 필터 조건:', data);
  return data;
}
```

---

## 고급 사용법

### 마스터-디테일 그리드

```vue
<template>
  <div class="master-detail-page">
    <div class="master-section">
      <h3>주문 목록</h3>
      <CtvDataGrid
        ref="masterGridRef"
        grid-id="masterGrid"
        :config="masterGridConfig"
        @row-click="handleMasterRowClick"
      />
    </div>

    <div class="detail-section">
      <h3>주문 상세</h3>
      <CtvDataGrid
        ref="detailGridRef"
        grid-id="detailGrid"
        :config="detailGridConfig"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';

const masterGridRef = ref(null);
const detailGridRef = ref(null);
const selectedOrderId = ref(null);

const masterGridConfig = reactive({
  dataQuery: {
    path: 'Order.ashx',
    funcNm: 'GetOrders',
    bParam: []
  },
  buildGridConfig: () => ({
    columns: [
      { field: 'orderId', caption: '주문ID', colType: 'STR|C|NN|M' },
      { field: 'orderDate', caption: '주문일', colType: 'STR|C|M' },
      { field: 'customerName', caption: '고객명', colType: 'STR|L|M' }
    ]
  })
});

const detailGridConfig = reactive({
  dataQuery: {
    path: 'Order.ashx',
    funcNm: 'GetOrderDetails',
    bParam: () => [selectedOrderId.value]
  },
  autoLoad: false,  // 수동 로드
  buildGridConfig: () => ({
    columns: [
      { field: 'productName', caption: '상품명', colType: 'STR|L|NN|M' },
      { field: 'quantity', caption: '수량', colType: 'NUM|C|M' },
      { field: 'price', caption: '단가', colType: 'NUM|C|M' }
    ]
  })
});

async function handleMasterRowClick(rowData) {
  selectedOrderId.value = rowData.orderId;
  await detailGridRef.value.query();
}
</script>

<style scoped>
.master-detail-page {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  height: 100%;
  padding: 15px;
}

.master-section,
.detail-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
```

---

## 참고 자료

- [마이그레이션 가이드](./MIGRATION_GUIDE.md)
- [컴포넌트 API 문서](./COMPONENTS.md)
- [SBGrid3 공식 문서](https://www.sbgrid.net)
