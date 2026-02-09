/**
 * @program Bpa100n
 * @title 프로그램 등록 (Vue 버전)
 * @author CTV
 * @description Vue 컴포넌트를 내부적으로 사용하지만, 기존 바닐라 JS API 방식 유지
 */
const Bpa100n = (function () {

    let _filter = null;
    let _grid = null;

    // ==============================================
    // 데이터 설정
    // ==============================================
    const CONFIG = {
        // 콤보 파라미터 설정
        comboParams: [
            { "CODE": "B100", "FLAG": "0" },   // 0 : 솔루션구분
            { "CODE": "0100", "FLAG": "0" },   // 1 : 신고사업장
            { "CODE": "0200", "FLAG": "0" },   // 2 : 사업장
            { "CODE": "B019", "FLAG": "0-Y" }, // 3 : 메뉴대분류
            { "CODE": "B020", "FLAG": "0" },   // 4 : 프로그램사용권한
            { "CODE": "B017", "FLAG": "0" },   // 5 : 프로그램타입
            { "CODE": "B003", "FLAG": "0" },   // 6 : 소스폴더
            { "CODE": "B031", "FLAG": "0" },   // 7 : 사용유무
            { "CODE": "B050", "FLAG": "0" },   // 8 : 업무모듈구분
        ],

        // API 설정
        api: {
            path: 'Bpa100n.ashx',
            query: 'UfnQuery',  // 프로그램 조회
            save: 'UfnSave'     // 프로그램 저장
        }
    };

    // ==============================================
    // 컴포넌트 설정
    // ==============================================

    /**
     * 조회조건 설정
     */
    function setFilter() {
        return {
            container: '#queryFilter',
            columns: 5,
            fields: [
                {
                    field: 'MC_MENU',
                    title: '매뉴대분류',
                    type: 'select',
                    comboIndex: 3,
                },
                {
                    field: 'MC_PGM_TYPE',
                    title: '프로그램타입',
                    type: 'select',
                    comboIndex: 5,
                },
                {
                    field: 'ID_PGM',
                    title: '프로그램ID',
                    type: 'input',
                },
                {
                    field: 'NM_KOR_PGM',
                    title: '프로그램명',
                    type: 'input',
                },
            ]
        };
    }

    /**
     * 그리드 설정
     */
    function setGrid() {
        return {
            container: '#grid1',
            toolBox: {
                left: [
                    { tool: 'setting', position: 'before' }
                ]
            },
            dataQuery: {
                path: CONFIG.api.path,
                funcNm: CONFIG.api.query,
                bParam: (queryData) => [
                    top.gSInfo[ERPSDB],
                    queryData.ID_PGM,
                    queryData.NM_KOR_PGM,
                    queryData.MC_MENU,
                    queryData.MC_PGM_TYPE,
                ],
            },
            saveQuery: {
                path: CONFIG.api.path,
                funcNm: CONFIG.api.save,
                bParam: [top.gSInfo[ERPSDB], '', '']
            },
            buildGridConfig: setGridCols,
            defaultValue: setDefaultValue,
            settingMenuItems: setSettingMenu(),
        };
    }

    /**
     * 그리드 컬럼 설정
     */
    function setGridCols(state) {
        return {
            defaultUnit: '%',
            columns: [
                {
                    field: 'MC_MENU',
                    caption: '메뉴대분류',
                    colType: 'C|NN|STR|M|SP',
                    inputCombo: gGridComboData[3],
                    groupTitle: {
                        aggregates: [{
                            func: (rows) => rows[0]?.NM_KOR_PGM,
                            field: 'MC_MENU'
                        }],
                        title: { template: `{{MC_MENU}}` }
                    },
                },
                { field: 'ID_PGM_TOP', caption: '상위ID', colType: 'STR|C|NN|S' },
                { field: 'NO_PGM', caption: '순서', colType: 'NUM|C|NN|XS' },
                {
                    field: 'ID_PGM',
                    caption: '프로그램ID',
                    colType: "STR|L|NN|M",
                    colCss: (data) => data.NO_PGM === 0 ? 'icon-hidden' : '',
                },
                { field: 'NM_KOR_PGM', caption: '프로그램명(한국어)', colType: 'STR|L|NN|XL' },
                { field: 'NM_ENG_PGM', caption: '프로그램명(영어)', colType: 'STR|L|XL' },
                { field: 'NM_CHN_PGM', caption: '프로그램명(중국어)', colType: 'STR|L|XL' },
                { field: 'MC_AMD_TYPE', caption: '권한분류', colType: 'STR|C|NN|M', type: 'combo', combo: gGridComboData[4] },
                {
                    field: 'MC_PGM_TYPE',
                    caption: '타입',
                    colType: 'STR|C|NN|M',
                    type: 'combo',
                    inputCombo: gGridComboData[5],
                    itemContent: (label, value) => `${value} | ${label}`
                },
                { field: 'PGM_FOLDER', caption: '폴더', colType: 'STR|C|NN|M', type: 'combo', combo: gGridComboData[6] },
                { field: 'YN_USE', caption: '사용유무', colType: 'STR|C|NN|S', type: 'combo', combo: gGridComboData[7] },
                { field: 'MC_MODL_TYPE', caption: '업무모듈구분', colType: 'STR|C|NN|M', type: 'combo', combo: gGridComboData[8] },
                { field: 'DT_PATCH_FIR', caption: '최초패치일자', colType: 'STR|H|EX' },
                { field: 'DT_PATCH_LST', caption: '최종패치일자', colType: 'STR|H|EX' },
                { field: 'BIGO', caption: '비고', colType: 'STR|L|XL|SP' },
                { field: 'TM_REG', caption: '등록일시', colType: 'STR|H|EX' },
                { field: 'TM_UPT', caption: '수정일시', colType: 'STR|H|EX' },
                { field: 'ROWID', caption: '행ID', colType: 'STR|H|EX' },
            ],
            rowCss: (data) => data.NO_PGM == 0 ? 'row-highlight' : '',
        };
    }

    /**
     * 행 추가시 기본값
     */
    function setDefaultValue(grid, state) {
        const focusValue = SBGrid3.getFocusedValue(state.datagrid)
            || SBGrid3.getRowByIndex(grid.datagrid, 0)?.data
            || { MC_MENU: "", ID_PGM_TOP: "", NO_PGM: 0, MC_PGM_TYPE: "", PGM_FOLDER: "", YN_USE: "Y" };

        const { MC_MENU, ID_PGM_TOP, NO_PGM, MC_PGM_TYPE, PGM_FOLDER, YN_USE } = focusValue;

        return {
            MC_MENU,
            ID_PGM_TOP,
            NO_PGM: NO_PGM + 1,
            MC_PGM_TYPE,
            PGM_FOLDER,
            YN_USE
        };
    }

    /**
     * 편의 메뉴 설정
     */
    function setSettingMenu() {
        return [
            {
                type: 'switch',
                title: '메뉴 그룹설정',
                name: 'showGroup',
                value: 'group',
                checked: false,
                onChange: onGroup
            },
            {
                type: 'check',
                title: '사용가능만 보기',
                name: 'showUseYn',
                checked: false,
                onChange: onUseYn
            },
        ];
    }

    // ==============================================
    // Event
    // ==============================================

    /**
     * 그룹 설정 활성화/비활성화
     */
    function onGroup(checked) {
        if (checked) {
            SBGrid3.setGroup(_grid.datagrid, [{ field: "MC_MENU", isOpen: true }]);
        } else {
            SBGrid3.setGroup(_grid.datagrid, []);
        }
    }

    /**
     * 사용가능만 필터
     */
    function onUseYn(checked) {
        if (checked) {
            SBGrid3.setFilter(_grid.datagrid, 'YN_USE', {
                field: 'YN_USE',
                operator: 'IsEqualTo',
                values: 'Y'
            });
        } else {
            SBGrid3.setFilter(_grid.datagrid, 'YN_USE');
        }
    }

    /**
     * 프로그램 이동
     */
    function movePgm(pgmId) {
        const focusValue = SBGrid3.getFocusedValue(_grid.datagrid);

        // HID 타입이거나 사용유무가 'N'인 경우 프로그램 오픈하지 않음
        if (focusValue.MC_PGM_TYPE === "HID" || focusValue.YN_USE !== "Y") {
            return;
        }

        top.gTopAces.mMain.open(pgmId);
    }

    /**
     * 페이지 초기화
     */
    async function init() {
        try {
            // 프로그램 이동 템플릿 로드

            // 콤보 데이터 로드
            await CtvPageUtils.loadComboData(CONFIG.comboParams);

            // Vue 기반 필터 및 그리드 생성
            // 내부적으로 Vue 컴포넌트를 사용하지만, API는 동일
            _filter = new CtvQueryFilter(setFilter());
            _grid = new CtvDataGrid(setGrid());

        } catch (error) {
            console.error('[Bpa100n] 초기화 중 에러:', error);
        }
    }

    return {
        init,

        // 외부 접근 필요시 사용
        get filter() { return _filter; },
        get grid() { return _grid; },

        movePgm: movePgm,
    };
})();

// 외부 함수 (템플릿에서 호출)
function ufnMovePgmId(sPgmId) {
    Bpa100n.movePgm(sPgmId);
}
