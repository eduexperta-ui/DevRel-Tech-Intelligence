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

export interface PresetConfig {
  period?: string;
  selectedCategories?: string[];
  targetAges?: string[];
  purpose?: string;
  dataSources?: string[];
  keyword?: string;
  articleCount?: number;
}

export const REPORT_PRESETS = [
  {
    id: "korean-engineering" as const,
    label: "국내 테크블로그/엔지니어링 리포트",
    badge: "국내 IT",
    title: "네카라쿠배당토 엔지니어링 블로그 탐색",
    description: "국내 대표 IT 기업의 최신 엔지니어링 포스트, 기술 공유 및 데브렐 아티클 수집",
    period: "recent30",
    selectedCategories: ["Backend", "MSA", "DevOps"],
    targetAges: ["미드/시니어 개발자", "주니어 개발자"],
    purpose: "tech-blog",
    dataSources: ["국내 대표 테크 블로그 (네카라쿠배당토 등)", "개발자 커뮤니티 & 뉴스 (Hacker News, GeekNews, Velog, Reddit 등)"],
    keyword: "대규모 백엔드, MSA 전환, 핀테크 아키텍처",
    articleCount: 30
  },
  {
    id: "ai-ml-rag" as const,
    label: "AI/ML & RAG 아키텍처 리포트",
    badge: "AI / ML",
    title: "LLM 실무 적용 & RAG 기술 트렌드",
    description: "국내외 주요 기업의 LLM 활용, RAG, AI 에이전트 구축 및 서비스 적용 기술 포스트 탐색",
    period: "recent14",
    selectedCategories: ["AI/ML", "Backend", "Platform"],
    targetAges: ["미드/시니어 개발자", "주니어 개발자"],
    purpose: "tech-blog",
    dataSources: ["글로벌 빅테크 엔지니어링 블로그 (Google, Netflix, Uber, AWS 등)", "개발자 커뮤니티 & 뉴스 (Hacker News, GeekNews, Velog, Reddit 등)"],
    keyword: "LLM 서빙, RAG 평가, VectorDB, Agentic AI",
    articleCount: 50
  },
  {
    id: "devex-employer-brand" as const,
    label: "DevEx & 채용 브랜딩 리포트",
    badge: "조직 문화",
    title: "개발자 경험(DX) & 채용 브랜딩",
    description: "개발자 경험(DX), 코드리뷰, 팀 온보딩, 온콜 시스템 및 개발자 조직 문화 자료 발굴",
    period: "recent30",
    selectedCategories: ["DevEx", "Engineering Culture"],
    targetAges: ["외부 경력 채용 구직자", "주니어 개발자"],
    purpose: "employer-brand",
    dataSources: ["국내 대표 테크 블로그 (네카라쿠배당토 등)", "개발자 컨퍼런스 & 발표자료 (DEVIEW, FEConf, AWS re:Invent 등)"],
    keyword: "개발자 경험 DX, 팀 문화, 온보딩 프로세스, 개발 생산성",
    articleCount: 20
  },
  {
    id: "global-engineering" as const,
    label: "글로벌 빅테크 아티클 동향",
    badge: "글로벌",
    title: "해외 빅테크 & 커뮤니티 핫 토픽",
    description: "Google, Netflix, Uber 등 해외 빅테크 블로그와 Hacker News, GeekNews 트렌딩 뉴스 수집",
    period: "recent7",
    selectedCategories: ["Cloud/DevOps", "Backend", "Frontend"],
    targetAges: ["미드/시니어 개발자"],
    purpose: "community-trend",
    dataSources: ["글로벌 빅테크 엔지니어링 블로그 (Google, Netflix, Uber, AWS 등)", "개발자 커뮤니티 & 뉴스 (Hacker News, GeekNews, Velog, Reddit 등)"],
    keyword: "글로벌 엔지니어링, 분산 시스템, 성능 최적화, Kubernetes",
    articleCount: 30
  }
] as const;

export type TemplateId = typeof REPORT_PRESETS[number]["id"];

export function getTrendAnalysisPrompt(templateId: TemplateId, config?: PresetConfig): string {
  const templateInstructions: Record<TemplateId, string> = {
    "korean-engineering": "국내 테크기업 엔지니어링 블로그(토스, 카카오, 당근, 네이버 D2 등)의 최신 글을 중심으로 기술 스택 변화와 아키텍처 사례를 분석해.",
    "ai-ml-rag": "RAG 파이프라인, 임베딩/리랭킹, 에이전트 아키텍처 관련 최신 구현 패턴과 벤치마크만 다뤄.",
    "devex-employer-brand": "개발자 경험 지표(DORA, DX Core 4 등)와 테크 채용 브랜딩 사례를 중심으로 분석해.",
    "global-engineering": "Netflix, Uber, Meta, Cloudflare 등 글로벌 빅테크 엔지니어링 블로그의 신규 아티클 동향을 분석해.",
  };
  const baseInstruction = templateInstructions[templateId] || templateInstructions["korean-engineering"];
  if (!config) return baseInstruction;
  return `${baseInstruction}\n\n[분석 설정]\n- 기간: ${config.period || '최근 30일'}\n- 카테고리: ${config.selectedCategories?.join(', ') || '전체'}\n- 키워드: ${config.keyword || '기본'}`;
}

export interface DevRelPreset {
  id: string;
  badge: string;
  title: string;
  description: string;
  period: string;
  selectedCategories: string[];
  targetAges: string[];
  purpose: string;
  dataSources: string[];
  keyword: string;
  articleCount: number;
}

export const DEVREL_PRESETS: DevRelPreset[] = REPORT_PRESETS.map((p) => ({
  id: p.id,
  badge: p.badge,
  title: p.title,
  description: p.description,
  period: p.period,
  selectedCategories: [...p.selectedCategories],
  targetAges: [...p.targetAges],
  purpose: p.purpose,
  dataSources: [...p.dataSources],
  keyword: p.keyword,
  articleCount: p.articleCount,
}));


