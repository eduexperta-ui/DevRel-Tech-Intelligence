import type { TemplateId } from "./config/reportTemplates";

export interface Category {
  id: string;
  label: string;
}

export type Period =
  | "recent7"
  | "recent14"
  | "recent30"
  | "recent60"
  | "recent90";

export type AnalysisPurpose =
  | "tech-blog"
  | "community-trend"
  | "employer-brand"
  | "tech-session";

export type EvidenceStatus =
  | "has_original_sources"
  | "redirect_only"
  | "no_sources";

export interface Source {
  title: string;
  uri: string;

  sourceType?: "original" | "grounding_redirect";
  statusLabel?: "ORIGINAL URL" | "GROUNDING REDIRECT";

  domain?: string;
  publishedAt?: string | null;
}

export interface FactMetrics {
  totalSourcesCollected: number;
  originalSourceCount: number;
  groundingRedirectCount: number;
  uniqueDomainCount: number;

  searchQueriesExecuted: string[];
  evidenceStatus: EvidenceStatus;

  responseChars?: number;
  responseTokens?: number | null;
}

export interface ReportMeta {
  templateId: TemplateId;
  templateTitle: string;

  evidenceStatus: EvidenceStatus;
  originalSourceCount: number;
  groundingRedirectCount: number;
  uniqueDomainCount: number;

  limitations: string[];
}

export interface QualitativeTrend {
  title: string;
  summary: string;
  keyItems: string[];

  // 0–100 score 대신 정성 레벨만 사용한다.
  signalLevel: "high" | "medium" | "low";
  rationale: string;
}

export interface ContentOpportunity {
  title: string;
  target: string;
  description: string;
  format: "blog" | "tech-talk" | "case-study" | "community-post";
  rationale: string;
}

export interface DashboardData {
  reportMeta: ReportMeta;

  topTrends: QualitativeTrend[];
  contentOpportunities: ContentOpportunity[];

  // templateId에 따라 하나만 채울 수 있다.
  companyPosts?: Array<{
    company: string;
    title: string;
    topic: string;
    publishedAt: string | null;
    sourceIndex: number | null;
    whyItMatters: string;
  }>;

  implementationPatterns?: Array<{
    pattern: string;
    problem: string;
    approach: string;
    operationsNote: string;
    sourceIndex: number | null;
  }>;

  devexSignals?: Array<{
    theme: string;
    observedPractice: string;
    employerBrandAngle: string;
    sourceIndex: number | null;
  }>;

  globalSignals?: Array<{
    signal: string;
    sourceKind: "official" | "community";
    interpretation: string;
    sourceIndex: number | null;
  }>;

  actionPlan: Array<{
    priority: "P1" | "P2" | "P3";
    action: string;
    owner: string;
    expectedOutput: string;
  }>;
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
export type SourceItem = Source;
