<template>
  <div class="ctv-query-filter" :style="gridStyle">
    <template v-for="(field, index) in config.fields" :key="field.field || index">
        <!-- Divider -->
        <div 
            v-if="field.type === 'divider'" 
            class="ctv-query-filter-divider"
            :style="getDividerStyle(field)"
        ></div>

        <!-- Field -->
        <div 
            v-else 
            class="ctv-filter-item"
            :style="getFieldStyle(field)"
        >
            <label v-if="field.title" class="ctv-filter-label" :style="{ width: labelWidth }">{{ field.title }}</label>
            <div class="ctv-filter-input-wrapper">
                <!-- Select -->
                <select 
                    v-if="field.type === 'select'"
                    v-model="formData[field.field]"
                    :disabled="field.disabled"
                    @change="handleChange(field)"
                    class="ctv-form-control"
                >
                    <option v-if="field.placeholder" value="">{{ field.placeholder }}</option>
                    <option v-for="opt in getOptions(field)" :key="opt.value" :value="opt.value">
                        {{ opt.text }}
                    </option>
                </select>

                <!-- Checkbox -->
                <input 
                    v-else-if="field.type === 'check'"
                    type="checkbox"
                    v-model="formData[field.field]"
                    :disabled="field.disabled"
                    @change="handleChange(field)"
                />

                <!-- Date (Simple Input for now) -->
                <input 
                    v-else-if="field.type === 'date'"
                    type="date"
                    v-model="formData[field.field]"
                    :disabled="field.disabled"
                    @change="handleChange(field)"
                    class="ctv-form-control"
                />

                <!-- Text / Default -->
                <input 
                    v-else
                    type="text"
                    v-model="formData[field.field]"
                    :placeholder="field.placeholder"
                    :disabled="field.disabled"
                    @keydown.enter.prevent="handleSearch"
                    @change="handleChange(field)"
                    class="ctv-form-control"
                />
            </div>
        </div>
    </template>
    
    <!-- Buttons (if internal) -->
    <div class="ctv-filter-buttons" v-if="config.buttons !== false">
        <button class="ctv-btn ctv-btn-primary" @click="handleSearch">조회</button>
        <button class="ctv-btn ctv-btn-outline" @click="handleReset">초기화</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue';

const props = defineProps({
  config: {
    type: Object,
    default: () => ({ fields: [], columns: 4 })
  },
  gridInstance: {
    type: Object, // Optional direct link to grid
    default: null
  }
});

const emit = defineEmits(['search', 'reset', 'change']);

const formData = reactive({});
const labelWidth = computed(() => props.config.labelWidth || '100px');

const gridStyle = computed(() => {
    const cols = props.config.columns || 4;
    return {
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: props.config.gap || '5px 10px',
        alignItems: 'center'
    };
});

const getFieldStyle = (field) => {
    const span = field.span || 1;
    return {
        gridColumn: `span ${span}`,
        display: 'flex',
        alignItems: 'center'
    };
};

const getDividerStyle = (field) => {
    return {
        gridColumn: '1 / -1',
        height: '1px',
        backgroundColor: '#e5e7eb',
        margin: '10px 0'
    };
};

const getOptions = (field) => {
    // Basic option handling
    if (Array.isArray(field.options)) return field.options;
    // TODO: Support comboData lookup from global/config
    return [];
};

const handleChange = (field) => {
    emit('change', formData);
    if (field.autoQuery) {
        handleSearch();
    }
};

const handleSearch = () => {
    const params = { ...formData };
    emit('search', params);
    
    if (props.gridInstance && props.gridInstance.query) {
        props.gridInstance.query(params);
    }
};

const handleReset = () => {
    // Reset formData to initial values
    // For now simple reset
    Object.keys(formData).forEach(key => formData[key] = '');
    emit('reset');
};

// Initialize formData
onMounted(() => {
    if (props.config.fields) {
        props.config.fields.forEach(field => {
            if (field.field) {
                formData[field.field] = field.value !== undefined ? field.value : '';
            }
        });
    }
});

defineExpose({
    getData: () => ({ ...formData }),
    handleSearch,
    handleReset
});

</script>

<style scoped>
.ctv-query-filter {
    padding: 10px;
    background: #fff;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    margin-bottom: 10px;
}
.ctv-filter-item {
    min-height: 32px;
}
.ctv-filter-label {
    font-weight: 500;
    margin-right: 10px;
    text-align: right;
    font-size: 13px;
    color: #333;
}
.ctv-filter-input-wrapper {
    flex: 1;
    display: flex;
    align-items: center;
}
.ctv-form-control {
    width: 100%;
    height: 30px;
    padding: 2px 8px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 13px;
}
.ctv-form-control:focus {
    border-color: #80bdff;
    outline: 0;
}
.ctv-filter-buttons {
    grid-column: 1 / -1;
    display: flex;
    justify-content: flex-end;
    gap: 5px;
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid #eee;
}
.ctv-btn {
    padding: 5px 15px;
    font-size: 13px;
    border-radius: 4px;
    cursor: pointer;
}
.ctv-btn-primary {
    background-color: #007bff;
    color: white;
    border: 1px solid #007bff;
}
.ctv-btn-outline {
    background-color: white;
    color: #333;
    border: 1px solid #ccc;
}
</style>
