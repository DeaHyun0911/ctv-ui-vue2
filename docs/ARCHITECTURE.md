# CTV UI Vue - 아키텍처

Vue 기반이지만 바닐라 JS API를 제공하는 하이브리드 아키텍처입니다.

## 전체 구조

```
┌─────────────────────────────────────────────────────────────┐
│                     사용자 코드 (HTML + JS)                    │
│  - 기존 바닐라 JS 방식 그대로 사용                               │
│  - new CtvDataGrid(), new CtvQueryFilter()                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Wrapper 클래스 (Bridge Layer)                │
│  - CtvDataGridWrapper.js                                    │
│  - CtvQueryFilterWrapper.js                                 │
│  - 바닐라 JS API → Vue 컴포넌트로 변환                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Vue 컴포넌트 (Core Layer)                   │
│  - CtvDataGrid.vue                                          │
│  - CtvQueryFilter.vue                                       │
│  - 반응형 상태 관리 및 렌더링                                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    외부 라이브러리 (3rd Party)                  │
│  - SBGrid3 (데이터 그리드)                                     │
│  - 기타 유틸리티                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 디렉토리 구조

```
ctv-ui-vue2/
│
├── src/
│   ├── index.js                     # 진입점 (UMD 번들링)
│   │
│   ├── wrappers/                    # 🔑 래퍼 레이어
│   │   ├── CtvDataGridWrapper.js   # 그리드 래퍼
│   │   └── CtvQueryFilterWrapper.js # 필터 래퍼
│   │
│   ├── components/                  # Vue 컴포넌트
│   │   ├── core/                    # 핵심 컴포넌트
│   │   │   ├── CtvDataGrid.vue     # 데이터 그리드
│   │   │   ├── CtvQueryFilter.vue  # 조회 필터
│   │   │   ├── CtvToolBox.vue      # 툴박스
│   │   │   └── CtvModal.vue        # 모달
│   │   │
│   │   └── base/                    # 기본 UI 컴포넌트
│   │       ├── CtvButton.vue
│   │       ├── CtvInput.vue
│   │       └── CtvSelect.vue
│   │
│   ├── services/                    # 서비스 레이어
│   │   └── CtvDataService.js       # API 통신
│   │
│   ├── utils/                       # 유틸리티
│   │   └── CtvGridUtils.js         # 그리드 유틸
│   │
│   └── styles/                      # 스타일
│       └── main.css
│
├── sample/                          # 사용 예시
│   ├── Bpa100n-vue.html            # HTML (사용자가 작성)
│   └── Bpa100n-vue.js              # JS (바닐라 방식)
│
├── docs/                            # 문서
│   ├── WRAPPER_API.md              # 래퍼 API 가이드
│   ├── MIGRATION_GUIDE.md          # 마이그레이션 가이드
│   ├── USAGE_EXAMPLES.md           # 사용 예시
│   └── ARCHITECTURE.md             # 이 문서
│
└── dist/                            # 빌드 결과물
    ├── ctv-ui-vue.js               # UMD 번들
    ├── ctv-ui-vue.esm.js           # ES Module
    └── ctv-ui-vue.css              # 스타일시트
```

---

## 데이터 흐름

### 1. 초기화 과정

```
사용자 코드
  const grid = new CtvDataGrid({ container: '#grid1', ... })
                      ↓
CtvDataGridWrapper
  - document.querySelector('#grid1') - 컨테이너 찾기
  - createApp({ CtvDataGridComponent }) - Vue 앱 생성
  - app.mount(container) - 마운트
                      ↓
CtvDataGrid.vue
  - SBGrid3.createGrid(config) - 그리드 생성
  - emit('ready', datagrid) - 준비 완료 이벤트
                      ↓
CtvDataGridWrapper
  - wrapper.datagrid = datagrid - 인스턴스 저장
  - config.onGridReady(datagrid) - 콜백 호출
```

### 2. 조회 과정

```
사용자 코드
  await grid.query({ searchText: 'test' })
                      ↓
CtvDataGridWrapper
  - componentInstance.query(params) - Vue 컴포넌트 메서드 호출
                      ↓
CtvDataGrid.vue (query 메서드)
  - bParam = config.bParam(params) - 파라미터 생성
  - CtvDataService.query(queryConfig, params) - API 호출
                      ↓
CtvDataService.js
  - ufnXhrDotNetCaller04(path, funcNm, bParam) - 실제 API 호출
  - result = 서버 응답
                      ↓
CtvDataGrid.vue
  - SBGrid3.setClientData(datagrid, data) - 그리드에 데이터 설정
  - emit('query-success', { result, data }) - 이벤트 발생
                      ↓
사용자 코드
  - config.onDataLoaded(data, result) - 콜백 실행
```

### 3. 저장 과정

```
사용자 코드
  await grid.save()
                      ↓
CtvDataGridWrapper
  - componentInstance.save() - Vue 컴포넌트 메서드 호출
                      ↓
CtvDataGrid.vue (save 메서드)
  - SBGrid3.findInvalid(datagrid) - 유효성 검증
  - SBGrid3.getSaveData(datagrid) - 변경된 데이터 가져오기
  - buildSaveSchema(columns) - 저장 스키마 생성
  - processRows(insertedData, updatedData, deletedData) - 데이터 가공
                      ↓
CtvDataService.js
  - ufnXhrDotNetCaller04(path, funcNm, bParam, aSaveData) - API 호출
  - result = 서버 응답
                      ↓
CtvDataGrid.vue
  - SBGrid3.clearSaveData(datagrid) - 저장 상태 클리어
  - reloadData() - 재조회 (옵션)
  - emit('save-success', result) - 이벤트 발생
                      ↓
사용자 코드
  - config.saveQuery.onSuccess(result) - 콜백 실행
```

---

## 핵심 컴포넌트 상세

### CtvDataGridWrapper

**역할:** 바닐라 JS API를 Vue 컴포넌트로 브릿지

**주요 메서드:**
- `constructor(config)` - 초기화 및 Vue 앱 생성
- `query(params)` - 조회 (Vue 컴포넌트 메서드 위임)
- `save()` - 저장
- `setData(data)` - 데이터 설정
- `getData()` - 데이터 가져오기
- `destroy()` - 파괴

**내부 구조:**
```javascript
class CtvDataGrid {
    constructor(config) {
        this.config = config;
        this.container = document.querySelector(config.container);
        this.app = createApp({ /* Vue 앱 정의 */ });
        this.app.mount(this.container);
    }

    async query(params) {
        // Vue 컴포넌트 인스턴스 메서드 호출
        return await this.componentInstance.query(params);
    }

    get datagrid() {
        // SBGrid3 인스턴스 직접 접근 제공
        return this._datagrid;
    }
}
```

### CtvDataGrid.vue

**역할:** 실제 그리드 렌더링 및 로직

**템플릿:**
```vue
<template>
  <div class="ctv-data-grid">
    <CtvToolBox v-if="config.toolBox" ... />
    <div class="ctv-grid-content" ref="gridContent"></div>
  </div>
</template>
```

**Script:**
```vue
<script setup>
import { ref, onMounted } from 'vue';

const datagrid = ref(null);

async function initGrid() {
  datagrid.value = SBGrid3.createGrid(sbGridConfig);
  emit('ready', datagrid.value);
}

async function query(params) {
  const result = await CtvDataService.query(queryConfig, params);
  setData(result.data);
  emit('query-success', { result, data });
}

onMounted(() => {
  initGrid();
});

defineExpose({ query, save, setData, getData, datagrid });
</script>
```

---

## 빌드 프로세스

### Vite 설정

```javascript
// vite.config.js
export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: 'src/index.js',
      name: 'CtvUI',
      formats: ['umd', 'es']  // UMD + ES Module
    },
    rollupOptions: {
      external: [],  // Vue를 번들에 포함
      output: {
        globals: { vue: 'Vue' }
      }
    }
  }
});
```

### 빌드 흐름

```
src/index.js
    ↓
Vite + Rollup
    ↓ (번들링)
dist/ctv-ui-vue.js (UMD)
    - Vue 포함
    - window.CtvDataGrid
    - window.CtvQueryFilter
    ↓ (최적화)
dist/ctv-ui-vue.esm.js (ES Module)
    - import { CtvDataGrid } from 'ctv-ui-vue'
```

---

## 호환성 매트릭스

| 기능 | 바닐라 JS 버전 | Vue 래퍼 버전 | 호환성 |
|------|---------------|--------------|--------|
| 생성자 API | ✅ | ✅ | 100% |
| 메서드 API | ✅ | ✅ | 100% |
| 이벤트 콜백 | ✅ | ✅ | 100% |
| SBGrid3 접근 | ✅ | ✅ | 100% |
| 콤보 데이터 | ✅ | ✅ | 100% |
| 툴박스 커스터마이징 | ✅ | ✅ | 100% |

---

## 성능 최적화

### 1. 번들 크기 최적화

- **Tree Shaking**: 사용하지 않는 컴포넌트 제거
- **Code Splitting**: 큰 컴포넌트는 동적 import
- **Minification**: 프로덕션 빌드 시 압축

### 2. 런타임 최적화

- **가상 DOM**: Vue의 효율적인 DOM 업데이트
- **Reactive Caching**: 불필요한 재계산 방지
- **Event Delegation**: 이벤트 핸들러 최적화

### 3. 로딩 최적화

- **Lazy Loading**: 모달, 다이얼로그 등은 필요할 때만 로드
- **Async Components**: 대형 컴포넌트는 비동기 로드

---

## 확장성

### 새로운 컴포넌트 추가

1. Vue 컴포넌트 작성 (`src/components/core/NewComponent.vue`)
2. 래퍼 클래스 작성 (`src/wrappers/NewComponentWrapper.js`)
3. 진입점에 export 추가 (`src/index.js`)

```javascript
// src/wrappers/NewComponentWrapper.js
import { createApp } from 'vue';
import NewComponent from '@/components/core/NewComponent.vue';

class CtvNewComponent {
    constructor(config) {
        this.app = createApp({ /* ... */ });
        this.app.mount(config.container);
    }

    someMethod() {
        return this.componentInstance.someMethod();
    }
}

export default CtvNewComponent;
```

### 플러그인 시스템 (향후 계획)

```javascript
// 플러그인 등록
CtvUI.use({
    install(app, options) {
        app.component('CustomComponent', CustomComponent);
    }
});
```

---

## 테스트 전략

### 단위 테스트
- Vue 컴포넌트: `@vue/test-utils`
- 래퍼 클래스: Jest + JSDOM

### 통합 테스트
- 전체 플로우: Cypress / Playwright

### E2E 테스트
- 실제 브라우저 환경: Selenium

---

## 디버깅

### 개발자 도구

```javascript
// 전역 디버그 모드
window.__CTV_DEBUG__ = true;

// 래퍼 인스턴스 접근
const grid = new CtvDataGrid({ ... });
console.log(grid.datagrid);           // SBGrid3 인스턴스
console.log(grid.componentInstance);  // Vue 컴포넌트 인스턴스
console.log(grid.app);                // Vue 앱 인스턴스
```

### Vue Devtools

Vue 3 Devtools에서 컴포넌트 트리, 상태, 이벤트를 실시간으로 확인할 수 있습니다.

---

## 보안 고려사항

### XSS 방지
- Vue의 자동 이스케이프 활용
- `v-html` 사용 시 sanitize 필수

### CSRF 방지
- API 호출 시 토큰 포함
- Same-Origin Policy 준수

### 데이터 유효성 검증
- 서버 측 검증 필수
- 클라이언트 측은 UX 개선용

---

## 향후 계획

- [ ] Vue 3 마이그레이션 (선택적)
- [ ] TypeScript 지원
- [ ] 플러그인 시스템
- [ ] 테마 커스터마이징
- [ ] 접근성(A11y) 개선
- [ ] 국제화(i18n) 지원

---

**CTV Development Team**
