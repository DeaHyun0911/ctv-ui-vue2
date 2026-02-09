<template>
  <div class="ctv-table-container">
    <table :class="options.className || 'ctv-table'">
      <colgroup>
        <col v-for="(col, index) in visibleColumns" :key="index" :style="{ width: col.width || 'auto' }">
      </colgroup>
      <thead>
        <tr>
          <th v-for="(col, index) in visibleColumns" :key="index" :class="col.className">
            {{ col.header }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in visibleData" :key="rowIndex" :data-id="row.id">
          <td v-for="(col, colIndex) in visibleColumns" :key="colIndex" :class="[col.className, col.align ? 'text-' + col.align : '']">
            <!-- Special Handling based on Column Field and Row Type for the Deduction Table logic -->
            
            <!-- Group Field -->
            <template v-if="col.field === 'group'">
               {{ row.group }}
            </template>

            <!-- Label Field -->
            <template v-else-if="col.field === 'label'">
               {{ row.label }}
            </template>

            <!-- Check/Input Field -->
            <template v-else-if="col.field === 'check'">
               <div class="cell-content center">
                  <ctv-select 
                    v-if="row.type === 'select'" 
                    v-model="row.value" 
                    :id="row.id"
                    :options="getOptions(row)" 
                    :disabled="isDisabled(row)"
                    style="width: 100%;"
                  />
                  <ctv-check 
                    v-else-if="row.type === 'check'" 
                    v-model="row.value" 
                    :id="row.id"
                    checked-value="1" 
                    unchecked-value="0"
                    :disabled="isDisabled(row)"
                  />
                  <div v-else-if="row.type === 'date-range'" class="flex gap-1 items-center">
                      <ctv-date mode="range" v-model="row.value" :from="row.from" :to="row.to" :disabled="isDisabled(row)" />
                  </div>
               </div>
            </template>

            <!-- Desc Field (Complex Logic) -->
            <template v-else-if="col.field === 'desc'">
                <!-- Handling specific ID cases from legacy code -->
                <div v-if="row.id === 'CI02_IAD_TYPE'" class="complex-cell flex gap-2">
                    <div class="sub-label w-[100px] text-center">장애인기간</div>
                    <div class="sub-input w-[140px]">
                        <ctv-select 
                            v-model="formData['CI02_IAD_GUBN']" 
                            :options="getComboData(16)"
                            @change="handleDependencyChange"
                        />
                    </div>
                    <div class="sub-input flex-1">
                        <ctv-date 
                            v-model="formData['CI02_IAD_FT_FROM']"
                            mode="range" 
                            from="CI02_IAD_FT_FROM" 
                            to="CI02_IAD_FT_TO"
                            :disabled="!formData['CI02_IAD_GUBN'] || formData['CI02_IAD_GUBN'] === '1'"
                        />
                    </div>
                </div>

                <div v-else-if="row.id === 'CI02_IAD070'" class="complex-cell flex gap-2">
                    <div class="sub-input w-[140px]">
                        <ctv-select 
                           v-model="formData['CI02_IAD071']"
                           :options="getComboData(12)"
                           :disabled="row.value !== '1'"
                        />
                    </div>
                    <div class="sub-text p-1 text-sm text-gray-600" v-html="row.desc"></div>
                </div>

                <div v-else class="desc-text text-sm text-gray-600" v-html="row.desc"></div>
            </template>

            <!-- Default Text -->
            <template v-else>
               {{ col.render ? col.render(row) : row[col.field] }}
            </template>

          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, computed, watch, reactive, onMounted } from 'vue';

const props = defineProps({
  data: { type: Array, default: () => [] },
  columns: { type: Array, default: () => [] },
  options: { type: Object, default: () => ({}) },
  comboData: { type: Array, default: () => [] } // Injected combo data
});

const emit = defineEmits(['change']);

// Internal state for form values (flattened key-value)
const formData = reactive({});

// Update formData when data changes or user inputs
watch(() => props.data, (newData) => {
    newData.forEach(row => {
        if(row.id) {
            // Initialize if not present
            if(formData[row.id] === undefined) {
               formData[row.id] = row.value || (row.type === 'check' ? '0' : '');
            }
            // Sync initial values for nested fields or sidefields
            if(row.id === 'CI02_IAD_TYPE') {
                if(formData['CI02_IAD_GUBN'] === undefined) formData['CI02_IAD_GUBN'] = '';
                if(formData['CI02_IAD_FT_FROM'] === undefined) formData['CI02_IAD_FT_FROM'] = '';
            }
        }
    });
}, { immediate: true, deep: true });

// Also watch internal rows for value bind (v-model needs to sync back)
watch(formData, (newVal) => {
    // Sync back to rows? Not strictly needed if we use formData for retrieval
    // But for 'row.value' binding we need to be careful
    // Actually, let's bind v-model="row.value" directly in template where possible
    // And use formData for the extra complex fields
    emit('change', newVal);
}, { deep: true });


const visibleData = computed(() => {
    return props.data.filter(row => {
         // Visibility rules
         if (props.options.visibilityRules) {
             for (const rule of props.options.visibilityRules) {
                 if (rule.targetRowId === row.id) {
                     const sourceVal = row.value; // Wait, we need source control value
                     // We need to look up the source row
                     const sourceRow = props.data.find(r => r.id === rule.sourceControlId);
                     if (sourceRow && rule.condition) {
                         if (!rule.condition(sourceRow.value)) return false;
                     }
                 }
             }
         }
         // specific manual handler
         if (props.options.onRenderRow) {
             if (!props.options.onRenderRow(row)) return false;
         }
         return true;
    });
});

const visibleColumns = computed(() => {
    return props.columns;
});

const getComboData = (index) => {
    // Access global combo if available or props
    const globalCombo = window.gGridComboData || window._filterCombo || [];
    return globalCombo[index] || [];
};

const getOptions = (row) => {
    if (row.comboIndex !== undefined) return getComboData(row.comboIndex);
    return [];
};

const isDisabled = (row) => {
    return row.disabled;
};

const handleDependencyChange = () => {
    // Trigger reactivity
};

// Expose methods
const getData = () => {
    // Combine row values and formData
    const result = {};
    props.data.forEach(row => {
        if(row.id) result[row.id] = row.value;
    });
    // Merge extra fields form formData
    Object.assign(result, formData);
    return result;
};

const setData = (data) => {
    // Update rows and formData
    Object.keys(data).forEach(key => {
        const row = props.data.find(r => r.id === key);
        if(row) row.value = data[key];
        formData[key] = data[key];
    });
};

defineExpose({ getData, setData });

</script>

<style scoped>
.ctv-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
    border-top: 2px solid #3366cc;
}

.ctv-table th {
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    padding: 8px;
    font-weight: 600;
    text-align: center;
}

.ctv-table td {
    border: 1px solid #e2e8f0;
    padding: 6px 8px;
}

.ctv-col-label {
    background-color: #f8fafc;
}

.desc-text ul {
    margin: 4px 0 0 16px;
    padding: 0;
    list-style-type: disc;
}

.center {
    display: flex;
    justify-content: center;
    align-items: center;
}

.hidden {
    display: none;
}
</style>
