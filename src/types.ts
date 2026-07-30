export interface Category {
  id: string;
  label: string;
}

export type Period = string;

export type AnalysisPurpose = 
  | '테크블로그 주제 선정'
  | '사내 개발자 교육/세션 기획'
  | '채용 브랜딩 콘텐츠 발굴'
  | '기술 문서/FAQ 아카이빙'
  | '기획전 테마 선정'
  | '카테고리 운영 전략';

export type EvidenceStatus =
  | "verified"          // 원문 URL + 발행일 + 본문 근거 확보
  | "partially_verified" // 일부 원문 또는 메타데이터만 확보
  | "unverified"        // 모델 언급은 있으나 원문 근거 미확보
  | "duplicate"         // 기존 수집 건과 중복 가능성 높음
  | "insufficient";     // 분석 판단 불가

export type FactCheckStatus =
  | "verified"
  | "needs_source"
  | "needs_date"
  | "needs_duplicate_check"
  | "not_evaluable";

export interface EvidenceCoverage {
  sourceUrl: boolean;
  publishedAt: boolean;
  sourceTitle: boolean;
  duplicateCheck: string;
}

export interface DisplayPolicy {
  showScores: boolean;
  showMatrix: boolean;
  reason: string;
}

export interface FactMetrics {
  totalSourcesCollected: number;
  searchQueriesExecuted: string[];
  factCheckStatus: FactCheckStatus;
  crossValidationSourcesCount: number;
  dataVolumeEstKb: number;
}

/**
 * 외부/내부 기술 데이터 소스 개별 항목
 */
export interface SourceItem {
  title: string;
  uri: string;
  type?: 'TechBlog' | 'Conference' | 'Wiki' | 'Community' | 'News';
  snippet?: string;

  // 실제 원문 URL인지, Google Grounding redirect인지 구분
  sourceType?: "original" | "grounding_redirect";

  // UI에 보여줄 상태 라벨
  statusLabel?: "원문 링크" | "Grounding redirect";

  // 2D 매트릭스 조건 판별용 메타데이터
  url?: string;
  publishedAt?: string;
  duplicateStatus?: string;
  evidenceQuotes?: string[];
}

/**
 * 포착된 개별 기술 시그널
 */
export interface TrendSignal {
  signal: string;
  source: string;
  impact: 'High' | 'Medium' | 'Low';
  categories: string[]; // 연결된 기술 카테고리
  targetAges: string[]; // 대상 연령대/개발 직급
  description?: string;
}

/**
 * 클러스터링된 주요 기술 트렌드
 */
export interface TrendCluster {
  id: string;
  title: string;
  summary: string;
  signals: TrendSignal[];
  keyItems: string[]; // 주요 기술 키워드/라이브러리/아키텍처
  keyColors: string[]; // 관련 패키지/툴/태그
  evidenceStatus?: EvidenceStatus;
  factCheckStatus?: FactCheckStatus;
}

/**
 * DevRel을 위한 구체적 실행 아이템
 */
export interface MDActionItem {
  title: string;
  description: string;
  target: string;
  priority: 'P1' | 'P2' | 'P3';
  type?: 'Blog' | 'Training' | 'Branding' | 'Documentation' | 'Strategy';
}

/**
 * 카테고리별 정성 태그
 */
export interface CategoryPriority {
  category: string;
  actionabilityTag?: string;
  opportunityTag?: string;
  priority: number;
}

/**
 * DevRel 액션 보드 데이터 구조 (근거 중심, 정량 점수 제거)
 */
export interface DashboardData {
  evidenceStatus?: EvidenceStatus;
  evidenceCoverage?: EvidenceCoverage;
  mentionSignal?: string;
  actionabilityTag?: string;
  opportunityTag?: string;
  factCheckStatus?: FactCheckStatus;
  displayPolicy?: DisplayPolicy;

  topTrends: TrendCluster[];
  categoryPriorities: CategoryPriority[];
  ageInsights: { ageGroup: string; insight: string }[];
  promotionIdeas: MDActionItem[];
  thumbnailCopies: string[];
  sourcingPoints: string[];
  marketSignals: TrendSignal[];
}

/**
 * 리포트 전체 요약 정보
 */
export interface ReportSummary {
  mainTheme: string;
  consumerSentiment: string;
  opportunitySignals: string[];
  riskSignals: string[];
}

/**
 * 아키텍처 다이어그램용 블록
 */
export interface ArchitectureBlock {
  id: string;
  label: string;
  description: string;
  type: 'Input' | 'Process' | 'Output' | 'Storage';
}

/**
 * 분석 설정 파라미터
 */
export interface ConfigParams {
  period: Period;
  categories: string[];
  targetAges: string[];
  purpose: AnalysisPurpose;
  articleCount: number;
  dataSources: string[];
}

/**
 * 노션 연동 응답
 */
export interface NotionResponse {
  success: boolean;
  url?: string;
  message?: string;
  error?: string;
}

// 하위 호환성을 위한 별칭
export type Source = SourceItem;
export type MarketSignal = TrendSignal;
export type ActionIdea = MDActionItem;

