
/**
 * CTV Data Service
 * API 통신 로직을 담당하는 서비스 (MVC 패턴의 Model 역할)
 */
const CtvDataService = {
    /**
     * 데이터 조회
     * @param {Object} queryConfig - 조회 설정 객체 (path, funcNm, bParam 등)
     * @param {Object|Array} params - 조회 파라미터 (bParam 생성에 사용될 데이터)
     * @param {Object} options - 추가 옵션
     * @returns {Promise<any>} 조회 결과 데이터
     */
    async query(queryConfig, params = {}, options = {}) {
        if (!queryConfig) {
            console.error("[CtvDataService] queryConfig가 없습니다.");
            return null;
        }

        // 1. bParam 구성
        let bParam;
        if (typeof queryConfig.bParam === "function") {
            bParam = queryConfig.bParam(params);
        } else {
            bParam = queryConfig.bParam || [];
        }

        bParam = this._normalizeBParam(bParam);

        // 2. API 호출
        let result;
        try {
            if (typeof top !== 'undefined' && top.mwHourglassShow) {
                top.mwHourglassShow();
            }

            if (queryConfig.onQuery && typeof queryConfig.onQuery === "function") {
                // 커스텀 조회 함수 사용
                result = await queryConfig.onQuery(params);
            } else if (queryConfig.funcNm && typeof ufnXhrDotNetCaller04 === "function") {
                // ufnXhrDotNetCaller04 사용 (권장)
                result = await ufnXhrDotNetCaller04(
                    true,
                    queryConfig.path,
                    [queryConfig.funcNm, ""],
                    bParam
                );
            } else if (typeof ufnXhrDotNetCaller01 === "function") {
                // ufnXhrDotNetCaller01 사용 (구버전)
                result = await ufnXhrDotNetCaller01(
                    true,
                    queryConfig.path,
                    bParam
                );
            } else {
                console.error("[CtvDataService] 조회 함수를 찾을 수 없습니다.");
                return null;
            }
        } catch (error) {
            console.error("[CtvDataService] 데이터 조회 실패:", error);
            if (typeof top !== 'undefined' && top.SetMessage) {
                top.SetMessage("데이터 조회 중 오류가 발생했습니다.");
            }
            throw error;
        } finally {
            if (typeof top !== 'undefined' && top.mwHourglassHide) {
                top.mwHourglassHide();
            }
        }

        // 3. 결과 처리
        if (result && result.ErrorCode !== "") {
            if (typeof top !== 'undefined' && top.mwPop09Open) {
                top.mwPop09Open(result, result.ErrorCode);
            }
            return null;
        }

        return result;
    },

    /**
     * 데이터 저장
     * @param {Object} saveConfig - 저장 설정 객체 (path, funcNm, bParam 등)
     * @param {Array} aSaveData - 저장할 데이터 배열 (헤더 포함)
     * @param {Object} context - 호출 컨텍스트 (예: this) - bParam 함수에 전달됨
     * @returns {Promise<any>} 저장 결과
     */
    async save(saveConfig, aSaveData, context = null) {
        if (!saveConfig) {
            console.error("[CtvDataService] saveConfig가 없습니다.");
            return null;
        }

        if (!saveConfig.path) {
            console.error("[CtvDataService] 저장 URL(path)이 설정되지 않았습니다.");
            if (typeof top !== "undefined" && top.SetMessage) {
                top.SetMessage("저장 URL이 설정되지 않았습니다.");
            }
            return null;
        }

        const url = saveConfig.path;
        const funcName = saveConfig.funcName || saveConfig.funcNm || "UfnSave";

        // 1. bParam 구성
        let bParam;
        if (typeof saveConfig.bParamBuilder === "function") {
            bParam = saveConfig.bParamBuilder(context);
        } else if (typeof saveConfig.bParam === "function") {
            bParam = saveConfig.bParam(context);
        } else {
            bParam = saveConfig.bParam || [];
        }

        // 2. API 호출
        let result;
        try {
            if (typeof top !== "undefined" && top.mwHourglassShow) {
                top.mwHourglassShow("데이터 저장중 입니다.");
            }

            if (typeof ufnXhrDotNetCaller04 === "function") {
                result = await ufnXhrDotNetCaller04(
                    true,
                    url,
                    [funcName, ""],
                    bParam,
                    aSaveData
                );
            } else if (typeof ufnXhrDotNetCaller01 === "function") {
                result = await ufnXhrDotNetCaller01(
                    true,
                    url,
                    bParam,
                    aSaveData
                );
            } else {
                console.error("[CtvDataService] 저장 함수를 찾을 수 없습니다.");
                return null;
            }
        } catch (err) {
            console.error("Error : 저장 처리 \r\n" + err);
            if (typeof saveConfig.onError === "function") {
                saveConfig.onError(err, context);
            } else if (typeof top !== "undefined" && top.SetMessage) {
                top.SetMessage("저장 중 오류가 발생했습니다.");
            }
            throw err;
        } finally {
            if (typeof top !== "undefined" && top.mwHourglassHide) {
                top.mwHourglassHide();
            }
        }

        // 3. 결과 처리
        if (!result) {
            console.error("[CtvDataService] 서버 응답이 없습니다.");
            if (typeof saveConfig.onError === "function") {
                saveConfig.onError(new Error("서버 응답 없음"), context);
            }
            return null;
        }

        if (result.ErrorCode !== "") {
            if (typeof top !== "undefined" && top.mwPop09Open) {
                top.mwPop09Open(result, result.ErrorCode);
            }
            if (typeof saveConfig.onError === "function") {
                saveConfig.onError(result, context);
            }
            return result;
        }

        // 성공 처리
        if (typeof CtvModal !== "undefined" && CtvModal.alert) {
            await CtvModal.alert("정상적으로 저장처리 되었습니다.");
        } else if (typeof top !== "undefined" && top.SetMessage) {
            top.SetMessage("저장되었습니다.");
        }

        if (typeof saveConfig.onSuccess === "function") {
            await saveConfig.onSuccess(result, context);
        }

        return result;
    },

    /**
     * 결과 데이터에서 실제 데이터 추출
     */
    extractData(result, dataName = 'rsData01') {
        if (!result) return [];

        if (dataName && result[dataName] !== undefined && result[dataName] !== null) {
            const value = result[dataName];
            if (value === '') return [];
            try {
                const data = typeof value === "string" ? JSON.parse(value) : value;
                if (Array.isArray(data)) return data;
            } catch (error) {
                console.error(`[CtvDataService] ${dataName} 파싱 실패:`, error);
                return [];
            }
        }

        if (Array.isArray(result)) return result;
        return [];
    },

    /**
     * bParam 배열 정규화
     */
    _normalizeBParam(bParam) {
        if (!Array.isArray(bParam)) {
            return [];
        }

        return bParam.map((param) => {
            if (
                param === undefined ||
                param === null ||
                (typeof param === "number" && isNaN(param))
            ) {
                return "";
            }
            if (typeof param === "string") {
                return param.trim();
            }
            return param;
        });
    }
};

export default CtvDataService;
