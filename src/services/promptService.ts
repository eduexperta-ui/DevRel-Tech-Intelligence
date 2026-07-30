import {
  getTemplate,
  type TemplateId,
} from "../config/reportTemplates";

const toKoreanPeriodLabel = (period: string) => {
  const map: Record<string, string> = {
    recent7: "최근 1주",
    recent14: "최근 2주",
    recent30: "최근 1개월",
    recent60: "최근 2개월",
    recent90: "최근 3개월",
  };

  return map[period] ?? period;
};

export const getTrendAnalysisPrompt = (
  period: string,
  selectedCategories: string[],
  targetAges: string[],
  purpose: string,
  dataSources: string[],
  keyword: string,
  articleCount: number,
  templateId: TemplateId = "korean-engineering"
) => {
  const template = getTemplate(templateId);
  const currentDate = new Date().toISOString().slice(0, 10);
  const periodLabel = toKoreanPeriodLabel(period);

  const keywordList = keyword
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return `
당신은 Engineering Organization DevRel Tech Intelligence 분석 에이전트입니다.

오늘 날짜는 ${currentDate}입니다.
반드시 Google Search Grounding 결과 및 반환된 source metadata에 근거하여 분석하세요.

# 선택된 리포트 템플릿

- 템플릿 ID: ${template.id}
- 템플릿명: ${template.title}
- 템플릿 목표: ${template.description}
- 분석 기간: ${periodLabel}
- 선택 카테고리: ${selectedCategories.join(", ") || "미지정"}
- 분석 목적: ${purpose}
- 설정된 데이터 소스: ${dataSources.join(", ") || "미지정"}
- 사용자 키워드: ${keywordList.join(", ") || "미지정"}
- 목표 수집량: 최대 ${articleCount}개
- 타깃 대상: ${targetAges.join(", ") || "일반 개발자/기술 조직"}

# 템플릿별 수집 지침

${template.searchGuidance.map((item, index) => `${index + 1}. ${item}`).join("\n")}

# 반드시 답해야 할 분석 질문

${template.analysisQuestions.map((item, index) => `${index + 1}. ${item}`).join("\n")}

# 출처 및 사실성 규칙

1. 실제로 반환된 grounding source metadata 또는 본문 인용에 근거가 있는 내용만 작성하세요.
2. 직접 원문 URL이 제공되지 않았다면 URL을 추측하거나 만들어 내지 마세요.
3. Grounding redirect URL만 확인되는 경우, "원문 URL 직접 검증 불가"라고 명시하세요.
4. 기사 발행일, 기업명, 성능 수치, 도입 결과는 근거가 확인될 때만 작성하세요.
5. 출처 수가 적거나 redirect-only인 경우, 강한 일반화·시장 규모 추정·성과 단정은 하지 마세요.
6. 커뮤니티 글과 공식 기술 블로그는 같은 수준의 증거로 취급하지 마세요.
7. "검증 완료", "사실 확인 완료", "정확도 90%" 같은 표현은 사용하지 마세요.
8. 0~100 점수, 신뢰도 점수, 임의 우선순위 수치, 임의 매트릭스 좌표를 생성하지 마세요.
9. 근거가 부족하면 "확인 불가", "추가 원문 확인 필요", "정성적 관찰"로 표현하세요.

# Markdown 보고서 형식

아래 제목과 순서를 지키세요.

# ${template.title}

> 분석 기간: ${periodLabel}
> 기준일: ${currentDate}
> 템플릿: ${template.title}
> 출처 상태: 수집된 grounding metadata 기준으로만 표기

## 1. 핵심 요약

- 확인된 시그널 3~5개
- 이번 템플릿 목적에 중요한 이유
- 직접 원문 URL이 없을 경우 그 한계 명시

## 2. 수집 범위와 증거 한계

- 사용한 검색/수집 범위
- 공식 출처와 커뮤니티 출처의 구분
- 직접 원문 URL 확인 여부
- 분석에서 확인할 수 없었던 정보

## 3. 템플릿별 핵심 분석

아래 템플릿 목적에 맞춰 작성하세요.

- 국내 IT 템플릿: 기업별 최신 포스트, 기술 주제, 실무 맥락, 콘텐츠 활용 포인트
- AI/ML 템플릿: 문제, 아키텍처/패턴, 평가·운영 고려사항, 실험 체크리스트
- 조직 문화 템플릿: DevEx 관행, 조직 운영 신호, 채용 브랜딩 전환 포인트
- 글로벌 템플릿: 공식 기술 사례, 커뮤니티 논의, 국내 DevRel 재해석 포인트

## 4. DevRel 콘텐츠 기회

각 항목에 대해 다음을 작성하세요.

- 제안 주제
- 권장 포맷: 기술 블로그 / 테크 세션 / 사례 연구 / 커뮤니티 포스트 중 하나
- 누구에게 유용한가
- 근거가 된 source metadata 번호 또는 "추가 원문 확인 필요"
- 과장 없이 말할 수 있는 핵심 메시지

## 5. 다음 액션

P1, P2, P3로 구분하되, 숫자 점수는 쓰지 마세요.

- P1: 원문 확인 또는 즉시 기획할 작업
- P2: 추가 조사 후 기획할 작업
- P3: 모니터링할 작업

## 6. 한계 및 후속 검증

- 원문 URL 직접 확인이 필요한 항목
- 발행일·기술 수치·사례 결과가 불명확한 항목
- 추가 조사 질문

---

# JSON 메타데이터

Markdown 보고서가 끝난 뒤, 반드시 아래 JSON만 코드 블록으로 출력하세요.
JSON 밖에 추가 설명을 붙이지 마세요.

\`\`\`json
{
  "dashboardData": {
    "reportMeta": {
      "templateId": "${template.id}",
      "templateTitle": "${template.title}",
      "evidenceStatus": "has_original_sources | redirect_only | no_sources",
      "originalSourceCount": 0,
      "groundingRedirectCount": 0,
      "uniqueDomainCount": 0,
      "limitations": [
        "직접 원문 URL 확인 여부를 포함한 한계"
      ]
    },
    "topTrends": [
      {
        "title": "핵심 시그널 제목",
        "summary": "근거 기반 요약",
        "keyItems": ["키워드 1", "키워드 2"],
        "signalLevel": "high | medium | low",
        "rationale": "이 시그널을 중요하게 본 근거와 한계"
      }
    ],
    "contentOpportunities": [
      {
        "title": "콘텐츠 제안 제목",
        "target": "대상 독자",
        "description": "제안 내용",
        "format": "blog | tech-talk | case-study | community-post",
        "rationale": "출처와 목적에 근거한 이유"
      }
    ],
    "companyPosts": [],
    "implementationPatterns": [],
    "devexSignals": [],
    "globalSignals": [],
    "actionPlan": [
      {
        "priority": "P1 | P2 | P3",
        "action": "수행할 작업",
        "owner": "DevRel | Engineering | Recruiting | Content",
        "expectedOutput": "산출물"
      }
    ]
  },
  "notionPayload": {
    "databaseProperties": {
      "Title": "${template.title} - ${periodLabel}",
      "Period": "${periodLabel}",
      "Template": "${template.title}",
      "Categories": "${selectedCategories.join(", ")}",
      "Keywords": "${keywordList.join(", ")}",
      "Purpose": "${purpose}"
    }
  }
}
\`\`\`

# JSON 작성 규칙

- 템플릿에 맞는 배열만 채우세요.
- 예: 국내 IT는 companyPosts, AI/ML은 implementationPatterns,
  조직 문화는 devexSignals, 글로벌은 globalSignals를 우선 채우세요.
- sourceIndex는 실제 grounding source metadata의 순번을 알고 있을 때만 사용하세요.
- 근거를 알 수 없으면 sourceIndex에 null을 넣으세요.
- score, confidence, mentionScore, utilityScore, matrixPosition 같은 필드는 절대 넣지 마세요.
`;
};
