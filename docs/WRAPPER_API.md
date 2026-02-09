# CTV UI Vue - 래퍼 API 가이드

Vue 기반이지만 **바닐라 JS API를 그대로 사용**할 수 있는 CTV UI 라이브러리입니다.

## 개요

기존 바닐라 JS 코드를 **전혀 수정하지 않고** 그대로 사용하면서, 내부적으로는 Vue의 이점을 누릴 수 있습니다.

### 핵심 원리

```
사용자 코드 (바닐라 JS)
    ↓
Wrapper 클래스 (CtvQueryFilter, CtvDataGrid)
    ↓
Vue 컴포넌트 (내부 구현)
    ↓
DOM 렌더링
```

---

## 설치 및 사용

### 1. 라이브러리 포함 (HTML)

```html
<!DOCTYPE html>
<html>
<head>
    <!-- Vue는 내부적으로 포함되어 있어 별도 로드 불필요 -->

    <!-- CTV UI Vue 라이브러리 -->
    <link rel="stylesheet" href="/dist/ctv-ui-vue.css">
    <script src="/dist/ctv-ui-vue.js"></script>
</head>
<body>
    <div id="queryFilter"></div>
    <div id="grid1"></div>

    <script src="your-page.js"></script>
</body>
</html>
```

### 2. 기존 코드 그대로 사용

```javascript
// 기존 바닐라 JS 코드 - 수정 없이 그대로 동작!
const filter = new CtvQueryFilter({
    container: '#queryFilter',
    columns: 4,
    fields: [
        {
            field: 'searchText',
            title: '검색어',
            type: 'input'
        }
    ]
});

const grid = new CtvDataGrid({
    container: '#grid1',
    dataQuery: {
        path: 'api/data.ashx',
        funcNm: 'UfnQuery',
        bParam: []
    },
    buildGridConfig: () => ({
        columns: [
            { field: 'id', caption: 'ID', colType: 'STR|C|NN|S' }
        ]
    })
});
```

---

## API 참조

### CtvQueryFilter

기존 API와 100% 동일합니다.

#### 생성자

```javascript
const filter = new CtvQueryFilter(config);
```

**Config 구조:**

```javascript
{
    container: string,          // '#queryFilter' (필수)
    columns: number,            // 그리드 컬럼 수 (기본: 4)
    labelWidth: string,         // 레이블 너비 (기본: '100px')
    gap: string,                // 필드 간격 (기본: '5px 10px')
    buttons: boolean,           // 버튼 표시 여부 (기본: true)
    fields: Array<{
        field: string,          // 필드명
        title: string,          // 레이블
        type: 'input' | 'select' | 'date' | 'check',
        placeholder: string,    // placeholder (선택)
        disabled: boolean,      // 비활성화 (선택)
        autoQuery: boolean,     // 변경 시 자동 조회 (선택)
        span: number,           // 컬럼 span (선택)
        comboIndex: number,     // 전역 콤보 데이터 인덱스 (선택)
        options: Array<{value, text}>  // 옵션 배열 (선택)
    }>,
    onSearch: Function,         // 조회 콜백 (params) => {}
    onReset: Function,          // 초기화 콜백 () => {}
    onChange: Function          // 변경 콜백 (formData) => {}
}
```

#### 메서드

```javascript
// 필터 데이터 가져오기
const data = filter.getData();
// 반환: { searchText: 'value', category: 'A', ... }

// 조회 실행
filter.search();

// 초기화
filter.reset();

// 필드 값 설정
filter.setValue('searchText', 'test');

// 필드 값 가져오기
const value = filter.getValue('searchText');

// 파괴
filter.destroy();
```

---

### CtvDataGrid

기존 API와 100% 동일합니다.

#### 생성자

```javascript
const grid = new CtvDataGrid(config);
```

**Config 구조:**

```javascript
{
    container: string,              // '#grid1' (필수)
    id: string,                     // 그리드 고유 ID (선택, 자동 생성됨)

    toolBox: {
        left: Array,                // 왼쪽 버튼 ['append', 'delete', ...]
        right: Array,               // 오른쪽 버튼 ['save', 'excel', ...]
        title: string               // 툴박스 제목
    },

    dataQuery: {
        path: string,               // API 경로
        funcNm: string,             // 함수명
        bParam: Array | Function,   // 파라미터 배열 또는 함수
        dataName: string,           // 데이터 필드명 (기본: 'rsData01')
        autoActive: boolean         // 조회 후 자동 활성화 (기본: true)
    },

    saveQuery: {
        path: string,               // API 경로
        funcNm: string,             // 함수명
        bParam: Array | Function,   // 파라미터 배열 또는 함수
        reloadAfterSave: boolean,   // 저장 후 재조회 (기본: true)
        onValueCheck: Function,     // 값 검증 (field, value, row) => errorMsg
        onValueConvert: Function,   // 값 변환 (field, value) => newValue
        onSuccess: Function,        // 성공 콜백 (result, context) => {}
        onError: Function           // 에러 콜백 (error, context) => {}
    },

    buildGridConfig: Function,      // 그리드 컬럼 생성 (state) => { columns: [...] }
    defaultValue: Function,         // 행 추가 시 기본값 (grid, state) => { ... }
    settingMenuItems: Array,        // 설정 메뉴 항목

    editable: boolean,              // 편집 가능 여부 (기본: true)
    autoLoad: boolean,              // 자동 로드 (기본: true)
    height: string,                 // 그리드 높이
    comboData: Array,               // 콤보 데이터

    onGridReady: Function,          // 그리드 준비 콜백 (datagrid) => {}
    onDataLoaded: Function,         // 데이터 로드 콜백 (data, result) => {}
    onRowClick: Function,           // 행 클릭 콜백 (rowData) => {}
    onRowDblClick: Function         // 행 더블클릭 콜백 (rowData) => {}
}
```

#### 메서드

```javascript
// 조회
await grid.query(params);
await grid.query({ searchText: 'test' });

// 저장
await grid.save();

// 데이터 설정
grid.setData([
    { id: 1, name: 'User1' },
    { id: 2, name: 'User2' }
]);

// 데이터 가져오기
const data = grid.getData();

// 재조회
await grid.reload();

// 행 추가
grid.addRow({ id: 3, name: 'User3' });

// 행 삭제 (인덱스)
grid.deleteRow(0);

// 선택된 행 삭제
grid.deleteSelectedRows();

// SBGrid3 인스턴스 직접 접근
const datagrid = grid.datagrid;
SBGrid3.setGroup(datagrid, [{ field: 'category' }]);

// 툴박스 접근
const toolbox = grid.tool;

// 파괴
grid.destroy();
```

---

## 전체 예시

### HTML

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>사용자 관리</title>

    <!-- CTV UI Vue -->
    <link rel="stylesheet" href="/dist/ctv-ui-vue.css">
    <script src="/dist/ctv-ui-vue.js"></script>

    <style>
        body { margin: 0; padding: 20px; }
        .page { display: flex; flex-direction: column; height: calc(100vh - 40px); gap: 10px; }
    </style>
</head>
<body>
    <div class="page">
        <div id="queryFilter"></div>
        <div id="grid1"></div>
    </div>

    <script src="user-management.js"></script>
    <script>
        window.onload = () => UserManagement.init();
    </script>
</body>
</html>
```

### JavaScript

```javascript
const UserManagement = (function () {

    let _filter = null;
    let _grid = null;

    /**
     * 필터 설정
     */
    function setFilter() {
        return {
            container: '#queryFilter',
            columns: 4,
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
                }
            ],
            onSearch: (params) => {
                console.log('조회:', params);
                _grid.query(params);
            }
        };
    }

    /**
     * 그리드 설정
     */
    function setGrid() {
        return {
            container: '#grid1',
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
                    queryData.useYn || ''
                ]
            },
            saveQuery: {
                path: 'User.ashx',
                funcNm: 'UfnSave',
                bParam: [],
                onSuccess: (result) => {
                    console.log('저장 완료:', result);
                }
            },
            buildGridConfig: buildGridCols,
            defaultValue: getDefaultValue,
            onGridReady: (datagrid) => {
                console.log('그리드 준비:', datagrid);
            },
            onDataLoaded: (data, result) => {
                console.log('데이터 로드:', data.length, '건');
            }
        };
    }

    /**
     * 그리드 컬럼 설정
     */
    function buildGridCols(state) {
        return {
            defaultUnit: '%',
            columns: [
                {
                    field: 'userId',
                    caption: '사용자ID',
                    colType: 'STR|C|NN|M',
                    width: 20
                },
                {
                    field: 'userName',
                    caption: '사용자명',
                    colType: 'STR|L|NN|M',
                    width: 25
                },
                {
                    field: 'email',
                    caption: '이메일',
                    colType: 'STR|L|M',
                    width: 30
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
                }
            ]
        };
    }

    /**
     * 기본값 설정
     */
    function getDefaultValue(grid, state) {
        return {
            userId: '',
            userName: '',
            email: '',
            userType: 'USER',
            useYn: 'Y'
        };
    }

    /**
     * 초기화
     */
    async function init() {
        try {
            // 필터 생성
            _filter = new CtvQueryFilter(setFilter());

            // 그리드 생성
            _grid = new CtvDataGrid(setGrid());

            console.log('페이지 초기화 완료');

        } catch (error) {
            console.error('초기화 중 에러:', error);
        }
    }

    // 공개 API
    return {
        init,
        get filter() { return _filter; },
        get grid() { return _grid; }
    };

})();
```

---

## 마이그레이션 체크리스트

기존 바닐라 JS 코드를 Vue 기반 라이브러리로 전환할 때:

- [x] HTML에서 `ctv-ui.js` → `ctv-ui-vue.js`로 변경
- [x] HTML에서 `ctv-ui.css` → `ctv-ui-vue.css`로 변경
- [x] **JavaScript 코드는 수정 없음!**
- [x] API 호출 방식 동일
- [x] 이벤트 핸들러 동일
- [x] SBGrid3 접근 방식 동일

---

## 성능 및 호환성

### 번들 크기
- **ctv-ui-vue.js**: ~500KB (Vue 포함, gzipped: ~150KB)
- **ctv-ui-vue.css**: ~50KB (gzipped: ~10KB)

### 브라우저 지원
- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+
- IE11 (폴리필 필요)

### Vue 버전
- Vue 2.7.14 (내부 포함, 별도 로드 불필요)

---

## 자주 묻는 질문 (FAQ)

### Q1. 기존 코드를 수정해야 하나요?
**A:** 아니요. HTML에서 스크립트 파일명만 변경하면 됩니다. JavaScript 코드는 그대로 사용 가능합니다.

### Q2. Vue를 따로 로드해야 하나요?
**A:** 아니요. `ctv-ui-vue.js`에 Vue가 내장되어 있습니다.

### Q3. SBGrid3 API를 직접 사용할 수 있나요?
**A:** 네. `grid.datagrid`로 SBGrid3 인스턴스에 접근하여 모든 SBGrid3 API를 사용할 수 있습니다.

### Q4. 성능이 더 좋아지나요?
**A:** Vue의 반응형 시스템과 가상 DOM으로 인해 복잡한 UI 업데이트가 더 효율적입니다. 하지만 그리드 자체는 SBGrid3를 사용하므로 성능은 유사합니다.

### Q5. 디버깅은 어떻게 하나요?
**A:** 개발자 도구의 콘솔에서 동일하게 디버깅할 수 있습니다. `grid.datagrid`, `filter.getData()` 등으로 상태를 확인할 수 있습니다.

---

## 문제 해결

### 문제: 필터가 렌더링되지 않음

```javascript
// 확인 1: 컨테이너 존재 여부
console.log(document.querySelector('#queryFilter')); // null이면 안 됨

// 확인 2: 스크립트 로드 순서
// HTML에서 ctv-ui-vue.js가 먼저 로드되었는지 확인

// 해결: DOMContentLoaded 사용
document.addEventListener('DOMContentLoaded', () => {
    MyPage.init();
});
```

### 문제: 콤보 데이터가 표시되지 않음

```javascript
// comboIndex 사용 시 전역 변수 확인
console.log(window.gGridComboData); // undefined이면 안 됨

// 또는 직접 options 지정
{
    field: 'category',
    type: 'select',
    options: [
        { value: 'A', text: 'Category A' },
        { value: 'B', text: 'Category B' }
    ]
}
```

### 문제: 그리드가 표시되지 않음

```javascript
// 확인: buildGridConfig 함수 반환값
function buildGridConfig(state) {
    return {
        columns: [...] // columns 배열 필수!
    };
}

// 확인: SBGrid3 라이브러리 로드
console.log(typeof SBGrid3); // 'undefined'이면 안 됨
```

---

## 참고 자료

- [마이그레이션 가이드](./MIGRATION_GUIDE.md)
- [사용 예시](./USAGE_EXAMPLES.md)
- [Vue 2 공식 문서](https://v2.vuejs.org/)
- [SBGrid3 공식 문서](https://www.sbgrid.net/)

---

**CTV Development Team**
