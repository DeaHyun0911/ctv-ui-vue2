/**
 * CTV Page Utilities
 * Ported from legacy ctv-Page-Utils.js
 */

const CtvPageUtils = {
    /**
     * Check if editable based on global tab permissions
     * @returns {boolean}
     */
    getEditable() {
        try {
            if (typeof top === 'undefined' ||
                !top.gTopAces?.mMain?.Tabs ||
                top.gTopAces.mMain.mSelectIdx === undefined) {
                return true; // Default to true if no context
            }
            const gMenuTabinfo = top.gTopAces.mMain.Tabs[top.gTopAces.mMain.mSelectIdx];
            // insauth === '2' means editable
            return gMenuTabinfo?.insauth === '2';
        } catch (error) {
            console.warn('[CTV PageUtils] Permission check error:', error);
            return true;
        }
    },

    /**
     * Load global combo data
     * @param {Array} cParam - Combo codes
     * @returns {Promise<Array|null>}
     */
    async loadComboData(cParam) {
        if (!cParam || cParam.length === 0) return null;

        // Ensure global variables exist or handle gracefully
        const DIVCOD = typeof top.gSInfo !== 'undefined' && top.gSInfo.DIVCOD ? top.gSInfo.DIVCOD : '';
        const ERPSDB = typeof top.gSInfo !== 'undefined' && top.gSInfo.ERPSDB ? top.gSInfo.ERPSDB : '';
        const bParam = [DIVCOD, ERPSDB];
        const dParam = "";

        try {
            // Check if ufnXhrDotNetCombo2 exists (Legacy Global)
            if (typeof ufnXhrDotNetCombo2 !== 'function') {
                console.error('[CtvPageUtils] ufnXhrDotNetCombo2 is not defined. Cannot load combos.');
                // Return mock data if in dev mode?
                if (import.meta.env.DEV) {
                    console.log('[Dev] Returning mock combo data');
                    return [];
                }
                return null;
            }

            const rjSon = await ufnXhrDotNetCombo2(
                true,
                "../CwwsCombo.ashx",
                ["CreateCombo", ""],
                bParam,
                cParam,
                dParam
            );

            if (rjSon.ErrorCode !== "") {
                if (typeof top.mwPop09Open === 'function') top.mwPop09Open(rjSon, rjSon.ErrorCode);
                return null;
            }

            if (rjSon.gComboInfoc && rjSon.gComboInfoc.length > 0) {
                const comboArray = rjSon.gComboInfoc.split("■");

                // Legacy support
                window._filterCombo = comboArray;

                let comboData = null;
                if (typeof fnCreateGridCombo === "function") {
                    comboData = fnCreateGridCombo(comboArray);
                } else if (typeof window.fnCreateGridCombo === "function") {
                    comboData = window.fnCreateGridCombo(comboArray);
                } else {
                    // Fallback or rudimentary parsing if fnCreateGridCombo is missing
                    // Use ComponentUtils or internal parser?
                    // For now return raw array or null if parser missing
                    console.warn('[CtvPageUtils] fnCreateGridCombo not found.');
                    comboData = comboArray;
                }
                return comboData;
            }
            return null;
        } catch (error) {
            console.error("Global Combo Load Failed:", error);
            if (typeof top.mwPop09Open === 'function') {
                top.mwPop09Open({ ErrorMsg: "Combo Load Error: " + error.message }, "ERROR");
            }
            return null;
        }
    },

    /**
     * Unified Query
     * @param {Object} config 
     */
    async dataQuery(config) {
        const { path, funcNm, bParam = [], targets = [] } = config;

        if (!path) {
            console.error("[CtvPageUtils] dataQuery: path is missing.");
            return false;
        }

        if (typeof top.mwHourglassShow === 'function') top.mwHourglassShow();

        try {
            // Check ufnXhrDotNetCaller04
            if (typeof ufnXhrDotNetCaller04 !== 'function') {
                throw new Error("ufnXhrDotNetCaller04 is not defined");
            }

            const result = await ufnXhrDotNetCaller04(
                true,
                path,
                [funcNm || "UfnQuery", ""],
                bParam
            );

            if (result.ErrorCode && result.ErrorCode !== "") {
                if (typeof top.mwHourglassHide === 'function') top.mwHourglassHide();
                if (typeof top.mwPop09Open === 'function') top.mwPop09Open(result, result.ErrorCode);
                return false;
            }

            // Distribute Data
            for (const target of targets) {
                const { component, dataName, transform } = target;
                if (!component) continue;

                let data = null;
                if (dataName && result[dataName]) {
                    try {
                        data = JSON.parse(result[dataName]);
                    } catch (e) {
                        data = result[dataName];
                    }
                }

                if (typeof transform === 'function') {
                    data = transform(data, result);
                }

                if (data) {
                    // Handle CtvFreeForm (Vue component proxy or raw object)
                    // If component is a Vue ref, access value
                    const comp = component.value || component; // Handle ref

                    if (comp && typeof comp.setData === 'function') {
                        comp.setData(data);
                    } else if (comp && typeof comp.setValue === 'function') {
                        comp.setValue(data);
                    } else if (comp && comp.datagrid) {
                        // CtvDataGrid legacy/proxy
                        if (typeof SBGrid3 !== 'undefined' && typeof SBGrid3.setJson === 'function') {
                            // Grid handles array
                            const gridData = Array.isArray(data) ? data : [data];
                            SBGrid3.setJson(comp.datagrid, gridData);
                        }
                    } else {
                        // Fallback: try setting modelValue directly if it is a ref?
                        // Or warn
                        console.warn('[CtvPageUtils] Component does not have setData/setValue:', comp);
                    }
                }
            }

            if (typeof top.mwHourglassHide === 'function') top.mwHourglassHide();
            return true;

        } catch (error) {
            console.error("[CtvPageUtils] dataQuery Error:", error);
            if (typeof top.mwHourglassHide === 'function') top.mwHourglassHide();
            if (typeof top.mwPop09Open === 'function') {
                top.mwPop09Open({ ErrorMsg: "Query Error: " + error.message }, "ERROR");
            }
            return false;
        }
    },

    // DocViewer / Excel Import helpers can be added here if needed
    // ...
};

export default CtvPageUtils;
