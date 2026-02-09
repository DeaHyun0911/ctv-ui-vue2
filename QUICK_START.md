# CTV UI Vue - 빠른 시작 가이드

**5분 안에 시작하기** 🚀

---

## 핵심 개념

✨ **사용자는 바닐라 JS 코드를 그대로 사용하고, 내부만 Vue로 동작합니다!**

```
기존 코드 수정 없음 → 스크립트 파일만 교체 → 완료!
```

---

## 1단계: 라이브러리 포함

### 기존 (바닐라 버전)
```html
<link rel="stylesheet" href="/ctv-ui/ctv-ui.css">
<script src="/ctv-ui/ctv-DataGrid.js"></script>
<script src="/ctv-ui/ctv-QueryFilter.js"></script>
```

### 변경 후 (Vue 버전)
```html
<link rel="stylesheet" href="/dist/ctv-ui-vue.css">
<script src="/dist/ctv-ui-vue.js"></script>
```

**끝!** JavaScript 코드는 수정하지 않습니다.

---

## 2단계: 코드 작성 (기존과 동일)

### HTML

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>샘플 페이지</title>

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
        <!-- 조회 필터 -->
        <div id="queryFilter"></div>

        <!-- 데이터 그리드 -->
        <div id="grid1"></div>
    </div>

    <script src="my-page.js"></script>
    <script>
        window.onload = () => MyPage.init();
    </script>
</body>
</html>
```

### JavaScript

```javascript
const MyPage = (function () {

    let _filter = null;
    let _grid = null;

    /**
     * 필터 설정
     */
    function setFilter() {
        return {
            container: '#queryFilter',
            columns: 3,
            fields: [
                {
                    field: 'searchText',
                    title: '검색어',
                    type: 'input',
                    placeholder: '검색어 입력'
                },
                {
                    field: 'category',
                    title: '카테고리',
                    type: 'select',
                    options: [
                        { value: '', text: '전체' },
                        { value: 'A', text: 'Category A' },
                        { value: 'B', text: 'Category B' }
                    ]
                }
            ],
            onSearch: (params) => {
                console.log('조회 조건:', params);
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
                path: 'api/data.ashx',
                funcNm: 'UfnQuery',
                bParam: (queryData) => [
                    queryData.searchText || '',
                    queryData.category || ''
                ]
            },
            saveQuery: {
                path: 'api/data.ashx',
                funcNm: 'UfnSave',
                bParam: []
            },
            buildGridConfig: buildGridCols,
            onGridReady: (datagrid) => {
                console.log('그리드 준비 완료');
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
                    field: 'id',
                    caption: 'ID',
                    colType: 'STR|C|NN|S',
                    width: 10
                },
                {
                    field: 'name',
                    caption: '이름',
                    colType: 'STR|L|NN|M',
                    width: 30
                },
                {
                    field: 'category',
                    caption: '카테고리',
                    colType: 'STR|C|M',
                    type: 'combo',
                    combo: [
                        { value: 'A', text: 'Category A' },
                        { value: 'B', text: 'Category B' }
                    ],
                    width: 20
                },
                {
                    field: 'description',
                    caption: '설명',
                    colType: 'STR|L|XL',
                    width: 40
                }
            ]
        };
    }

    /**
     * 초기화
     */
    async function init() {
        // 필터 생성
        _filter = new CtvQueryFilter(setFilter());

        // 그리드 생성
        _grid = new CtvDataGrid(setGrid());

        console.log('페이지 초기화 완료');
    }

    return {
        init,
        get filter() { return _filter; },
        get grid() { return _grid; }
    };

})();
```

---

## 3단계: 테스트

브라우저에서 HTML 파일을 열거나 웹 서버를 실행합니다.

```bash
# 간단한 로컬 서버 실행 (Python)
python -m http.server 8000

# 또는 Node.js
npx serve .
```

`http://localhost:8000/your-page.html` 접속!

---

## 자주 사용하는 패턴

### 패턴 1: 필터 + 그리드 연동

```javascript
function setFilter() {
    return {
        container: '#queryFilter',
        fields: [...],
        onSearch: (params) => {
            // 필터에서 조회 버튼 클릭 시 그리드 조회
            _grid.query(params);
        }
    };
}
```

### 패턴 2: 데이터 로드 후 처리

```javascript
function setGrid() {
    return {
        container: '#grid1',
        dataQuery: { ... },
        onDataLoaded: (data, result) => {
            console.log(`${data.length}건 로드됨`);
            // 추가 처리...
        }
    };
}
```

### 패턴 3: 저장 성공 후 처리

```javascript
function setGrid() {
    return {
        container: '#grid1',
        saveQuery: {
            path: 'api/save.ashx',
            funcNm: 'UfnSave',
            bParam: [],
            onSuccess: (result) => {
                console.log('저장 완료!');
                alert('저장되었습니다.');
            }
        }
    };
}
```

### 패턴 4: SBGrid3 직접 제어

```javascript
async function init() {
    _grid = new CtvDataGrid(setGrid());

    // SBGrid3 API 직접 사용
    setTimeout(() => {
        const datagrid = _grid.datagrid;

        // 그룹핑 설정
        SBGrid3.setGroup(datagrid, [{ field: 'category', isOpen: true }]);

        // 필터 설정
        SBGrid3.setFilter(datagrid, 'category', {
            field: 'category',
            operator: 'IsEqualTo',
            values: 'A'
        });
    }, 1000);
}
```

---

## 트러블슈팅

### ❌ 필터가 표시되지 않아요

**원인:** 컨테이너가 없거나 스크립트 로드 순서 문제

**해결:**
```javascript
// DOMContentLoaded 사용
document.addEventListener('DOMContentLoaded', () => {
    MyPage.init();
});

// 또는 window.onload
window.onload = () => MyPage.init();
```

### ❌ 그리드가 표시되지 않아요

**원인:** SBGrid3 라이브러리 미로드 또는 buildGridConfig 누락

**해결:**
```html
<!-- SBGrid3 먼저 로드 -->
<script src="/path/to/sbgrid3.js"></script>

<!-- 그 다음 CTV UI Vue -->
<script src="/dist/ctv-ui-vue.js"></script>
```

```javascript
// buildGridConfig 반드시 columns 반환
function buildGridConfig(state) {
    return {
        columns: [...]  // 필수!
    };
}
```

### ❌ 콤보 데이터가 안 보여요

**원인:** comboIndex 사용 시 전역 변수 미로드

**해결:**
```javascript
// 방법 1: comboIndex 사용
await CtvPageUtils.loadComboData(CONFIG.comboParams);
// 이후 gGridComboData[index] 사용 가능

// 방법 2: 직접 options 지정
{
    field: 'category',
    type: 'select',
    options: [
        { value: 'A', text: 'Category A' },
        { value: 'B', text: 'Category B' }
    ]
}
```

---

## 다음 단계

- 📖 [래퍼 API 전체 문서](./docs/WRAPPER_API.md) - 모든 API 메서드
- 💡 [사용 예시](./docs/USAGE_EXAMPLES.md) - 다양한 시나리오
- 🏗️ [아키텍처](./docs/ARCHITECTURE.md) - 내부 구조 이해

---

## 도움이 필요하신가요?

- **GitHub Issues**: [프로젝트 이슈](https://github.com/your-repo/issues)
- **내부 문의**: CTV 개발팀

---

**즐거운 코딩 되세요! 🎉**

_CTV Development Team_
