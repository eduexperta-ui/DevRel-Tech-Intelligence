import { Category } from './types';

export const CATEGORIES: Category[] = [
  { id: 'backend', label: 'Backend' },
  { id: 'frontend', label: 'Frontend' },
  { id: 'cloud', label: 'Cloud/DevOps' },
  { id: 'ai', label: 'AI/ML' },
  { id: 'mobile', label: 'Mobile' },
  { id: 'data', label: 'Data Engineering' },
  { id: 'culture', label: 'Engineering Culture' },
];

export const PERIODS: string[] = ['최근 1주', '최근 2주', '최근 1개월'];

export const TARGET_AGES = [
  '주니어 개발자',
  '미드/시니어 개발자',
  '외부 경력 채용 구직자',
  '전사 임직원/비개발'
];

export const PURPOSES = [
  '테크블로그 주제 선정',
  '사내 개발자 교육/세션 기획',
  '채용 브랜딩 콘텐츠 발굴',
  '기술 문서/FAQ 아카이빙'
] as const;

export const DATA_SOURCES = [
  { id: 'techblog', label: '국내 대표 테크 블로그 (네카라쿠배당토 등)' },
  { id: 'global_tech', label: '글로벌 빅테크 엔지니어링 블로그 (Google, Netflix, Uber, AWS 등)' },
  { id: 'community', label: '개발자 커뮤니티 & 뉴스 (Hacker News, GeekNews, Velog, Reddit 등)' },
  { id: 'conference', label: '개발자 컨퍼런스 & 발표자료 (DEVIEW, FEConf, AWS re:Invent 등)' }
];

import { AnalysisPurpose, Period } from "./types";

export type AnalysisMode = "verified_only" | "exploration";
export type TemplateLocale = "ko" | "en" | "mixed";

export interface EvidenceRequirement {
  originalUrl: boolean;
  articleTitle: boolean;
  publishedAt: boolean;
  duplicateCheck: boolean;
}

export interface DevRelPreset {
  id: string;
  badge: string;
  title: string;
  description: string;

  period: Period;
  selectedCategories: string[];
  targetAges: string[];
  purpose: AnalysisPurpose;
  dataSources: string[];
  keyword: string;
  articleCount: number;

  locale: TemplateLocale;
  analysisMode: AnalysisMode;

  allowedDomains: string[];
  blockedDomains: string[];

  requiredEvidence: EvidenceRequirement;
  sourcePolicyNote: string;
}

export const DEVREL_PRESETS: DevRelPreset[] = [
  {
    id: "k-tech-leaders",
    badge: "국내 IT",
    title: "네카라쿠배당토 엔지니어링 블로그 탐색",
    description:
      "국내 대표 IT 기업의 공식 엔지니어링 포스트, 기술 공유 및 DevRel 아티클을 수집합니다.",

    period: "최근 1개월",
    selectedCategories: ["백엔드", "클라우드 / DevOps", "엔지니어링 문화"],
    targetAges: ["주니어 개발자", "시니어 / 리드"],
    purpose: "테크블로그 주제 선정",
    dataSources: ["국내 기업 공식 기술 블로그"],
    keyword: "대규모 백엔드, MSA 전환, 핀테크 아키텍처",
    articleCount: 30,

    locale: "ko",
    analysisMode: "verified_only",

    allowedDomains: [
      "d2.naver.com",
      "tech.kakao.com",
      "engineering.linecorp.com",
      "tech.coupang.com",
      "techblog.woowahan.com",
      "toss.tech",
      "medium.com/daangn",
      "daangn.com",
    ],

    blockedDomains: [
      "substack.com",
      "infoq.com",
      "youtube.com",
      "amazon.com",
      "eng.uber.com",
      "netflixtechblog.com",
      "medium.com",
    ],

    requiredEvidence: {
      originalUrl: true,
      articleTitle: true,
      publishedAt: true,
      duplicateCheck: true,
    },

    sourcePolicyNote:
      "국내 주요 IT 기업의 공식 기술 채널 원문만 분석합니다. 개인 블로그, 해외 일반 블로그, Grounding redirect URL은 분석 대상에서 제외합니다.",
  },

  {
    id: "ai-llm-architecture",
    badge: "AI / ML",
    title: "LLM 실무 적용 & RAG 기술 트렌드",
    description:
      "국내외 주요 기업의 LLM 활용, RAG, AI 에이전트 구축 및 서비스 적용 기술 포스트를 탐색합니다.",

    period: "최근 2주",
    selectedCategories: ["AI / ML", "데이터 엔지니어링", "백엔드"],
    targetAges: ["주니어 개발자", "시니어 / 리드"],
    purpose: "기술 트렌드 리서치" as any,
    dataSources: ["기업 공식 기술 블로그", "공식 제품 문서"],
    keyword: "LLM 서빙, RAG 평가, VectorDB, Agentic AI",
    articleCount: 50,

    locale: "mixed",
    analysisMode: "verified_only",

    allowedDomains: [
      "openai.com",
      "anthropic.com",
      "cloud.google.com",
      "developers.googleblog.com",
      "aws.amazon.com",
      "learn.microsoft.com",
      "engineering.linecorp.com",
      "toss.tech",
      "tech.kakao.com",
    ],

    blockedDomains: [
      "substack.com",
      "medium.com",
      "youtube.com",
      "reddit.com",
      "quora.com",
    ],

    requiredEvidence: {
      originalUrl: true,
      articleTitle: true,
      publishedAt: true,
      duplicateCheck: true,
    },

    sourcePolicyNote:
      "LLM/RAG의 실제 구현·운영 사례를 우선합니다. 개인 의견, 영상 요약, 원문 확인 불가 redirect는 분석에서 제외합니다.",
  },

  {
    id: "dev-branding-culture",
    badge: "조직 문화",
    title: "개발자 경험(DX) & 채용 브랜딩",
    description:
      "개발자 경험, 코드리뷰, 팀 온보딩, 온콜 시스템 및 개발자 조직 문화 사례를 발굴합니다.",

    period: "최근 1개월",
    selectedCategories: ["엔지니어링 문화", "백엔드", "플랫폼"],
    targetAges: ["주니어 개발자", "시니어 / 리드"],
    purpose: "채용 브랜딩 콘텐츠 발굴",
    dataSources: ["기업 공식 기술 블로그", "공식 채용·문화 채널"],
    keyword: "개발자 경험 DX, 팀 문화, 온보딩 프로세스, 코드리뷰",
    articleCount: 20,

    locale: "ko",
    analysisMode: "verified_only",

    allowedDomains: [
      "d2.naver.com",
      "tech.kakao.com",
      "careers.kakao.com",
      "engineering.linecorp.com",
      "techblog.woowahan.com",
      "toss.tech",
      "medium.com/daangn",
      "daangn.com",
    ],

    blockedDomains: [
      "substack.com",
      "infoq.com",
      "youtube.com",
      "reddit.com",
      "medium.com",
    ],

    requiredEvidence: {
      originalUrl: true,
      articleTitle: true,
      publishedAt: true,
      duplicateCheck: true,
    },

    sourcePolicyNote:
      "개발 조직이 직접 발행한 DX·문화·채용 브랜딩 사례만 분석합니다. 외부 해설이나 개인 회고는 제외합니다.",
  },

  {
    id: "global-tech-trends",
    badge: "글로벌",
    title: "해외 빅테크 & 커뮤니티 핫 토픽",
    description:
      "Google, Netflix, Uber 등 해외 빅테크 기술 블로그와 Hacker News, GeekNews 트렌딩 뉴스를 수집합니다.",

    period: "최근 1주",
    selectedCategories: ["클라우드 / DevOps", "백엔드", "프론트엔드"],
    targetAges: ["시니어 / 리드"],
    purpose: "기술 문서/FAQ 아카이빙",
    dataSources: ["해외 기업 공식 기술 블로그", "Hacker News", "GeekNews"],
    keyword: "글로벌 엔지니어링, 분산 시스템, 성능 최적화, Kubernetes",
    articleCount: 30,

    locale: "mixed",
    analysisMode: "exploration",

    allowedDomains: [
      "research.google",
      "developers.googleblog.com",
      "netflixtechblog.com",
      "eng.uber.com",
      "engineering.atspotify.com",
      "github.blog",
      "news.ycombinator.com",
      "news.hada.io",
    ],

    blockedDomains: [
      "substack.com",
      "medium.com",
      "reddit.com",
      "quora.com",
    ],

    requiredEvidence: {
      originalUrl: true,
      articleTitle: true,
      publishedAt: true,
      duplicateCheck: true,
    },

    sourcePolicyNote:
      "공식 엔지니어링 글은 사례 근거로, 커뮤니티 글은 관심 신호로만 사용합니다. 커뮤니티 반응만으로 우선순위나 점수를 만들지 않습니다.",
  },
];


