<template>
  <div class="ctv-free-form" :id="formId">
    <!-- ToolBox Slot -->
    <slot name="toolbox">
      <CtvToolBox 
        v-if="config.toolBox !== false" 
        :config="config.toolBox"
        :grid-instance="formInstanceProxy"
        @action="handleToolBoxAction"
      />
    </slot>

    <!-- Form Layout -->
    <div class="ctv-form-grid" :style="gridStyle">
        <template v-for="(field, index) in config.fields" :key="field.field || index">
            <!-- Divider -->
            <div 
                v-if="field.type === 'divider'" 
                class="ctv-form-divider"
                :style="getDividerStyle(field)"
            ></div>

            <!-- Field -->
            <div 
                v-else 
                class="ctv-form-item"
                :style="getFieldStyle(field)"
            >
                <label v-if="field.title" class="ctv-form-label" :style="{ width: labelWidth }">
                    <span v-if="field.required" class="required">*</span>
                    {{ field.title }}
                </label>
                <div class="ctv-form-input-wrapper">
                    <!-- Select -->
                    <select 
                        v-if="field.type === 'select'"
                        v-model="modelValue[field.field]"
                        :disabled="isFieldDisabled(field)"
                        @change="handleChange(field)"
                        class="ctv-form-control"
                    >
                        <option v-if="field.placeholder" value="">{{ field.placeholder }}</option>
                        <option v-for="opt in getOptions(field)" :key="opt.value" :value="opt.value">
                            {{ opt.text }}
                        </option>
                    </select>

                    <!-- Checkbox -->
                    <div v-else-if="field.type === 'check'" class="ctv-check-wrapper">
                         <input 
                            type="checkbox"
                            v-model="modelValue[field.field]"
                            :disabled="isFieldDisabled(field)"
                            @change="handleChange(field)"
                        />
                        <span v-if="field.label">{{ field.label }}</span>
                    </div>

                    <!-- Date -->
                    <input 
                        v-else-if="field.type === 'date'"
                        type="date"
                        v-model="modelValue[field.field]"
                        :disabled="isFieldDisabled(field)"
                        @change="handleChange(field)"
                        class="ctv-form-control"
                    />

                    <!-- Textarea -->
                    <textarea
                        v-else-if="field.type === 'textarea'"
                        v-model="modelValue[field.field]"
                        :placeholder="field.placeholder"
                        :disabled="isFieldDisabled(field)"
                        :rows="field.rows || 3"
                        @change="handleChange(field)"
                        class="ctv-form-control"
                    ></textarea>

                    <!-- Text / Default -->
                    <input 
                        v-else
                        type="text"
                        v-model="modelValue[field.field]"
                        :placeholder="field.placeholder"
                        :disabled="isFieldDisabled(field)"
                        :readonly="field.readonly"
                        @change="handleChange(field)"
                        class="ctv-form-control"
                    />
                </div>
            </div>
        </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch, inject } from 'vue';
import CtvDataService from '@/services/CtvDataService';
import CtvToolBox from './CtvToolBox.vue';

const props = defineProps({
  formId: {
    type: String,
    required: true
  },
  config: {
    type: Object,
    default: () => ({ fields: [], columns: 2 })
  },
  modelValue: {
    type: Object,
    default: () => ({})
  },
  readonly: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'save-success', 'change', 'toolbox-action']);

const labelWidth = computed(() => props.config.labelWidth || '120px');

const gridStyle = computed(() => {
    const cols = props.config.columns || 2;
    return {
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: props.config.gap || '5px 10px',
        alignItems: 'center',
        padding: '10px',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        background: '#fff'
    };
});

const getFieldStyle = (field) => {
    const span = field.span || 1;
    return {
        gridColumn: `span ${span}`,
        display: 'flex',
        alignItems: 'start' // Align top for textareas
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
    if (Array.isArray(field.options)) return field.options;
    return [];
};

const isFieldDisabled = (field) => {
    return props.readonly || field.disabled;
};

const handleChange = (field) => {
    emit('update:modelValue', props.modelValue);
    emit('change', field.field, props.modelValue[field.field]);
};

// ToolBox Interaction
const handleToolBoxAction = (action, btn) => {
    emit('toolbox-action', action, btn);
};

const save = async () => {
    if (!props.config.saveQuery) return;
    
    // 1. Validation
    for (const field of props.config.fields) {
        if (field.required && !props.modelValue[field.field]) {
            alert(`${field.title || field.field} 필수 입력입니다.`);
            return null;
        }
    }

    const aSaveData = [];
    // FreeForm save logic usually sends a singe row or array of 1 row
    // Assuming 1 row for FreeForm
    
    // Header Info (Similar to DataGrid but simpler?)
    // Actually FreeForm might use same structure: Header + Row
    
    // Logic: FreeForm saves usually involve checking status (I/U/D).
    // The status needs to be tracked. 
    // For now, let's assume 'U' (Update) or check a hidden status field.
    const status = props.modelValue.rowStatus || 'U'; 
    const rowData = { ...props.modelValue, ROW: 1, FLAG: status };
    
    // Header
    const headerInfo = { ROW: "RowNum", FLAG: String.fromCharCode(7) };
    // ... Populate header from fields/schema ...
    if (props.config.fields) {
        props.config.fields.forEach(f => {
            if (f.field) headerInfo[f.field] = f.field; // Simplified header mapping
        });
    }
    
    aSaveData.push(headerInfo);
    aSaveData.push(rowData);

    const result = await CtvDataService.save(props.config.saveQuery, aSaveData);
    
    if (result) {
        emit('save-success', result);
        return result;
    }
    return null;
};

const formInstanceProxy = computed(() => ({
    save: save,
    // other methods
}));

defineExpose({
    save
});

</script>

<style scoped>
.ctv-free-form {
    width: 100%;
}
.ctv-form-grid {
    /* Layout handled by computed styles */
    width: 100%;
}
.ctv-form-item {
    min-height: 32px;
    padding: 2px 0;
}
.ctv-form-label {
    font-weight: 500;
    margin-right: 10px;
    text-align: right;
    font-size: 13px;
    color: #333;
    padding-top: 6px; /* Align with input text */
}
.required {
    color: red;
    margin-right: 2px;
}
.ctv-form-input-wrapper {
    flex: 1;
    display: flex;
    align-items: center;
}
.ctv-form-control {
    width: 100%;
    min-height: 30px;
    padding: 2px 8px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 13px;
}
.ctv-form-control:focus {
    border-color: #80bdff;
    outline: 0;
}
textarea.ctv-form-control {
    height: auto;
    padding: 8px;
}
.ctv-check-wrapper {
    display: flex;
    align-items: center;
    gap: 5px;
}
</style>
