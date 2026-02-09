<template>
  <div class="ctv-doc-viewer" :class="{ 'fullscreen': isFullscreen }">
    <!-- Sidebar -->
    <div 
      class="ctv-doc-viewer-sidebar" 
      :class="{ 'collapsed': !sidebarOpen }"
      :style="{ width: sidebarOpen ? config.sidebarWidth + 'px' : '0px' }"
    >
      <div class="ctv-doc-viewer-sidebar-header">
        <div class="ctv-doc-viewer-sidebar-title">문서 목록</div>
      </div>
      
      <div class="ctv-doc-viewer-sidebar-list">
        <div v-if="!docList || docList.length === 0" class="ctv-doc-viewer-empty-list">
          <component :is="icons.FileX" class="icon" />
          <span>{{ config.emptyMessage || '목록이 존재하지 않습니다' }}</span>
        </div>
        <div v-else>
           <!-- Recursive Tree Rendering -->
           <div v-for="(item, index) in docList" :key="index">
              <CtvDocTreeItem 
                :item="item" 
                :level="0" 
                :current-doc="currentDoc"
                @select="handleSelect"
                @toggle="handleFolderToggle"
              />
           </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="ctv-doc-viewer-body">
      <!-- Toolbar -->
      <div class="ctv-doc-viewer-toolbar">
         <div class="ctv-doc-viewer-toolbar-left">
            <button class="ctv-btn-icon" @click="toggleSidebar" title="사이드바 토글">
               <component :is="icons.Sidebar" class="icon" />
            </button>
         </div>
         <div class="ctv-doc-viewer-toolbar-right">
             <!-- Zoom Controls -->
             <div class="zoom-controls">
                <button class="ctv-btn-icon" @click="zoomOut" title="축소">
                   <component :is="icons.Minus" class="icon" />
                </button>
                <span class="zoom-text">{{ zoom }}%</span>
                <button class="ctv-btn-icon" @click="zoomIn" title="확대">
                   <component :is="icons.Plus" class="icon" />
                </button>
             </div>
         </div>
      </div>

      <!-- Content Area -->
      <div class="ctv-doc-viewer-content" ref="contentArea">
         <div v-if="!currentDoc" class="ctv-doc-viewer-empty">
             <component :is="icons.FileText" class="large-icon" />
             <div>문서를 선택하세요</div>
         </div>
         
         <!-- Image Viewer -->
         <div v-else-if="currentDoc.type === 'image'" class="viewer-container image-viewer">
            <img 
               :src="currentDoc.url" 
               :style="{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }"
               @load="onImageLoad"
               alt="Document Image"
            />
         </div>

         <!-- PDF Viewer -->
         <div v-else-if="currentDoc.type === 'pdf'" class="viewer-container pdf-viewer">
            <canvas ref="pdfCanvas"></canvas>
            
            <!-- PDF Page Controls Overlay -->
            <div class="pdf-controls" v-if="pdfDoc">
                <button @click="prevPage" :disabled="currentPage <= 1">
                   <component :is="icons.ChevronLeft" />
                </button>
                <span>{{ currentPage }} / {{ totalPages }}</span>
                <button @click="nextPage" :disabled="currentPage >= totalPages">
                   <component :is="icons.ChevronRight" />
                </button>
            </div>
         </div>

         <div v-else class="ctv-doc-viewer-error">
             지원하지 않는 파일 형식입니다.
         </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue';
import { 
    Sidebar, FileX, FileText, Minus, Plus, ChevronLeft, ChevronRight, 
    Folder, FolderOpen, File 
} from 'lucide-vue-next';

// Use a recursive component for the tree
const CtvDocTreeItem = {
  name: 'CtvDocTreeItem',
  props: ['item', 'level', 'currentDoc'],
  emits: ['select', 'toggle'],
  components: { Folder, FolderOpen, File, ChevronRight, FileText }, // Lucide icons
  template: `
    <div class="doc-tree-item" :style="{ paddingLeft: (level * 16 + 10) + 'px' }">
      <div v-if="item.type === 'folder'" class="folder-row" @click="$emit('toggle', item)">
        <span class="chevron" :class="{ rotated: item.expanded }">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </span>
        <span class="folder-icon">
            <svg v-if="item.expanded" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>
        </span>
        <span class="name">{{ item.name }}</span>
        <span class="count">({{ item.fileCount || 0 }})</span>
      </div>
      
      <div v-else class="file-row" :class="{ active: currentDoc && currentDoc.url === item.url }" @click="$emit('select', item)">
         <span class="file-icon">
            <svg v-if="item.type === 'pdf'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
         </span>
         <span class="name" :title="item.name">{{ item.name }}</span>
      </div>
    </div>
    
    <div v-if="item.type === 'folder' && item.expanded">
      <CtvDocTreeItem 
        v-for="(subItem, idx) in item.items" 
        :key="idx" 
        :item="subItem" 
        :level="level + 1"
        :current-doc="currentDoc"
        @select="$emit('select', $event)"
        @toggle="$emit('toggle', $event)"
      />
    </div>
  `
};

const icons = {
  Sidebar, FileX, FileText, Minus, Plus, ChevronLeft, ChevronRight
};

const props = defineProps({
  config: {
    type: Object,
    default: () => ({
      documents: [],
      sidebarWidth: 300,
      defaultZoom: 100,
      minZoom: 25,
      maxZoom: 500,
      pdfWorkerPath: '/js/pdf.worker.min.js'
    })
  }
});

const isFullscreen = ref(false);
const sidebarOpen = ref(true);
const currentDoc = ref(null);
const zoom = ref(props.config.defaultZoom || 100);
const currentPage = ref(1);
const totalPages = ref(0);
const pdfDoc = ref(null);
const pdfRenderTask = ref(null);
const pdfCanvas = ref(null);
const docList = ref([]); // Processed list with expanded state

// Normalize and process input documents into recursive structure with state
const processDocs = (docs) => {
    return docs.map(d => {
        if (d.type === 'folder') {
            const children = d.items ? processDocs(d.items) : [];
            const count = countFiles(d);
            return { ...d, expanded: d.expanded ?? true, items: children, fileCount: count }; 
        }
        return d;
    });
};

const countFiles = (folder) => {
    let c = 0;
    if(folder.items) {
        folder.items.forEach(item => {
            if(item.type === 'folder') c += countFiles(item);
            else c++;
        });
    }
    return c;
};

watch(() => props.config.documents, (newDocs) => {
    if(newDocs) {
        docList.value = processDocs(JSON.parse(JSON.stringify(newDocs))); // Deep copy
        // Auto select first file?
    }
}, { immediate: true });


const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value;
};

const handleFolderToggle = (item) => {
    item.expanded = !item.expanded;
};

const handleSelect = (item) => {
    if(item.type === 'folder') return;
    currentDoc.value = item;
    zoom.value = props.config.defaultZoom || 100;
    currentPage.value = 1;
    totalPages.value = 0;
    pdfDoc.value = null;
    
    if(item.type === 'pdf') {
        loadPdf(item.url);
    }
};

const loadPdf = async (url) => {
    if (typeof window.pdfjsLib === 'undefined') {
        console.error('PDF.js library not found (window.pdfjsLib)');
        // Try loading script dynamically? Or just fail
        return;
    }

    // Set worker if not set
    if (!window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = props.config.pdfWorkerPath || '/js/pdf.worker.min.js';
    }

    try {
        const loadingTask = window.pdfjsLib.getDocument(url);
        pdfDoc.value = await loadingTask.promise;
        totalPages.value = pdfDoc.value.numPages;
        renderPdfPage(1);
    } catch (e) {
        console.error('Error loading PDF:', e);
    }
};

const renderPdfPage = async (num) => {
    if(!pdfDoc.value || !pdfCanvas.value) return;
    
    if(pdfRenderTask.value) {
        // Cancel previous render
        // pdfRenderTask.value.cancel(); 
        // Note: cancelling is tricky, usually better to wait or ignore
    }

    try {
        const page = await pdfDoc.value.getPage(num);
        const viewport = page.getViewport({ scale: zoom.value / 100 });
        
        const canvas = pdfCanvas.value;
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        
        pdfRenderTask.value = page.render(renderContext);
        await pdfRenderTask.value.promise;
        pdfRenderTask.value = null;
    } catch(e) {
        // Error or cancelled
    }
};

const prevPage = () => {
    if(currentPage.value > 1) {
        currentPage.value--;
        renderPdfPage(currentPage.value);
    }
};

const nextPage = () => {
    if(currentPage.value < totalPages.value) {
        currentPage.value++;
        renderPdfPage(currentPage.value);
    }
};

const zoomIn = () => {
    if(zoom.value < (props.config.maxZoom || 500)) {
        zoom.value += 25;
        if(currentDoc.value?.type === 'pdf') renderPdfPage(currentPage.value);
    }
};

const zoomOut = () => {
    if(zoom.value > (props.config.minZoom || 25)) {
        zoom.value -= 25;
        if(currentDoc.value?.type === 'pdf') renderPdfPage(currentPage.value);
    }
};

const onImageLoad = () => {
    // Optional: auto-fit logic
};

</script>

<style scoped>
.ctv-doc-viewer {
    display: flex;
    width: 100%;
    height: 100%;
    min-height: 500px; /* Minimal height */
    border: 1px solid #ddd;
    background: #f5f5f5;
    overflow: hidden;
}

.ctv-doc-viewer-sidebar {
    background: white;
    border-right: 1px solid #ddd;
    display: flex;
    flex-direction: column;
    transition: width 0.3s ease;
    overflow: hidden;
}

.ctv-doc-viewer-sidebar-header {
    padding: 12px;
    border-bottom: 1px solid #eee;
    font-weight: bold;
    background: #f9fafb;
}

.ctv-doc-viewer-sidebar-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;
}

.doc-tree-item {
    cursor: pointer;
    font-size: 14px;
}

.folder-row, .file-row {
    padding: 6px 8px;
    display: flex;
    align-items: center;
    gap: 6px;
    border-radius: 4px;
    margin: 0 4px;
}

.folder-row:hover, .file-row:hover {
    background-color: #f3f4f6;
}

.file-row.active {
    background-color: #e0f2fe;
    color: #0284c7;
}

.chevron {
    transition: transform 0.2s;
    color: #9ca3af;
    display: flex;
}
.chevron.rotated {
    transform: rotate(90deg);
}

.folder-icon { color: #f59e0b; display: flex; }
.file-icon { color: #6b7280; display: flex; }
.count { color: #9ca3af; font-size: 12px; margin-left: auto; }
.name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.ctv-doc-viewer-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.ctv-doc-viewer-toolbar {
    height: 48px;
    background: white;
    border-bottom: 1px solid #ddd;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
}

.ctv-btn-icon {
    border: none;
    background: transparent;
    cursor: pointer;
    padding: 6px;
    border-radius: 4px;
    color: #555;
    display: flex;
    align-items: center;
    justify-content: center;
}
.ctv-btn-icon:hover { background: #f0f0f0; }

.ctv-doc-viewer-toolbar-right {
    display: flex;
    gap: 12px;
}

.zoom-controls {
    display: flex;
    align-items: center;
    gap: 8px;
}
.zoom-text {
    font-size: 14px;
    min-width: 48px;
    text-align: center;
}

.ctv-doc-viewer-content {
    flex: 1;
    overflow: auto;
    background: #e5e5e5; /* Darker bg for contrast */
    position: relative;
    padding: 20px;
    display: flex;
    justify-content: center;
    align-items: flex-start;
}

.viewer-container {
    background: white;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.image-viewer {
    /* Image specific */
}

.pdf-viewer {
    /* PDF specific */
    display: flex;
    flex-direction: column;
    align-items: center;
}

.pdf-controls {
    position: fixed; /* Or sticky */
    bottom: 20px;
    background: white;
    padding: 8px 16px;
    border-radius: 20px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    display: flex;
    gap: 12px;
    align-items: center;
    z-index: 10;
}

.ctv-doc-viewer-empty, .ctv-doc-viewer-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #888;
    gap: 12px;
}
.large-icon { width: 48px; height: 48px; stroke-width: 1.5; }

/* SVG Icon styles */
.icon {
    width: 20px;
    height: 20px;
}
</style>
