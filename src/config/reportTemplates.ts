import type { AnalysisPurpose, Period } from "../types";

export type TemplateId =
  | "korean-engineering"
  | "ai-ml-rag"
  | "devex-employer-brand"
  | "global-engineering";

export type ReportSectionId =
  | "executiveSummary"
  | "sourceLedger"
  | "companyPosts"
  | "implementationPatterns"
  | "devexSignals"
  | "globalSignals"
  | "contentOpportunities"
  | "actionPlan"
  | "limitations";

export interface ReportTemplate {
  id: TemplateId;
  group: "국내 IT" | "AI / ML" | "조직 문화" | "글로벌";
  title: string;
  subtitle: string;
  description: string;

  defaultPeriod: Period;
  defaultCategories: string[];
  defaultDataSources: string[];
  defaultKeywords: string[];
  defaultPurpose: AnalysisPurpose;
  defaultArticleCount: number;

  searchGuidance: string[];
  analysisQuestions: string[];
  requiredSections: ReportSectionId[];
  excludedSections: string[];

  sourceRequirements: {
    preferOfficialEngineeringBlogs: boolean;
    requireDirectOriginalUrlForSave: boolean;
    allowCommunitySources: boolean;
    allowRedirectOnlyResult: boolean;
  };
}

export const REPORT_TEMPLATES: Record<TemplateId, ReportTemplate> = {
  "korean-engineering": {
    id: "korean-engineering",
    group: "국내 IT",
    title: "네카라쿠배당토 엔지니어링 블로그 탐색",
    subtitle: "국내 대표 IT 기업의 최신 기술 포스트 수집",
    description:
      "국내 주요 IT 기업의 엔지니어링 블로그, 기술 공유, DevRel 콘텐츠를 탐색하고 비교합니다.",

    defaultPeriod: "recent30",
    defaultCategories: ["Backend", "MSA", "DevOps"],
    defaultDataSources: [
      "Naver D2",
      "Kakao Tech",
      "Toss Tech",
      "Woowahan Tech",
      "Kubernetes Korea",
      "GeekNews",
    ],
    defaultKeywords: ["대규모 백엔드", "MSA 전환", "핀테크 아키텍처"],
    defaultPurpose: "tech-blog",
    defaultArticleCount: 20,

    searchGuidance: [
      "국내 엔지니어링 블로그의 공식 원문을 우선 수집한다.",
      "기업명, 발행일, 글 제목, 원문 URL, 핵심 기술을 분리한다.",
      "홍보성 보도자료와 원문 없는 2차 요약 글은 우선순위를 낮춘다.",
      "동일 URL, 동일 제목, 동일 주제의 중복 포스트를 제거한다.",
    ],

    analysisQuestions: [
      "최근 기간 내 어떤 국내 기업이 어떤 기술 주제를 공개했는가?",
      "각 포스트의 문제 상황, 기술 선택, 구현 방식, 운영 결과는 무엇인가?",
      "DevRel 콘텐츠로 재가공하기 좋은 사례는 무엇이며 왜 그런가?",
      "직접 원문 URL을 확보하지 못한 항목은 무엇인가?",
    ],

    requiredSections: [
      "executiveSummary",
      "sourceLedger",
      "companyPosts",
      "contentOpportunities",
      "actionPlan",
      "limitations",
    ],

    excludedSections: [
      "AI 모델 비교",
      "RAG 평가 프레임워크",
      "글로벌 커뮤니티 반응 순위",
    ],

    sourceRequirements: {
      preferOfficialEngineeringBlogs: true,
      requireDirectOriginalUrlForSave: true,
      allowCommunitySources: true,
      allowRedirectOnlyResult: true,
    },
  },

  "ai-ml-rag": {
    id: "ai-ml-rag",
    group: "AI / ML",
    title: "LLM 실무 적용 & RAG 기술 트렌드",
    subtitle: "LLM, RAG, AI 에이전트의 서비스 적용 사례 탐색",
    description:
      "국내외 기업과 기술 조직의 LLM 서비스 적용, RAG 설계, 평가, 운영 사례를 분석합니다.",

    defaultPeriod: "recent14",
    defaultCategories: ["AI/ML", "Backend", "Platform"],
    defaultDataSources: [
      "Google AI Blog",
      "OpenAI Developers",
      "Anthropic Engineering",
      "Netflix TechBlog",
      "AWS Architecture Blog",
      "Hugging Face",
      "GitHub Trending",
    ],
    defaultKeywords: ["LLM 서빙", "RAG 평가", "VectorDB", "Agentic AI"],
    defaultPurpose: "tech-blog",
    defaultArticleCount: 20,

    searchGuidance: [
      "모델 발표 뉴스보다 실제 운영·구현·평가 사례를 우선한다.",
      "각 사례에서 문제, 데이터, 검색/생성 구조, 평가 방법, 운영 이슈를 분리한다.",
      "비용, 지연시간, 정확도, 환각 완화, 보안 중 언급된 지표만 기록한다.",
      "근거 없는 성능 수치나 재현 불가능한 주장에는 검증 불가 표기를 한다.",
    ],

    analysisQuestions: [
      "어떤 RAG·에이전트 아키텍처 패턴이 실제 서비스에 적용됐는가?",
      "평가, 관측성, 비용, 보안, 환각 통제 중 무엇이 반복적으로 등장하는가?",
      "개발팀이 바로 실험할 수 있는 구현·평가 체크리스트는 무엇인가?",
      "기술 홍보가 아닌 실무 신뢰를 주는 DevRel 콘텐츠 주제는 무엇인가?",
    ],

    requiredSections: [
      "executiveSummary",
      "sourceLedger",
      "implementationPatterns",
      "contentOpportunities",
      "actionPlan",
      "limitations",
    ],

    excludedSections: [
      "근거 없는 AI maturity score",
      "근거 없는 RAG 성능 점수",
      "임의의 2D 우선순위 매트릭스",
    ],

    sourceRequirements: {
      preferOfficialEngineeringBlogs: true,
      requireDirectOriginalUrlForSave: true,
      allowCommunitySources: true,
      allowRedirectOnlyResult: true,
    },
  },

  "devex-employer-brand": {
    id: "devex-employer-brand",
    group: "조직 문화",
    title: "개발자 경험(DX) & 채용 브랜딩",
    subtitle: "개발자 조직 문화와 DevEx 사례 발굴",
    description:
      "개발자 경험, 온보딩, 협업, 코드리뷰, 온콜, 생산성 관련 사례를 채용 브랜딩 관점에서 분석합니다.",

    defaultPeriod: "recent30",
    defaultCategories: ["DevEx", "Engineering Culture", "Platform"],
    defaultDataSources: [
      "Netflix TechBlog",
      "Google Engineering",
      "GitLab Handbook",
      "Atlassian Team Playbook",
      "Toss Tech",
      "Kakao Tech",
      "GeekNews",
    ],
    defaultKeywords: [
      "개발자 경험 DX",
      "팀 문화",
      "온보딩 프로세스",
      "개발 생산성",
    ],
    defaultPurpose: "employer-brand",
    defaultArticleCount: 16,

    searchGuidance: [
      "기술 도입 자체보다 개발 조직이 일하는 방식의 변화에 초점을 둔다.",
      "온보딩, 배포, 코드리뷰, 문서화, 온콜, 내부 플랫폼, 회고 사례를 우선한다.",
      "기업의 채용 슬로건과 실제 제도·프로세스를 구분한다.",
      "출처 없이 조직 문화를 단정하거나 미화하지 않는다.",
    ],

    analysisQuestions: [
      "개발자 경험을 개선하기 위해 실제로 어떤 운영 장치를 두었는가?",
      "외부 채용 브랜딩으로 안전하게 전환 가능한 사례는 무엇인가?",
      "기술 조직의 강점을 보여 주는 콘텐츠 포맷은 무엇인가?",
      "후보자에게 과장 없이 전달할 수 있는 메시지는 무엇인가?",
    ],

    requiredSections: [
      "executiveSummary",
      "sourceLedger",
      "devexSignals",
      "contentOpportunities",
      "actionPlan",
      "limitations",
    ],

    excludedSections: [
      "기술 키워드 인기 점수",
      "채용 브랜딩 효과 수치 추정",
      "근거 없는 조직문화 우수 등급",
    ],

    sourceRequirements: {
      preferOfficialEngineeringBlogs: false,
      requireDirectOriginalUrlForSave: true,
      allowCommunitySources: true,
      allowRedirectOnlyResult: true,
    },
  },

  "global-engineering": {
    id: "global-engineering",
    group: "글로벌",
    title: "해외 빅테크 & 커뮤니티 핫 토픽",
    subtitle: "글로벌 엔지니어링 블로그와 커뮤니티 시그널 수집",
    description:
      "Google, Netflix, Uber 등 공식 기술 블로그와 개발자 커뮤니티의 최신 논점을 비교합니다.",

    defaultPeriod: "recent7",
    defaultCategories: [
      "Distributed Systems",
      "Kubernetes",
      "Performance",
      "Backend",
    ],
    defaultDataSources: [
      "Google Engineering",
      "Netflix TechBlog",
      "Uber Engineering",
      "AWS Architecture Blog",
      "Cloudflare Blog",
      "Hacker News",
      "GeekNews",
      "GitHub Trending",
    ],
    defaultKeywords: [
      "글로벌 엔지니어링",
      "분산 시스템",
      "성능 최적화",
      "Kubernetes",
    ],
    defaultPurpose: "community-trend",
    defaultArticleCount: 20,

    searchGuidance: [
      "공식 엔지니어링 블로그와 커뮤니티 반응을 출처 유형별로 분리한다.",
      "공식 포스트는 기술 사례로, 커뮤니티 글은 논의 신호로만 취급한다.",
      "커뮤니티 반응을 시장 규모나 산업 표준의 증거로 확대 해석하지 않는다.",
      "원문 URL과 발행일이 없는 결과는 '참고 메타데이터'로 구분한다.",
    ],

    analysisQuestions: [
      "이번 주 글로벌 기술 조직에서 반복적으로 나타난 엔지니어링 주제는 무엇인가?",
      "공식 기술 사례와 커뮤니티 논의가 만나는 지점은 무엇인가?",
      "국내 DevRel/기술 콘텐츠에서 재해석할 만한 주제는 무엇인가?",
      "추가 원문 확인이 필요한 항목은 무엇인가?",
    ],

    requiredSections: [
      "executiveSummary",
      "sourceLedger",
      "globalSignals",
      "contentOpportunities",
      "actionPlan",
      "limitations",
    ],

    excludedSections: [
      "커뮤니티 반응을 기반으로 한 시장 점유율 추정",
      "근거 없는 인기 점수",
      "임의의 기술 성숙도 등급",
    ],

    sourceRequirements: {
      preferOfficialEngineeringBlogs: true,
      requireDirectOriginalUrlForSave: true,
      allowCommunitySources: true,
      allowRedirectOnlyResult: true,
    },
  },
};

export const getTemplate = (templateId: TemplateId): ReportTemplate =>
  REPORT_TEMPLATES[templateId] ?? REPORT_TEMPLATES["korean-engineering"];

export const getTemplateKeywordsText = (template: ReportTemplate): string =>
  template.defaultKeywords.join(", ");
