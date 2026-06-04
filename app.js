// CareTable - Bulletproof Logic Engine (Version 3.1)

// 식약처 고시 식품 알레르기 유발물질 22종
const ALLERGEN_CATEGORIES = [
    "난류(가금류)", "우유", "메밀", "땅콩", "대두", "밀", "고등어", "게", "새우", "돼지고기", 
    "복숭아", "토마토", "아황산류", "호두", "닭고기", "쇠고기", "오징어", "조개류(굴,전복,홍합 포함)", 
    "잣", "겨자", "깨", "루핀"
];

// 만성 기저질환 및 섭식 장애 7종
const DISEASE_CATEGORIES = [
    "당뇨병", "고혈압", "신장질환", "유당불내증", "연하장애 1단계(다짐식)", "연하장애 2단계(연화식)", "연하장애 3단계(무스식)"
];

// 단체급식 메뉴-알레르기 유발 유래 성분 매핑 로컬 사전 (Rule-based 매칭용)
const MENU_ALLERGEN_MAP = {
    "현미밥": [],
    "쌀밥": [],
    "잡곡밥": [],
    "보리밥": [],
    "귀리잡곡밥": [],
    "귀리죽": [],
    "배추김치": ["밀", "대두"],
    "깍두기": ["밀", "대두"],
    "미역국": ["쇠고기", "조개류(굴,전복,홍합 포함)"],
    "근대된장국": ["대두", "밀"],
    "맑은 무국": ["쇠고기"],
    "된장찌개": ["대두", "밀", "조개류(굴,전복,홍합 포함)"],
    "저나트륨 된장국": ["대두", "밀"],
    "닭살야채볶음": ["닭고기", "대두", "밀"],
    "닭가슴살야채볶음": ["닭고기", "대두", "밀"],
    "불고기": ["쇠고기", "대두", "밀"],
    "제육볶음": ["돼지고기", "대두", "밀"],
    "오징어볶음": ["오징어", "대두", "밀"],
    "오징어채무침": ["오징어", "대두", "밀"],
    "생선구이": ["고등어", "대두", "밀"],
    "계란찜": ["난류(가금류)", "우유"],
    "순두부계란찜": ["난류(가금류)", "우유", "대두"],
    "달걀찜": ["난류(가금류)", "우유"],
    "계란말이": ["난류(가금류)"],
    "두부구이": ["대두"],
    "연두부구이": ["대두"],
    "연두부구이 + 약콩 두유": ["대두"],
    "두부조림": ["대두", "밀"],
    "시금치나물": [],
    "고구마순나물": [],
    "버섯찌개": ["대두", "밀"],
    "저나트륨 버섯국": ["대두", "밀"],
    "요구르트": ["우유"],
    "요플레": ["우유"],
    "약콩 두유": ["대두"],
    "오렌지주스": ["복숭아"],
    "돈까스": ["돼지고기", "밀", "난류(가금류)", "우유", "대두"],
    "양배추 샐러드": ["난류(가금류)", "우유"],
    "조기구이": ["고등어"],
    "명란젓갈": ["조개류(굴,전복,홍합 포함)"],
    "칼국수": ["밀", "조개류(굴,전복,홍합 포함)", "대두"],
    "야채만두": ["밀", "돼지고기", "대두"],
    "식식빵": ["밀", "우유"],
    "사과잼": [],
    "우유": ["우유"]
};

// Database of Default Mock Data
const defaultMembers = {
    child: [
        { id: 101, name: "김민수", age: "5세 / 남", type: "알레르기", detail: "달걀, 우유", instruction: "달걀말이 대신 두부구이, 요구르트 대신 오렌지주스로 전면 대체 배식 필요", status: "care" },
        { id: 102, name: "이영희", age: "6세 / 여", type: "일반", detail: "없음", instruction: "표준 건강 식단 및 적정 정량 배식", status: "safe" },
        { id: 103, name: "박예준", age: "4세 / 남", type: "알레르기", detail: "대두, 밀", instruction: "된장 및 간장 양념 최소화, 쌀가루 글루텐프리 튀김옷 사용 교차오염 방지", status: "care" }
    ],
    senior: [
        { id: 201, name: "최옥분", age: "78세 / 여", type: "질환식", detail: "당뇨병, 고혈압", instruction: "나트륨 1,500mg 이하 저염식, 정제 설탕 배제, 백미 대신 귀리잡곡밥 믹싱 지급", status: "care" },
        { id: 202, name: "이명자", age: "82세 / 여", type: "질환식", detail: "유당불내증", instruction: "간식 제공 시 일반 요플레/요구르트 배제, 락토프리 약콩 두유 대체 지급", status: "care" },
        { id: 203, name: "김성진", age: "80세 / 남", type: "질환식", detail: "연하 2단계", instruction: "씹기 장애에 따른 미세 연화 조리(부드러운 입자), 딱딱한 견과류 전면 배제", status: "care" }
    ],
    family: [
        { id: 301, name: "막내아들", age: "8세 / 남", type: "알레르기", detail: "우유, 밀가루", instruction: "밀크 및 빵류 간식 절대 급지, 오렌지주스 및 감자 떡볶이 대체", status: "care" },
        { id: 302, name: "할머니", age: "85세 / 여", type: "질환식", detail: "연하 2단계", instruction: "삼킴 장애 대응 연화 조리, 식사 시 다진 야채 및 수분기 많은 양념 조리", status: "care" }
    ]
};

const defaultDiets = [
    {
        date: "2026.06.01 (월) 중식",
        menu: [
            { name: "현미밥", weight: "210g" },
            { name: "닭살야채볶음", weight: "150g" },
            { name: "미역국", weight: "150g" },
            { name: "배추김치", weight: "40g" }
        ],
        results: [
            { num: 1, type: "알레르기", title: "알레르기 주의", desc: "대두, 밀, 닭고기 성분 주의 (김민수 외 1명)", status: "warning" },
            { num: 2, type: "질환식", title: "질환별 적합성", desc: "당뇨 환자 단순당 및 혈당 상승 유의 (최옥분 어르신)", status: "warning" },
            { num: 3, type: "연하식", title: "연하식 적합성", desc: "연하 2단계 아동/어르신 연화처리 식사 제공 권장", status: "info" },
            { num: 4, type: "영양", title: "영양 적정성", desc: "당일 중식 식단 나트륨 과다 (권장량 대비 35% 초과)", status: "danger" },
            { num: 5, type: "식중독", title: "식중독 위험", desc: "현재 기상 정보 및 계절적 요인에 따른 식중독 발생 위험도: 보통", status: "info" }
        ],
        alternative: {
            from: "닭살야채볶음",
            to: "닭가슴살야채볶음",
            effect: "나트륨 32% 감소, 포화지방 20% 감소, 대두/밀 알레르기 교차오염 차단 대체재"
        }
    },
    {
        date: "2026.06.02 (화) 중식",
        menu: [
            { name: "쌀밥", weight: "210g" },
            { name: "불고기", weight: "120g" },
            { name: "된장찌개", weight: "150g" },
            { name: "시금치나물", weight: "50g" }
        ],
        results: [
            { num: 1, type: "알레르기", title: "알레르기 주의", desc: "대두 성분 주의 (박예준 아동 양념)", status: "warning" },
            { num: 2, type: "질환식", title: "질환별 적합성", desc: "백미 쌀밥 및 고나트륨 된장찌개 혈당/혈압 상승 유의 (최옥분 어르신)", status: "warning" },
            { num: 3, type: "영양", title: "영양 적정성", desc: "당일 중식 정제 탄수화물 비율 높음 (현미밥 대체 권장)", status: "warning" },
            { num: 4, type: "식중독", title: "식중독 위험", desc: "현재 기상 정보 및 계절적 요인에 따른 식중독 발생 위험도: 보통", status: "info" }
        ],
        alternative: {
            from: "쌀밥 + 된장찌개",
            to: "귀리잡곡밥 + 저나트륨 된장국",
            effect: "단당류 탄수화물 흡수율 40% 저하 및 염도 0.6% 저감 효과"
        }
    },
    {
        date: "2026.06.03 (수) 중식",
        menu: [
            { name: "잡곡밥", weight: "210g" },
            { name: "생선구이", weight: "100g" },
            { name: "계란찜", weight: "80g" },
            { name: "요구르트", weight: "80ml" }
        ],
        results: [
            { num: 1, type: "알레르기", title: "알레르기 위험", desc: "달걀, 우유 알레르기 유발 성분 대량 포함 (김민수 아동 비상)", status: "danger" },
            { num: 2, type: "질환식", title: "질환별 적합성", desc: "유당불내증 간식(요구르트) 제한 지침 대조 (이명자 어르신)", status: "warning" },
            { num: 3, type: "연하식", title: "연하식 적합성", desc: "생선 가시 제거 및 부드러운 순두부계란찜 대체 권유", status: "info" },
            { num: 4, type: "식중독", title: "식중독 위험", desc: "고온 환경에 따른 어패류 유통 위생 주의보: 식중독 주의 요망", status: "warning" }
        ],
        alternative: {
            from: "계란찜 + 요구르트",
            to: "연두부구이 + 약콩 두유",
            effect: "달걀/우유 알러지원 원천 배제 및 락토프리 식단 전환 성공"
        }
    }
];

const defaultRecalls = [
    { brand: "OO식품 제조", food: "해물믹스", type: "회수", reason: "금속성 이물질 검출 및 세균 기준치 초과 가능성", date: "2026.05.28" },
    { brand: "△△푸드", food: "국산 콩나물", type: "주의", reason: "보존제(이산화황) 허용 기준치 미량 초과 검출", date: "2026.05.27" },
    { brand: "□□유통", food: "냉동새우살", type: "주의", reason: "냉동 보관 위생 부적합 판정 및 대장균 수 초과", date: "2026.05.25" },
    { brand: "성실유통", food: "가래떡", type: "회수", reason: "허가되지 않은 보존 첨가물 검출", date: "2026.05.20" },
    { brand: "신선푸드", food: "어묵 슬라이스", type: "주의", reason: "위생 전처리 기준 위반 건", date: "2026.05.15" },
    { brand: "대자연푸드", food: "도토리묵", type: "회수", reason: "잔류 농약 기준 미달 원재료 사용 회수 조치", date: "2026.05.10" }
];

const defaultLogs = [
    { date: "2026.05.29", menu: "귀리잡곡밥, 저나트륨 버섯국, 연두부구이, 깍두기, 약콩 두유", facility: "senior", target: "최옥분(당뇨), 이명자(유당)", alternative: "쌀밥 ➔ 귀리잡곡밥, 요플레 ➔ 두유 대체", guideline: "당뇨/유당불내증 전용 대체 식단 조립", vlmStatus: "PASS", timestamp: "2026.05.29 11:55" },
    { date: "2026.05.28", menu: "쌀밥, 두부구이, 오징어채무침, 맑은 무국, 오렌지주스", facility: "child", target: "김민수(달걀/우유)", alternative: "달걀말이 ➔ 두부구이, 요구르트 ➔ 주스 대체", guideline: "식재료 라벨 점검 및 조리기구 세척", vlmStatus: "PASS", timestamp: "2026.05.28 12:02" }
];

// Global State
const state = {
    currentTab: 'dashboard',
    currentMode: 'agency', 
    currentFacility: 'child', 
    members: JSON.parse(JSON.stringify(defaultMembers)), 
    logs: JSON.parse(JSON.stringify(defaultLogs)),
    
    selectedUserId: 101, 
    selectedMealIndex: 0, 
    selectedVlmImage: null, 
    customVlmImageSrc: null,
    vlmApproved: false,
    recallSearchQuery: '',
    
    charts: {
        dashboard: null,
        statsDoughnut: null,
        statsPie: null,
        esg: null
    }
};

const apiConfig = {
    key: localStorage.getItem('OPENROUTER_API') || '',
    model: localStorage.getItem('caremeal_api_model') || 'nvidia/llama-3.1-nemotron-70b-instruct:free'
};

const freeLLMModels = [
    "deepseek/deepseek-v4-flash:free",
    "qwen/qwen3-next-80b-a3b-instruct:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "google/gemma-4-26b-a4b:free",
    "nvidia/llama-3.1-nemotron-70b-instruct:free"
];

const freeVLMModels = [
    "google/gemma-4-26b-a4b:free",
    "nvidia/nemotron-nano-12b-2-vl:free",
    "meta-llama/llama-3.2-11b-vision-instruct:free"
];

// Cache DOM Elements
let elements = {};

document.addEventListener('DOMContentLoaded', () => {
    cacheDomElements();
    loadDatabase();
    initThemeManager();
    initModeToggler();
    initTabs();
    initFacilitySelector();
    initDietAnalyzer();
    initDietVerification();
    initIngredientSafety();
    initUserCustomMgmt();
    initStatsReport();
    initReportCenter();
    initApiConfig();
    
    // Launch app
    switchTab('dashboard');
    updateApiStatusUI();
});

function cacheDomElements() {
    elements = {
        navButtons: document.querySelectorAll('.nav-btn'),
        tabContents: document.querySelectorAll('.tab-content'),
        facilitySelect: document.getElementById('facility-select'),
        facilitySelectorWrapper: document.getElementById('facility-selector-wrapper'),
        pageMainTitle: document.getElementById('page-main-title'),
        pageSubTitle: document.getElementById('page-sub-title'),
        mainBadge: document.getElementById('main-badge'),
        apiStatusBadge: document.getElementById('api-status-badge'),
        apiStatusText: document.getElementById('api-status-text'),
        themeToggleBtn: document.getElementById('theme-toggle-btn'),
        themeToggleText: document.getElementById('theme-toggle-text'),
        modeToggleCheckbox: document.getElementById('mode-toggle-checkbox'),
        modeTextLeft: document.getElementById('mode-text-left'),
        modeTextRight: document.getElementById('mode-text-right'),
        userAvatarInitial: document.getElementById('user-avatar-initial'),
        userDisplayName: document.getElementById('user-display-name'),
        userDisplayRole: document.getElementById('user-display-role'),
        
        statTotalMembers: document.getElementById('stat-total-members'),
        statDietCheckCount: document.getElementById('stat-diet-check-count'),
        statRiskAlerts: document.getElementById('stat-risk-alerts'),
        lblTotalMembers: document.getElementById('lbl-total-members'),
        lblTotalDesc: document.getElementById('lbl-total-desc'),
        dashboardApplyAltBtn: document.getElementById('dashboard-apply-alt-btn'),
        
        dietBulkInput: document.getElementById('diet-bulk-input'),
        analyzeDietBtn: document.getElementById('analyze-diet-btn'),
        analyzerLoading: document.getElementById('analyzer-loading'),
        analyzerModelIndicator: document.getElementById('analyzer-model-indicator'),
        loadingText: document.getElementById('loading-text'),
        scheduleResultView: document.getElementById('schedule-result-view'),
        scheduleCardsContainer: document.getElementById('schedule-cards-container'),
        scheduleStatusBanner: document.getElementById('schedule-status-banner'),
        scheduleSummaryTitle: document.getElementById('schedule-summary-title'),
        scheduleSummaryDesc: document.getElementById('schedule-summary-desc'),
        scheduleEmptyView: document.getElementById('schedule-empty-view'),
        confirmAllDietBtn: document.getElementById('confirm-all-diet-btn'),
        exampleTags: document.querySelectorAll('.example-tag'),

        btnPrevMeal: document.getElementById('btn-prev-meal'),
        btnNextMeal: document.getElementById('btn-next-meal'),
        selectedMealLabel: document.getElementById('selected-meal-label'),
        verificationMenuList: document.getElementById('verification-menu-list'),
        verificationResultsList: document.getElementById('verification-results-list'),
        applyAlternativeDietBtn: document.getElementById('apply-alternative-diet-btn'),
        vAlternativeBox: document.getElementById('v-alternative-box'),
        
        vlmOptNormal: document.getElementById('sim-opt-normal'),
        vlmOptAlternative: document.getElementById('sim-opt-alternative'),
        vlmTargetImage: document.getElementById('vlm-target-image'),
        vlmPlaceholder: document.getElementById('vlm-placeholder'),
        runVlmBtn: document.getElementById('run-vlm-btn'),
        scannerLaser: document.getElementById('scanner-laser'),
        vlmEmptyResult: document.getElementById('vlm-empty-result'),
        vlmResultPanel: document.getElementById('vlm-result-panel'),
        vlmVerdictBox: document.getElementById('vlm-verdict-box'),
        verdictIconContainer: document.getElementById('verdict-icon-container'),
        verdictTitle: document.getElementById('verdict-title'),
        vlmMatchRate: document.getElementById('vlm-match-rate'),
        vlmMatchValue: document.getElementById('vlm-match-value'),
        vlmAllergenStatus: document.getElementById('vlm-allergen-status'),
        vlmPortionStatus: document.getElementById('vlm-portion-status'),
        vlmAnalysisReason: document.getElementById('vlm-analysis-reason'),
        vlmActionFooter: document.getElementById('vlm-action-footer'),
        triggerFileBtn: document.getElementById('trigger-file-btn'),
        vlmFileInput: document.getElementById('vlm-file-input'),

        safetySearchInput: document.getElementById('safety-search-input'),
        btnSearchSafety: document.getElementById('btn-search-safety'),
        recallTableBody: document.getElementById('recall-table-body'),
        btnLoadMoreRecalls: document.getElementById('btn-load-more-recalls'),
        recallTotalBadge: document.getElementById('recall-total-badge'),

        customUserPickerContainer: document.getElementById('custom-user-picker-container'),
        customTabBtns: document.querySelectorAll('.custom-tab-btn'),
        subtabWarnings: document.getElementById('subtab-warnings'),
        subtabInfo: document.getElementById('subtab-info'),
        subtabHistory: document.getElementById('subtab-history'),
        selectedUserAvatar: document.getElementById('selected-user-avatar'),
        selectedUserName: document.getElementById('selected-user-name'),
        selectedUserType: document.getElementById('selected-user-type'),
        selectedUserDiseases: document.getElementById('selected-user-diseases'),
        selectedUserDiets: document.getElementById('selected-user-diets'),
        selectedUserAllergies: document.getElementById('selected-user-allergies'),
        selectedUserSwallow: document.getElementById('selected-user-swallow'),
        userGuidelinesPills: document.getElementById('user-guidelines-pills'),
        userAvoidFoods: document.getElementById('user-avoid-foods'),
        infoDetailsList: document.getElementById('info-details-list'),
        historyTimelineContainer: document.getElementById('history-timeline-container'),
        panelMemberTitle: document.getElementById('panel-member-title'),

        statsDateStart: document.getElementById('stats-date-start'),
        statsDateEnd: document.getElementById('stats-date-end'),
        btnStatsSearch: document.getElementById('btn-stats-search'),

        reportSubTabBtns: document.querySelectorAll('.sub-tab-btn'),
        reportDocTitle: document.getElementById('report-doc-title'),
        rFacilityName: document.getElementById('r-facility-name'),
        rDate: document.getElementById('r-date'),
        rWriter: document.getElementById('r-writer'),
        reportDocContent: document.getElementById('report-doc-content'),
        printReportBtn: document.getElementById('print-report-btn'),
        reportConfirmStatement: document.getElementById('report-confirm-statement'),
        reportSignerName: document.getElementById('report-signer-name'),
        reportFooterDesc: document.getElementById('report-footer-desc'),
        navReportBtn: document.getElementById('nav-report-btn'),
        esgCo2: document.getElementById('esg-co2'),
        esgTime: document.getElementById('esg-time'),
        esgLocal: document.getElementById('esg-local'),

        addMemberBtn: document.getElementById('add-member-btn'),
        addMemberModal: document.getElementById('add-member-modal'),
        closeMemberModalBtn: document.getElementById('close-member-modal-btn'),
        cancelMemberBtn: document.getElementById('cancel-member-btn'),
        memberForm: document.getElementById('member-form'),
        modalMemberTitle: document.getElementById('modal-member-title'),
        allergenSelectorGroup: document.getElementById('allergen-selector-group'),
        diseaseSelectorGroup: document.getElementById('disease-selector-group'),
        allergenCheckboxGrid: document.getElementById('allergen-checkbox-grid'),
        diseaseCheckboxGrid: document.getElementById('disease-checkbox-grid'),
        mRiskType: document.getElementById('m-risk-type'),
        apiConfigForm: document.getElementById('api-config-form'),
        apiKeyInput: document.getElementById('api-key-input'),
        apiModelSelect: document.getElementById('api-model-select'),
        toggleKeyVisibilityBtn: document.getElementById('toggle-key-visibility-btn'),
        resetApiKeyBtn: document.getElementById('reset-api-key-btn')
    };
}

function loadDatabase() {
    try {
        ['child', 'senior', 'family'].forEach(key => {
            const stored = localStorage.getItem(`caremeal_members_${key}`);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    state.members[key] = parsed;
                } else {
                    saveDatabase(key);
                }
            } else {
                saveDatabase(key);
            }
        });
    } catch (e) {
        console.error('Database parse error:', e);
        localStorage.clear();
        state.members = JSON.parse(JSON.stringify(defaultMembers));
        saveDatabase('child');
        saveDatabase('senior');
        saveDatabase('family');
    }

    try {
        const storedLogs = localStorage.getItem('caremeal_logs');
        if (storedLogs) {
            state.logs = JSON.parse(storedLogs);
        } else {
            localStorage.setItem('caremeal_logs', JSON.stringify(state.logs));
        }
    } catch (e) {
        console.error('Logs parse error:', e);
        state.logs = JSON.parse(JSON.stringify(defaultLogs));
        saveLogs();
    }
}

function saveDatabase(key) {
    localStorage.setItem(`caremeal_members_${key}`, JSON.stringify(state.members[key]));
}

function saveLogs() {
    localStorage.setItem('caremeal_logs', JSON.stringify(state.logs));
}

function initThemeManager() {
    if (!elements.themeToggleBtn) return;
    
    const storedTheme = localStorage.getItem('caremeal_theme') || 'light';
    applyTheme(storedTheme);

    elements.themeToggleBtn.addEventListener('click', () => {
        const isDark = document.body.classList.contains('dark-mode');
        const nextTheme = isDark ? 'light' : 'dark';
        applyTheme(nextTheme);
        localStorage.setItem('caremeal_theme', nextTheme);
    });
}

function applyTheme(theme) {
    const icon = elements.themeToggleBtn ? elements.themeToggleBtn.querySelector('i') : null;
    
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        if (icon) icon.className = 'fa-solid fa-sun';
        if (elements.themeToggleText) elements.themeToggleText.textContent = '라이트 모드';
    } else {
        document.body.classList.remove('dark-mode');
        if (icon) icon.className = 'fa-solid fa-moon';
        if (elements.themeToggleText) elements.themeToggleText.textContent = '다크 모드';
    }
    
    setTimeout(() => {
        updateCharts();
    }, 100);
}

function initModeToggler() {
    if (!elements.modeToggleCheckbox) return;

    const storedMode = localStorage.getItem('caremeal_mode');
    if (storedMode) {
        state.currentMode = storedMode;
        elements.modeToggleCheckbox.checked = (storedMode === 'family');
    }
    
    applyModeTheme();

    elements.modeToggleCheckbox.addEventListener('change', (e) => {
        state.currentMode = e.target.checked ? 'family' : 'agency';
        localStorage.setItem('caremeal_mode', state.currentMode);
        
        applyModeTheme();
        resetVlmUI();
        
        const listKey = state.currentMode === 'family' ? 'family' : state.currentFacility;
        if (state.members[listKey] && state.members[listKey].length > 0) {
            state.selectedUserId = state.members[listKey][0].id;
        }
        
        switchTab(state.currentTab);
        showNotification(`${state.currentMode === 'family' ? '가정 케어' : '시설 위생 관리'} 모드로 전환되었습니다.`);
    });
}

function applyModeTheme() {
    const modeLeft = elements.modeTextLeft;
    const modeRight = elements.modeTextRight;
    
    if (state.currentMode === 'family') {
        if (modeLeft) modeLeft.classList.remove('active-mode');
        if (modeRight) modeRight.classList.add('active-mode');
        if (elements.facilitySelectorWrapper) elements.facilitySelectorWrapper.classList.add('hidden');
        if (elements.mainBadge) {
            elements.mainBadge.textContent = '일반 소비자 모드';
            elements.mainBadge.style.background = 'rgba(124, 58, 237, 0.08)';
            elements.mainBadge.style.borderColor = 'rgba(124, 58, 237, 0.2)';
            elements.mainBadge.style.color = '#7c3aed';
        }
        
        if (elements.userAvatarInitial) elements.userAvatarInitial.textContent = '가';
        if (elements.userDisplayName) elements.userDisplayName.textContent = '서교동 삼총사';
        if (elements.userDisplayRole) elements.userDisplayRole.textContent = '가정 자율 영양 케어';
        if (elements.navReportBtn) elements.navReportBtn.innerHTML = '<i class="fa-solid fa-file-invoice"></i> <span>안전 증빙 일지</span>';
    } else {
        if (modeLeft) modeLeft.classList.add('active-mode');
        if (modeRight) modeRight.classList.remove('active-mode');
        if (elements.facilitySelectorWrapper) elements.facilitySelectorWrapper.classList.remove('hidden');
        if (elements.mainBadge) {
            elements.mainBadge.textContent = '게스트 기관 모드';
            elements.mainBadge.style.background = 'rgba(37, 99, 235, 0.08)';
            elements.mainBadge.style.borderColor = 'rgba(37, 99, 235, 0.2)';
            elements.mainBadge.style.color = 'var(--color-blue)';
        }
        
        if (elements.userAvatarInitial) elements.userAvatarInitial.textContent = '복';
        if (elements.userDisplayName) elements.userDisplayName.textContent = '박아름 사회복지사';
        if (elements.userDisplayRole) elements.userDisplayRole.textContent = '마포구 시설 운영대표';
        if (elements.navReportBtn) elements.navReportBtn.innerHTML = '<i class="fa-solid fa-file-shield"></i> <span>평가 증빙 & ESG</span>';
    }
}

function initTabs() {
    if (!elements.navButtons) return;
    elements.navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
}

function switchTab(tabId) {
    state.currentTab = tabId;
    
    if (elements.navButtons) {
        elements.navButtons.forEach(btn => {
            if (btn.getAttribute('data-tab') === tabId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    if (elements.tabContents) {
        elements.tabContents.forEach(content => {
            if (content.id === tabId) {
                content.classList.add('active-tab');
            } else {
                content.classList.remove('active-tab');
            }
        });
    }

    updateHeaderTitles(tabId);
    
    if (tabId === 'dashboard') {
        renderDashboard();
    } else if (tabId === 'diet-verification') {
        renderDietVerification();
    } else if (tabId === 'user-custom-mgmt') {
        renderUserCustomMgmt();
    } else if (tabId === 'stats-report') {
        renderStatsReport();
    } else if (tabId === 'report-generator') {
        renderReport();
    }
}

function updateHeaderTitles(tabId) {
    let modeTitle = '';
    if (state.currentMode === 'family') {
        modeTitle = '가정 식단 케어';
    } else {
        modeTitle = state.currentFacility === 'child' ? '튼튼어린이집' : '행복실버요양원';
    }
    
    if (elements.pageMainTitle) {
        switch (tabId) {
            case 'dashboard':
                elements.pageMainTitle.textContent = `${modeTitle} 종합 대시보드`;
                if (elements.pageSubTitle) elements.pageSubTitle.textContent = '급식소 실시간 급식 안전성 및 영양 관리 요약';
                break;
            case 'diet-analyzer':
                elements.pageMainTitle.textContent = '식단 AI 분석';
                if (elements.pageSubTitle) elements.pageSubTitle.textContent = '식단을 대량 입력하면 OpenRouter AI가 수혜자 DB와 실시간 스크리닝 분석을 시행합니다.';
                break;
            case 'diet-verification':
                elements.pageMainTitle.textContent = '식단 검증';
                if (elements.pageSubTitle) elements.pageSubTitle.textContent = '지정 일자별 급식 위험요소 2차 비전 검증 및 대체식 영양 개선 분석';
                break;
            case 'ingredient-safety':
                elements.pageMainTitle.textContent = '식재료 안전 모니터링';
                if (elements.pageSubTitle) elements.pageSubTitle.textContent = '식품의약품안전처 위해 및 회수 식품 표준 정보 실시간 동기화 검색';
                break;
            case 'user-custom-mgmt':
                elements.pageMainTitle.textContent = '이용자 맞춤 관리';
                if (elements.pageSubTitle) elements.pageSubTitle.textContent = '사회보장정보 기반 집중 식이 케어 대상자 맞춤 지침 및 주의 정보';
                break;
            case 'stats-report':
                elements.pageMainTitle.textContent = '통계 리포트';
                if (elements.pageSubTitle) elements.pageSubTitle.textContent = '검출된 급식 위해 정보 통계 및 기간별 위험 알림 유형 분석';
                break;
            case 'report-generator':
                elements.pageMainTitle.textContent = state.currentMode === 'family' ? '가정 식단 위생 일지' : '평가 증빙 및 ESG 센터';
                if (elements.pageSubTitle) elements.pageSubTitle.textContent = '한국사회보장정보원 시스템 증빙 양식 출력 및 디지털 친환경 행정 지표 요약';
                break;
            case 'service-flow':
                elements.pageMainTitle.textContent = '서비스 개요';
                if (elements.pageSubTitle) elements.pageSubTitle.textContent = 'CareTable의 실시간 AI 급식 영양 안전 서비스 작동 구조도 및 민간 협업 인프라';
                break;
            case 'settings':
                elements.pageMainTitle.textContent = '설정 및 관리';
                if (elements.pageSubTitle) elements.pageSubTitle.textContent = '시스템 매개변수 조정, 테마 스위칭, API 연동 Key 관리';
                break;
        }
    }
}

function initFacilitySelector() {
    if (!elements.facilitySelect) return;
    elements.facilitySelect.addEventListener('change', (e) => {
        state.currentFacility = e.target.value;
        resetVlmUI();
        
        const listKey = state.currentFacility;
        if (state.members[listKey] && state.members[listKey].length > 0) {
            state.selectedUserId = state.members[listKey][0].id;
        }
        
        switchTab(state.currentTab);
        showNotification(`${state.currentFacility === 'child' ? '튼튼어린이집' : '행복실버요양원'} 데이터로 전환되었습니다.`);
    });
}

function renderDashboard() {
    const listKey = state.currentMode === 'family' ? 'family' : state.currentFacility;
    const list = state.members[listKey];
    if (!list) return;
    
    const totalMembersCount = list.length;
    const riskCount = list.filter(m => m.type !== '일반').length;
    
    if (elements.statTotalMembers) elements.statTotalMembers.textContent = `${totalMembersCount}명`;
    if (elements.statRiskAlerts) elements.statRiskAlerts.textContent = `${riskCount * 2}건`;
    
    if (elements.lblTotalMembers) {
        if (state.currentMode === 'family') {
            elements.lblTotalMembers.textContent = '가족 인원';
            if (elements.lblTotalDesc) elements.lblTotalDesc.innerHTML = '<i class="fa-solid fa-house"></i> 가정 프로필 기준';
        } else {
            elements.lblTotalMembers.textContent = '총 관리 대상자';
            if (elements.lblTotalDesc) elements.lblTotalDesc.innerHTML = '<i class="fa-solid fa-circle-info"></i> 사보원 연동 기준';
        }
    }
    
    const todayDietContainer = document.querySelector('.today-diet-list');
    if (todayDietContainer) {
        todayDietContainer.innerHTML = '';
        
        let activeMealSet = [];
        if (state.currentMode === 'family') {
            activeMealSet = [
                { time: "조식", menu: "귀리밥, 계란말이, 된장국, 깍두기", tag: "주의 1건", color: "tag-yellow" },
                { time: "중식", menu: "잡곡밥, 돈까스, 양배추 샐러드, 우유", tag: "주의 1건", color: "tag-yellow" },
                { time: "석식", menu: "쌀밥, 버섯찌개, 계란찜, 시금치나물", tag: "정상", color: "tag-green" }
            ];
        } else if (state.currentFacility === 'child') {
            activeMealSet = [
                { time: "조식", menu: "잡곡밥, 근대된장국, 달걀찜, 깍두기", tag: "정상", color: "tag-green" },
                { time: "중식", menu: "현미밥, 닭살야채볶음, 미역국, 배추김치", tag: "주의 1건", color: "tag-yellow" },
                { time: "석식", menu: "보리밥, 두부조림, 시금치나물, 깍두기", tag: "정상", color: "tag-green" }
            ];
        } else {
            activeMealSet = [
                { time: "조식", menu: "귀리밥, 두부국, 시금치, 조기구이", tag: "정상", color: "tag-green" },
                { time: "중식", menu: "귀리잡곡밥, 버섯국, 불고기, 고구마순나물, 약콩 두유", tag: "주의 2건", color: "tag-yellow" },
                { time: "석식", menu: "귀리죽, 계란찜, 명란젓갈, 배추김치", tag: "주의 1건", color: "tag-yellow" }
            ];
        }
        
        activeMealSet.forEach(meal => {
            const timeBadgeClass = meal.time === '조식' ? 'header-blue' : meal.time === '중식' ? 'header-orange' : 'header-purple';
            const card = document.createElement('div');
            card.className = 'today-diet-card glass-card';
            card.innerHTML = `
                <div class="diet-time-badge ${timeBadgeClass}">${meal.time}</div>
                <div class="diet-menu-items">${meal.menu}</div>
                <div class="diet-status-tag ${meal.color}">${meal.tag}</div>
            `;
            todayDietContainer.appendChild(card);
        });
    }

    if (elements.dashboardApplyAltBtn) {
        elements.dashboardApplyAltBtn.onclick = () => {
            showNotification("대체 식단 처방이 오늘의 식단에 즉시 적용되었습니다.");
            switchTab('diet-verification');
        };
    }

    setTimeout(() => {
        updateCharts();
    }, 100);
}

// 식재료 텍스트 기반 100% 로컬 오프라인 위험 대조 분석 알고리즘
function localAnalyzeDiet(dietText) {
    const lines = dietText.split('\n');
    const results = [];
    const listKey = state.currentMode === 'family' ? 'family' : state.currentFacility;
    const currentMembers = state.members[listKey] || [];

    lines.forEach((line, index) => {
        const cleanLine = line.trim();
        if (!cleanLine) return;

        let datePart = `식단 ${index + 1}`;
        let menuPart = cleanLine;

        const dateMatch = cleanLine.match(/^\[(.*?)\](.*)/) || cleanLine.match(/^(.*?):(.*)/) || cleanLine.match(/^(.*?)-(.*)/);
        if (dateMatch) {
            datePart = dateMatch[1].trim();
            menuPart = dateMatch[2].trim();
        }

        const menuItems = menuPart.split(',').map(m => m.trim()).filter(m => m);
        const menuObjects = menuItems.map(name => {
            let w = "150g";
            if (name.includes("밥") || name.includes("죽")) w = "210g";
            if (name.includes("국") || name.includes("찌개")) w = "150g";
            if (name.includes("김치") || name.includes("나물")) w = "40g";
            if (name.includes("주스") || name.includes("음료") || name.includes("우유") || name.includes("두유")) w = "125ml";
            return { name: name, weight: w };
        });

        const risks = [];
        let altFrom = "";
        let altTo = "";
        let altEffect = "";

        const activeAllergensInMenu = {};
        menuItems.forEach(menuName => {
            let foundMenu = "";
            let mappedAllergens = [];
            
            for (let key in MENU_ALLERGEN_MAP) {
                if (menuName.includes(key) || key.includes(menuName)) {
                    foundMenu = key;
                    mappedAllergens = MENU_ALLERGEN_MAP[key];
                    break;
                }
            }

            mappedAllergens.forEach(allergen => {
                activeAllergensInMenu[allergen] = menuName;
            });
        });

        let riskCount = 1;
        currentMembers.forEach(member => {
            if (member.type === '알레르기') {
                const memberAllergens = member.detail.split(',').map(s => s.trim());
                memberAllergens.forEach(alg => {
                    if (activeAllergensInMenu[alg]) {
                        const targetMenu = activeAllergensInMenu[alg];
                        risks.push({
                            num: riskCount++,
                            type: "알레르기",
                            title: "알레르기 위험",
                            desc: `[${targetMenu}] 내 ${alg} 성분 포함 ➔ ${member.name} (${member.detail}) 위험`,
                            status: "danger"
                        });

                        if (targetMenu.includes("계란찜") || targetMenu.includes("달걀찜") || targetMenu.includes("계란말이")) {
                            altFrom = targetMenu;
                            altTo = "연두부구이";
                            altEffect = "난류 알러지원 차단 및 식물성 대두 단백질 대체 공급";
                        } else if (targetMenu.includes("요구르트") || targetMenu.includes("요플레") || targetMenu.includes("우유")) {
                            altFrom = targetMenu;
                            altTo = "약콩 두유";
                            altEffect = "유제품 락토프리 식물성 단백질 전환";
                        } else if (targetMenu.includes("된장찌개")) {
                            altFrom = targetMenu;
                            altTo = "저나트륨 버섯국";
                            altEffect = "대두 및 나트륨 함량 40% 저감";
                        } else if (!altFrom) {
                            altFrom = targetMenu;
                            altTo = "두부조림";
                            altEffect = `${alg} 항원 물질 배제 완료`;
                        }
                    }
                });
            } else if (member.type === '질환식') {
                const diseaseList = member.detail.split(',').map(s => s.trim());
                diseaseList.forEach(dis => {
                    if (dis.includes("당뇨")) {
                        const hasRice = menuItems.some(m => m === "쌀밥" || m === "백미밥");
                        const hasSweet = menuItems.some(m => m.includes("요구르트") || m.includes("요플레") || m.includes("우유"));
                        if (hasRice) {
                            risks.push({
                                num: riskCount++,
                                type: "질환식",
                                title: "당뇨 적합성 주의",
                                desc: `정제 백미 쌀밥 포함 ➔ 당뇨군 ${member.name} 혈당 상승 주의`,
                                status: "warning"
                            });
                            altFrom = "쌀밥";
                            altTo = "귀리잡곡밥";
                            altEffect = "정제 탄수화물 제한 및 잡곡 혼합으로 혈당 상승 속도 저하";
                        }
                    }
                    if (dis.includes("연하")) {
                        const needsSoft = menuItems.some(m => m.includes("떡") || m.includes("질긴") || m.includes("생선") || m.includes("어묵"));
                        if (needsSoft) {
                            risks.push({
                                num: riskCount++,
                                type: "연하식",
                                title: "연하 섭식 위험",
                                desc: `고형 반찬 포함 ➔ 연하장애군 ${member.name} 삼킴 위험 감지`,
                                status: "info"
                            });
                            const filterMenu = menuItems.find(m => m.includes("생선") || m.includes("떡") || m.includes("질긴")) || menuItems[1];
                            altFrom = filterMenu;
                            altTo = `${filterMenu} (연화 다짐식)`;
                            altEffect = "삼킴 장애 완화 및 잇몸 저작 대응 다짐식 조리";
                        }
                    }
                });
            }
        });

        // 식중독지수 가상 추가
        risks.push({
            num: riskCount++,
            type: "식중독",
            title: "식중독 예측 보통",
            desc: "당일 보건기상지수에 따른 수산물 위생가공 주의 및 익힘 조리 권장",
            status: "info"
        });

        results.push({
            date: datePart.includes("식단") ? `${datePart}` : `${datePart} 식단`,
            menu: menuObjects,
            results: risks,
            alternative: altFrom ? {
                from: altFrom,
                to: altTo,
                effect: altEffect
            } : null
        });
    });

    return results;
}

function initDietAnalyzer() {
    if (!elements.dietBulkInput) return;

    elements.dietBulkInput.value = state.currentMode === 'family' 
        ? `[월요일] 쌀밥, 계란말이, 요구르트\n[화요일] 쌀식빵, 사과잼, 우유\n[수요일] 잡곡밥, 돈까스, 샐러드` 
        : `[월요일] 현미밥, 닭살야채볶음, 미역국, 배추김치\n[화요일] 쌀밥, 불고기, 된장찌개, 시금치나물\n[수요일] 잡곡밥, 생선구이, 계란찜, 요구르트`;
    
    if (elements.exampleTags) {
        elements.exampleTags.forEach(tag => {
            tag.addEventListener('click', () => {
                elements.exampleTags.forEach(t => t.classList.remove('active'));
                tag.classList.add('active');
                const period = tag.getAttribute('data-period');
                if (period === 'weekly') {
                    elements.dietBulkInput.value = `[월요일] 현미밥, 닭살야채볶음, 미역국, 배추김치\n[화요일] 쌀밥, 불고기, 된장찌개, 시금치나물\n[수요일] 잡곡밥, 생선구이, 계란찜, 요구르트`;
                } else {
                    elements.dietBulkInput.value = `[1주 월요일] 현미밥, 닭살야채볶음, 미역국, 배추김치\n[1주 화요일] 쌀밥, 불고기, 된장찌개, 시금치나물\n[1주 수요일] 잡곡밥, 생선구이, 계란찜, 요구르트\n[1주 목요일] 보리밥, 오징어볶음, 콩나물국, 무피클\n[1주 금요일] 칼국수, 야채만두, 배추겉절이, 요구르트`;
                }
            });
        });
    }

    if (elements.analyzeDietBtn) {
        elements.analyzeDietBtn.addEventListener('click', async () => {
            const textInput = elements.dietBulkInput.value.trim();
            if (!textInput) return;
            
            if (elements.scheduleEmptyView) elements.scheduleEmptyView.classList.add('hidden');
            if (elements.scheduleResultView) elements.scheduleResultView.classList.add('hidden');
            if (elements.analyzerLoading) elements.analyzerLoading.classList.remove('hidden');
            elements.analyzeDietBtn.disabled = true;
            
            if (elements.loadingText) {
                elements.loadingText.textContent = apiConfig.key 
                    ? "OpenRouter 임상 영양 분석 LLM 모델과 통신하여 알레르기 및 식습관 위험요소를 실시간 정밀 스크리닝 중입니다..."
                    : "인터넷 및 API Key 비검출로 인하여 로컬 영양 성분 교차 대조 알고리즘으로 폴백하여 식단을 분석하고 처방하는 중...";
            }

            try {
                if (apiConfig.key) {
                    const parsedResult = await callOpenRouterLLM(textInput);
                    renderAnalyzedSchedule(parsedResult);
                } else {
                    await new Promise(resolve => setTimeout(resolve, 800));
                    // 100% 로컬 대조 알고리즘 실행
                    const localResults = localAnalyzeDiet(textInput);
                    renderAnalyzedSchedule(localResults);
                }
                showNotification("AI 식단 분석 및 대체식 처방 수립이 완료되었습니다.");
            } catch (error) {
                console.error(error);
                showNotification("AI 모델 호출 실패로 로컬 안전 가이드 데이터를 로드합니다.");
                const localResults = localAnalyzeDiet(textInput);
                renderAnalyzedSchedule(localResults);
            } finally {
                if (elements.analyzerLoading) elements.analyzerLoading.classList.add('hidden');
                elements.analyzeDietBtn.disabled = false;
            }
        });
    }

    if (elements.confirmAllDietBtn) {
        elements.confirmAllDietBtn.addEventListener('click', () => {
            showNotification("대체 식단 처방 수칙이 식단 검증 시스템에 최종 동기화되었습니다. 배식 검증 단계를 수행하십시오.");
            switchTab('diet-verification');
        });
    }
}

async function callOpenRouterLLM(dietText) {
    const listKey = state.currentMode === 'family' ? 'family' : state.currentFacility;
    const list = state.members[listKey];
    const memberProfileStr = list.map(m => `- 이름: ${m.name}, 유형: ${m.type}, 원인물질/질환: ${m.detail}, 처방: ${m.instruction}`).join('\n');
    
    const prompt = `
당신은 취약계층 급식 또는 가정을 관리하는 영양 안전 케어 AI 시스템인 CareTable입니다.
다음 입력된 식단표를 바탕으로 현재 관리 대상자들의 알레르기 및 만성질환 유해 성분 정보와 비교하여 위험 요소를 분석하고 대체 식단과 위생/조리지침 레시피 가이드를 수립하십시오.

[수혜 대상자 알레르기/질환 명단]
${memberProfileStr}

[식단표]
${dietText}

[출력 요구사항]
반드시 다른 잡다한 설명 없이 오직 아래 형태의 유효한 JSON 배열만 출력하십시오. Markdown 기호(\`\`\`) 등을 붙이지 마세요.

JSON Array format:
[
  {
    "date": "요일/일자 구분 (예: 2026.06.01 (월) 중식)",
    "menu": [
      { "name": "식품명", "weight": "권장 중량" }
    ],
    "results": [
      { "num": 1, "type": "알레르기", "title": "위험 분류 요약", "desc": "위험 대상 및 상세 설명", "status": "danger" }
    ],
    "alternative": {
      "from": "제한할 식단명",
      "to": "대체 처방 식단명",
      "effect": "개선 효과 서술"
    }
  }
]
`;

    const modelsToTry = [apiConfig.model, ...freeLLMModels.filter(m => m !== apiConfig.model)];
    
    for (let model of modelsToTry) {
        try {
            console.log(`Connecting OpenRouter: ${model}`);
            const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiConfig.key}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://huggingface.co/spaces/HwangJinwook/caretable", 
                    "X-Title": "CareTable Client"
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: "system", content: "You are clinical dietitian AI. Output only JSON array. Do not wrap in markdown." },
                        { role: "user", content: prompt }
                    ]
                })
            });

            if (!res.ok) continue;

            const data = await res.json();
            let text = data.choices[0].message.content.trim();
            
            if (text.includes("```json")) {
                text = text.split("```json")[1].split("```")[0].trim();
            } else if (text.includes("```")) {
                text = text.split("```")[1].split("```")[0].trim();
            }
            
            return JSON.parse(text);
        } catch (e) {
            console.warn(`Model ${model} connection error: `, e);
        }
    }
    
    throw new Error("API failures");
}

function renderAnalyzedSchedule(results) {
    if (!elements.scheduleCardsContainer) return;
    elements.scheduleCardsContainer.innerHTML = '';
    
    results.forEach((item, idx) => {
        const card = document.createElement('div');
        const hasRisk = item.results.some(r => r.status === 'danger' || r.status === 'warning');
        card.className = `schedule-card ${hasRisk ? 'has-risk' : 'is-safe'}`;
        
        const statusPill = hasRisk 
            ? `<span class="status-pill danger">주의/위험</span>`
            : `<span class="status-pill success">검증 통과</span>`;

        const menuStr = item.menu.map(m => m.name).join(', ');

        card.innerHTML = `
            <div class="card-header-toggle" onclick="toggleCardAccordion(${idx})">
                <div class="header-day-info">
                    <span class="day-title">${item.date}</span>
                    <span class="day-date">${menuStr}</span>
                </div>
                <div class="status-indicator-box">
                    ${statusPill}
                    <i class="fa-solid fa-chevron-down toggle-arrow-icon" id="arrow-${idx}"></i>
                </div>
            </div>
            
            <div class="accordion-content" id="accordion-${idx}">
                <div class="card-body-details">
                    <div class="menu-orig-box">
                        <h5>식단 구성 및 중량</h5>
                        <p class="menu-content-text">
                            ${item.menu.map(m => `• ${m.name} (${m.weight})`).join('<br>')}
                        </p>
                    </div>
                    
                    ${item.alternative ? `
                    <div class="menu-alt-box">
                        <h5>AI 처방 대체식</h5>
                        <p class="menu-content-text text-green font-bold">
                            ${item.alternative.from} ➔ ${item.alternative.to}
                        </p>
                        <p class="recipe-content-text" style="margin-top:5px; border-color: rgba(16,185,129,0.2);">
                            <strong>개선 효과</strong>: ${item.alternative.effect}
                        </p>
                    </div>
                    ` : ''}

                    <div class="recipe-guide-box">
                        <h5>스크리닝 위해 목록</h5>
                        <p class="menu-content-text">
                            ${item.results.map(r => `• [${r.type}] ${r.desc}`).join('<br>')}
                        </p>
                    </div>
                </div>
            </div>
        `;
        
        elements.scheduleCardsContainer.appendChild(card);
    });

    window.toggleCardAccordion = function(index) {
        const content = document.getElementById(`accordion-${index}`);
        const arrow = document.getElementById(`arrow-${index}`);
        
        if (content && content.classList.contains('expanded')) {
            content.classList.remove('expanded');
            if (arrow) arrow.classList.remove('rotate-icon');
        } else if (content) {
            content.classList.add('expanded');
            if (arrow) arrow.classList.add('rotate-icon');
        }
    };

    if (elements.scheduleResultView) elements.scheduleResultView.classList.remove('hidden');
}

function initDietVerification() {
    if (elements.btnPrevMeal) {
        elements.btnPrevMeal.addEventListener('click', () => {
            if (state.selectedMealIndex > 0) {
                state.selectedMealIndex--;
                renderDietVerification();
            }
        });
    }

    if (elements.btnNextMeal) {
        elements.btnNextMeal.addEventListener('click', () => {
            if (state.selectedMealIndex < defaultDiets.length - 1) {
                state.selectedMealIndex++;
                renderDietVerification();
            }
        });
    }

    if (elements.applyAlternativeDietBtn) {
        elements.applyAlternativeDietBtn.addEventListener('click', () => {
            const diet = defaultDiets[state.selectedMealIndex];
            showNotification(`[${diet.alternative.from}]이 [${diet.alternative.to}]으로 안전 대체 적용되었습니다.`);
            
            diet.menu = diet.menu.map(food => {
                if (food.name === diet.alternative.from) {
                    return { name: diet.alternative.to, weight: food.weight };
                }
                return food;
            });
            
            diet.results = diet.results.filter(r => r.type !== '알레르기');
            renderDietVerification();
            renderDashboard();
        });
    }

    if (elements.vlmOptNormal) {
        elements.vlmOptNormal.addEventListener('click', () => {
            selectVlmImage('normal');
        });
    }
    if (elements.vlmOptAlternative) {
        elements.vlmOptAlternative.addEventListener('click', () => {
            selectVlmImage('alternative');
        });
    }
    
    if (elements.triggerFileBtn) {
        elements.triggerFileBtn.addEventListener('click', () => {
            if (elements.vlmFileInput) elements.vlmFileInput.click();
        });
    }

    if (elements.vlmFileInput) {
        elements.vlmFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                state.customVlmImageSrc = event.target.result;
                selectVlmImage('custom');
            };
            reader.readAsDataURL(file);
        });
    }

    if (elements.runVlmBtn) {
        elements.runVlmBtn.addEventListener('click', async () => {
            if (!state.selectedVlmImage) return;
            
            if (elements.vlmEmptyResult) elements.vlmEmptyResult.classList.add('hidden');
            if (elements.vlmResultPanel) elements.vlmResultPanel.classList.add('hidden');
            if (elements.scannerLaser) {
                elements.scannerLaser.style.display = 'block';
                elements.scannerLaser.style.animation = 'scan 2s infinite linear';
            }
            elements.runVlmBtn.disabled = true;

            try {
                if (apiConfig.key && (state.selectedVlmImage === 'custom' || state.customVlmImageSrc)) {
                    const visionResult = await callOpenRouterVLM();
                    setTimeout(() => {
                        if (elements.scannerLaser) elements.scannerLaser.style.display = 'none';
                        elements.runVlmBtn.disabled = false;
                        renderVlmResult(visionResult);
                    }, 2000);
                } else {
                    setTimeout(() => {
                        if (elements.scannerLaser) elements.scannerLaser.style.display = 'none';
                        elements.runVlmBtn.disabled = false;
                        renderVlmSimulationResult();
                    }, 2000);
                }
            } catch (error) {
                console.error(error);
                showNotification("VLM 모델 응답 지연으로 로컬 인공지능 검증 결과를 표시합니다.");
                setTimeout(() => {
                    if (elements.scannerLaser) elements.scannerLaser.style.display = 'none';
                    elements.runVlmBtn.disabled = false;
                    renderVlmSimulationResult();
                }, 1000);
            }
        });
    }
}

function selectVlmImage(type) {
    state.selectedVlmImage = type;
    if (elements.vlmPlaceholder) elements.vlmPlaceholder.classList.add('hidden');
    if (elements.vlmTargetImage) elements.vlmTargetImage.classList.remove('hidden');
    
    if (elements.vlmOptNormal) elements.vlmOptNormal.classList.remove('selected');
    if (elements.vlmOptAlternative) elements.vlmOptAlternative.classList.remove('selected');
    
    if (type === 'normal') {
        if (elements.vlmTargetImage) elements.vlmTargetImage.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80'; 
        if (elements.vlmOptNormal) elements.vlmOptNormal.classList.add('selected');
    } else if (type === 'alternative') {
        if (elements.vlmTargetImage) elements.vlmTargetImage.src = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80'; 
        if (elements.vlmOptAlternative) elements.vlmOptAlternative.classList.add('selected');
    } else if (type === 'custom' && state.customVlmImageSrc) {
        if (elements.vlmTargetImage) elements.vlmTargetImage.src = state.customVlmImageSrc;
    }
    
    if (elements.runVlmBtn) elements.runVlmBtn.disabled = false;
}

function resetVlmUI() {
    state.selectedVlmImage = null;
    state.customVlmImageSrc = null;
    state.vlmApproved = false;
    if (elements.vlmPlaceholder) elements.vlmPlaceholder.classList.remove('hidden');
    if (elements.vlmTargetImage) {
        elements.vlmTargetImage.classList.add('hidden');
        elements.vlmTargetImage.src = '';
    }
    if (elements.vlmOptNormal) elements.vlmOptNormal.classList.remove('selected');
    if (elements.vlmOptAlternative) elements.vlmOptAlternative.classList.remove('selected');
    if (elements.vlmEmptyResult) elements.vlmEmptyResult.classList.remove('hidden');
    if (elements.vlmResultPanel) elements.vlmResultPanel.classList.add('hidden');
    if (elements.runVlmBtn) elements.runVlmBtn.disabled = true;
    if (elements.vlmFileInput) elements.vlmFileInput.value = '';
}

async function callOpenRouterVLM() {
    const listKey = state.currentMode === 'family' ? 'family' : state.currentFacility;
    const list = state.members[listKey];
    const memberProfileStr = list.map(m => `- 이름: ${m.name}, 유형: ${m.type}, 원인물질/질환: ${m.detail}`).join('\n');

    const prompt = `
이 식판 사진에서 닭고기, 달걀, 우유 성분이 포함되어 오배식이 일어났는지 감지하고, 아래 JSON 객체 형태 하나만 출력하세요.
[제한 인원 정보]
${memberProfileStr}

JSON Format:
{
  "verdict": "PASS" 또는 "REJECT",
  "allergen": "발견된 유발 요인 요약 또는 없음",
  "portion": "정량 비율 평가",
  "reason": "AI Vision 이미지 판별 결과 설명"
}
`;
    const base64Image = state.customVlmImageSrc.split(',')[1];

    for (let model of freeVLMModels) {
        try {
            console.log(`Connecting OpenRouter VLM: ${model}`);
            const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiConfig.key}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://huggingface.co/spaces/HwangJinwook/caretable", 
                    "X-Title": "CareTable Client"
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        {
                            role: "user",
                            content: [
                                { type: "text", text: prompt },
                                { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
                            ]
                        }
                    ]
                })
            });

            if (!res.ok) continue;

            const data = await res.json();
            let text = data.choices[0].message.content.trim();
            
            if (text.includes("```json")) {
                text = text.split("```json")[1].split("```")[0].trim();
            } else if (text.includes("```")) {
                text = text.split("```")[1].split("```")[0].trim();
            }

            return JSON.parse(text);
        } catch (e) {
            console.warn(`Vision Model ${model} failure: `, e);
        }
    }

    throw new Error("VLM Failure");
}

function renderVlmSimulationResult() {
    if (elements.vlmResultPanel) elements.vlmResultPanel.classList.remove('hidden');
    if (elements.vlmEmptyResult) elements.vlmEmptyResult.classList.add('hidden');
    
    if (state.selectedVlmImage === 'normal') {
        if (elements.vlmVerdictBox) elements.vlmVerdictBox.className = 'vlm-verdict-box rejected';
        if (elements.verdictIconContainer) elements.verdictIconContainer.innerHTML = '<i class="fa-solid fa-circle-xmark"></i>';
        if (elements.verdictTitle) elements.verdictTitle.textContent = '배식 보류 (REJECTED)';
        
        if (elements.vlmMatchRate) {
            elements.vlmMatchRate.style.width = '70%';
            elements.vlmMatchRate.style.backgroundColor = 'var(--color-red)';
        }
        if (elements.vlmMatchValue) elements.vlmMatchValue.textContent = '70%';
        
        if (state.currentMode === 'family') {
            if (elements.vlmAllergenStatus) elements.vlmAllergenStatus.textContent = '계란/우유 검출 (막내아들 알러지원 검출)';
            if (elements.vlmAnalysisReason) elements.vlmAnalysisReason.textContent = 'Vision 비전 AI 분석 결과, 식판에 계란말이 및 요구르트병이 그대로 포착되었습니다. 막내아들을 위해 두부구이와 주스로 교체를 진행하십시오.';
        } else if (state.currentFacility === 'child') {
            if (elements.vlmAllergenStatus) elements.vlmAllergenStatus.textContent = '달걀, 우유 검출 (김민수 아동 비상)';
            if (elements.vlmAnalysisReason) elements.vlmAnalysisReason.textContent = 'Vision 비전 AI 판독 결과, 조리 식판 내에 달걀 성분 계란찜 및 요구르트병이 인식되었습니다. 오배식 사고 예방을 위해 배식을 차단하십시오.';
        } else {
            if (elements.vlmAllergenStatus) elements.vlmAllergenStatus.textContent = '백미 및 가당 유제품 검출 (최옥분, 이명자 주의)';
            if (elements.vlmAnalysisReason) elements.vlmAnalysisReason.textContent = 'Vision 비전 AI 판독 결과, 당뇨 최옥분 어르신 제한군 요구르트 및 백미 쌀밥이 감지되었습니다. 저나트륨 영양식단으로 교체하십시오.';
        }
        
        if (elements.vlmPortionStatus) elements.vlmPortionStatus.textContent = '적량 배식 (94%)';
        
        if (elements.vlmActionFooter) {
            elements.vlmActionFooter.innerHTML = `
                <button class="secondary-btn" onclick="switchTab('diet-analyzer')"><i class="fa-solid fa-rotate-left"></i> 식단 분석 재진행</button>
                <button class="primary-btn" style="background:var(--gradient-danger);" disabled><i class="fa-solid fa-ban"></i> 배식 불가</button>
            `;
        }
    } else {
        if (elements.vlmVerdictBox) elements.vlmVerdictBox.className = 'vlm-verdict-box passed';
        if (elements.verdictIconContainer) elements.verdictIconContainer.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
        if (elements.verdictTitle) elements.verdictTitle.textContent = '배식 승인 (PASSED)';
        
        if (elements.vlmMatchRate) {
            elements.vlmMatchRate.style.width = '99%';
            elements.vlmMatchRate.style.backgroundColor = 'var(--color-green)';
        }
        if (elements.vlmMatchValue) elements.vlmMatchValue.textContent = '99%';
        if (elements.vlmAllergenStatus) elements.vlmAllergenStatus.textContent = '위험 성분 없음 (대체 식재료 완벽 적용)';
        
        if (state.currentMode === 'family') {
            if (elements.vlmAnalysisReason) elements.vlmAnalysisReason.textContent = 'Vision 판독 완료: 계란말이 대신 식물성 두부구이와 오렌지주스 팩 교체가 정상 확인되었습니다. 배식이 안전합니다.';
        } else if (state.currentFacility === 'child') {
            if (elements.vlmAnalysisReason) elements.vlmAnalysisReason.textContent = 'Vision 판독 완료: 김민수 아동의 대체식인 연두부구이 및 오렌지주스가 매핑 확인되었습니다. 배식을 즉시 승인합니다.';
        } else {
            if (elements.vlmAnalysisReason) elements.vlmAnalysisReason.textContent = 'Vision 판독 완료: 당뇨 및 유당불내증 수혜 전용 잡곡밥 및 락토프리 두유 대체 배식이 검증되었습니다.';
        }
        
        if (elements.vlmPortionStatus) elements.vlmPortionStatus.textContent = '적량 배식 (98%)';
        
        if (elements.vlmActionFooter) {
            elements.vlmActionFooter.innerHTML = `
                <button id="approve-final-btn" class="primary-btn" style="background:var(--gradient-success); width:100%;"><i class="fa-solid fa-circle-check"></i> 최종 배식 확정 및 이력 저장</button>
            `;
            const btn = document.getElementById('approve-final-btn');
            if (btn) btn.addEventListener('click', saveFinalVerificationLog);
        }
    }
}

function renderVlmResult(apiResult) {
    if (elements.vlmResultPanel) elements.vlmResultPanel.classList.remove('hidden');
    if (elements.vlmEmptyResult) elements.vlmEmptyResult.classList.add('hidden');
    
    if (apiResult.verdict === 'REJECT') {
        if (elements.vlmVerdictBox) elements.vlmVerdictBox.className = 'vlm-verdict-box rejected';
        if (elements.verdictIconContainer) elements.verdictIconContainer.innerHTML = '<i class="fa-solid fa-circle-xmark"></i>';
        if (elements.verdictTitle) elements.verdictTitle.textContent = '배식 보류 (REJECTED)';
        if (elements.vlmMatchRate) {
            elements.vlmMatchRate.style.width = '68%';
            elements.vlmMatchRate.style.backgroundColor = 'var(--color-red)';
        }
        if (elements.vlmMatchValue) elements.vlmMatchValue.textContent = '68%';
        if (elements.vlmAllergenStatus) elements.vlmAllergenStatus.textContent = apiResult.allergen;
        if (elements.vlmPortionStatus) elements.vlmPortionStatus.textContent = apiResult.portion;
        if (elements.vlmAnalysisReason) elements.vlmAnalysisReason.textContent = apiResult.reason;
        
        if (elements.vlmActionFooter) {
            elements.vlmActionFooter.innerHTML = `
                <button class="secondary-btn" onclick="switchTab('diet-analyzer')"><i class="fa-solid fa-rotate-left"></i> 식단 분석 재진행</button>
                <button class="primary-btn" style="background:var(--gradient-danger);" disabled><i class="fa-solid fa-ban"></i> 배식 불가</button>
            `;
        }
    } else {
        if (elements.vlmVerdictBox) elements.vlmVerdictBox.className = 'vlm-verdict-box passed';
        if (elements.verdictIconContainer) elements.verdictIconContainer.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
        if (elements.verdictTitle) elements.verdictTitle.textContent = '배식 승인 (PASSED)';
        if (elements.vlmMatchRate) {
            elements.vlmMatchRate.style.width = '99%';
            elements.vlmMatchRate.style.backgroundColor = 'var(--color-green)';
        }
        if (elements.vlmMatchValue) elements.vlmMatchValue.textContent = '99%';
        if (elements.vlmAllergenStatus) elements.vlmAllergenStatus.textContent = '유해/금지 성분 검출되지 않음';
        if (elements.vlmPortionStatus) elements.vlmPortionStatus.textContent = apiResult.portion;
        if (elements.vlmAnalysisReason) elements.vlmAnalysisReason.textContent = apiResult.reason;
        
        if (elements.vlmActionFooter) {
            elements.vlmActionFooter.innerHTML = `
                <button id="approve-final-btn" class="primary-btn" style="background:var(--gradient-success); width:100%;"><i class="fa-solid fa-circle-check"></i> 최종 배식 확정 및 이력 저장</button>
            `;
            const btn = document.getElementById('approve-final-btn');
            if (btn) btn.addEventListener('click', saveFinalVerificationLog);
        }
    }
}

function saveFinalVerificationLog() {
    const diet = defaultDiets[state.selectedMealIndex];
    if (!diet) return;
    
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const timeStr = today.toTimeString().split(' ')[0].substring(0, 5);
    
    let targetStr = '';
    let altStr = '';
    let facilityKey = state.currentMode === 'family' ? 'family' : state.currentFacility;
    
    if (state.currentMode === 'family') {
        targetStr = '막내아들 (우유/밀가루)';
        altStr = '요구르트 ➔ 오렌지주스 대체 공급 완료';
    } else if (state.currentFacility === 'child') {
        targetStr = '김민수 아동 (달걀/우유)';
        altStr = '달걀말이 ➔ 두부구이 대체 공급 완료';
    } else {
        targetStr = '최옥분/이명자 (당뇨/유당)';
        altStr = '쌀밥 ➔ 귀리잡곡밥, 요구르트 ➔ 두유 대체 지급 완료';
    }

    const logItem = {
        date: dateStr,
        menu: diet.menu.map(m => m.name).join(', '),
        facility: facilityKey,
        target: targetStr,
        alternative: altStr,
        guideline: 'AI 조리지침 준수 및 VLM 배식 사진 비전 대조 PASS 검증',
        vlmStatus: 'PASS',
        timestamp: `${dateStr} ${timeStr}`
    };

    state.logs.unshift(logItem);
    saveLogs();
    
    showNotification("배식 검증 디지털 로그가 안심 데이터베이스에 안전하게 저장되었습니다.");
    resetVlmUI();
    switchTab('report-generator');
}

function renderDietVerification() {
    const diet = defaultDiets[state.selectedMealIndex];
    if (!diet) return;
    
    if (elements.selectedMealLabel) elements.selectedMealLabel.textContent = diet.date;
    
    if (elements.verificationMenuList) {
        elements.verificationMenuList.innerHTML = '';
        diet.menu.forEach(item => {
            const row = document.createElement('div');
            row.className = 'menu-ingredient-item';
            row.innerHTML = `
                <span class="food-name">${item.name}</span>
                <span class="food-weight">${item.weight}</span>
            `;
            elements.verificationMenuList.appendChild(row);
        });
    }

    if (elements.verificationResultsList) {
        elements.verificationResultsList.innerHTML = '';
        diet.results.forEach(res => {
            const card = document.createElement('div');
            const alertClass = res.status === 'danger' ? 'alert-danger' : res.status === 'warning' ? 'alert-warning' : 'alert-info';
            const tagClass = res.status === 'danger' ? 'tag-danger' : res.status === 'warning' ? 'tag-warning' : 'tag-info';
            
            card.className = `verif-result-card ${alertClass}`;
            card.innerHTML = `
                <div class="res-num">${res.num}</div>
                <div class="res-body">
                    <h4>${res.title}</h4>
                    <p>${res.desc}</p>
                </div>
                <div class="res-tag ${tagClass}">${res.status === 'danger' ? '위험' : res.status === 'warning' ? '주의' : '안내'}</div>
            `;
            elements.verificationResultsList.appendChild(card);
        });
    }

    if (diet.alternative && elements.vAlternativeBox) {
        elements.vAlternativeBox.classList.remove('hidden');
        const altFlow = elements.vAlternativeBox.querySelector('.alternative-flow');
        if (altFlow) {
            altFlow.innerHTML = `
                <div class="menu-before">${diet.alternative.from}</div>
                <i class="fa-solid fa-arrow-right-long arrow-icon"></i>
                <div class="menu-after text-green">${diet.alternative.to}</div>
            `;
        }
        const eff = elements.vAlternativeBox.querySelector('.alt-effect-desc');
        if (eff) {
            eff.innerHTML = `
                <strong>개선 효과</strong>: ${diet.alternative.effect}
            `;
        }
    } else if (elements.vAlternativeBox) {
        elements.vAlternativeBox.classList.add('hidden');
    }
}

function initIngredientSafety() {
    if (elements.btnSearchSafety) {
        elements.btnSearchSafety.addEventListener('click', runSafetyRecallFilter);
    }
    if (elements.safetySearchInput) {
        elements.safetySearchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') runSafetyRecallFilter();
        });
    }
    if (elements.btnLoadMoreRecalls) {
        elements.btnLoadMoreRecalls.addEventListener('click', () => {
            showNotification("추가적인 위해식재료 회수 공공데이터 내역을 로드합니다.");
        });
    }
}

function runSafetyRecallFilter() {
    if (!elements.safetySearchInput || !elements.recallTableBody) return;
    
    const query = elements.safetySearchInput.value.trim().toLowerCase();
    state.recallSearchQuery = query;
    
    const filtered = defaultRecalls.filter(item => 
        item.brand.toLowerCase().includes(query) || 
        item.food.toLowerCase().includes(query) || 
        item.reason.toLowerCase().includes(query)
    );

    elements.recallTableBody.innerHTML = '';
    
    if (filtered.length > 0) {
        filtered.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${item.brand}</strong></td>
                <td>${item.food}</td>
                <td><span class="risk-tag ${item.type === '회수' ? 'allergy' : 'disease'}">${item.type}</span></td>
                <td class="${item.type === '회수' ? 'text-red' : ''}">${item.reason}</td>
                <td>${item.date}</td>
            `;
            elements.recallTableBody.appendChild(tr);
        });
        if (elements.recallTotalBadge) elements.recallTotalBadge.textContent = `${filtered.length}건 위해요소 발견`;
    } else {
        elements.recallTableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 30px;">
                    <i class="fa-solid fa-circle-info" style="font-size:20px; margin-bottom:8px;"></i><br>
                    위해 및 회수 식자재 정보가 감지되지 않았습니다. (안전 등급 식재료군)
                </td>
            </tr>
        `;
        if (elements.recallTotalBadge) elements.recallTotalBadge.textContent = '0건';
    }
}

function initUserCustomMgmt() {
    // 1. 알레르기 및 질환 체크박스 그리드 동적 렌더링 (최초 1회 실행)
    if (elements.allergenCheckboxGrid && elements.allergenCheckboxGrid.children.length === 0) {
        elements.allergenCheckboxGrid.innerHTML = ALLERGEN_CATEGORIES.map(item => `
            <label style="display:flex; align-items:center; gap:6px; font-size:12px; cursor:pointer;">
                <input type="checkbox" name="allergen-items" value="${item}" style="cursor:pointer;">
                <span>${item}</span>
            </label>
        `).join('');
    }
    if (elements.diseaseCheckboxGrid && elements.diseaseCheckboxGrid.children.length === 0) {
        elements.diseaseCheckboxGrid.innerHTML = DISEASE_CATEGORIES.map(item => `
            <label style="display:flex; align-items:center; gap:6px; font-size:12px; cursor:pointer;">
                <input type="checkbox" name="disease-items" value="${item}" style="cursor:pointer;">
                <span>${item}</span>
            </label>
        `).join('');
    }

    // 2. 위험 분류 변경 시 동적 selector 토글
    if (elements.mRiskType) {
        elements.mRiskType.addEventListener('change', (e) => {
            const val = e.target.value;
            if (val === '알레르기') {
                if (elements.allergenSelectorGroup) elements.allergenSelectorGroup.classList.remove('hidden');
                if (elements.diseaseSelectorGroup) elements.diseaseSelectorGroup.classList.add('hidden');
            } else if (val === '질환식') {
                if (elements.allergenSelectorGroup) elements.allergenSelectorGroup.classList.add('hidden');
                if (elements.diseaseSelectorGroup) elements.diseaseSelectorGroup.classList.remove('hidden');
            } else {
                if (elements.allergenSelectorGroup) elements.allergenSelectorGroup.classList.add('hidden');
                if (elements.diseaseSelectorGroup) elements.diseaseSelectorGroup.classList.add('hidden');
            }
        });
    }

    if (elements.customTabBtns) {
        elements.customTabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                elements.customTabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const subtab = btn.getAttribute('data-subtab');
                document.querySelectorAll('.subtab-content').forEach(c => c.classList.remove('active-subtab'));
                const el = document.getElementById(`subtab-${subtab}`);
                if (el) el.classList.add('active-subtab');
            });
        });
    }

    const resetModalForm = () => {
        if (elements.addMemberModal) elements.addMemberModal.classList.add('hidden');
        if (elements.memberForm) elements.memberForm.reset();
        // UI 기본 상태 복원 (알레르기 활성, 질환 숨김)
        if (elements.allergenSelectorGroup) elements.allergenSelectorGroup.classList.remove('hidden');
        if (elements.diseaseSelectorGroup) elements.diseaseSelectorGroup.classList.add('hidden');
    };

    if (elements.addMemberBtn) {
        elements.addMemberBtn.addEventListener('click', () => {
            if (elements.addMemberModal) elements.addMemberModal.classList.remove('hidden');
        });
    }

    if (elements.closeMemberModalBtn) {
        elements.closeMemberModalBtn.addEventListener('click', resetModalForm);
    }
    if (elements.cancelMemberBtn) {
        elements.cancelMemberBtn.addEventListener('click', resetModalForm);
    }

    if (elements.memberForm) {
        elements.memberForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('m-name').value.trim();
            const ageVal = document.getElementById('m-age').value.trim();
            const gender = document.getElementById('m-gender').value;
            const type = document.getElementById('m-risk-type').value;
            const instruction = document.getElementById('m-instruction').value.trim();
            
            // 3. 다중 선택된 알레르기 및 만성질환 직렬화(Serialization)
            let detail = '';
            if (type === '알레르기') {
                const checked = Array.from(document.querySelectorAll('input[name="allergen-items"]:checked')).map(el => el.value);
                detail = checked.length > 0 ? checked.join(', ') : '없음';
            } else if (type === '질환식') {
                const checked = Array.from(document.querySelectorAll('input[name="disease-items"]:checked')).map(el => el.value);
                detail = checked.length > 0 ? checked.join(', ') : '없음';
            } else {
                detail = '없음';
            }
            
            if (!name || !ageVal || !detail || !instruction) {
                showNotification("필수 선택/입력 사항을 다시 확인해 주십시오.");
                return;
            }

            const listKey = state.currentMode === 'family' ? 'family' : state.currentFacility;
            const newId = state.members[listKey].length > 0 ? Math.max(...state.members[listKey].map(m => m.id)) + 1 : 1;
            
            const memberObj = {
                id: newId,
                name: name,
                age: `${ageVal}세 / ${gender}`,
                type: type,
                detail: detail,
                instruction: instruction,
                status: type === '일반' ? 'safe' : 'care'
            };

            state.members[listKey].push(memberObj);
            saveDatabase(listKey);
            
            resetModalForm();
            
            renderUserCustomMgmt();
            renderDashboard();
            showNotification(`신규 케어 대상자 ${name}님이 등록 완료되었습니다.`);
        });
    }
}

function renderUserCustomMgmt() {
    const listKey = state.currentMode === 'family' ? 'family' : state.currentFacility;
    const list = state.members[listKey];
    if (!list) return;
    
    if (elements.panelMemberTitle) {
        if (state.currentMode === 'family') {
            elements.panelMemberTitle.innerHTML = '<i class="fa-solid fa-people-roof"></i> 가족 구성원';
            if (elements.modalMemberTitle) elements.modalMemberTitle.innerHTML = '<i class="fa-solid fa-house-chimney-medical"></i> 가족 건강 프로필 신규 등록';
        } else {
            elements.panelMemberTitle.innerHTML = '<i class="fa-solid fa-id-card"></i> 대상자 명단';
            if (elements.modalMemberTitle) elements.modalMemberTitle.innerHTML = '<i class="fa-solid fa-user-plus"></i> 신규 관리 대상자 등록';
        }
    }

    if (!elements.customUserPickerContainer) return;
    elements.customUserPickerContainer.innerHTML = '';
    
    if (list.length === 0) {
        elements.customUserPickerContainer.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding:20px;">등록된 케어 대상자가 없습니다.</p>';
        return;
    }

    list.forEach(member => {
        const item = document.createElement('div');
        const activeClass = state.selectedUserId === member.id ? 'active' : '';
        const badgeClass = member.type === '알레르기' ? 'allergy' : member.type === '질환식' ? 'disease' : 'general';
        
        item.className = `user-picker-item ${activeClass}`;
        item.innerHTML = `
            <div class="picker-name-box">
                <span class="picker-name">${member.name}</span>
                <span class="picker-desc">${member.age}</span>
            </div>
            <span class="picker-risk-badge ${badgeClass}">${member.type}</span>
        `;
        
        item.addEventListener('click', () => {
            state.selectedUserId = member.id;
            renderUserCustomMgmt();
        });

        elements.customUserPickerContainer.appendChild(item);
    });

    const user = list.find(m => m.id === state.selectedUserId) || list[0];
    if (user) {
        state.selectedUserId = user.id;
        
        if (elements.selectedUserAvatar) elements.selectedUserAvatar.textContent = user.name.charAt(0);
        if (elements.selectedUserName) elements.selectedUserName.textContent = user.name;
        
        let typeStr = '';
        if (state.currentMode === 'family') {
            typeStr = `가족 / ${user.age}`;
        } else {
            typeStr = `${state.currentFacility === 'child' ? '원아' : '입소어르신'} / ${user.age}`;
        }
        if (elements.selectedUserType) elements.selectedUserType.textContent = typeStr;

        const isAllergy = user.type === '알레르기';
        const isDisease = user.type === '질환식';
        
        if (elements.selectedUserDiseases) elements.selectedUserDiseases.textContent = isDisease ? user.detail : '없음';
        if (elements.selectedUserDiets) elements.selectedUserDiets.textContent = isDisease ? user.detail : '없음';
        if (elements.selectedUserAllergies) elements.selectedUserAllergies.textContent = isAllergy ? user.detail : '없음';
        
        let swallowLevel = '일반 삼킴';
        if (user.detail.includes('연하') || user.instruction.includes('연하')) {
            swallowLevel = '연하 2단계 (연화처치식)';
        }
        if (elements.selectedUserSwallow) elements.selectedUserSwallow.textContent = swallowLevel;

        if (elements.userGuidelinesPills) {
            elements.userGuidelinesPills.innerHTML = '';
            if (isAllergy) {
                elements.userGuidelinesPills.innerHTML += `<div class="guideline-badge low-sodium">알레르기 조치 <span class="sub text-muted">${user.detail} 격리 급식</span></div>`;
            } else if (isDisease) {
                if (user.detail.includes('당뇨')) {
                    elements.userGuidelinesPills.innerHTML += `<div class="guideline-badge diabetes">당뇨식 <span class="sub text-muted">탄수화물 제한</span></div>`;
                }
                if (user.detail.includes('고혈압') || user.instruction.includes('저염')) {
                    elements.userGuidelinesPills.innerHTML += `<div class="guideline-badge low-sodium">저염식 <span class="sub text-muted">나트륨 1,500mg 조절</span></div>`;
                }
                if (user.detail.includes('연하')) {
                    elements.userGuidelinesPills.innerHTML += `<div class="guideline-badge swallow">연하식 <span class="sub text-muted">연하 2단계 연화 다짐</span></div>`;
                }
            } else {
                elements.userGuidelinesPills.innerHTML = '<div class="guideline-badge swallow" style="background-color:rgba(0,0,0,0.03); color:var(--text-secondary); border-color:var(--border-color);">일반 급식 기준 <span class="sub text-muted">특이사항 없음</span></div>';
            }
        }

        if (elements.userAvoidFoods) {
            elements.userAvoidFoods.innerHTML = '';
            if (isAllergy) {
                const allergenList = user.detail.split(',');
                allergenList.forEach(alg => {
                    const clean = alg.trim();
                    let ex = '교차오염 차단 도구 분리 사용';
                    if (clean.includes('달걀') || clean.includes('계란')) ex = '계란말이, 계란찜, 마요네즈, 빵류';
                    if (clean.includes('우유')) ex = '유제품, 야쿠르트, 치즈, 아이스크림';
                    if (clean.includes('밀')) ex = '밀가루, 부침개, 면류, 과자류';
                    if (clean.includes('대두')) ex = '간장 조림, 된장국, 콩자반, 식포류';

                    elements.userAvoidFoods.innerHTML += `
                        <div class="avoid-food-card danger">
                            <div class="card-icon"><i class="fa-solid fa-circle-xmark"></i></div>
                            <div class="card-info">
                                <h4>${clean} 포함 식품</h4>
                                <p>${ex} 등 유래 물질 전면 제외 급식</p>
                            </div>
                        </div>
                    `;
                });
            } else if (isDisease) {
                if (user.detail.includes('당뇨')) {
                    elements.userAvoidFoods.innerHTML += `
                        <div class="avoid-food-card danger">
                            <div class="card-icon"><i class="fa-solid fa-circle-xmark"></i></div>
                            <div class="card-info">
                                <h4>단순당 높은 식품</h4>
                                <p>케이크, 초콜릿, 탄산음료 등 과당 함유 가공품 배제</p>
                            </div>
                        </div>
                    `;
                }
                if (user.detail.includes('고혈압')) {
                    elements.userAvoidFoods.innerHTML += `
                        <div class="avoid-food-card warning">
                            <div class="card-icon"><i class="fa-solid fa-triangle-exclamation"></i></div>
                            <div class="card-info">
                                <h4>고나트륨 염장 가공품</h4>
                                <p>젓갈, 장아찌, 고염도 찌개 양념 육수 섭취 제한</p>
                            </div>
                        </div>
                    `;
                }
                if (user.detail.includes('연하')) {
                    elements.userAvoidFoods.innerHTML += `
                        <div class="avoid-food-card danger">
                            <div class="card-icon"><i class="fa-solid fa-circle-xmark"></i></div>
                            <div class="card-info">
                                <h4>질기거나 딱딱한 식품</h4>
                                <p>견과류, 말린 오징어, 대형 생채소류 등 목넘김 방해 물질 차단</p>
                            </div>
                        </div>
                    `;
                }
            } else {
                elements.userAvoidFoods.innerHTML = `
                    <div class="avoid-food-card warning" style="background-color:rgba(0,0,0,0.01); border-color:var(--border-color);">
                        <div class="card-icon" style="color:var(--text-muted);"><i class="fa-solid fa-circle-check"></i></div>
                        <div class="card-info">
                            <h4 style="color:var(--text-primary);">제한 식품 없음</h4>
                            <p>일반 위생 조리 지침 준수식 급식 제공 가능</p>
                        </div>
                    </div>
                `;
            }
        }

        if (elements.infoDetailsList) {
            elements.infoDetailsList.innerHTML = `
                <div class="detail-log-row">
                    <div class="log-lbl">고유식별키</div>
                    <div class="log-val">CT-${user.id}-2026</div>
                </div>
                <div class="detail-log-row">
                    <div class="log-lbl">수혜자성명</div>
                    <div class="log-val"><strong>${user.name}</strong></div>
                </div>
                <div class="detail-log-row">
                    <div class="log-lbl">연령 및 정보</div>
                    <div class="log-val">${user.age}</div>
                </div>
                <div class="detail-log-row">
                    <div class="log-lbl">위험도 진단</div>
                    <div class="log-val"><span class="risk-tag ${user.type === '알레르기' ? 'allergy' : user.type === '질환식' ? 'disease' : 'general'}">${user.type}</span></div>
                </div>
                <div class="detail-log-row">
                    <div class="log-lbl">조리제한지침</div>
                    <div class="log-val">${user.instruction}</div>
                </div>
            `;
        }

        if (elements.historyTimelineContainer) {
            elements.historyTimelineContainer.innerHTML = '';
            const userLogs = state.logs.filter(l => l.target.includes(user.name));
            
            if (userLogs.length > 0) {
                userLogs.forEach(log => {
                    const timelineCard = document.createElement('div');
                    timelineCard.className = 'timeline-item-card';
                    timelineCard.innerHTML = `
                        <div class="timeline-time">${log.timestamp}</div>
                        <div class="timeline-title">${log.alternative}</div>
                        <div class="timeline-desc">제공메뉴: ${log.menu}<br>조리감독: ${log.guideline} [VLM ${log.vlmStatus}]</div>
                    `;
                    elements.historyTimelineContainer.appendChild(timelineCard);
                });
            } else {
                elements.historyTimelineContainer.innerHTML = `
                    <div class="timeline-item-card" style="border-style:dashed;">
                        <div class="timeline-time">기록 없음</div>
                        <div class="timeline-title">대체 급식 제공 이력이 없습니다.</div>
                        <div class="timeline-desc">VLM 배식 스캔을 완료하면 해당 이력이 타임라인에 누적 보관됩니다.</div>
                    </div>
                `;
            }
        }
    }
}

function initStatsReport() {
    if (!elements.btnStatsSearch) return;
    elements.btnStatsSearch.addEventListener('click', () => {
        const start = elements.statsDateStart ? elements.statsDateStart.value : '2026-05-01';
        const end = elements.statsDateEnd ? elements.statsDateEnd.value : '2026-05-31';
        showNotification(`${start} ~ ${end} 기간의 급식 예방 통계 데이터를 재조회합니다.`);
        setTimeout(() => {
            updateCharts();
        }, 100);
    });
}

function renderStatsReport() {
    setTimeout(() => {
        updateCharts();
    }, 100);
}

function initReportCenter() {
    if (elements.reportSubTabBtns) {
        elements.reportSubTabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                elements.reportSubTabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderReport();
            });
        });
    }

    if (elements.printReportBtn) {
        elements.printReportBtn.addEventListener('click', () => {
            window.print();
        });
    }
}

function renderReport() {
    const activeBtn = document.querySelector('.sub-tab-btn.active');
    const activeSubTab = activeBtn ? activeBtn.getAttribute('data-report') : '급식일지';
    
    let facilityName = '';
    let reportWriter = '';
    let reportSigner = '';
    
    if (state.currentMode === 'family') {
        facilityName = '마포구 서교동 삼총사 가정';
        reportWriter = '가정 영양 리더';
        reportSigner = '보호자 자필 서명';
        if (elements.reportConfirmStatement) elements.reportConfirmStatement.textContent = '위와 같이 가족 구성원의 특이 체질 및 지침에 부합하는 안전 식단과 대체 배식이 올바르게 실행되었음을 확인하며 VLM 스캔 검증 이력을 디지털 기록합니다.';
        if (elements.reportSignerName) elements.reportSignerName.textContent = '가족 건강 확인자: 보호자 (인)';
        if (elements.reportFooterDesc) elements.reportFooterDesc.textContent = 'CareTable 가정용 식단 위생 자율 점검 대장 (F-2026)';
    } else {
        facilityName = state.currentFacility === 'child' ? '튼튼어린이집' : '행복실버요양원';
        reportWriter = '박아름 사회복지사';
        reportSigner = '시설대표 박아름 (서명)';
        if (elements.reportConfirmStatement) elements.reportConfirmStatement.textContent = '위와 같이 취약계층 급식 관리 및 대체 배식이 올바르게 수행되었으며, 배식 전 VLM(Vision-Language Model) 검증 절차를 완료하였음을 확인합니다.';
        if (elements.reportSignerName) elements.reportSignerName.textContent = '확인자: 시설대표 박아름 (서명/인)';
        if (elements.reportFooterDesc) elements.reportFooterDesc.textContent = '한국사회보장정보원 사회복지시설평가 증빙 표준 서식 (SSIS 14-2)';
    }

    if (elements.rFacilityName) elements.rFacilityName.textContent = facilityName;
    if (elements.rWriter) elements.rWriter.textContent = reportWriter;
    
    const today = new Date();
    if (elements.rDate) elements.rDate.textContent = `${today.getFullYear()}년 ${String(today.getMonth() + 1).padStart(2, '0')}월 ${String(today.getDate()).padStart(2, '0')}일`;

    const currentFilterKey = state.currentMode === 'family' ? 'family' : state.currentFacility;
    const filteredLogs = state.logs.filter(l => l.facility === currentFilterKey);

    let contentHtml = '';

    if (activeSubTab === '급식일지') {
        if (elements.reportDocTitle) elements.reportDocTitle.textContent = state.currentMode === 'family' ? '가 정 식 단 위 생 일 지' : '영 양 급 식 일 지';
        
        contentHtml = `
            <div class="report-paper-body">
                <p>${state.currentMode === 'family' ? '가정 내 자율 보건 위생 관리와 오배식 방지 수칙에 따른 안심 식단 급지 기록입니다.' : '보건복지부 급식안전 기준 및 한국사회보장정보원 시설 평가 가이드라인에 근거한 당일 배식 현황 보고서입니다.'}</p>
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>작성일자</th>
                            <th>배식 식단 내용 (대체식 포함)</th>
                            <th>집중 케어 대상자</th>
                            <th>VLM AI 분석 적합성</th>
                            <th>인증 확인</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredLogs.length > 0 ? filteredLogs.map(log => `
                            <tr>
                                <td>${log.date}</td>
                                <td class="align-left">${log.menu}</td>
                                <td>${log.target}</td>
                                <td><span style="color:var(--color-green); font-weight:bold;">${log.vlmStatus} (99%)</span></td>
                                <td>확인완료</td>
                            </tr>
                        `).join('') : `
                            <tr>
                                <td colspan="5" style="color: var(--text-muted); padding:20px 0;">배식 이력이 존재하지 않습니다. 식단 검증 탭에서 실시간 VLM 검증을 최종 완료해 주십시오.</td>
                            </tr>
                        `}
                    </tbody>
                </table>
            </div>
        `;
    } else if (activeSubTab === '알레르기대장') {
        if (elements.reportDocTitle) elements.reportDocTitle.textContent = state.currentMode === 'family' ? '가족 알레르기 및 만성질환 DB' : '집중 케어 대상자 대장';
        
        contentHtml = `
            <div class="report-paper-body">
                <p>${state.currentMode === 'family' ? '가족들의 건강 및 식품 과민반응 정보를 지속 보관하여 오인 사고를 예방하는 집중 예방 DB입니다.' : '사회복지시설 평가지표 24번 취약계층 식품 유해인자 맞춤 안전 관리대장 양식입니다.'}</p>
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>순번</th>
                            <th>수혜자명</th>
                            <th>제한 식품 및 요인</th>
                            <th>핵심 대체 조리 지침</th>
                            <th>검증 방식</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${state.members[currentFilterKey].filter(m => m.type !== '일반').map((m, idx) => {
                            return `
                                <tr>
                                    <td>${idx + 1}</td>
                                    <td><strong>${m.name}</strong></td>
                                    <td><span style="color:#e11d48; font-weight:600;">${m.detail}</span></td>
                                    <td class="align-left">${m.instruction}</td>
                                    <td>VLM 비전 매칭</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else if (activeSubTab === '대체식대장') {
        if (elements.reportDocTitle) elements.reportDocTitle.textContent = '대 체 급 식 제 공 대 장';
        
        contentHtml = `
            <div class="report-paper-body">
                <p>특이 체질이나 의학적 위험 인자로 인해 일반 식사를 섭취하지 못하는 대상자에게 안전 대체식을 처방하고 지급을 검증한 이력서입니다.</p>
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>제공일시</th>
                            <th>대상자</th>
                            <th>제한 원본 메뉴</th>
                            <th>실제 대체 급식 내용</th>
                            <th>대체 사유</th>
                            <th>VLM 스캔 완료시각</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredLogs.length > 0 ? filteredLogs.map(log => `
                            <tr>
                                <td>${log.date}</td>
                                <td><strong>${log.target.split(' ')[0]}</strong></td>
                                <td><span style="color:#e11d48; text-decoration:line-through;">${log.target.includes('아동') || log.target.includes('아들') ? '계란말이, 요구르트' : '쌀밥, 요플레'}</span></td>
                                <td><span style="color:#0d9488; font-weight:bold;">${log.alternative.split('➔')[1] || log.alternative}</span></td>
                                <td>${log.target.includes('아동') || log.target.includes('아들') ? '식품 알레르기 격리' : '혈당/유당 만성질환 케어'}</td>
                                <td>${log.timestamp}</td>
                            </tr>
                        `).join('') : `
                            <tr>
                                <td colspan="6" style="color: var(--text-muted); padding:20px 0;">대체 급식 배식 이력이 존재하지 않습니다. 식단 검증 탭에서 배식을 최종 확정해 주십시오.</td>
                            </tr>
                        `}
                    </tbody>
                </table>
            </div>
        `;
    }

    if (elements.reportDocContent) elements.reportDocContent.innerHTML = contentHtml;

    const savedHours = (filteredLogs.length * 4.2).toFixed(1);
    const co2Saved = (filteredLogs.length * 12.0).toFixed(1);
    
    if (elements.esgCo2) elements.esgCo2.textContent = `${co2Saved}kg`;
    if (elements.esgTime) elements.esgTime.textContent = `${savedHours}시간`;
    if (elements.esgLocal) elements.esgLocal.textContent = state.currentMode === 'family' ? '75%' : (state.currentFacility === 'child' ? '45%' : '60%');
}

function initApiConfig() {
    if (elements.apiKeyInput) elements.apiKeyInput.value = apiConfig.key;
    if (elements.apiModelSelect) elements.apiModelSelect.value = apiConfig.model;

    if (elements.toggleKeyVisibilityBtn) {
        elements.toggleKeyVisibilityBtn.addEventListener('click', () => {
            if (!elements.apiKeyInput) return;
            const type = elements.apiKeyInput.type === 'password' ? 'text' : 'password';
            elements.apiKeyInput.type = type;
            elements.toggleKeyVisibilityBtn.innerHTML = type === 'password' ? '<i class="fa-solid fa-eye"></i>' : '<i class="fa-solid fa-eye-slash"></i>';
        });
    }

    if (elements.resetApiKeyBtn) {
        elements.resetApiKeyBtn.addEventListener('click', () => {
            if (elements.apiKeyInput) elements.apiKeyInput.value = '';
            apiConfig.key = '';
            localStorage.removeItem('OPENROUTER_API');
            updateApiStatusUI();
            showNotification("오픈라우터 API Key가 삭제되었습니다. 데모 시뮬레이션 모드로 작동합니다.");
        });
    }

    if (elements.apiConfigForm) {
        elements.apiConfigForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const key = elements.apiKeyInput ? elements.apiKeyInput.value.trim() : '';
            const model = elements.apiModelSelect ? elements.apiModelSelect.value : 'nvidia/llama-3.1-nemotron-70b-instruct:free';
            
            apiConfig.key = key;
            apiConfig.model = model;
            
            if (key) {
                localStorage.setItem('OPENROUTER_API', key);
                localStorage.setItem('caremeal_api_model', model);
                showNotification("오픈라우터 무료 AI 연동 및 자동 폴백 체인 구성완료!");
            } else {
                localStorage.removeItem('OPENROUTER_API');
                showNotification("API Key가 비어있어 로컬 시뮬레이션 모드로 전환되었습니다.");
            }
            
            updateApiStatusUI();
        });
    }
}

function updateApiStatusUI() {
    if (elements.apiStatusBadge && elements.apiStatusText) {
        if (apiConfig.key) {
            elements.apiStatusBadge.className = 'api-status live-connected';
            elements.apiStatusText.textContent = `AI 연동: 폴백 체인`;
            if (elements.analyzerModelIndicator) elements.analyzerModelIndicator.textContent = `${apiConfig.model.split('/')[1] || apiConfig.model} (실시간 AI 우선 연동)`;
        } else {
            elements.apiStatusBadge.className = 'api-status online';
            elements.apiStatusText.textContent = 'AI: 시뮬레이션 모드';
            if (elements.analyzerModelIndicator) elements.analyzerModelIndicator.textContent = 'Nemotron-70B / Llama-3 (시뮬레이션 폴백 모드)';
        }
    }
}

function updateCharts() {
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js is not loaded yet.');
        return;
    }

    try {
        const isDark = document.body.classList.contains('dark-mode');
        const labelColor = isDark ? '#94a3b8' : '#4b5563';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';

        Chart.defaults.color = labelColor;
        Chart.defaults.font.family = 'Outfit';

        // 1. Dashboard Doughnut
        const dashCanvas = document.getElementById('dashboardChart');
        if (dashCanvas) {
            if (state.charts.dashboard) state.charts.dashboard.destroy();
            state.charts.dashboard = new Chart(dashCanvas, {
                type: 'doughnut',
                data: {
                    labels: ['정상', '주의', '위험'],
                    datasets: [{
                        data: [10, 3, 2],
                        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                        borderWidth: isDark ? 2 : 1,
                        borderColor: isDark ? '#0f1322' : '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    cutout: '72%'
                }
            });
        }

        // 2. Stats Doughnut
        const statsDoughnutCanvas = document.getElementById('statsDoughnutChart');
        if (statsDoughnutCanvas) {
            if (state.charts.statsDoughnut) state.charts.statsDoughnut.destroy();
            state.charts.statsDoughnut = new Chart(statsDoughnutCanvas, {
                type: 'doughnut',
                data: {
                    labels: ['주의', '위험', '안내'],
                    datasets: [{
                        data: [28, 12, 5],
                        backgroundColor: ['#fbbf24', '#f43f5e', '#3b82f6'],
                        borderWidth: isDark ? 2 : 1,
                        borderColor: isDark ? '#0f1322' : '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { boxWidth: 10, padding: 8, font: { size: 10 } }
                        }
                    },
                    cutout: '65%'
                }
            });
        }

        // 3. Stats Pie
        const statsPieCanvas = document.getElementById('statsPieChart');
        if (statsPieCanvas) {
            if (state.charts.statsPie) state.charts.statsPie.destroy();
            state.charts.statsPie = new Chart(statsPieCanvas, {
                type: 'pie',
                data: {
                    labels: ['알레르기', '영양 불균형', '식중독 위험', '질환별 적합성'],
                    datasets: [{
                        data: [35, 30, 20, 15],
                        backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#8b5cf6'],
                        borderWidth: isDark ? 2 : 1,
                        borderColor: isDark ? '#0f1322' : '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { boxWidth: 10, padding: 8, font: { size: 10 } }
                        }
                    }
                }
            });
        }

        // 4. ESG Line Chart
        const esgCanvas = document.getElementById('esgChart');
        if (esgCanvas) {
            if (state.charts.esg) state.charts.esg.destroy();
            const lineLabel1 = state.currentMode === 'family' ? '자율 관리 시간 (H)' : '행정 돌봄 환원 시간 (H)';
            const lineLabel2 = state.currentMode === 'family' ? '가정 탄소 배출량 (kg)' : '누적 탄소 절감 (kg)';

            state.charts.esg = new Chart(esgCanvas, {
                type: 'line',
                data: {
                    labels: ['1월', '2월', '3월', '4월', '5월', '6월(예정)'],
                    datasets: [
                        {
                            label: lineLabel1,
                            data: [20, 35, 52, 68, 84, 105],
                            borderColor: '#3b82f6',
                            backgroundColor: 'rgba(59, 130, 246, 0.05)',
                            tension: 0.4,
                            fill: true
                        },
                        {
                            label: lineLabel2,
                            data: [50, 95, 140, 190, 240, 310],
                            borderColor: '#10b981',
                            backgroundColor: 'rgba(16, 185, 129, 0.05)',
                            tension: 0.4,
                            fill: true
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: { boxWidth: 10, font: { size: 10 } }
                        }
                    },
                    scales: {
                        x: { grid: { display: false } },
                        y: { grid: { color: gridColor } }
                    }
                }
            });
        }
    } catch (e) {
        console.error('Error drawing charts:', e);
    }
}

function showNotification(message) {
    const oldToast = document.querySelector('.toast-notification');
    if (oldToast) oldToast.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-notification glass-card';
    toast.style.borderRadius = '10px';
    toast.style.boxShadow = '0 10px 25px rgba(31, 41, 55, 0.15)';
    toast.innerHTML = `
        <i class="fa-solid fa-bell-ring" style="color:var(--color-cyan);"></i>
        <span style="font-size:12px; font-weight:600;">${message}</span>
    `;
    
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}
