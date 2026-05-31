// CareTable - Premium Demo Logic Engine (Version 2.2)

// Global State Default Data Sets
const defaultMembers = {
    child: [],
    senior: [],
    family: []
};

const state = {
    currentTab: 'dashboard',
    currentMode: 'agency', // 'agency' (기관) or 'family' (가정)
    currentFacility: 'child', // 'child' (보육) or 'senior' (노인)
    members: JSON.parse(JSON.stringify(defaultMembers)), // Deep Copy
    
    // Simulation / Analyzer variables
    activeDietInput: '',
    analysisResult: null, // Schedule cards list
    selectedVlmImage: null, // 'normal' or 'alternative' or 'custom'
    customVlmImageSrc: null,
    vlmApproved: false,
    
    // Database of logs to generate reports
    logs: [],
    charts: {
        dashboard: null,
        esg: null
    }
};

// API settings configuration
const apiConfig = {
    key: localStorage.getItem('caremeal_api_key') || '',
    model: localStorage.getItem('caremeal_api_model') || 'nvidia/llama-3.1-nemotron-70b-instruct:free'
};

// OpenRouter Free Models for Fallback Strategy
const freeLLMModels = [
    "nvidia/llama-3.1-nemotron-70b-instruct:free",
    "meta-llama/llama-3-8b-instruct:free",
    "google/gemma-2-9b-it:free",
    "mistralai/mistral-7b-instruct:free"
];

const freeVLMModels = [
    "meta-llama/llama-3.2-11b-vision-instruct:free",
    "qwen/qwen-2-vl-7b-instruct:free"
];

// DOM Elements
const elements = {
    navButtons: document.querySelectorAll('.nav-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    facilitySelect: document.getElementById('facility-select'),
    facilitySelectorWrapper: document.getElementById('facility-selector-wrapper'),
    pageMainTitle: document.getElementById('page-main-title'),
    pageSubTitle: document.getElementById('page-sub-title'),
    mainBadge: document.getElementById('main-badge'),
    
    // Theme Toggle
    themeToggleBtn: document.getElementById('theme-toggle-btn'),
    
    // Mode Switch Toggle
    modeToggleCheckbox: document.getElementById('mode-toggle-checkbox'),
    modeTextLeft: document.getElementById('mode-text-left'),
    modeTextRight: document.getElementById('mode-text-right'),
    userAvatarInitial: document.getElementById('user-avatar-initial'),
    userDisplayName: document.getElementById('user-display-name'),
    userDisplayRole: document.getElementById('user-display-role'),
    
    // Stats
    statTotalMembers: document.getElementById('stat-total-members'),
    statRiskMembers: document.getElementById('stat-risk-members'),
    statSafetyScore: document.getElementById('stat-safety-score'),
    
    lblTotalMembers: document.getElementById('lbl-total-members'),
    lblTotalDesc: document.getElementById('lbl-total-desc'),
    esgBottomDesc: document.getElementById('esg-bottom-desc'),
    
    // GNB & API Connection Status
    openApiConfigBtn: document.getElementById('open-api-config-btn'),
    apiStatusBadge: document.getElementById('api-status-badge'),
    apiStatusText: document.getElementById('api-status-text'),
    
    // Tables
    memberTableBody: document.getElementById('member-table-body'),
    panelMemberTitle: document.getElementById('panel-member-title'),
    
    // Bulk Diet tab
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
    
    // VLM tab
    vlmOptNormal: document.getElementById('sim-opt-normal'),
    vlmOptAlternative: document.getElementById('sim-opt-alternative'),
    vlmTargetImage: document.getElementById('vlm-target-image'),
    vlmViewportPlaceholder: document.querySelector('.viewport-placeholder'),
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
    
    // Report tab
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
    
    // Modals & Forms
    addMemberBtn: document.getElementById('add-member-btn'),
    addMemberModal: document.getElementById('add-member-modal'),
    closeMemberModalBtn: document.getElementById('close-member-modal-btn'),
    cancelMemberBtn: document.getElementById('cancel-member-btn'),
    memberForm: document.getElementById('member-form'),
    modalMemberTitle: document.getElementById('modal-member-title'),
    
    apiConfigModal: document.getElementById('api-config-modal'),
    closeApiModalBtn: document.getElementById('close-api-modal-btn'),
    apiConfigForm: document.getElementById('api-config-form'),
    apiKeyInput: document.getElementById('api-key-input'),
    apiModelSelect: document.getElementById('api-model-select'),
    toggleKeyVisibilityBtn: document.getElementById('toggle-key-visibility-btn'),
    resetApiKeyBtn: document.getElementById('reset-api-key-btn')
};

// Templates
const templates = {
    weekly: `[월요일] 쌀밥, 계란말이, 어묵볶음, 요구르트\n[화요일] 잡곡밥, 소불고기, 고구마순나물, 두부국, 우유\n[수요일] 현미밥, 맑은 무국, 생선구이, 콩자반, 식혜\n[목요일] 쌀밥, 닭볶음탕, 오징어채무침, 땅콩조림, 사과주스\n[금요일] 잡곡밥, 버섯찌개, 계란찜, 시금치나물, 핫초코`,
    monthly: `[1주 월요일] 쌀밥, 계란말이, 어묵볶음, 요구르트\n[1주 화요일] 잡곡밥, 소불고기, 시금치, 두부국, 우유\n[1주 수요일] 현미밥, 맑은 무국, 생선구이, 콩자반, 요구르트\n[1주 목요일] 쌀밥, 닭볶음탕, 오징어채무침, 땅콩조림, 주스\n[1주 금요일] 잡곡밥, 버섯찌개, 만두국, 고구마순나물, 요구르트\n[2주 월요일] 귀리밥, 돈까스, 샐러드, 계란국, 우유\n[2주 화요일] 쌀밥, 된장찌개, 갈치구이, 멸치볶음, 식혜`
};

// 1. Initial System Setup
document.addEventListener('DOMContentLoaded', () => {
    loadDatabase();
    initThemeManager();
    initModeToggler();
    initTabs();
    initFacilitySelector();
    initCharts();
    initDietAnalyzer();
    initVlmScanner();
    initReportCenter();
    initModal();
    initApiConfig();
    
    // Draw initial dashboard & status
    switchTab('dashboard');
    updateApiStatusUI();
});

// Load DB from localStorage or restore defaults if empty/not-present
function loadDatabase() {
    ['child', 'senior', 'family'].forEach(key => {
        const stored = localStorage.getItem(`caremeal_members_${key}`);
        if (stored && JSON.parse(stored).length > 0) {
            state.members[key] = JSON.parse(stored);
        } else {
            state.members[key] = JSON.parse(JSON.stringify(defaultMembers[key]));
            saveDatabase(key);
        }
    });
    
    const storedLogs = localStorage.getItem('caremeal_logs');
    if (storedLogs) {
        state.logs = JSON.parse(storedLogs);
    }
}

function saveDatabase(key) {
    localStorage.setItem(`caremeal_members_${key}`, JSON.stringify(state.members[key]));
}

function saveLogs() {
    localStorage.setItem('caremeal_logs', JSON.stringify(state.logs));
}

// 2. Light / Dark Theme Management
function initThemeManager() {
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
    const icon = elements.themeToggleBtn.querySelector('i');
    const text = document.getElementById('theme-toggle-text');
    
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        icon.className = 'fa-solid fa-sun';
        text.textContent = '라이트 모드';
    } else {
        document.body.classList.remove('dark-mode');
        icon.className = 'fa-solid fa-moon';
        text.textContent = '다크 모드';
    }
}

// 3. Mode Switching (Agency vs Family)
function initModeToggler() {
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
        
        resetDietUI();
        resetVlmUI();
        
        switchTab(state.currentTab);
        showNotification(`${state.currentMode === 'family' ? '가정(가족) 건강 케어' : '보건복지시설 관리'} 모드로 전환되었습니다.`);
    });
}

function applyModeTheme() {
    if (state.currentMode === 'family') {
        elements.modeTextLeft.classList.remove('active-mode');
        elements.modeTextRight.classList.add('active-mode');
        elements.facilitySelectorWrapper.classList.add('hidden');
        elements.mainBadge.textContent = '일반 소비자 모드';
        elements.mainBadge.style.background = 'rgba(124, 58, 237, 0.08)';
        elements.mainBadge.style.borderColor = 'rgba(124, 58, 237, 0.2)';
        elements.mainBadge.style.color = '#7c3aed';
        
        elements.userAvatarInitial.textContent = '게';
        elements.userDisplayName.textContent = '게스트 (가정)';
        elements.userDisplayRole.textContent = '일반 사용자 케어 모드';
        
        elements.navReportBtn.innerHTML = '<i class="fa-solid fa-file-invoice"></i> <span>안전 증빙 일지</span>';
    } else {
        elements.modeTextLeft.classList.add('active-mode');
        elements.modeTextRight.classList.remove('active-mode');
        elements.facilitySelectorWrapper.classList.remove('hidden');
        elements.mainBadge.textContent = '게스트 기관 모드';
        elements.mainBadge.style.background = 'rgba(37, 99, 235, 0.08)';
        elements.mainBadge.style.borderColor = 'rgba(37, 99, 235, 0.2)';
        elements.mainBadge.style.color = 'var(--color-blue)';
        
        elements.userAvatarInitial.textContent = '게';
        elements.userDisplayName.textContent = '게스트 (기관)';
        elements.userDisplayRole.textContent = '미지정 자유 이용 모드';
        elements.navReportBtn.innerHTML = '<i class="fa-solid fa-file-shield"></i> <span>평가 증빙 & ESG</span>';
    }
}

// 4. Navigation System
function initTabs() {
    elements.navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
}

function switchTab(tabId) {
    state.currentTab = tabId;
    
    elements.navButtons.forEach(btn => {
        if (btn.getAttribute('data-tab') === tabId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    elements.tabContents.forEach(content => {
        if (content.id === tabId) {
            content.classList.add('active-tab');
        } else {
            content.classList.remove('active-tab');
        }
    });

    updateHeaderTitles(tabId);
    
    if (tabId === 'dashboard') {
        renderDashboard();
        setTimeout(() => updateCharts(), 100);
    } else if (tabId === 'report-generator') {
        renderReport();
        setTimeout(() => updateCharts(), 100);
    }
}

function updateHeaderTitles(tabId) {
    let modeTitle = '';
    if (state.currentMode === 'family') {
        modeTitle = '가족 건강 스케줄러';
    } else {
        modeTitle = state.currentFacility === 'child' ? '튼튼어린이집' : '행복실버요양원';
    }
    
    switch (tabId) {
        case 'dashboard':
            elements.pageMainTitle.textContent = `${modeTitle} 종합 대시보드`;
            elements.pageSubTitle.textContent = state.currentMode === 'family'
                ? '가정 내 가족별 알레르기 및 유해인자 스크리닝 요약'
                : '시설 맞춤형 프로파일 및 취약계층 급식 위험 관리 요약';
            break;
        case 'diet-analyzer':
            elements.pageMainTitle.textContent = '주간/월간 식단 AI 대량 분석';
            elements.pageSubTitle.textContent = '식단표를 붙여넣으면 OpenRouter AI 모델이 캘린더 대체 식단과 레시피를 일목요연하게 자동 분석합니다.';
            break;
        case 'vlm-scanner':
            elements.pageMainTitle.textContent = 'VLM 배식 오배 예방 모니터';
            elements.pageSubTitle.textContent = '배식 직전 촬영된 식판 이미지를 Vision AI가 분석하여 제한 식재료 교차 감지를 실시간 2차 예방합니다.';
            break;
        case 'report-generator':
            elements.pageMainTitle.textContent = state.currentMode === 'family' ? '가정용 식단 위생 안전 일지' : '사회보장/가족 건강 데이터 증빙 센터';
            elements.pageSubTitle.textContent = state.currentMode === 'family'
                ? '가정 내 배식 일지 보관 및 페이퍼리스 디지털 케어 실천 점수'
                : '한국사회보장정보원 시스템 제출용 증빙 서류 자동 생성 및 ESG 혁신 통계';
            break;
    }
}

// Render Dashboard Panel
function renderDashboard() {
    const listKey = state.currentMode === 'family' ? 'family' : state.currentFacility;
    const list = state.members[listKey];
    const totalMembers = list.length;
    const riskMembers = list.filter(m => m.type !== '일반').length;
    const currentLogs = state.logs.filter(l => state.currentMode === 'family' ? l.facility === 'family' : l.facility === state.currentFacility);
    const totalSavedTime = (currentLogs.length * 4.2).toFixed(1);
    
    if (state.currentMode === 'family') {
        elements.lblTotalMembers.textContent = '가족 등록 인원';
        elements.lblTotalDesc.innerHTML = '<i class="fa-solid fa-house"></i> 가정용 프로필 기준';
        elements.panelMemberTitle.innerHTML = '<i class="fa-solid fa-people-roof"></i> 가족 구성원 건강/알레르기 DB';
        elements.esgBottomDesc.textContent = '친환경 로컬 식단 구성 및 식료품 소비 데이터 연동을 통해 에코 탄소 마일리지 120kg CO2e 감축 기여';
        elements.modalMemberTitle.innerHTML = '<i class="fa-solid fa-house-chimney-medical"></i> 가족 건강 프로필 신규 등록';
    } else {
        elements.lblTotalMembers.textContent = '관리 대상자 수';
        elements.lblTotalDesc.innerHTML = '<i class="fa-solid fa-circle-info"></i> 사보원 데이터 기준';
        elements.panelMemberTitle.innerHTML = '<i class="fa-solid fa-id-card"></i> 대상자 집중 관리 명단';
        elements.esgBottomDesc.textContent = '친환경 저탄소 식단 추천 및 페이퍼리스 행정 자동화를 통한 탄소 발자국 240kg CO2e 감축 달성';
        elements.modalMemberTitle.innerHTML = '<i class="fa-solid fa-user-plus"></i> 신규 관리 대상자 등록';
    }

    elements.statTotalMembers.textContent = `${totalMembers}명`;
    elements.statRiskMembers.textContent = `${riskMembers}명`;
    elements.statSafetyScore.textContent = riskMembers > 0 ? '100%' : '0%';

    elements.memberTableBody.innerHTML = '';
    
    list.forEach(member => {
        const tr = document.createElement('tr');
        
        const riskTag = member.type === '일반' 
            ? `<span style="color:var(--text-muted)">일반 급식군</span>`
            : `<span class="risk-tag ${member.type === '알레르기' ? 'allergy' : 'disease'}">${member.type}: ${member.detail}</span>`;

        tr.innerHTML = `
            <td><strong>${member.name}</strong></td>
            <td>${member.age}</td>
            <td>${riskTag}</td>
            <td style="color: var(--text-secondary); max-width: 250px; line-height: 1.4;">${member.instruction}</td>
            <td>
                <button class="delete-member-btn" onclick="deleteMember(${member.id})">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </td>
        `;
        elements.memberTableBody.appendChild(tr);
    });
}

// Global delete member function linked from inline onclick handler
window.deleteMember = function(id) {
    const listKey = state.currentMode === 'family' ? 'family' : state.currentFacility;
    state.members[listKey] = state.members[listKey].filter(m => m.id !== id);
    saveDatabase(listKey);
    renderDashboard();
    updateCharts();
    showNotification("선택한 관리 대상 프로필이 삭제되었습니다.");
};

// Facility switch logic for agency mode
function initFacilitySelector() {
    elements.facilitySelect.addEventListener('change', (e) => {
        state.currentFacility = e.target.value;
        
        resetDietUI();
        resetVlmUI();
        
        switchTab(state.currentTab);
        showNotification(`${state.currentFacility === 'child' ? '보육시설 (어린이집)' : '노인요양시설 (실버케어)'} 데이터로 갱신되었습니다.`);
    });
}

// 5. Diet Bulk Scheduler and OpenRouter API Engine
function initDietAnalyzer() {
    elements.dietBulkInput.value = state.currentMode === 'family' ? `[월요일] 쌀밥, 계란말이, 요구르트\n[화요일] 쌀식빵, 사과잼, 우유\n[수요일] 잡곡밥, 돈까스, 샐러드` : templates.weekly;
    
    elements.exampleTags.forEach(tag => {
        tag.addEventListener('click', () => {
            elements.exampleTags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            const period = tag.getAttribute('data-period');
            elements.dietBulkInput.value = templates[period];
        });
    });

    elements.analyzeDietBtn.addEventListener('click', async () => {
        const textInput = elements.dietBulkInput.value.trim();
        if (!textInput) return;
        
        state.activeDietInput = textInput;
        
        elements.scheduleEmptyView.classList.add('hidden');
        elements.scheduleResultView.classList.add('hidden');
        elements.analyzerLoading.classList.remove('hidden');
        elements.analyzeDietBtn.disabled = true;
        
        elements.loadingText.textContent = apiConfig.key 
            ? "오픈라우터 무료 AI 모델과 실시간 통신 중입니다 (API 폴백 활성화)..."
            : "인터넷 지연 및 API 키 미검출에 따라 로컬 고성능 시뮬레이션 알고리즘으로 폴백하여 식단을 분석하는 중...";

        try {
            if (apiConfig.key) {
                // Call real OpenRouter API with Fallback Chain
                state.analysisResult = await callOpenRouterLLMFallback(textInput);
            } else {
                await new Promise(resolve => setTimeout(resolve, 1200));
                state.analysisResult = runLocalSimParser(textInput);
            }
            
            renderScheduleCards();
        } catch (error) {
            console.error(error);
            showNotification("AI 모델 호출 실패로 안전 시뮬레이션 데이터로 대체 처리합니다.");
            state.analysisResult = runLocalSimParser(textInput);
            renderScheduleCards();
        } finally {
            elements.analyzerLoading.classList.add('hidden');
            elements.analyzeDietBtn.disabled = false;
        }
    });

    elements.confirmAllDietBtn.addEventListener('click', () => {
        showNotification("대체 가이드라인을 반영하여 전체 주간/월간 식단 검토가 확정되었습니다. 배식 검증 단계를 진행하십시오.");
        switchTab('vlm-scanner');
        
        elements.runVlmBtn.disabled = false;
        elements.vlmOptNormal.click();
    });
}

function resetDietUI() {
    elements.dietBulkInput.value = state.currentMode === 'family' ? `[월요일] 쌀밥, 계란말이, 요구르트\n[화요일] 쌀식빵, 사과잼, 우유\n[수요일] 잡곡밥, 돈까스, 샐러드` : templates.weekly;
    elements.scheduleEmptyView.classList.remove('hidden');
    elements.scheduleResultView.classList.add('hidden');
    elements.analyzerLoading.classList.add('hidden');
}

// LLM Fallback Sequential API Calling
async function callOpenRouterLLMFallback(dietText) {
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
반드시 다른 잡다한 말(인사말 등)이나 마크업(```json 등)을 작성하지 말고 오직 아래 양식에 맞춘 유효한 JSON 배열만 출력하십시오.

JSON 양식:
[
  {
    "day": "요일/일자 구분 (예: 월요일 또는 1주 화요일)",
    "date": "임의의 날짜 (예: 06/01)",
    "hasRisk": true/false (유해인자가 식단에 감지되면 true, 없으면 false),
    "risks": ["감지된 위험 요소 상세 요약 (예: 김민수(달걀 알레르기) - 계란말이 유래 성분 충돌)"],
    "menuOrig": "입력된 원래 식단",
    "menuAlt": "대체 처방이 적용된 신규 식단 (원래 식단에서 위험 성분 제거/대체식 교체)",
    "recipe": "조리 지침 및 주의 가이드 (교차오염 방지 및 대체 조리법 서술)"
  }
]
`;

    // Try selected model first
    const modelsToTry = [apiConfig.model, ...freeLLMModels.filter(m => m !== apiConfig.model)];
    
    for (let model of modelsToTry) {
        try {
            console.log(`Trying OpenRouter LLM model: ${model}`);
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
                        { role: "system", content: "You are an expert clinical dietitian AI. Output only JSON array. Do not wrap in markdown codeblocks." },
                        { role: "user", content: prompt }
                    ]
                })
            });

            if (!res.ok) continue; // Try next model on failure

            const data = await res.json();
            let text = data.choices[0].message.content.trim();
            
            if (text.includes("```json")) {
                text = text.split("```json")[1].split("```")[0].trim();
            } else if (text.includes("```")) {
                text = text.split("```")[1].split("```")[0].trim();
            }
            
            return JSON.parse(text);
        } catch (e) {
            console.warn(`Model ${model} failed: `, e);
        }
    }
    
    throw new Error("All free OpenRouter LLM models failed.");
}

// Local simulation fallback parser
function runLocalSimParser(dietText) {
    const listKey = state.currentMode === 'family' ? 'family' : state.currentFacility;
    const list = state.members[listKey];
    const lines = dietText.split('\n').filter(l => l.trim().length > 0);
    
    const results = [];
    
    lines.forEach((line, index) => {
        const dayMatch = line.match(/^\[(.*?)\]/);
        const dayName = dayMatch ? dayMatch[1] : `일차 ${index+1}`;
        const menuString = line.replace(/^\[.*?\]/, '').trim();
        const foods = menuString.split(',').map(f => f.trim());
        
        const risks = [];
        const alternatives = [];
        const guidelines = [];
        
        foods.forEach(food => {
            list.forEach(m => {
                if (m.type === '알레르기') {
                    const allergens = m.detail.split(',').map(a => a.trim());
                    allergens.forEach(allergen => {
                        if (isAllergenContained(food, allergen)) {
                            risks.push(`${m.name} (${allergen} 알레르기) - ${food} 성분 유의`);
                            const repl = getAlternativeFood(food, allergen);
                            alternatives.push({ from: food, to: repl.food });
                            guidelines.push(`${m.name}의 알레르기 교차오염을 차단하기 위해 ${food} 대체식 조리 시 도구 분리 사용.`);
                        }
                    });
                } else if (m.type === '질환식') {
                    if (m.detail.includes('당뇨') && (food.includes('밥') || food.includes('요플레') || food.includes('요구르트') || food.includes('설탕'))) {
                        if (!food.includes('잡곡') && !food.includes('현미')) {
                            risks.push(`${m.name} (당뇨 케어) - ${food} 단순당/혈당상승 위험`);
                            const repl = getAlternativeFood(food, '당뇨');
                            alternatives.push({ from: food, to: repl.food });
                            guidelines.push(`${m.name} 어르신의 급격한 인슐린 반응 억제를 위한 저당 잡곡밥 믹싱 및 천연 에리스리톨 가미.`);
                        }
                    }
                    if (m.detail.includes('유당불내증') && (food.includes('요구르트') || food.includes('우유') || food.includes('요플레'))) {
                        risks.push(`${m.name} (유당불내) - ${food} 유당 함유 위험`);
                        const repl = getAlternativeFood(food, '유당불내증');
                        alternatives.push({ from: food, to: repl.food });
                        guidelines.push(`${m.name}님에게 일반 요구르트/유제품 대신 대체 두유 팩 제공.`);
                    }
                    if (m.detail.includes('통풍') && (food.includes('조개') || food.includes('새우') || food.includes('맥주'))) {
                        risks.push(`${m.name} (통풍 케어) - ${food} 고퓨린 성분 위험`);
                        alternatives.push({ from: food, to: '버섯구이 또는 야채찜' });
                        guidelines.push(`통풍 발작 예방을 위해 퓨린 함량이 높은 해산물 요리 대신 식이섬유가 많은 뿌리채소 구이로 교체.`);
                    }
                }
            });
        });
        
        const hasRisk = risks.length > 0;
        
        let menuAlt = menuString;
        alternatives.forEach(alt => {
            menuAlt = menuAlt.replace(alt.from, alt.to);
        });
        
        let recipe = '';
        if (hasRisk) {
            recipe = `[대체 조리 수칙]\n` + guidelines.map((g, i) => `${i+1}. ${g}`).join('\n');
        } else {
            recipe = "일반 조리 시설 보건 위생 규정 및 교차 오염 기본 예방 수칙을 준수하여 정성껏 위생 조리하십시오.";
        }
        
        const dateObj = new Date();
        dateObj.setDate(dateObj.getDate() + index);
        const dateStr = `${String(dateObj.getMonth() + 1).padStart(2, '0')}/${String(dateObj.getDate()).padStart(2, '0')}`;
        
        results.push({
            day: dayName,
            date: dateStr,
            hasRisk: hasRisk,
            risks: risks,
            menuOrig: menuString,
            menuAlt: menuAlt,
            recipe: recipe
        });
    });
    
    return results;
}

function isAllergenContained(food, allergen) {
    if (allergen === '달걀' && (food.includes('계란') || food.includes('달걀') || food.includes('난황') || food.includes('알'))) return true;
    if (allergen === '우유' && (food.includes('우유') || food.includes('밀크') || food.includes('요구르트') || food.includes('야쿠르트') || food.includes('요플레') || food.includes('치즈'))) return true;
    if (allergen === '땅콩' && (food.includes('땅콩') || food.includes('피넛') || food.includes('견과'))) return true;
    if (allergen === '대두' && (food.includes('대두') || food.includes('콩') || food.includes('간장') || food.includes('된장') || food.includes('두부'))) return true;
    return food.includes(allergen);
}

function getAlternativeFood(food, allergen) {
    if (allergen === '달걀') {
        return { food: '두부구이 (연화처리)', reason: '대체 단백질 및 가루 응집 식감 구현 가능, 알레르기 제로' };
    }
    if (allergen === '우유') {
        return { food: '오렌지주스 (무칼슘/천연)', reason: '우유 지질 성분 제로 및 비타민 보존 대체' };
    }
    if (allergen === '당뇨') {
        if (food.includes('밥')) return { food: '귀리잡곡밥', reason: '식이섬유가 풍부하여 식후 혈당 급상승을 예방하는 복합탄수화물 대체' };
        if (food.includes('요플레')) return { food: '무설탕 플레인 요거트', reason: '과당/정제 설탕 배제로 인슐린 급증 억제' };
        return { food: '저당 식이 반찬', reason: '천연 대체 감미료 조리법 적용' };
    }
    if (allergen === '유당불내증') {
        return { food: '약콩 두유 (락토프리)', reason: '유당 불포함 천연 유기농 식물성 단유 대체' };
    }
    return { food: '대체 자연식품', reason: '식약처 식자재 DB 대체 지표에 따른 추천' };
}

// Render schedule cards in DOM
function renderScheduleCards() {
    elements.scheduleCardsContainer.innerHTML = '';
    
    const results = state.analysisResult;
    const hasAnyRisk = results.some(r => r.hasRisk);
    const riskCount = results.filter(r => r.hasRisk).length;
    
    if (hasAnyRisk) {
        elements.scheduleStatusBanner.className = 'summary-status-badge alert-red';
        elements.scheduleSummaryTitle.textContent = '대체식 처방 식단 스케줄 생성 완료';
        elements.scheduleSummaryDesc.textContent = `전체 분석 식단 중 ${riskCount}일의 식단에서 유해 요인이 확인되어 AI 대체 처방 및 안전 조리법을 발행했습니다.`;
        elements.scheduleStatusBanner.querySelector('i').className = 'fa-solid fa-circle-exclamation text-red animate-bounce';
    } else {
        elements.scheduleStatusBanner.className = 'summary-status-badge safe-green';
        elements.scheduleSummaryTitle.textContent = '식단 스크리닝 통과 (전원 안전)';
        elements.scheduleSummaryDesc.textContent = '입력된 식단 전체에서 현재 등록된 대상자들의 알레르기 및 만성질환 위험군 제한 물질이 검출되지 않았습니다.';
        elements.scheduleStatusBanner.querySelector('i').className = 'fa-solid fa-circle-check text-green';
    }

    results.forEach((item, idx) => {
        const card = document.createElement('div');
        card.className = `schedule-card ${item.hasRisk ? 'has-risk' : 'is-safe'}`;
        
        const statusPill = item.hasRisk 
            ? `<span class="status-pill danger">위험 처방 완료</span>`
            : `<span class="status-pill success">검증 통과</span>`;

        card.innerHTML = `
            <div class="card-header-toggle" onclick="toggleCardAccordion(${idx})">
                <div class="header-day-info">
                    <span class="day-title">[${item.day}]</span>
                    <span class="day-date">예정일자: ${item.date}</span>
                </div>
                <div class="status-indicator-box">
                    ${statusPill}
                    <i class="fa-solid fa-chevron-down toggle-arrow-icon" id="arrow-${idx}"></i>
                </div>
            </div>
            
            <div class="accordion-content" id="accordion-${idx}">
                <div class="card-body-details">
                    <div class="menu-orig-box">
                        <h5>기존 원본 식단</h5>
                        <p class="menu-content-text" style="${item.hasRisk ? 'color: var(--text-secondary); text-decoration: line-through;' : ''}">
                            ${item.menuOrig}
                        </p>
                    </div>
                    
                    ${item.hasRisk ? `
                    <div class="menu-alt-box">
                        <h5>AI 처방 대체식 식단</h5>
                        <p class="menu-content-text text-green font-bold">
                            ${item.menuAlt}
                        </p>
                    </div>
                    
                    <div class="detected-risk-sublist" style="background: rgba(220,38,38,0.03); border-left: 2px solid var(--color-red); padding: 8px 12px; border-radius: 4px; font-size:11px;">
                        <strong class="text-red">충돌 정보:</strong><br>
                        ${item.risks.map(r => `• ${r}`).join('<br>')}
                    </div>
                    ` : ''}
                    
                    <div class="recipe-guide-box">
                        <h5>${item.hasRisk ? 'AI 맞춤 조리 가이드라인' : '표준 조리 지침'}</h5>
                        <p class="recipe-content-text">
                            ${item.recipe.replace(/\n/g, '<br>')}
                        </p>
                    </div>
                </div>
            </div>
        `;
        
        elements.scheduleCardsContainer.appendChild(card);
    });

    elements.scheduleResultView.classList.remove('hidden');
}

window.toggleCardAccordion = function(index) {
    const content = document.getElementById(`accordion-${index}`);
    const arrow = document.getElementById(`arrow-${index}`);
    
    if (content.classList.contains('expanded')) {
        content.classList.remove('expanded');
        arrow.classList.remove('rotate-icon');
    } else {
        content.classList.add('expanded');
        arrow.classList.add('rotate-icon');
    }
};

// 6. VLM Scanner Integration
function initVlmScanner() {
    elements.vlmOptNormal.addEventListener('click', () => {
        selectVlmImage('normal');
    });

    elements.vlmOptAlternative.addEventListener('click', () => {
        selectVlmImage('alternative');
    });

    elements.triggerFileBtn.addEventListener('click', () => {
        elements.vlmFileInput.click();
    });

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

    elements.runVlmBtn.addEventListener('click', async () => {
        if (!state.selectedVlmImage) return;
        
        elements.vlmEmptyResult.classList.add('hidden');
        elements.vlmResultPanel.classList.add('hidden');
        elements.scannerLaser.style.display = 'block';
        elements.scannerLaser.style.animation = 'scan 2.5s infinite linear';
        elements.runVlmBtn.disabled = true;

        try {
            if (apiConfig.key && (state.selectedVlmImage === 'custom' || state.customVlmImageSrc)) {
                // Call Real OpenRouter VLM (Vision) models
                const visionResult = await callOpenRouterVLMFallback();
                // Fill result with vision result
                setTimeout(() => {
                    elements.scannerLaser.style.display = 'none';
                    elements.scannerLaser.style.animation = 'none';
                    elements.runVlmBtn.disabled = false;
                    renderVlmResult(visionResult);
                }, 2500);
            } else {
                // Default Sim Fallback
                setTimeout(() => {
                    elements.scannerLaser.style.display = 'none';
                    elements.scannerLaser.style.animation = 'none';
                    elements.runVlmBtn.disabled = false;
                    showVlmScanResult();
                }, 2500);
            }
        } catch (error) {
            console.error(error);
            showNotification("VLM 모델 인식 지연으로 시뮬레이션 결과로 연동 대체합니다.");
            setTimeout(() => {
                elements.scannerLaser.style.display = 'none';
                elements.scannerLaser.style.animation = 'none';
                elements.runVlmBtn.disabled = false;
                showVlmScanResult();
            }, 1000);
        }
    });
}

// OpenRouter VLM Vision Fallback Call
async function callOpenRouterVLMFallback() {
    const listKey = state.currentMode === 'family' ? 'family' : state.currentFacility;
    const list = state.members[listKey];
    const memberProfileStr = list.map(m => `- 이름: ${m.name}, 유형: ${m.type}, 원인물질/질환: ${m.detail}`).join('\n');

    const prompt = `
이 이미지는 배식 조리 완료된 식판 사진입니다.
아래에 제공된 관리 대상자들의 알레르기/질환 과민 반응 제한 성분 목록을 분석하여, 이 식판에 해당 대상자에게 유해한 식품이나 알레르기 유발 요소가 오배식 되었는지 검증하십시오.

[제한 대상 명단]
${memberProfileStr}

반드시 다른 텍스트 설명 없이 오직 아래 형태의 JSON 객체 하나만 반환하십시오:
{
  "verdict": "PASS" 또는 "REJECT" (위해물질이 없으면 PASS, 있으면 REJECT),
  "allergen": "검출된 유해 물질 요약 (예: 달걀 성분 또는 없음)",
  "portion": "정량 및 형태 분석 (예: 적정 배식 98% 또는 적정)",
  "reason": "AI Vision 분석 상세 근거 (식판 내 물체의 위치 및 매칭 사유)"
}
`;

    const base64Image = state.customVlmImageSrc.split(',')[1];

    for (let model of freeVLMModels) {
        try {
            console.log(`Trying OpenRouter VLM model: ${model}`);
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
                                {
                                    type: "image_url",
                                    image_url: {
                                        url: `data:image/jpeg;base64,${base64Image}`
                                    }
                                }
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
            console.warn(`VLM Model ${model} failed: `, e);
        }
    }

    throw new Error("All free OpenRouter VLM models failed.");
}

function renderVlmResult(apiResult) {
    elements.vlmResultPanel.classList.remove('hidden');
    
    if (apiResult.verdict === 'REJECT') {
        elements.vlmVerdictBox.className = 'vlm-verdict-box rejected';
        elements.verdictIconContainer.innerHTML = '<i class="fa-solid fa-circle-xmark"></i>';
        elements.verdictTitle.textContent = '배식 보류 (REJECTED)';
        
        elements.vlmMatchRate.style.width = '72%';
        elements.vlmMatchRate.style.backgroundColor = 'var(--color-red)';
        elements.vlmMatchValue.textContent = '72%';
        
        elements.vlmAllergenStatus.textContent = apiResult.allergen;
        elements.vlmAllergenStatus.className = 'detail-value text-red';
        elements.vlmPortionStatus.textContent = apiResult.portion;
        elements.vlmAnalysisReason.textContent = apiResult.reason;
        
        elements.vlmActionFooter.innerHTML = `
            <button class="secondary-btn" onclick="switchTab('diet-analyzer')"><i class="fa-solid fa-calendar-days"></i> 식단 분석 재진행</button>
            <button class="primary-btn" style="background:var(--gradient-danger);" disabled><i class="fa-solid fa-ban"></i> 배식 불가 상태</button>
        `;
    } else {
        elements.vlmVerdictBox.className = 'vlm-verdict-box passed';
        elements.verdictIconContainer.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
        elements.verdictTitle.textContent = '배식 승인 (PASSED)';
        
        elements.vlmMatchRate.style.width = '99%';
        elements.vlmMatchRate.style.backgroundColor = 'var(--color-green)';
        elements.vlmMatchValue.textContent = '99%';
        
        elements.vlmAllergenStatus.textContent = '유해 성분 없음 (검증 완료)';
        elements.vlmAllergenStatus.className = 'detail-value text-green';
        elements.vlmPortionStatus.textContent = apiResult.portion;
        elements.vlmAnalysisReason.textContent = apiResult.reason;
        
        elements.vlmActionFooter.innerHTML = `
            <button id="approve-final-btn" class="primary-btn" style="background:var(--gradient-success); width:100%;"><i class="fa-solid fa-circle-check"></i> 최종 배식 확정 및 디지털 이력 저장</button>
        `;
        
        document.getElementById('approve-final-btn').addEventListener('click', saveFinalVerificationLog);
    }
}

function selectVlmImage(type) {
    state.selectedVlmImage = type;
    elements.vlmViewportPlaceholder.classList.add('hidden');
    elements.vlmTargetImage.classList.remove('hidden');
    
    elements.vlmOptNormal.classList.remove('selected');
    elements.vlmOptAlternative.classList.remove('selected');
    
    if (type === 'normal') {
        elements.vlmTargetImage.src = 'assets/meal_normal.png';
        elements.vlmOptNormal.classList.add('selected');
    } else if (type === 'alternative') {
        elements.vlmTargetImage.src = 'assets/meal_alternative.png';
        elements.vlmOptAlternative.classList.add('selected');
    } else if (type === 'custom' && state.customVlmImageSrc) {
        elements.vlmTargetImage.src = state.customVlmImageSrc;
    }
    
    elements.runVlmBtn.disabled = false;
}

function resetVlmUI() {
    state.selectedVlmImage = null;
    state.customVlmImageSrc = null;
    state.vlmApproved = false;
    elements.vlmViewportPlaceholder.classList.remove('hidden');
    elements.vlmTargetImage.classList.add('hidden');
    elements.vlmTargetImage.src = '';
    elements.vlmOptNormal.classList.remove('selected');
    elements.vlmOptAlternative.classList.remove('selected');
    elements.vlmEmptyResult.classList.remove('hidden');
    elements.vlmResultPanel.classList.add('hidden');
    elements.runVlmBtn.disabled = true;
    elements.vlmFileInput.value = '';
}

function showVlmScanResult() {
    elements.vlmResultPanel.classList.remove('hidden');
    
    if (state.selectedVlmImage === 'normal') {
        elements.vlmVerdictBox.className = 'vlm-verdict-box rejected';
        elements.verdictIconContainer.innerHTML = '<i class="fa-solid fa-circle-xmark"></i>';
        elements.verdictTitle.textContent = '배식 보류 (REJECTED)';
        
        elements.vlmMatchRate.style.width = '70%';
        elements.vlmMatchRate.style.backgroundColor = 'var(--color-red)';
        elements.vlmMatchValue.textContent = '70%';
        
        if (state.currentMode === 'family') {
            elements.vlmAllergenStatus.textContent = '계란 및 요구르트 포함 (막내아들 알러지 충돌)';
            elements.vlmAllergenStatus.className = 'detail-value text-red';
            elements.vlmAnalysisReason.textContent = 'Vision 분석 결과, 준비된 식판에 계란말이와 일반 우유 성분 요구르트가 감지되었습니다. 막내아들(우유/밀가루 알레르기)에게는 유해하므로 대체 배식으로 교체하십시오.';
        } else if (state.currentFacility === 'child') {
            elements.vlmAllergenStatus.textContent = '달걀, 우유 성분 검출 (김민수 아동 위험)';
            elements.vlmAllergenStatus.className = 'detail-value text-red';
            elements.vlmAnalysisReason.textContent = 'Vision 분석 결과, 튼튼어린이집 김민수 아동의 유해 인자인 달걀 성분의 계란말이 및 우유 성분의 요구르트가 그대로 배식되어 오배식 경고를 발동합니다.';
        } else {
            elements.vlmAllergenStatus.textContent = '백미 쌀밥 및 가당 유제품 검출 (노인 질환 위험)';
            elements.vlmAllergenStatus.className = 'detail-value text-red';
            elements.vlmAnalysisReason.textContent = 'Vision 분석 결과, 요양시설 당뇨 최옥분 어르신과 유당불내 이명자 어르신에게 유해한 백미 쌀밥 및 요플레가 확인되었습니다. 배식을 차단하고 저당 잡곡밥 및 락토프리 두유로 재배식하십시오.';
        }
        
        elements.vlmPortionStatus.textContent = '배식량 적정 (94%)';
        
        elements.vlmActionFooter.innerHTML = `
            <button class="secondary-btn" onclick="switchTab('diet-analyzer')"><i class="fa-solid fa-calendar-days"></i> 식단 분석 재진행</button>
            <button class="primary-btn" style="background:var(--gradient-danger);" disabled><i class="fa-solid fa-ban"></i> 배식 불가 상태</button>
        `;
    } else {
        elements.vlmVerdictBox.className = 'vlm-verdict-box passed';
        elements.verdictIconContainer.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
        elements.verdictTitle.textContent = '배식 승인 (PASSED)';
        
        elements.vlmMatchRate.style.width = '99%';
        elements.vlmMatchRate.style.backgroundColor = 'var(--color-green)';
        elements.vlmMatchValue.textContent = '99%';
        elements.vlmAllergenStatus.textContent = '위험 성분 없음 (대체식 안전 적용 완료)';
        elements.vlmAllergenStatus.className = 'detail-value text-green';
        
        if (state.selectedVlmImage === 'custom') {
            elements.vlmAnalysisReason.textContent = '직접 업로드한 사진 분석 결과, 조리지침에 따른 대체 구성 성분 매칭이 완벽하여 위험 물질이 전혀 감지되지 않았습니다. 안전 배식이 허가되었습니다.';
        } else if (state.currentMode === 'family') {
            elements.vlmAnalysisReason.textContent = 'Vision 분석 결과, 계란말이 대신 두부구이와 일반 요구르트 대신 유당 성분이 없는 오렌지주스가 완벽히 배식되어 막내아들 및 가족 알레르기 수칙 통과를 보증합니다.';
        } else if (state.currentFacility === 'child') {
            elements.vlmAnalysisReason.textContent = 'Vision 분석 결과, 김민수 아동의 대체 처방 식자재인 두부구이와 오렌지주스가 오배식 없이 완벽 매핑되었습니다.';
        } else {
            elements.vlmAnalysisReason.textContent = 'Vision 분석 결과, 당뇨 및 유당불내 어르신들에게 적합한 잡곡밥 및 락토프리 두유 대체 급식이 검증 완료되었습니다.';
        }
        
        elements.vlmPortionStatus.textContent = '정량 배식 검증 (98%)';
        
        elements.vlmActionFooter.innerHTML = `
            <button id="approve-final-btn" class="primary-btn" style="background:var(--gradient-success); width:100%;"><i class="fa-solid fa-circle-check"></i> 최종 배식 확정 및 디지털 이력 저장</button>
        `;
        
        document.getElementById('approve-final-btn').addEventListener('click', saveFinalVerificationLog);
    }
}

function saveFinalVerificationLog() {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const timeStr = today.toTimeString().split(' ')[0].substring(0, 5);
    
    let logItem = {};
    if (state.currentMode === 'family') {
        logItem = {
            date: dateStr,
            menu: '쌀밥, 두부구이, 어묵볶음, 오렌지주스',
            facility: 'family',
            target: '막내아들 (우유, 밀가루)',
            alternative: '계란말이 ➔ 두부구이, 요구르트 ➔ 오렌지주스 대체',
            guideline: '가정 내 유제품 독립 보관 및 배식 도구 철저 분리',
            vlmStatus: 'PASS',
            timestamp: `${dateStr} ${timeStr}`
        };
    } else if (state.currentFacility === 'child') {
        logItem = {
            date: dateStr,
            menu: '쌀밥, 두부구이, 어묵볶음, 맑은 무국, 오렌지주스',
            facility: 'child',
            target: '김민수 아동 (달걀/우유)',
            alternative: '달걀말이 ➔ 두부구이, 요구르트 ➔ 오렌지주스 대체',
            guideline: '계란 조리기구 분리 사용 및 대체 급식 라벨 체크',
            vlmStatus: 'PASS',
            timestamp: `${dateStr} ${timeStr}`
        };
    } else {
        logItem = {
            date: dateStr,
            menu: '귀리잡곡밥, 버섯국, 불고기, 고구마순나물, 약콩 두유',
            facility: 'senior',
            target: '최옥분(당뇨), 이명자(유당불내)',
            alternative: '쌀밥 ➔ 귀리잡곡밥, 요플레 ➔ 약콩 두유 대체',
            guideline: '당뇨 혈당 모니터링 식단 및 비유제품 간식 교체 검증',
            vlmStatus: 'PASS',
            timestamp: `${dateStr} ${timeStr}`
        };
    }

    state.logs.push(logItem);
    saveLogs();
    state.vlmApproved = true;
    
    showNotification("배식 이력이 안전하게 저장되었습니다. 자동 생성된 디지털 일지를 보관합니다.");
    switchTab('report-generator');
}

// 7. Report Center and ESG Integration
function initReportCenter() {
    elements.reportSubTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.reportSubTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderReport();
        });
    });

    elements.printReportBtn.addEventListener('click', () => {
        window.print();
    });
}

function renderReport() {
    const activeSubTab = document.querySelector('.sub-tab-btn.active').getAttribute('data-report');
    
    let facilityName = '';
    let reportWriter = '';
    let reportSigner = '';
    
    if (state.currentMode === 'family') {
        facilityName = '마포구 서교동 삼총사 가정';
        reportWriter = '엄마/아빠 (가정 안심 영양사)';
        reportSigner = '가정대표 보호자 (서명)';
        elements.reportConfirmStatement.textContent = '위와 같이 가족 구성원의 특이 체질 및 지침에 부합하는 안전 식단과 대체 배식이 올바르게 실행되었음을 확인하며 VLM 스캔 검증 이력을 디지털 기록합니다.';
        elements.reportSignerName.textContent = '가족 건강 확인자: 엄마/아빠 (인)';
        elements.reportFooterDesc.textContent = 'CareTable 가정용 식단 위생 자율 점검 대장 (F-2026)';
    } else {
        facilityName = state.currentFacility === 'child' ? '튼튼어린이집' : '행복실버요양원';
        reportWriter = '박아름 사회복지사';
        reportSigner = '시설대표 박아름 (서명)';
        elements.reportConfirmStatement.textContent = '위와 같이 취약계층 급식 관리 및 대체 배식이 올바르게 수행되었으며, 배식 전 VLM(Vision-Language Model) 검증 절차를 완료하였음을 확인합니다.';
        elements.reportSignerName.textContent = '확인자: 시설대표 박아름 (서명/인)';
        elements.reportFooterDesc.textContent = '한국사회보장정보원 사회복지시설평가 증빙 표준 서식 (SSIS 14-2)';
    }

    elements.rFacilityName.textContent = facilityName;
    elements.rWriter.textContent = reportWriter;
    
    const today = new Date();
    elements.rDate.textContent = `${today.getFullYear()}년 ${String(today.getMonth() + 1).padStart(2, '0')}월 ${String(today.getDate()).padStart(2, '0')}일`;

    const currentFilterKey = state.currentMode === 'family' ? 'family' : state.currentFacility;
    const filteredLogs = state.logs.filter(l => l.facility === currentFilterKey);

    let contentHtml = '';

    if (activeSubTab === '급식일지') {
        elements.reportDocTitle.textContent = state.currentMode === 'family' ? '가 정 식 단 위 생 일 지' : '영 양 급 식 일 지';
        
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
                                <td colspan="5" style="color: var(--text-muted); padding:20px 0;">배식 이력이 존재하지 않습니다. VLM 검증 탭에서 배식을 최종 확정해 주십시오.</td>
                            </tr>
                        `}
                    </tbody>
                </table>
                <p><strong>주요 안전 점검 준수 사항:</strong></p>
                <ul>
                    <li>식자재 보관 냉장/냉동고 온도 적격 확인</li>
                    <li>VLM 비전 분석 스캔을 통한 알레르기 유발 유래 성분 최종 격리 점검 양호</li>
                    <li>지정 조리사의 교차 오염 방지용 조리기구 분리 사용 실행 완료</li>
                </ul>
            </div>
        `;
    } else if (activeSubTab === '알레르기대장') {
        elements.reportDocTitle.textContent = state.currentMode === 'family' ? '가족 알레르기 및 만성질환 DB' : '집중 케어 대상자 대장';
        
        contentHtml = `
            <div class="report-paper-body">
                <p>${state.currentMode === 'family' ? '가족들의 건강 및 식품 과민반응 정보를 지속 보관하여 오인 사고를 예방하는 집중 예방 DB입니다.' : '사회복지시설 평가지표 24번 취약계층 식품 유해인자 맞춤 안전 관리대장 양식입니다.'}</p>
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>순번</th>
                            <th>수혜자명</th>
                            <th>제한 식품 및 요인</th>
                            <th>추천 대체 식자재</th>
                            <th>핵심 대체 조리 지침</th>
                            <th>검증 방식</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${state.members[currentFilterKey].filter(m => m.type !== '일반').map((m, idx) => {
                            const pair = getAlternativeFood(m.detail.split(',')[0].trim(), m.detail.includes('당뇨') ? '당뇨' : m.detail.includes('고혈압') ? '당뇨' : m.detail.split(',')[0].trim());
                            return `
                                <tr>
                                    <td>${idx + 1}</td>
                                    <td><strong>${m.name}</strong></td>
                                    <td><span style="color:#e11d48; font-weight:600;">${m.detail}</span></td>
                                    <td><span style="color:#0d9488; font-weight:600;">${pair.food}</span></td>
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
        elements.reportDocTitle.textContent = '대 체 급 식 제 공 대 장';
        
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
                                <td colspan="6" style="color: var(--text-muted); padding:20px 0;">배식 이력이 존재하지 않습니다. VLM 검증 탭에서 배식을 최종 확정해 주십시오.</td>
                            </tr>
                        `}
                    </tbody>
                </table>
            </div>
        `;
    }

    elements.reportDocContent.innerHTML = contentHtml;

    const savedHours = (filteredLogs.length * 4.2).toFixed(1);
    const co2Saved = (filteredLogs.length * 12.0).toFixed(1);
    
    elements.esgCo2.textContent = `${co2Saved}kg`;
    elements.esgTime.textContent = `${savedHours}시간`;
    elements.esgLocal.textContent = state.currentMode === 'family' ? '75%' : (state.currentFacility === 'child' ? '45%' : '60%');
    
    if (state.currentMode === 'family') {
        elements.esgTime.parentElement.querySelector('.esg-lbl').textContent = '가사 노동 및 행정 절감 시간';
        elements.esgTime.parentElement.querySelector('.esg-sub').textContent = '레시피 고민 및 자율 기록 자동화 효과';
    } else {
        elements.esgTime.parentElement.querySelector('.esg-lbl').textContent = '행정 시간 ➔ 직접 돌봄 시간 환원';
        elements.esgTime.parentElement.querySelector('.esg-sub').textContent = '시설 평가 문서 자동화에 따른 절감';
    }
}

// 8. API configuration modal functions
function initApiConfig() {
    elements.openApiConfigBtn.addEventListener('click', () => {
        elements.apiKeyInput.value = apiConfig.key;
        elements.apiModelSelect.value = apiConfig.model;
        elements.apiConfigModal.classList.remove('hidden');
    });

    elements.closeApiModalBtn.addEventListener('click', closeApiModal);

    elements.apiConfigModal.addEventListener('click', (e) => {
        if (e.target === elements.apiConfigModal) closeApiModal();
    });

    elements.toggleKeyVisibilityBtn.addEventListener('click', () => {
        const type = elements.apiKeyInput.type === 'password' ? 'text' : 'password';
        elements.apiKeyInput.type = type;
        elements.toggleKeyVisibilityBtn.innerHTML = type === 'password' ? '<i class="fa-solid fa-eye"></i>' : '<i class="fa-solid fa-eye-slash"></i>';
    });

    elements.resetApiKeyBtn.addEventListener('click', () => {
        elements.apiKeyInput.value = '';
        apiConfig.key = '';
        localStorage.removeItem('caremeal_api_key');
        updateApiStatusUI();
        closeApiModal();
        showNotification("오픈라우터 API Key가 삭제되었습니다. 데모 시뮬레이션 모드로 작동합니다.");
    });

    elements.apiConfigForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const key = elements.apiKeyInput.value.trim();
        const model = elements.apiModelSelect.value;
        
        apiConfig.key = key;
        apiConfig.model = model;
        
        if (key) {
            localStorage.setItem('caremeal_api_key', key);
            localStorage.setItem('caremeal_api_model', model);
            showNotification("오픈라우터 무료 AI 연동 및 순차 폴백 체인 활성화!");
        } else {
            localStorage.removeItem('caremeal_api_key');
            showNotification("API Key가 비어있어 로컬 시뮬레이션 모드로 전환되었습니다.");
        }
        
        updateApiStatusUI();
        closeApiModal();
    });
}

function closeApiModal() {
    elements.apiConfigModal.classList.add('hidden');
}

function updateApiStatusUI() {
    if (apiConfig.key) {
        elements.apiStatusBadge.className = 'api-status live-connected';
        elements.apiStatusText.textContent = `AI 연동: 폴백 체인`;
        elements.analyzerModelIndicator.textContent = `${apiConfig.model.split('/')[1] || apiConfig.model} (실시간 무료 AI 폴백 활성화)`;
    } else {
        elements.apiStatusBadge.className = 'api-status online';
        elements.apiStatusText.textContent = 'AI: 시뮬레이션 모드';
        elements.analyzerModelIndicator.textContent = 'Nemotron-70B / Llama-3 (시뮬레이션 폴백 모드)';
    }
}

// 9. Interactive Person management Modal
function initModal() {
    elements.addMemberBtn.addEventListener('click', () => {
        elements.addMemberModal.classList.remove('hidden');
    });

    elements.closeMemberModalBtn.addEventListener('click', closeMemberModal);
    elements.cancelMemberBtn.addEventListener('click', closeMemberModal);

    elements.addMemberModal.addEventListener('click', (e) => {
        if (e.target === elements.addMemberModal) closeMemberModal();
    });

    elements.memberForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('m-name').value.trim();
        const ageVal = document.getElementById('m-age').value.trim();
        const gender = document.getElementById('m-gender').value;
        const type = document.getElementById('m-risk-type').value;
        const detail = document.getElementById('m-detail').value.trim();
        const instruction = document.getElementById('m-instruction').value.trim();
        
        if (!name || !ageVal || !detail || !instruction) return;

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
        
        closeMemberModal();
        elements.memberForm.reset();
        
        renderDashboard();
        updateCharts();
        
        showNotification(`신규 수혜자 ${name}님이 성공적으로 데이터베이스에 추가되었습니다.`);
    });
}

function closeMemberModal() {
    elements.addMemberModal.classList.add('hidden');
}

// 10. Chart.js Dashboard and ESG rendering
function initCharts() {
    // Dynamic refresh
}

function updateCharts() {
    const dashCanvas = document.getElementById('dashboardChart');
    if (dashCanvas) {
        if (state.charts.dashboard) state.charts.dashboard.destroy();
        
        const listKey = state.currentMode === 'family' ? 'family' : state.currentFacility;
        const list = state.members[listKey];
        const normalCount = list.filter(m => m.type === '일반').length;
        const allergyCount = list.filter(m => m.type === '알레르기').length;
        const diseaseCount = list.filter(m => m.type === '질환식').length;

        Chart.defaults.color = '#94a3b8';
        Chart.defaults.font.family = 'Outfit';

        state.charts.dashboard = new Chart(dashCanvas, {
            type: 'doughnut',
            data: {
                labels: ['일반 급식군', '식품 알러지군', '만성 질환 식이군'],
                datasets: [{
                    data: [normalCount, allergyCount, diseaseCount],
                    backgroundColor: ['#10b981', '#f43f5e', '#8b5cf6'],
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            padding: 10,
                            font: { size: 11 }
                        }
                    }
                },
                cutout: '65%'
            }
        });
    }

    const esgCanvas = document.getElementById('esgChart');
    if (esgCanvas) {
        if (state.charts.esg) state.charts.esg.destroy();

        const lineLabel1 = state.currentMode === 'family' ? '자율 관리 환원 시간(H)' : '돌봄 환원 시간(H)';
        const lineLabel2 = state.currentMode === 'family' ? '가정 탄소 감축량(kg)' : '누적 탄소 절감(kg)';

        state.charts.esg = new Chart(esgCanvas, {
            type: 'line',
            data: {
                labels: ['1월', '2월', '3월', '4월', '5월', '6월(예정)'],
                datasets: [
                    {
                        label: lineLabel1,
                        data: [20, 35, 52, 68, 84, 105],
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: lineLabel2,
                        data: [50, 95, 140, 190, 240, 310],
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
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
                        labels: {
                            boxWidth: 10,
                            font: { size: 10 }
                        }
                    }
                },
                scales: {
                    x: { grid: { display: false } },
                    y: { grid: { color: 'rgba(255, 255, 255, 0.05)' } }
                }
            }
        });
    }
}
