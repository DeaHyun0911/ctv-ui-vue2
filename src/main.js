/**
 * CTV UI Vue - Main Entry Point
 * 
 * Vue 컴포넌트들을 전역으로 등록하고, ASP.NET 환경에서 사용할 수 있도록 window 객체에 노출
 * 온프레미스 환경 지원: Vue 런타임을 번들에 포함하여 CDN 없이 사용 가능
 */

import * as Vue from 'vue';
import './styles/main.css';

// Vue를 전역으로 노출 (온프레미스 환경에서 CDN 대체)
if (typeof window !== 'undefined') {
  window.Vue = Vue;
}

// 컴포넌트 Import
import CtvInput from './components/base/CtvInput.vue';
import CtvInputGroup from './components/base/CtvInputGroup.vue';
import CtvSelect from './components/base/CtvSelect.vue';
import CtvDate from './components/base/CtvDate.vue';
import CtvTextarea from './components/base/CtvTextarea.vue';
import CtvCheck from './components/base/CtvCheck.vue';
import CtvSwitch from './components/base/CtvSwitch.vue';
import CtvButton from './components/base/CtvButton.vue';
import CtvStack from './components/base/CtvStack.vue';
import CtvGrid from './components/base/CtvGrid.vue';
import CtvBox from './components/base/CtvBox.vue';
import CtvTabs from './components/base/CtvTabs.vue';
import CtvTab from './components/base/CtvTab.vue';

// Core Components
import CtvDataGrid from './components/core/CtvDataGrid.vue';
import CtvToolBox from './components/core/CtvToolBox.vue';
import CtvQueryFilter from './components/core/CtvQueryFilter.vue';
import CtvFreeForm from './components/core/CtvFreeForm.vue';
import CtvDocViewer from './components/core/CtvDocViewer.vue';

// Services
import CtvDataService from './services/CtvDataService.js';
import CtvModalService, { mountModalContainer } from '@/utils/CtvModalService';
import CtvPageUtils from '@/utils/CtvPageUtils';
import CtvTable from '@/utils/CtvTableClass';

// Mount Modal Container globally
mountModalContainer();

// Expose globally for legacy support
window.CtvModal = CtvModalService;
window.CtvPageUtils = CtvPageUtils;
window.CtvTable = CtvTable;

/**
 * 모든 CTV 컴포넌트를 Vue 앱에 등록하는 헬퍼 함수
 * ASP.NET 페이지에서 사용:
 * const app = createApp({...});
 * CtvUI.registerComponents(app);
 * app.mount('#app');
 */
const registerComponents = (app) => {
  app.component('ctv-input', CtvInput);
  app.component('ctv-input-group', CtvInputGroup);
  app.component('ctv-select', CtvSelect);
  app.component('ctv-date', CtvDate);
  app.component('ctv-textarea', CtvTextarea);
  app.component('ctv-check', CtvCheck);
  app.component('ctv-switch', CtvSwitch);
  app.component('ctv-button', CtvButton);
  app.component('ctv-stack', CtvStack);
  app.component('ctv-grid', CtvGrid);
  app.component('ctv-box', CtvBox);
  app.component('ctv-tabs', CtvTabs);
  app.component('ctv-tab', CtvTab);

  // Core Components Registration
  app.component('ctv-data-grid', CtvDataGrid);
  app.component('ctv-toolbox', CtvToolBox);
  app.component('ctv-query-filter', CtvQueryFilter);
  app.component('ctv-free-form', CtvFreeForm);
  app.component('ctv-doc-viewer', CtvDocViewer);

  // Global Properties
  app.config.globalProperties.$ctvModal = CtvModalService;

  console.log('[CtvUI] 컴포넌트 등록 완료');
  return app;
};

// 전역 객체로 노출
const CtvUI = {
  version: '1.0.0',
  registerComponents,
  CtvDataService
};

if (typeof window !== 'undefined') {
  window.CtvUI = CtvUI;
}

// 개발 모드: 테스트 앱 실행
if (import.meta.env.DEV) {
  const { ref, reactive, createApp } = Vue;

  const app = createApp({
    setup() {
      const form = reactive({
        userId: '',
        userName: '',
        userNameForGroup: '',
        email: ''
      });

      const userList = ref([
        { id: 'user1', name: '홍길동', dept: '인사팀' },
        { id: 'user2', name: '김철수', dept: '개발팀' },
        { id: 'user3', name: '이영희', dept: '영업팀' }
      ]);

      const handleChange = (event) => {
        console.log('Change:', event);
      };

      const handleComboSelect = (event) => {
        console.log('Combo Select:', event);
      };

      return {
        form,
        userList,
        handleChange,
        handleComboSelect
      };
    },
    template: `
      <div style="padding: 20px; max-width: 600px;">
        <h1>CTV UI Vue - 개발 테스트</h1>
        <p style="color: #666;">CtvInput 컴포넌트 테스트 페이지</p>
        
        <hr style="margin: 20px 0;">
        
        <h2>기본 Input</h2>
        <ctv-input 
          v-model="form.userId" 
          label="사용자 ID"
          placeholder="아이디를 입력하세요"
          @change="handleChange"
        />
        <p>입력 값: {{ form.userId }}</p>
        
        <hr style="margin: 20px 0;">
        
        <h2>Required + Validation</h2>
        <ctv-input 
          v-model="form.email" 
          label="이메일"
          placeholder="example@example.com"
          type="email"
          :required="true"
          :validators="['email']"
        />
        <p>입력 값: {{ form.email }}</p>
        
        <hr style="margin: 20px 0;">
        
        <h2>Combo 연관 검색</h2>
        <ctv-input 
          v-model="form.userName" 
          label="사용자 이름"
          placeholder="이름을 입력하세요"
          :combo-items="userList"
          combo-label-key="name"
          combo-value-key="name"
          @combo-select="handleComboSelect"
        />
        <p>입력 값: {{ form.userName }}</p>
        
        <hr style="margin: 20px 0;">

        <h2>Direction: Column</h2>
        <ctv-input
          v-model="form.userId"
          label="사용자 ID"
          direction="column"
        />

        <hr style="margin: 20px 0;">

        <h2>Input Group (여러 입력 필드 그룹화)</h2>
        <ctv-input-group label="사용자 ID/명">
          <ctv-input
            v-model="form.userId"
            placeholder="사용자 ID"
          />
          <ctv-input
            v-model="form.userNameForGroup"
            placeholder="사용자명"
          />
        </ctv-input-group>
        <p>ID: {{ form.userId }}, 이름: {{ form.userNameForGroup }}</p>
      </div>
    `
  });

  registerComponents(app);
  app.mount('#app');
}

export default CtvUI;
export { registerComponents };
