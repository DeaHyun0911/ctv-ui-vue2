<template>
  <div class="ctv-toolbox">
    <div class="ctv-toolbox-left">
      <template v-for="(btn, index) in leftButtons" :key="'left-' + index">
        <ctv-button
          v-if="btn.visible !== false"
          :variant="btn.variant"
          :icon="btn.icon"
          :disabled="btn.disabled"
          @click="handleAction(btn)"
        >
          {{ btn.text }}
        </ctv-button>
      </template>
    </div>
    <div class="ctv-toolbox-right">
      <template v-for="(btn, index) in rightButtons" :key="'right-' + index">
        <ctv-button
          v-if="btn.visible !== false"
          :variant="btn.variant"
          :icon="btn.icon"
          :disabled="btn.disabled"
          @click="handleAction(btn)"
        >
          {{ btn.text }}
        </ctv-button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue';

const props = defineProps({
  config: {
    type: Object,
    default: () => ({})
  },
  gridInstance: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['action']);

// Standard Button Definitions
const BUTTON_DEFINITIONS = {
  append: { text: "추가", variant: "outline", icon: "plus", action: "append" },
  delete: { text: "삭제", variant: "outline", icon: "minus", action: "delete" },
  save: { text: "저장", variant: "primary", icon: "save", action: "save" },
  excel: { text: null, variant: "outline", icon: "download", action: "excel", tooltip: '엑셀 다운로드' },
  // ... other definitions
};

// Normalize Buttons
const normalizeButtons = (buttons) => {
  if (!buttons) return [];
  
  return buttons.map(btn => {
    if (typeof btn === 'string') {
      return BUTTON_DEFINITIONS[btn] ? { ...BUTTON_DEFINITIONS[btn] } : { text: btn, action: btn };
    }
    // Object config
    const action = btn.tool || btn.action || btn.type;
    const base = BUTTON_DEFINITIONS[action] || {};
    return { ...base, ...btn, action };
  });
};

const leftButtons = computed(() => normalizeButtons(props.config.left || (props.config.defaultButtons ? ['append', 'delete'] : [])));
const rightButtons = computed(() => normalizeButtons(props.config.right || (props.config.defaultButtons ? ['save', 'excel'] : [])));

const handleAction = async (btn) => {
  if (!props.gridInstance) {
      console.warn("No grid instance connected to toolbox");
      return;
  }
  
  const action = btn.action;
  
  switch(action) {
      case 'append':
          // logic for append (call SBGrid3 directly or via utils/methods?)
          // For now, let's assume we can access SBGrid3 via gridInstance.datagrid
          if (props.gridInstance.datagrid) {
             // ... append logic
             SBGrid3.appendRow(props.gridInstance.datagrid);
          }
          break;
      case 'delete':
           if (props.gridInstance.datagrid) {
             const selectedKey = SBGrid3.getFocusedKey(props.gridInstance.datagrid);
             if (selectedKey) {
                 SBGrid3.deleteRow(props.gridInstance.datagrid, selectedKey);
             } else {
                 alert("삭제할 행을 선택하세요.");
             }
           }
          break;
      case 'save':
          if (props.gridInstance.save) {
              await props.gridInstance.save();
          }
          break;
      case 'excel':
          if (props.gridInstance.datagrid) {
              SBGrid3.excelExport(props.gridInstance.datagrid);
          }
          break;
      default:
          emit('action', action, btn);
          break; 
  }
};

</script>

<style scoped>
.ctv-toolbox {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}
.ctv-toolbox-left, .ctv-toolbox-right {
  display: flex;
  gap: 4px;
}
</style>
