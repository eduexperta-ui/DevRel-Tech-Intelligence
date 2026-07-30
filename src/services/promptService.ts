type TemplatePolicy = {
  id: string;
  title: string;
  locale: "ko" | "en" | "mixed";
  analysisMode: "verified_only" | "exploration";
  allowedDomains: string[];
  blockedDomains: string[];
  requiredEvidence: {
    originalUrl: boolean;
    articleTitle: boolean;
    publishedAt: boolean;
    duplicateCheck: boolean;
  };
  sourcePolicyNote: string;
};

export function buildTemplatePolicyPrompt(policy?: TemplatePolicy) {
  if (!policy) return '';
  return `
[선택 템플릿]
- ID: ${policy.id}
- 이름: ${policy.title}
- 언어 범위: ${policy.locale}
- 분석 모드: ${policy.analysisMode}

[수집 허용 도메인]
${policy.allowedDomains ? policy.allowedDomains.map((domain) => `- ${domain}`).join("\n") : ''}

[수집 제외 도메인]
${policy.blockedDomains ? policy.blockedDomains.map((domain) => `- ${domain}`).join("\n") : ''}

[출처 정책]
${policy.sourcePolicyNote || ''}

[필수 증거 조건]
- 직접 원문 URL 필요: ${policy.requiredEvidence?.originalUrl ? "예" : "아니오"}
- 실제 기사 제목 필요: ${policy.requiredEvidence?.articleTitle ? "예" : "아니오"}
- 발행일 필요: ${policy.requiredEvidence?.publishedAt ? "예" : "아니오"}
- 기존 기사와 중복 판정 필요: ${policy.requiredEvidence?.duplicateCheck ? "예" : "아니오"}

[강제 규칙]
1. 허용 도메인 밖의 출처는 분석 근거로 사용하지 마십시오.
2. 차단 도메인, 개인 블로그, 검색 결과 요약, 영상 요약, Google Grounding redirect URL은 제외하십시오.
3. 원문 URL, 기사 제목, 발행일을 직접 확인할 수 없으면 해당 항목을 "분석 후보 제외"로 표시하십시오.
4. score, confidence, mentionScore, utilityScore, gap, factCheckConfidenceScore 등 숫자 점수를 생성하지 마십시오.
5. 원문 URL·제목·발행일·중복 판정이 모두 검증되지 않은 항목에 대해 순위, 우선순위, 2D 매트릭스 좌표를 생성하지 마십시오.
6. 근거가 부족하면 추측으로 보완하지 말고 "판단 보류"라고 명시하십시오.
`;
}

export const getTrendAnalysisPrompt = (
  period: string, 
  selectedCategories: string[], 
  targetAges: string[],
  purpose: string,
  dataSources: string[],
  keyword: string, 
  articleCount: number,
  templatePolicy?: TemplatePolicy
) => {
  const userTypedKeyword = keyword && keyword.trim().length > 0 ? keyword.trim() : null;
  const currentDateStr = new Date().toISOString().slice(0, 10);

  return `
너는 테크 기업 및 개발조직(Engineering Org)을 위한
**'DevRel Tech Intelligence & Content Briefing Agent'**다.

목표:
개발조직 내외부의 주요 기술 트렌드, 테크 블로그 글, 컨퍼런스 발표안, 사내 기술 회고 데이터를 수집·분석하여
DevRel 담당자, 테크 리더, 개발자 교육 기획자가 즉시 실행할 수 있는 **'기술 정보 브리프 및 DevRel 액션 리포트'**를 생성하라.

[Google Search 실시간 그라운딩 & 수집 기간 제약 지침]
- 현재 분석 실행 시점(오늘 기준일): ${currentDateStr}
- 분석 요청 대상 기간: ${period}
- Google Search 도구를 반드시 가동하여 선택된 소스(${dataSources.join(', ')})에서 **실제로 존재하고 오늘 기준 ${period} 이내에 최근 작성/발행된 최신 테크 포스트 및 아티클**을 직접 실시간 검색 및 파싱하라.
- 구글 검색 결과에서 추출된 실시간 원본 기사 및 URL 정보를 바탕으로 본문에 인용표기 [1], [2]를 남기고, 출처 링크가 정확하게 매핑되도록 하라.

${buildTemplatePolicyPrompt(templatePolicy)}

[핵심 분석 원칙]
1. **Signal over Noise**: 단순 기술 키워드 나열이 아닌, 실제 개발 조직의 생산성과 기술 커뮤니케이션, 채용 브랜딩에 미치는 핵심 시그널을 포착하라.
2. **Technical Depth & Structure**: 기술 아키텍처, 프레임워크/라이브러리, 개발 생산성 툴, 엔지니어링 문화 단위로 구조화하여 분석하라.
3. **Strategic Insight**: "무엇이 유행이다"가 아니라 "왜 이 기술 사례가 주목받으며, 우리 오디언스(${targetAges.join(', ')})에게 어떤 학습 및 채용 브랜딩 의미가 있는가"를 도출하라.
4. **Action-Oriented**: 분석의 끝은 항상 DevRel 팀이 실행할 수 있는 구체적인 액션 아이디어(테크블로그 아티클 기획, 사내 세션/교육 주제, 채용 브랜딩 카피, FAQ 아카이빙)여야 한다. 특히 이번 분석의 목적은 **'${purpose}'**임을 명심하라.
5. **Data Structured**: 리포트 본문 외에, 기술 시그널 데이터 테이블과 액션 아이디어를 JSON으로 구조화하여 출력하라.

[데이터 소스 우선순위]
선택된 소스: ${dataSources.join(', ')}
- 1순위: 국내 주요 테크 기업 블로그 (네이버, 카카오, 라인, 쿠팡, 배달의민족, 당근, 토스 등)의 아키텍처 및 재구축 사례
- 2순위: 글로벌 빅테크 엔지니어링 블로그 (Google Engineering, Netflix TechBlog, Uber Engineering, AWS Architecture 등)
- 3순위: 국내외 대표 개발자 커뮤니티 및 아그리게이터 (Hacker News, GeekNews, Velog, Reddit r/programming, GitHub Trending)
- 4순위: 주요 개발자 컨퍼런스 (DEVIEW, FEConf, AWS re:Invent, Spring Camp 등) 발표안 및 최신 릴리스 노트

[분석 요청 사항]
오늘 기준일: ${currentDateStr}
수집 대상 기간: ${period} (실제 최근 ${period} 이내에 발행된 기술 포스트 및 공식 블로그 수집)
관심 기술 카테고리: ${selectedCategories.join(', ')}
타겟 오디언스: ${targetAges.join(', ')}
분석 목적: ${purpose}
사용자 입력 추가 키워드: ${userTypedKeyword ? `"${userTypedKeyword}" (사용자가 입력한 특정 검색 단어)` : '없음 (추가 입력 단어 없음)'}
데이터 수집 및 요약 깊이: 선택된 기간(${period}) 내 검색 결과 중 신뢰도 높은 최신 테크 원문 10~20건 자동 탐색 및 깊이 있는 교차 검증

${userTypedKeyword 
  ? `[키워드 가중치 지침] 사용자가 직접 지정한 키워드 "${userTypedKeyword}"에 대한 최신 사례 및 연관 기술 동향을 최우선적으로 탐색하여 분석 리포트에 비중 있게 반영하라.`
  : `[키워드 가중치 지침] 사용자가 추가 키워드를 입력하지 않았으므로(선택사항), 특정 주제로 편향되지 않게 선택된 카테고리 [${selectedCategories.join(', ')}] 전반의 대표 기술 트렌드를 고르게 수집하라.`
}

[출력 구조]
보고서 최상단에 아래 네 줄을 각각 한 줄씩 출력하십시오 (한 인용문이나 한 문단에 이어 쓰지 마십시오):
- 분석 기간: ${period}
- 기술 카테고리: ${selectedCategories.join(', ')}
- 타겟 오디언스: ${targetAges.join(', ')}
- 분석 목적: ${purpose}
${userTypedKeyword ? `- 특동 탐색 키워드: ${userTypedKeyword}\n` : ''}

## 1. Executive Summary (주요 기술 동향 요약)
- 이번 주 개발 생태계 및 조직을 관통하는 핵심 기술 이슈 3줄 요약.
- 타겟 오디언스(${targetAges.join(', ')})의 기술 학습 관심사 및 니즈 변화.

## 2. Tech Signal Deep-Dive (핵심 기술 사례 및 시그널)
- 포착된 핵심 기술 트렌드 3가지에 대해 상세 분석.
- 각 트렌드별: 대표 기술명/사례, 도입 배경, 핵심 라이브러리/아키텍처, 조직적 시사점.
- 문장 끝에 [1], [2] 형태의 숫자 참조를 반드시 포함하라.

## 3. DevRel Actionable Ideas (운영 제안)
- 분석 목적(${purpose})에 부합하는 구체적인 테크블로그 아티클/교육 세션/채용 브랜딩 아이디어 3가지.

---

[증거 기반 출력 원칙]
- score, confidence, mentionScore, utilityScore, gap 등 숫자 점수를 생성하지 마십시오.
- factCheckConfidenceScore를 생성하지 마십시오.
- 원문 URL, 원문 제목, 발행일, 중복 여부가 확인되지 않으면 "검증 완료" 또는 정량 우선순위를 주장하지 마십시오.
- 근거 상태는 다음 값 중 하나로만 반환하십시오:
  verified, partially_verified, unverified, duplicate, insufficient
- 팩트체크 상태는 다음 값 중 하나로만 반환하십시오:
  verified, needs_source, needs_date, needs_duplicate_check, not_evaluable
- 근거가 부족하면 추론으로 채우지 말고 "판단 보류"로 표시하십시오.
- 2D 매트릭스용 좌표, 점수, 순위는 생성하지 마십시오.
- 점수화는 원문 URL, 발행일, 중복 판정 데이터가 모두 확보된 경우에만 별도 단계에서 수행할 수 있다고 명시하십시오.

[JSON 출력 규칙]
리포트 본문 뒤에 반드시 아래 형식의 JSON을 \`\`\`json 코드 블록으로 포함하라.

{
  "dashboard_data": {
    "evidenceStatus": "partially_verified",
    "evidenceCoverage": {
      "sourceUrl": false,
      "publishedAt": false,
      "sourceTitle": true,
      "duplicateCheck": "not_checked"
    },
    "mentionSignal": "observed_in_model_output_only",
    "actionabilityTag": "requires_manual_review",
    "opportunityTag": "insufficient_evidence",
    "factCheckStatus": "needs_source",
    "displayPolicy": {
      "showScores": false,
      "showMatrix": false,
      "reason": "원문 URL·발행일·중복 판정 데이터가 확보되지 않았습니다."
    },
    "topTrends": [
      {
        "title": "기술 시그널/사례명",
        "summary": "핵심 기술 요약",
        "keyItems": ["핵심기술1", "라이브러리2"],
        "keyColors": ["아키텍처/태그1"]
      }
    ],
    "categoryPriorities": [
      { "category": "카테고리명", "actionabilityTag": "수동_검토_필요", "opportunityTag": "근거_부족", "priority": 1 }
    ],
    "ageInsights": [
      { "ageGroup": "주니어 개발자", "insight": "기술 학습 및 문서화 인사이트" }
    ],
    "promotionIdeas": [
      { "title": "콘텐츠/세션 제목", "description": "상세 기획 내용", "target": "타겟 오디언스", "priority": "P1" }
    ],
    "thumbnailCopies": ["헤드라인 카피1", "아티클 제목2", "세션 타이틀3"],
    "sourcingPoints": ["지식 자산화 포인트1", "문서화/FAQ 포인트2", "교육 재활용 포인트3"],
    "marketSignals": [
      {
        "signal": "기술 시그널명",
        "source": "출처/블로그명",
        "impact": "High|Medium|Low",
        "categories": ["Backend"],
        "targetAges": ["시니어 개발자"]
      }
    ]
  },
  "notion_payload": {
    "database_properties": {
      "Title": "[${period}] ${selectedCategories.join('·')} DevRel 브리프 - ${purpose} (${targetAges.join(', ')})",
      "Period": "${period}",
      "Impact": "High",
      "Keywords": "${userTypedKeyword || '기본 전체 수집'}",
      "Categories": "${selectedCategories.join(', ')}",
      "Purpose": "${purpose}",
      "TargetAges": "${targetAges.join(', ')}"
    },
    "markdown_body": "- 분석 기간: ${period}\\n- 기술 카테고리: ${selectedCategories.join(', ')}\\n- 타겟 오디언스: ${targetAges.join(', ')}\\n- 분석 목적: ${purpose}\\n\\n## 1. Executive Summary (주요 기술 동향 요약)\\n(내용...)\\n\\n## 2. Tech Signal Deep-Dive (핵심 기술 사례 및 시그널)\\n(내용...)\\n\\n## 3. DevRel Actionable Ideas (운영 제안)\\n(내용...)"
  }
}

[최종 점검]
- 단순 요약이 아닌 'DevRel Tech Intelligence' 관점인가?
- 개발팀 및 DevRel 실무자가 즉시 테크블로그/세션 기획에 활용할 만큼 구체적인가?
- 참조 기호 [1], [2]를 정확히 사용했는가?
- JSON 형식이 완벽한가? (특히 categories와 targetAges는 배열이어야 함)
- **중요**: notion_payload의 markdown_body는 리포트 본문 전체를 포함해야 하며, 노션 블록으로 변환하기 좋게 깔끔한 마크다운 형식을 유지하라.
`;
};
