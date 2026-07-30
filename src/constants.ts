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

export const DEVREL_PRESETS: DevRelPreset[] = [
  {
    id: 'k-tech-leaders',
    badge: '국내 IT',
    title: '네카라쿠배당토 엔지니어링 블로그 탐색',
    description: '국내 대표 IT 기업의 최신 엔지니어링 포스트, 기술 공유 및 데브렐 아티클 수집',
    period: '최근 1개월',
    selectedCategories: ['Backend', 'Frontend', 'Cloud/DevOps', 'Engineering Culture'],
    targetAges: ['미드/시니어 개발자', '주니어 개발자'],
    purpose: '테크블로그 주제 선정',
    dataSources: ['국내 대표 테크 블로그 (네카라쿠배당토 등)', '개발자 커뮤니티 & 뉴스 (Hacker News, GeekNews, Velog, Reddit 등)'],
    keyword: '대규모 백엔드, MSA 전환, 핀테크 아키텍처',
    articleCount: 30
  },
  {
    id: 'ai-llm-architecture',
    badge: 'AI / ML',
    title: 'LLM 실무 적용 & RAG 기술 트렌드',
    description: '국내외 주요 기업의 LLM 활용, RAG, AI 에이전트 구축 및 서비스 적용 기술 포스트 탐색',
    period: '최근 2주',
    selectedCategories: ['AI/ML', 'Data Engineering'],
    targetAges: ['미드/시니어 개발자', '주니어 개발자'],
    purpose: '사내 개발자 교육/세션 기획',
    dataSources: ['글로벌 빅테크 엔지니어링 블로그 (Google, Netflix, Uber, AWS 등)', '개발자 커뮤니티 & 뉴스 (Hacker News, GeekNews, Velog, Reddit 등)'],
    keyword: 'LLM 서빙, RAG 평가, VectorDB, Agentic AI',
    articleCount: 50
  },
  {
    id: 'dev-branding-culture',
    badge: '조직 문화',
    title: '개발자 경험(DX) & 채용 브랜딩',
    description: '개발자 경험(DX), 코드리뷰, 팀 온보딩, 온콜 시스템 및 개발자 조직 문화 자료 발굴',
    period: '최근 1개월',
    selectedCategories: ['Engineering Culture'],
    targetAges: ['외부 경력 채용 구직자', '주니어 개발자'],
    purpose: '채용 브랜딩 콘텐츠 발굴',
    dataSources: ['국내 대표 테크 블로그 (네카라쿠배당토 등)', '개발자 컨퍼런스 & 발표자료 (DEVIEW, FEConf, AWS re:Invent 등)'],
    keyword: '개발자 경험 DX, 팀 문화, 온보딩 프로세스, 개발 생산성',
    articleCount: 20
  },
  {
    id: 'global-tech-trends',
    badge: '글로벌',
    title: '해외 빅테크 & 커뮤니티 핫 토픽',
    description: 'Google, Netflix, Uber 등 해외 빅테크 블로그와 Hacker News, GeekNews 트렌딩 뉴스 수집',
    period: '최근 1주',
    selectedCategories: ['Cloud/DevOps', 'Backend', 'Frontend'],
    targetAges: ['미드/시니어 개발자'],
    purpose: '기술 문서/FAQ 아카이빙',
    dataSources: ['글로벌 빅테크 엔지니어링 블로그 (Google, Netflix, Uber, AWS 등)', '개발자 커뮤니티 & 뉴스 (Hacker News, GeekNews, Velog, Reddit 등)'],
    keyword: '글로벌 엔지니어링, 분산 시스템, 성능 최적화, Kubernetes',
    articleCount: 30
  }
];


