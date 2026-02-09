<template>
  <div class="ctv-data-grid" :id="gridId" ref="gridContainer">
    <!-- ToolBox Slot (Fallback to internal ToolBox if not provided) -->
    <slot name="toolbox">
      <CtvToolBox 
        v-if="config.toolBox !== false" 
        :config="config.toolBox"
        :grid-instance="gridInstanceProxy"
        @action="handleToolBoxAction"
      />
    </slot>

    <!-- Grid Container -->
    <div class="ctv-grid-content" ref="gridContent" :style="{ height: gridHeight }"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick, inject, computed } from 'vue';
import CtvDataService from '@/services/CtvDataService';
import CtvToolBox from './CtvToolBox.vue';
import { flattenColumns, parseColTypeSchema, normalizeConfig, applyColTypeToColumns } from '@/utils/CtvGridUtils';

const emit = defineEmits(['ready', 'query-success', 'save-success', 'row-click', 'row-dblclick', 'update:modelValue', 'toolbox-action']);

const props = defineProps({
  config: {
    type: Object,
    default: () => ({ toolBox: {} })
  },
  gridId: {
    type: String,
    required: true
  },
  // Added gridHeight prop for flexibility, though legacy calculated it.
  gridHeight: {
    type: String,
    default: '100%'
  }
});

const gridContainer = ref(null);
const gridContent = ref(null);
const datagrid = ref(null);
const lastQueryData = ref({});

// Proxy object exposed to ToolBox and other components
const gridInstanceProxy = computed(() => ({
    datagrid: datagrid.value,
    config: props.config, // expose config to toolbox
    save: save,
    query: query,
    loadData: query, // legacy alias
    refresh: reloadData,
    exportExcel: exportExcel, // Placeholder for excel export
    importExcel: importExcel, // Placeholder for excel import
    toolBoxInstance: null, // Legacy toolbox ref if needed
    container: gridContainer.value
}));

const handleToolBoxAction = (action, btn) => {
    emit('toolbox-action', action, btn);
};

const initGrid = async () => {
  if (typeof SBGrid3 === 'undefined') {
    console.error('SBGrid3 library is not loaded.');
    return;
  }

  // Clean DOM
  if (gridContent.value) {
    gridContent.value.innerHTML = '';
  }

  let sbGridConfig = {};

  // 1. Construct SBGrid Config using buildGridConfig (Legacy Pattern)
  if (props.config.buildGridConfig && typeof props.config.buildGridConfig === 'function') {
      const state = {
          datagrid: null,
          comboData: props.config.comboData || {}, 
          localData: []
      };
      // Execute user function to get SBGrid specific options
      sbGridConfig = props.config.buildGridConfig(state);
      
      if (!sbGridConfig || typeof sbGridConfig !== 'object') {
          console.error('[CtvDataGrid] buildGridConfig did not return a valid object.');
          return;
      }

  } else {
      // Fallback: Use props.config directly (Modern/Simple usage)
      // Extract only safe SBGrid properties to avoid polluting config
      const { columns, rowCss, height, width, ...rest } = props.config;
      sbGridConfig = { ...rest, columns, rowCss, height, width };
      
      // Cleanup non-SBGrid props
      delete sbGridConfig.dataQuery;
      delete sbGridConfig.saveQuery;
      delete sbGridConfig.toolBox;
      delete sbGridConfig.description; // metadata
  }

  // 2. Process Columns (Transformation & Sanitization)
  if (sbGridConfig.columns) {
      // transformMultiColumnFormat(sbGridConfig.columns); // If needed in future
      sbGridConfig.columns = applyColTypeToColumns(sbGridConfig.columns);
  }

  // 3. Apply Defaults & Container
  // Ensure valid generic defaults
  sbGridConfig.parent = gridContent.value;
  sbGridConfig.json = sbGridConfig.json || [];
  
  // Default SBGrid3 settings that match legacy behavior
  sbGridConfig.width = sbGridConfig.width || "100%";
  sbGridConfig.height = sbGridConfig.height || "100%";
  
  // Default column properties
  if (!sbGridConfig.defaultColumn) {
      sbGridConfig.defaultColumn = {
            showUnSortIcon: false,
            captionClick: "sort",
            directApplyValue: true,
      };
  }

  // 4. Create Grid
  try {
    datagrid.value = SBGrid3.createGrid(sbGridConfig);
    
    // Bind global datagrid for legacy access logic (optional)
    if (typeof window !== 'undefined' && props.gridId) {
         // window[props.gridId] = datagrid.value; // Avoid global pollution unless strictly needed
    }

    // Attach basic events
    if (datagrid.value) {
        // e.g. row click
    }

    emit('ready', datagrid.value);
    
    // 5. Auto Load
    // Only if config.autoLoad is NOT false (default true)
    // and query config is present
    if (props.config.autoLoad !== false && (props.config.query?.path || props.config.query?.onQuery || props.config.dataQuery?.path)) {
        await nextTick();
        query();
    }
  } catch (error) {
    console.error('Failed to create grid:', error);
  }
};

const query = async (params = {}) => {
  const queryConfig = props.config.dataQuery || props.config.query;
  if (!queryConfig) return;

  // Use last query data if params empty? (Logic from legacy)
  lastQueryData.value = { ...params };
  
  // Call CtvPageUtils.dataQuery directly or via Service?
  // CtvDataService wraps CtvPageUtils.dataQuery now? 
  // checking CtvDataService... assuming it mirrors dataQuery logic.
  // Actually, legacy calls CtvPageUtils.dataQuery(config).
  // Let's use CtvDataService.query which likely wraps it.
  
  // Wait, CtvDataService.query might expect specific format.
  // Legacy dataQuery config: { path, funcNm, bParam, ... }
  // Let's assume CtvDataService.query handles this object structure.
  
  // Legacy bParam can be a function
  let bParams = queryConfig.bParam || [];
  if (typeof bParams === 'function') {
      // Pass something to it? 
      // Bpa100n.js: bParam: (queryData) => [...]
      // We need to resolve it.
      // Where does queryData come from? usually from filter or params.
      // CtvQueryFilter might handle this separately. 
      // For now, assume params contains filter data.
       bParams = bParams(params);
  }

  const result = await CtvDataService.query({ ...queryConfig, bParam: bParams }, params);
  
  if (result) {
    const dataName = queryConfig.dataName || 'rsData01';
    const data = CtvDataService.extractData(result, dataName);
    setData(data);
    
    if (props.config.onDataLoaded) {
        props.config.onDataLoaded(data, result);
    }

    emit('query-success', { result, data, params });
    return result;
  }
  return null;
};

const save = async () => {
  const saveConfig = props.config.saveQuery;
  if (!saveConfig) return;

  // 1. Validation
  const failedData = SBGrid3.findInvalid(datagrid.value);
  if (failedData?.rowItem !== undefined && failedData?.column !== undefined) {
      const msg = "필수 항목이 누락되었거나 형식이 맞지 않습니다. \n 수정한 뒤 다시 저장해 주세요.";
      if (typeof CtvModal !== 'undefined' && CtvModal.alert) {
          await CtvModal.alert(msg, "검증 실패");
      } else {
          alert(msg);
      }
      SBGrid3.moveFocus(datagrid.value, failedData.rowItem, failedData.column);
      return null;
  }

  // 2. Get Save Data
  const saveDataResult = SBGrid3.getSaveData(datagrid.value, true, true, true);
  const insertedData = saveDataResult?.inserted || [];
  const updatedData = saveDataResult?.updated || [];
  const deletedData = saveDataResult?.deleted || [];

  if (insertedData.length === 0 && updatedData.length === 0 && deletedData.length === 0) {
      if (typeof CtvModal !== 'undefined' && CtvModal.alert) {
          await CtvModal.alert("저장할 정보가 존재하지 않습니다.");
      } else if (typeof top !== 'undefined' && top.SetMessage) {
          top.SetMessage("저장할 데이터가 없습니다.");
      }
      return null;
  }

  // 3. Prepare aSaveData
  // Need to get columns from SBGrid or from config?
  // Use config columns because SBGrid columns might be processed objects.
  // We need the flattened, raw-ish definitions for ptaxsData
  // Actually, we processed them in init.
  // But SBGrid3.getColumns(datagrid.value) returns the runtime columns.
  
  // Let's use flattenColumns on the sbGridConfig logic again?
  // We can't easily access sbGridConfig here, it was local to init.
  // However, we can use props.config.buildGridConfig again or store it.
  // Better: store processed columns in a ref or use SBGrid columns and try to match?
  
  // Legacy strategy: _buildSaveSchemaFromColumns.
  // We should try to reconstruct schema from the runtime columns if possible, 
  // or re-run buildGridConfig(state) to get the columns def.
  
  let columnsForSave = [];
  if (props.config.buildGridConfig) {
      const state = { datagrid: datagrid.value, comboData: {}, localData: [] };
      const tempConfig = props.config.buildGridConfig(state);
      columnsForSave = tempConfig.columns;
  } else {
      columnsForSave = props.config.columns;
  }
  
  // We need to applyColTypeToColumns to them to get ptaxsData populated?
  // applyColTypeToColumns modifies objects. processing it again is safe.
  columnsForSave = flattenColumns(columnsForSave || [], false);
  const processedCols = applyColTypeToColumns(columnsForSave); // To ensure ptaxsData is generated

  const aSaveData = [];

  // Header Info
  const headerInfo = {
      ROW: "RowNum",
      FLAG: String.fromCharCode(7),
  };

  processedCols.forEach((col) => {
      const field = col.field;
      if (!field || field.startsWith("_")) return;

      const saveSchema = props.config.saveSchema || {};
      const schemaInfo = saveSchema[field];

      if (schemaInfo && schemaInfo.ptaxsData) {
          headerInfo[field] = field + String.fromCharCode(7) + schemaInfo.ptaxsData;
      } else if (col.ptaxsData) {
           headerInfo[field] = field + String.fromCharCode(7) + col.ptaxsData;
      } else {
          // Fallback using parseColTypeSchema if not in processed col
          const schema = parseColTypeSchema(col.colType);
          headerInfo[field] = field + String.fromCharCode(7) + schema;
      }
  });
  aSaveData.push(headerInfo);

  // Process Rows
  let rowNum = 1;
  const onValueCheck = saveConfig.onValueCheck;
  const onValueConvert = saveConfig.onValueConvert || ((f, v) => (typeof v === 'string' ? v.replace(/'/g, "′") : v));

  const processRow = (row, flag) => {
      const rowInfo = {
          ROW: rowNum++,
          FLAG: flag,
      };

      for (const col of processedCols) {
          const field = col.field;
          if (!field || field.startsWith("_")) continue;

          let val = row[field];
          if (val === undefined || val === null) val = "";

          // Value Check
          if (typeof onValueCheck === 'function') {
              const errorMsg = onValueCheck(field, val, row);
              if (errorMsg) return { error: errorMsg };
          }

          // Value Convert
          val = onValueConvert(field, val);
          rowInfo[field] = val;
      }
      return rowInfo;
  };

  const processDataArray = async (dataArray, flag) => {
      for (const row of dataArray) {
          const result = processRow(row, flag);
          if (result && result.error) {
              if (typeof CtvModal !== 'undefined' && CtvModal.alert) {
                  await CtvModal.alert(result.error);
              } else if (typeof top !== 'undefined' && top.SetMessage) {
                  top.SetMessage(result.error);
              }
              return false;
          }
          aSaveData.push(result);
      }
      return true;
  };

  if (!(await processDataArray(insertedData, "N"))) return null;
  if (!(await processDataArray(updatedData, "U"))) return null;
  if (!(await processDataArray(deletedData, "D"))) return null;

  // 4. Call Service
  const result = await CtvDataService.save(saveConfig, aSaveData, { datagrid: datagrid.value });
  
  if (result) {
    SBGrid3.clearSaveData(datagrid.value);
    
    if (saveConfig.reloadAfterSave !== false) {
      await reloadData();
    }
    
    emit('save-success', result);
    return result;
  }
  return null;
};

const setData = (data) => {
  if (datagrid.value && Array.isArray(data)) {
    SBGrid3.setClientData(datagrid.value, data);
  }
};

const getData = () => {
    if (datagrid.value) {
        return SBGrid3.getData(datagrid.value);
    }
    return [];
}

const reloadData = async () => {
  // query(lastQueryData.value); // Use last params
  // Need to be careful about recursive usage if query calls reload
  await query(lastQueryData.value);
};

const exportExcel = () => {
    if (datagrid.value) {
         SBGrid3.excelExport(datagrid.value, {
             fileName: 'export.xlsx',
             // ... defaults from config ...
         });
    }
}
const importExcel = () => {
    // Implement using CtvDataGrid logic or SBGrid3 built-in
}


// Expose methods
defineExpose({
  query,
  save,
  setData,
  getData,
  reloadData,
  datagrid
});

onMounted(() => {
  initGrid();
});

// Watch for column changes to re-initialize grid
// If buildGridConfig is used, we might need to watch deps or rely on parent re-rendering
// But for safety:
watch(() => props.config, (newVal) => {
    // If deep change, re-init.
    // Debounce might be needed but for now simple re-init
    if (newVal) {
        // initGrid(); 
        // Warning: Full re-init destroys grid state. 
        // Only do if structural change.
    }
}, { deep: true });

onUnmounted(() => {
  if (datagrid.value) {
    // SBGrid3.destroy(datagrid.value); // If available
    datagrid.value = null;
  }
});
</script>

<style scoped>
.ctv-data-grid {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}
.ctv-grid-content {
  flex: 1;
  overflow: hidden;
}
</style>
