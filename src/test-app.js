/**
 * CTV UI Vue - 컴포넌트 테스트 앱
 * 모든 기본 컴포넌트의 기능을 테스트할 수 있는 예제
 */

import { createApp, ref, reactive, computed } from 'vue';
import './styles/main.css';

// 컴포넌트 Import
import CtvInput from './components/base/CtvInput.vue';
import CtvSelect from './components/base/CtvSelect.vue';
import CtvDate from './components/base/CtvDate.vue';
import CtvTextarea from './components/base/CtvTextarea.vue';
import CtvCheck from './components/base/CtvCheck.vue';
import CtvSwitch from './components/base/CtvSwitch.vue';
import CtvButton from './components/base/CtvButton.vue';

const app = createApp({
    setup() {
        // Form 데이터
        const form = reactive({
            // CtvInput
            username: '',
            email: '',
            password: '',
            phone: '',
            search: '',

            // CtvSelect
            country: '',
            city: '',

            // CtvDate
            birthDate: '',
            startDate: '',
            endDate: '',

            // CtvTextarea
            bio: '',
            message: '',

            // CtvCheck
            agree: false,
            hobbies: [],

            // CtvSwitch
            notifications: false,
            darkMode: false
        });

        // Select Options
        const countries = ref([
            { value: 'kr', label: '대한민국' },
            { value: 'us', label: '미국' },
            { value: 'jp', label: '일본' },
            { value: 'cn', label: '중국' }
        ]);

        const cities = ref([
            { value: 'seoul', label: '서울' },
            { value: 'busan', label: '부산' },
            { value: 'daegu', label: '대구' },
            { value: 'incheon', label: '인천' },
            { value: 'gwangju', label: '광주' },
            { value: 'daejeon', label: '대전' },
            { value: 'ulsan', label: '울산' },
            { value: 'sejong', label: '세종' }
        ]);

        // Combo Items (CtvInput)
        const users = ref([
            { id: 1, name: '홍길동', dept: '개발팀', email: 'hong@example.com' },
            { id: 2, name: '김철수', dept: '디자인팀', email: 'kim@example.com' },
            { id: 3, name: '이영희', dept: '기획팀', email: 'lee@example.com' },
            { id: 4, name: '박민수', dept: '개발팀', email: 'park@example.com' },
            { id: 5, name: '최지수', dept: '마케팅팀', email: 'choi@example.com' }
        ]);

        // Hobbies for checkbox group
        const hobbyOptions = ref([
            { value: 'reading', label: '독서' },
            { value: 'music', label: '음악' },
            { value: 'sports', label: '운동' },
            { value: 'cooking', label: '요리' },
            { value: 'travel', label: '여행' }
        ]);

        // 날짜 범위
        const today = computed(() => {
            return new Date().toISOString().split('T')[0];
        });

        const minDate = computed(() => {
            const date = new Date();
            date.setFullYear(date.getFullYear() - 100);
            return date.toISOString().split('T')[0];
        });

        const maxDate = computed(() => {
            return today.value;
        });

        // Event Handlers
        const handleInputChange = (event) => {
            console.log('Input Change:', event);
        };

        const handleSelectChange = (event) => {
            console.log('Select Change:', event);
        };

        const handleComboSelect = (event) => {
            console.log('Combo Select:', event);
        };

        const handleButtonClick = () => {
            console.log('Button Clicked!');
            alert('버튼이 클릭되었습니다!');
        };

        const handleSubmit = () => {
            console.log('Form Data:', form);
            alert('폼 데이터가 콘솔에 출력되었습니다. (F12)');
        };

        const handleReset = () => {
            Object.keys(form).forEach(key => {
                if (Array.isArray(form[key])) {
                    form[key] = [];
                } else if (typeof form[key] === 'boolean') {
                    form[key] = false;
                } else {
                    form[key] = '';
                }
            });
            alert('폼이 초기화되었습니다.');
        };

        return {
            form,
            countries,
            cities,
            users,
            hobbyOptions,
            today,
            minDate,
            maxDate,
            handleInputChange,
            handleSelectChange,
            handleComboSelect,
            handleButtonClick,
            handleSubmit,
            handleReset
        };
    },
    template: `
        <div style="max-width: 1200px; margin: 0 auto; padding: 40px 20px;">
            <h1 style="text-align: center; color: #333; margin-bottom: 10px;">CTV UI Vue 컴포넌트 테스트</h1>
            <p style="text-align: center; color: #666; margin-bottom: 40px;">모든 기본 컴포넌트의 기능을 테스트할 수 있습니다</p>

            <!-- CtvInput -->
            <section style="margin-bottom: 60px;">
                <h2 style="color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 8px; margin-bottom: 24px;">
                    📝 CtvInput
                </h2>

                <div style="display: grid; gap: 16px;">
                    <ctv-input 
                        v-model="form.username" 
                        label="사용자명"
                        placeholder="이름을 입력하세요"
                        @change="handleInputChange"
                    />

                    <ctv-input 
                        v-model="form.email" 
                        label="이메일"
                        type="email"
                        placeholder="example@example.com"
                        :required="true"
                        :validators="['email']"
                        @change="handleInputChange"
                    />

                    <ctv-input 
                        v-model="form.password" 
                        label="비밀번호"
                        type="password"
                        placeholder="8자 이상"
                        :required="true"
                        :minlength="8"
                        @change="handleInputChange"
                    />

                    <ctv-input 
                        v-model="form.phone" 
                        label="전화번호"
                        placeholder="010-0000-0000"
                        pattern="^[0-9-]+$"
                        pattern-message="숫자와 하이픈만 입력 가능합니다"
                        @change="handleInputChange"
                    />

                    <ctv-input 
                        v-model="form.search" 
                        label="사용자 검색"
                        placeholder="이름 또는 초성 검색 (예: ㅎㄱㄷ)"
                        :combo-items="users"
                        combo-label-key="name"
                        combo-value-key="name"
                        @combo-select="handleComboSelect"
                    />
                </div>
            </section>

            <!-- CtvSelect -->
            <section style="margin-bottom: 60px;">
                <h2 style="color: #28a745; border-bottom: 2px solid #28a745; padding-bottom: 8px; margin-bottom: 24px;">
                    📋 CtvSelect
                </h2>

                <div style="display: grid; gap: 16px;">
                    <ctv-select 
                        v-model="form.country" 
                        label="국가 선택"
                        :items="countries"
                        :searchable="false"
                        @change="handleSelectChange"
                    />

                    <ctv-select 
                        v-model="form.city" 
                        label="도시 선택"
                        placeholder="도시를 선택하세요"
                        :items="cities"
                        :searchable="true"
                        :required="true"
                        @change="handleSelectChange"
                    />
                </div>
            </section>

            <!-- CtvDate -->
            <section style="margin-bottom: 60px;">
                <h2 style="color: #17a2b8; border-bottom: 2px solid #17a2b8; padding-bottom: 8px; margin-bottom: 24px;">
                    📅 CtvDate
                </h2>

                <div style="display: grid; gap: 16px;">
                    <ctv-date 
                        v-model="form.birthDate" 
                        label="생년월일"
                        :min="minDate"
                        :max="today"
                        :required="true"
                    />

                    <ctv-date 
                        v-model="form.startDate" 
                        label="시작일"
                    />

                    <ctv-date 
                        v-model="form.endDate" 
                        label="종료일"
                    />
                </div>
            </section>

            <!-- CtvTextarea -->
            <section style="margin-bottom: 60px;">
                <h2 style="color: #ffc107; border-bottom: 2px solid #ffc107; padding-bottom: 8px; margin-bottom: 24px;">
                    📄 CtvTextarea
                </h2>

                <div style="display: grid; gap: 16px;">
                    <ctv-textarea 
                        v-model="form.bio" 
                        label="자기소개"
                        placeholder="자기소개를 작성하세요"
                        :rows="4"
                        :maxlength="200"
                    />

                    <ctv-textarea 
                        v-model="form.message" 
                        label="메시지"
                        placeholder="메시지를 입력하세요"
                        :rows="6"
                        :required="true"
                        :minlength="10"
                    />
                </div>
            </section>

            <!-- CtvCheck & CtvSwitch -->
            <section style="margin-bottom: 60px;">
                <h2 style="color: #6c757d; border-bottom: 2px solid #6c757d; padding-bottom: 8px; margin-bottom: 24px;">
                    ☑️ CtvCheck & CtvSwitch
                </h2>

                <div style="display: grid; gap: 24px;">
                    <div>
                        <h3 style="font-size: 16px; margin-bottom: 12px;">단일 체크박스</h3>
                        <ctv-check 
                            v-model="form.agree" 
                            label="이용약관에 동의합니다"
                        />
                        <p style="margin-top: 8px; font-size: 14px; color: #666;">
                            상태: {{ form.agree ? '동의함' : '동의하지 않음' }}
                        </p>
                    </div>

                    <div>
                        <h3 style="font-size: 16px; margin-bottom: 12px;">체크박스 그룹</h3>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            <ctv-check 
                                v-for="hobby in hobbyOptions" 
                                :key="hobby.value"
                                v-model="form.hobbies" 
                                :label="hobby.label"
                                :check-value="hobby.value"
                            />
                        </div>
                        <p style="margin-top: 8px; font-size: 14px; color: #666;">
                            선택된 취미: {{ form.hobbies.length > 0 ? form.hobbies.join(', ') : '없음' }}
                        </p>
                    </div>

                    <div>
                        <h3 style="font-size: 16px; margin-bottom: 12px;">토글 스위치</h3>
                        <div style="display: flex; flex-direction: column; gap: 12px;">
                            <ctv-switch 
                                v-model="form.notifications" 
                                label="알림 받기"
                            />
                            <ctv-switch 
                                v-model="form.darkMode" 
                                label="다크 모드"
                            />
                        </div>
                        <p style="margin-top: 8px; font-size: 14px; color: #666;">
                            알림: {{ form.notifications ? 'ON' : 'OFF' }} | 
                            다크모드: {{ form.darkMode ? 'ON' : 'OFF' }}
                        </p>
                    </div>
                </div>
            </section>

            <!-- CtvButton -->
            <section style="margin-bottom: 60px;">
                <h2 style="color: #dc3545; border-bottom: 2px solid #dc3545; padding-bottom: 8px; margin-bottom: 24px;">
                    🔘 CtvButton
                </h2>

                <div style="display: grid; gap: 24px;">
                    <div>
                        <h3 style="font-size: 16px; margin-bottom: 12px;">Variants</h3>
                        <div style="display: flex; flex-wrap: wrap; gap: 12px;">
                            <ctv-button variant="primary" @click="handleButtonClick">Primary</ctv-button>
                            <ctv-button variant="secondary" @click="handleButtonClick">Secondary</ctv-button>
                            <ctv-button variant="success" @click="handleButtonClick">Success</ctv-button>
                            <ctv-button variant="danger" @click="handleButtonClick">Danger</ctv-button>
                            <ctv-button variant="warning" @click="handleButtonClick">Warning</ctv-button>
                            <ctv-button variant="info" @click="handleButtonClick">Info</ctv-button>
                            <ctv-button variant="link" @click="handleButtonClick">Link</ctv-button>
                        </div>
                    </div>

                    <div>
                        <h3 style="font-size: 16px; margin-bottom: 12px;">Outline</h3>
                        <div style="display: flex; flex-wrap: wrap; gap: 12px;">
                            <ctv-button variant="primary" :outline="true" @click="handleButtonClick">Primary</ctv-button>
                            <ctv-button variant="secondary" :outline="true" @click="handleButtonClick">Secondary</ctv-button>
                            <ctv-button variant="success" :outline="true" @click="handleButtonClick">Success</ctv-button>
                            <ctv-button variant="danger" :outline="true" @click="handleButtonClick">Danger</ctv-button>
                        </div>
                    </div>

                    <div>
                        <h3 style="font-size: 16px; margin-bottom: 12px;">Sizes</h3>
                        <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 12px;">
                            <ctv-button size="small" @click="handleButtonClick">Small</ctv-button>
                            <ctv-button size="medium" @click="handleButtonClick">Medium</ctv-button>
                            <ctv-button size="large" @click="handleButtonClick">Large</ctv-button>
                        </div>
                    </div>

                    <div>
                        <h3 style="font-size: 16px; margin-bottom: 12px;">Disabled & Block</h3>
                        <div style="display: grid; gap: 12px;">
                            <ctv-button :disabled="true">Disabled Button</ctv-button>
                            <ctv-button variant="primary" :block="true" @click="handleButtonClick">Block Button</ctv-button>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Form Actions -->
            <section style="margin-bottom: 40px;">
                <h2 style="color: #333; border-bottom: 2px solid #333; padding-bottom: 8px; margin-bottom: 24px;">
                    🎯 Form Actions
                </h2>

                <div style="display: flex; gap: 12px; justify-content: center;">
                    <ctv-button variant="primary" size="large" @click="handleSubmit">
                        Submit (콘솔 확인)
                    </ctv-button>
                    <ctv-button variant="secondary" size="large" @click="handleReset">
                        Reset
                    </ctv-button>
                </div>
            </section>

            <!-- Form Data Display -->
            <section style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                <h3 style="font-size: 16px; margin-bottom: 12px; color: #333;">📊 현재 폼 데이터 (실시간)</h3>
                <pre style="background: #fff; padding: 16px; border-radius: 4px; overflow-x: auto; font-size: 13px; line-height: 1.5;">{{ JSON.stringify(form, null, 2) }}</pre>
            </section>
        </div>
    `
});

// 컴포넌트 등록
app.component('ctv-input', CtvInput);
app.component('ctv-select', CtvSelect);
app.component('ctv-date', CtvDate);
app.component('ctv-textarea', CtvTextarea);
app.component('ctv-check', CtvCheck);
app.component('ctv-switch', CtvSwitch);
app.component('ctv-button', CtvButton);

app.mount('#app');
