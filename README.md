---
title: CareTable
emoji: 🍱
colorFrom: blue
colorTo: green
sdk: docker
pinned: false
---

# CareTable - 취약계층 및 가정 맞춤형 급식 안전 스케줄러 & 증빙 자동화 플랫폼

2026 사회보장정보와 공공·민간 빅데이터를 활용한 국민행복 서비스 발굴‧창업경진대회 출품작입니다.

본 저장소는 **Hugging Face Spaces**의 Docker SDK 환경을 통해 호스팅되는 CareTable 데모 웹 사이트입니다.

## 🚀 주요 기능
1. **일반 가정 / 사회복지시설 범용 토글**: 시설용 모드와 일반 소비자(가정) 모드를 스위칭하여 맞춤형 데이터베이스 및 ESG 일지를 관리합니다.
2. **OpenRouter 무료 AI 모델 실시간 연동**: Llama-3.1 Nemotron, Llama-3, Gemma-2 등 오픈라우터 무료 LLM 모델 폴백(Fallback) 체인 및 Llama-3.2 Vision VLM 무료 모델 실시간 호출을 지원합니다. (API Key가 없어도 시뮬레이션 모드로 정상 작동합니다.)
3. **주간/월간 대량 식단 스케줄 분석**: 월/주 단위 식단을 통째로 입력하면 일목요연한 캘린더 그리드 및 아코디언 카드 뷰로 시각화합니다.
4. **VLM(Vision-Language Model) 오배식 방지 검증**: 식판 이미지 촬영 및 업로드 시 비전 AI가 유해 식자재 혼입 여부를 2차 자동 검증합니다.
5. **디지털 자동 일지 및 ESG 성과 인쇄**: 시설 평가 증빙 및 ESG 가치 수치 통계를 대시보드로 요약하고 공식 PDF로 깔끔하게 인쇄합니다.

---

## 🛠️ GitHub Actions를 활용한 Hugging Face Spaces CI/CD 배포 구성법

본 프로젝트의 코드를 GitHub에 올린 뒤, 코드 변경 시마다 허깅페이스 스페이스로 배포 자동화를 하려면 아래 단계를 완료하십시오.

### 1단계: Hugging Face Access Token 발급
1. [Hugging Face Settings](https://huggingface.co/settings/tokens)로 이동합니다.
2. **New token** 버튼을 클릭하고 Role을 **Write**로 지정하여 토큰을 생성 및 복사합니다.

### 2단계: GitHub Secrets에 토큰 추가
1. 배포할 GitHub Repository의 **Settings ➔ Secrets and variables ➔ Actions**로 이동합니다.
2. **New repository secret** 버튼을 클릭합니다.
3. Name에 `HF_TOKEN`을 입력하고, Value에 복사한 Hugging Face Access Token을 붙여넣습니다.

### 3단계: GitHub push 진행
- 코드가 GitHub 저장소의 `main` 브랜치에 push될 때마다 GitHub Actions 워크플로우가 자동으로 트리거되어 Hugging Face Spaces로 코드를 빌드/복사합니다.
