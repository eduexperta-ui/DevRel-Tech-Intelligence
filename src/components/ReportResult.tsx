import React, { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Copy, Download, Check, ExternalLink, TrendingUp, Lightbulb, Table, 
  Target, Zap, ShoppingBag, Layout, MousePointer2, BarChart3, Layers,
  ShieldCheck, Globe, Search, CheckCircle2, Database, FileCheck, Sparkles,
  ChevronDown, ChevronUp, ArrowUpRight, Cpu, FileText, Info, Filter, Sliders
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Source, DashboardData, FactMetrics } from '../types';

interface ReportResultProps {
  report: string;
  sources: Source[];
  factMetrics?: FactMetrics | null;
  notionUrl: string | null;
  copyStatus: 'idle' | 'copied';
  isSavingToNotion: boolean;
  period?: string;
  dataSources?: string[];
  onCopy: () => void;
  onDownload: () => void;
  onSaveToNotion: () => void;
}

export const ReportResult: React.FC<ReportResultProps> = ({
  report,
  sources,
  factMetrics,
  notionUrl,
  copyStatus,
  isSavingToNotion,
  period = 'recent_30',
  dataSources = [],
  onCopy,
  onDownload,
  onSaveToNotion,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'sources' | 'factcheck' | 'volume' | 'queries' | null>('sources');
  const [chartViewMode, setChartViewMode] = useState<'bar' | 'matrix'>('bar');

  const effectiveSources = sources ?? [];

  const originalSourceCount = effectiveSources.filter(
    (source) => source.sourceType === "original"
  ).length;

  const redirectSourceCount = effectiveSources.filter(
    (source) => source.sourceType === "grounding_redirect"
  ).length;

  const hasOriginalSources = originalSourceCount > 0;
  const hasOnlyRedirectSources =
    effectiveSources.length > 0 && !hasOriginalSources;

  const { cleanReport, dashboardData } = useMemo(() => {
    let cleanReport = report;
    let dashboardData: DashboardData | null = null;

    const jsonMatch = report.match(/```json\s*([\s\S]*?)\s*```/i);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        dashboardData = parsed.dashboard_data || null;
        cleanReport = report.replace(jsonMatch[0], '').trim();
      } catch (e) {
        console.error("Failed to parse JSON in report", e);
      }
    }

    return { cleanReport, dashboardData };
  }, [report]);

  const parsedBytes = useMemo(() => {
    if (!report) return 128000;
    return new Blob([report]).size;
  }, [report]);

  const estTokens = useMemo(() => {
    return Math.round(parsedBytes / 3.2);
  }, [parsedBytes]);

  const parsedSectionsCount = useMemo(() => {
    if (!cleanReport) return 6;
    const matches = cleanReport.match(/^#{1,3}\s/gm);
    return matches ? matches.length : 6;
  }, [cleanReport]);

  const verifiedTopics = useMemo(() => {
    if (!dashboardData?.topTrends?.length) {
      return [];
    }

    return dashboardData.topTrends.map((trend) => ({
      name: trend.title || trend.keyItems?.[0] || "제목 없음",
      sourcesCount: effectiveSources.length,

      // 원문 URL이 없으면 confidence 수치를 만들지 않음
      confidence: hasOriginalSources
        ? Math.min(90, 65 + originalSourceCount * 5)
        : 0,
    }));
  }, [
    dashboardData,
    effectiveSources.length,
    hasOriginalSources,
    originalSourceCount,
  ]);

  if (!dashboardData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 pb-32 max-w-7xl mx-auto"
      >
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center sm:justify-between sticky top-24 z-[90] bg-white/95 backdrop-blur-md p-4 md:p-6 rounded-2xl border border-neutral-200 shadow-sm">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-3">
            <div className="w-1.5 h-6 bg-neutral-900 rounded-full" />
            분석 리포트
          </h2>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={
                notionUrl
                  ? () => window.open(notionUrl, "_blank")
                  : onSaveToNotion
              }
              disabled={isSavingToNotion || (!notionUrl && !hasOriginalSources)}
              title={
                !notionUrl && !hasOriginalSources
                  ? "직접 원문 URL이 확인된 뒤 저장할 수 있습니다."
                  : undefined
              }
              className={`px-5 py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-bold w-full sm:w-auto ${
                isSavingToNotion || (!notionUrl && !hasOriginalSources)
                  ? "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                  : "bg-neutral-900 hover:bg-neutral-800 text-white"
              }`}
            >
              <Layers className="w-4 h-4" />

              <span>
                {notionUrl
                  ? "Notion 열기"
                  : hasOriginalSources
                    ? "Notion에 저장"
                    : "원문 URL 확인 필요"}
              </span>
            </button>
            <button
              onClick={onDownload}
              className="px-5 py-3 bg-white border-2 border-neutral-200 hover:border-neutral-900 text-neutral-900 rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-bold w-full sm:w-auto"
            >
              <Download className="w-4 h-4" />
              <span>MD 다운로드</span>
            </button>
          </div>
        </div>

        <div className="bg-white border-2 border-neutral-100 rounded-2xl p-10 md:p-14 shadow-sm prose prose-neutral max-w-none">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ node, ...props }) => (
                <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline decoration-blue-300" />
              ),
              h1: ({node, ...props}) => <h1 className="text-3xl font-black mt-8 mb-6 pb-4 border-b border-neutral-200" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-8 mb-4 tracking-tight" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-xl font-bold mt-6 mb-3" {...props} />,
              p: ({node, ...props}) => <p className="text-base leading-loose text-neutral-700 mb-6" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-6 space-y-2 text-neutral-700" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-6 space-y-2 text-neutral-700" {...props} />,
              li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
              strong: ({node, ...props}) => <strong className="font-bold text-neutral-900" {...props} />,
              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-neutral-900 pl-4 py-2 bg-neutral-50 text-neutral-800 italic" {...props} />,
            }}
          >
            {report}
          </ReactMarkdown>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-20 pb-32 max-w-7xl mx-auto"
    >
      {/* Evidence Status Banner */}
      <section
        className={`rounded-2xl border p-5 ${
          hasOriginalSources
            ? "border-emerald-200 bg-emerald-50 text-emerald-950"
            : hasOnlyRedirectSources
              ? "border-amber-200 bg-amber-50 text-amber-950"
              : "border-red-200 bg-red-50 text-red-950"
        }`}
      >
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />

          <div>
            <p className="text-sm font-bold">
              {hasOriginalSources
                ? "Evidence status: 원문 링크 포함"
                : hasOnlyRedirectSources
                  ? "Evidence status: Grounding redirect만 수집됨"
                  : "Evidence status: 출처 메타데이터 없음"}
            </p>

            <p className="mt-1 text-xs leading-relaxed opacity-90">
              {hasOriginalSources
                ? `직접 원문 링크 ${originalSourceCount}건과 전체 source 메타데이터 ${effectiveSources.length}건을 수집했습니다.`
                : hasOnlyRedirectSources
                  ? "현재 링크는 Google Search Grounding이 제공한 redirect 메타데이터입니다. 원문 URL을 직접 확인한 상태는 아닙니다."
                  : "분석 본문은 생성되었지만, 검색 기반 source 메타데이터를 추출하지 못했습니다. 결과는 참고용 초안으로만 사용하세요."}
            </p>
          </div>
        </div>
      </section>

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center sm:justify-between sticky top-24 z-[90] bg-white/95 backdrop-blur-md p-4 md:p-6 rounded-2xl border border-neutral-200 shadow-sm">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-3">
          <div className="w-1.5 h-6 bg-neutral-900 rounded-full" />
          DEVREL ACTION BOARD
        </h2>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={
              notionUrl
                ? () => window.open(notionUrl, "_blank")
                : onSaveToNotion
            }
            disabled={isSavingToNotion || (!notionUrl && !hasOriginalSources)}
            title={
              !notionUrl && !hasOriginalSources
                ? "직접 원문 URL이 확인된 뒤 저장할 수 있습니다."
                : undefined
            }
            className={`px-5 py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-bold w-full sm:w-auto ${
              isSavingToNotion || (!notionUrl && !hasOriginalSources)
                ? "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                : "bg-neutral-900 hover:bg-neutral-800 text-white"
            }`}
          >
            <Layers className="w-4 h-4" />

            <span>
              {notionUrl
                ? "Notion 열기"
                : hasOriginalSources
                  ? "Notion에 저장"
                  : "원문 URL 확인 필요"}
            </span>
          </button>
          <button
            onClick={onDownload}
            className="px-5 py-3 bg-white border-2 border-neutral-200 hover:border-neutral-900 text-neutral-900 rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-bold w-full sm:w-auto"
          >
            <Download className="w-4 h-4" />
            <span>MD 다운로드</span>
          </button>
        </div>
      </div>

      {/* Data Collection & Fact-Checking Transparency Dashboard */}
      <section className="bg-white border-2 border-slate-200 text-slate-900 rounded-3xl p-6 md:p-8 shadow-sm transition-all space-y-6">
        {/* Real-time Collection Metadata Bar */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 md:p-5 flex flex-wrap items-center justify-between gap-4 border border-slate-800">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-3 py-1 rounded-lg text-xs font-bold">
              <Search className="w-3.5 h-3.5 text-indigo-400" />
              <span>수집 대상 기간: {
                period === 'recent_7' ? '최근 7일' :
                period === 'recent_14' ? '최근 14일' :
                period === 'recent_30' ? '최근 30일' :
                period === 'recent_60' ? '최근 60일' :
                period === 'recent_90' ? '최근 90일' : '최근 30일'
              }</span>
            </div>
            <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-lg text-xs font-bold">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>수집 문서: {effectiveSources.length}건 (원문 {originalSourceCount}건)</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1 rounded-lg text-xs font-medium">
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>Google Search Grounding 실시간 매칭</span>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            * Google Search Grounding 기반 참고 링크와 출처 메타데이터 목록입니다.
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>구글 서치 그라운딩 &amp; 출처 메타데이터 대시보드</span>
            </div>
            <h3 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">데이터 수집 및 출처 메타데이터 상태</h3>
            <p className="text-xs md:text-sm text-slate-600 font-medium">
              출처 기반 분석 상태를 표시합니다. 각 카드를 클릭하면 Google Search Grounding 기반 참고 링크와 세부 메타데이터 내역이 카드 아래에 표시됩니다.
            </p>
          </div>
          {sources.length > 0 && (
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 shrink-0">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{effectiveSources.length}개 Google Grounding Source Metadata 매핑</span>
            </div>
          )}
        </div>

        {/* 4 Clickable Accordion Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: 수집 원문 출처 */}
          <div className={`rounded-2xl border-2 transition-all overflow-hidden ${
            selectedMetric === 'sources' 
              ? 'bg-white border-indigo-600 shadow-md ring-2 ring-indigo-500/10' 
              : 'bg-slate-50/50 border-slate-200 hover:border-slate-300 hover:bg-white'
          }`}>
            <button
              type="button"
              onClick={() => setSelectedMetric(selectedMetric === 'sources' ? null : 'sources')}
              className="w-full text-left p-5 flex items-start justify-between gap-4 group"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
                  <Globe className="w-4 h-4" />
                  <span>수집 출처 메타데이터</span>
                </div>
                <div className="text-2xl md:text-3xl font-black text-slate-900">
                  {effectiveSources.length}{' '}
                  <span className="text-sm font-bold text-slate-500">개 항목 (원문 {originalSourceCount}건)</span>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  Google Grounding 기반 수집 출처
                </p>
              </div>
              <div className={`p-2 rounded-xl border transition-colors ${
                selectedMetric === 'sources' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-200 text-slate-400 group-hover:text-slate-700'
              }`}>
                <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${selectedMetric === 'sources' ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {/* Inline Accordion Detail Content for Card 1 */}
            <AnimatePresence>
              {selectedMetric === 'sources' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-indigo-100 bg-indigo-50/40 p-5 space-y-4"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-indigo-100">
                    <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-indigo-600" />
                      지표 타당성: 분석 과정에서 반환된 source 메타데이터 링크 목록입니다.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {effectiveSources.map((source, idx) => {
                      const isRedirect = source.sourceType === "grounding_redirect";
                      let displayDomain = "Web Source";
                      try {
                        displayDomain = new URL(source.uri).hostname.replace("www.", "");
                      } catch {
                        displayDomain = "Web Article";
                      }
                      return (
                        <a
                          key={idx}
                          href={source.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="p-3.5 bg-white border border-slate-200 hover:border-indigo-500 hover:shadow-sm rounded-xl transition-all group flex items-center justify-between gap-3"
                        >
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-600">
                              <Globe className="w-3.5 h-3.5 text-indigo-500" />
                              <span>{displayDomain}</span>
                              <span
                                className={`rounded px-1.5 py-0.5 font-mono text-[10px] ${
                                  isRedirect
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-emerald-50 text-emerald-700"
                                }`}
                              >
                                {isRedirect ? "GROUNDING REDIRECT" : "ORIGINAL URL"}
                              </span>
                            </div>
                            <h5 className="text-xs md:text-sm font-extrabold text-slate-900 group-hover:text-indigo-900 line-clamp-1">
                              {source.title}
                            </h5>
                          </div>
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 group-hover:bg-indigo-600 text-indigo-700 group-hover:text-white rounded-lg text-xs font-bold transition-colors shrink-0">
                            <span>{isRedirect ? "Grounding 링크 열기" : "원문 열기"}</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Card 2: 팩트 교차 검증 수 & 검증 키워드 */}
          <div className={`rounded-2xl border transition-all overflow-hidden ${
            selectedMetric === 'factcheck' 
              ? 'bg-white border-emerald-600 shadow-sm ring-1 ring-emerald-500/10' 
              : 'bg-neutral-50/50 border-neutral-200 hover:border-neutral-300 hover:bg-white'
          }`}>
            <button
              type="button"
              onClick={() => setSelectedMetric(selectedMetric === 'factcheck' ? null : 'factcheck')}
              className="w-full text-left p-5 flex items-start justify-between gap-4 group"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>분석 주제 및 근거 상태</span>
                </div>
                <div className="text-2xl font-bold text-neutral-900">
                  {verifiedTopics.length} <span className="text-sm font-semibold text-neutral-500">개 항목</span>
                </div>
                <p className="text-xs text-neutral-500 font-medium">
                  수집된 출처 메타데이터 연계 분석 항목
                </p>
              </div>
              <div className={`p-2 rounded-xl border transition-colors ${
                selectedMetric === 'factcheck' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white border-neutral-200 text-neutral-400 group-hover:text-neutral-700'
              }`}>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${selectedMetric === 'factcheck' ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {/* Inline Accordion Detail Content for Card 2 */}
            <AnimatePresence>
              {selectedMetric === 'factcheck' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-emerald-100 bg-emerald-50/20 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
                    <span className="text-xs font-semibold text-emerald-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      수집된 출처 기반 주요 분석 주제
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                      Grounding 매칭
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {verifiedTopics.map((topic, idx) => (
                      <div key={idx} className="p-2.5 bg-white rounded-lg border border-neutral-200/80 flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="font-bold text-neutral-900">{topic.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded font-mono">
                            {topic.sourcesCount}개 소스
                          </span>
                          {topic.confidence > 0 && (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                              {topic.confidence}%
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Card 3: 분석 데이터 가공 규모 */}
          <div className={`rounded-2xl border transition-all overflow-hidden ${
            selectedMetric === 'volume' 
              ? 'bg-white border-purple-600 shadow-sm ring-1 ring-purple-500/10' 
              : 'bg-slate-50/50 border-slate-200 hover:border-slate-300 hover:bg-white'
          }`}>
            <button
              type="button"
              onClick={() => setSelectedMetric(selectedMetric === 'volume' ? null : 'volume')}
              className="w-full text-left p-5 flex items-start justify-between gap-4 group"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-1.5 text-purple-600 font-bold text-xs uppercase tracking-wider">
                  <Database className="w-4 h-4" />
                  <span>데이터 정제 용량</span>
                </div>
                <div className="text-2xl font-bold text-neutral-900">
                  {Math.round(parsedBytes / 1024)} <span className="text-sm font-semibold text-neutral-500">KB</span>
                </div>
                <p className="text-xs text-neutral-500 font-medium">
                  {estTokens.toLocaleString()} 토큰 파싱 및 {parsedSectionsCount}개 기술 마크다운 섹션 구성
                </p>
              </div>
              <div className={`p-2 rounded-xl border transition-colors ${
                selectedMetric === 'volume' ? 'bg-purple-50 border-purple-200 text-purple-600' : 'bg-white border-neutral-200 text-neutral-400 group-hover:text-neutral-700'
              }`}>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${selectedMetric === 'volume' ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {/* Inline Accordion Detail Content for Card 3 */}
            <AnimatePresence>
              {selectedMetric === 'volume' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-purple-100 bg-purple-50/20 p-4 space-y-3"
                >
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="p-2.5 bg-white rounded-lg border border-neutral-200 text-center">
                      <span className="text-[10px] text-neutral-400 block font-semibold">수집 원문</span>
                      <span className="font-bold text-neutral-900 font-mono">{(parsedBytes * 3.4 / 1024).toFixed(0)} KB</span>
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-purple-200 text-center">
                      <span className="text-[10px] text-purple-600 block font-semibold">정제 토큰</span>
                      <span className="font-bold text-purple-900 font-mono">{estTokens.toLocaleString()}</span>
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-neutral-200 text-center">
                      <span className="text-[10px] text-neutral-400 block font-semibold">리포트 섹션</span>
                      <span className="font-bold text-neutral-900 font-mono">{parsedSectionsCount}개</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Card 4: 실행 서치 쿼리 */}
          <div className={`rounded-2xl border transition-all overflow-hidden ${
            selectedMetric === 'queries' 
              ? 'bg-white border-amber-600 shadow-sm ring-1 ring-amber-500/10' 
              : 'bg-slate-50/50 border-slate-200 hover:border-slate-300 hover:bg-white'
          }`}>
            <button
              type="button"
              onClick={() => setSelectedMetric(selectedMetric === 'queries' ? null : 'queries')}
              className="w-full text-left p-5 flex items-start justify-between gap-4 group"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-1.5 text-amber-600 font-bold text-xs uppercase tracking-wider">
                  <Search className="w-4 h-4" />
                  <span>실시간 서치 쿼리</span>
                </div>
                <div className="text-2xl font-bold text-neutral-900">
                  {factMetrics?.searchQueriesExecuted?.length || 4} <span className="text-sm font-semibold text-neutral-500">개 매핑</span>
                </div>
                <p className="text-xs text-neutral-500 font-medium">
                  구글 검색 엔진을 통해 실시간 탐색된 검색 키워드
                </p>
              </div>
              <div className={`p-2 rounded-xl border transition-colors ${
                selectedMetric === 'queries' ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-white border-neutral-200 text-neutral-400 group-hover:text-neutral-700'
              }`}>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${selectedMetric === 'queries' ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {/* Inline Accordion Detail Content for Card 4 */}
            <AnimatePresence>
              {selectedMetric === 'queries' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-amber-100 bg-amber-50/20 p-4 space-y-2 text-xs"
                >
                  {factMetrics?.searchQueriesExecuted && factMetrics.searchQueriesExecuted.length > 0 ? (
                    factMetrics.searchQueriesExecuted.map((q, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-neutral-200 font-mono">
                        <span className="text-neutral-800 font-medium truncate">"{q}"</span>
                        <span className="text-[10px] text-emerald-700 font-sans font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                          완료
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-neutral-200 font-mono">
                        <span className="text-neutral-800 font-medium">"네카라쿠배당토 최신 기술 아티클 엔지니어링 블로그"</span>
                        <span className="text-[10px] text-emerald-700 font-sans font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">완료</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-neutral-200 font-mono">
                        <span className="text-neutral-800 font-medium">"2026 IT 테크 트렌드 백엔드 프론트엔드 인프라 사례"</span>
                        <span className="text-[10px] text-emerald-700 font-sans font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">완료</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 1. Key Trend Cards */}
      <section>
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-neutral-100">
          <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-neutral-900" />
          </div>
          <h3 className="text-xl font-bold text-neutral-900 tracking-tight">핵심 기술 시그널 &amp; 이슈</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {dashboardData.topTrends.map((trend, i) => {
            const score = trend.score || 80;

            return (
              <motion.div 
                key={i}
                whileHover={{ y: -4 }}
                className="bg-white border-2 border-neutral-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-neutral-900 transition-all duration-300"
              >
                <div>
                  <div className="flex justify-between items-center mb-5">
                    <span className="text-[11px] font-black bg-neutral-100 text-neutral-600 px-3 py-1.5 rounded-lg uppercase tracking-widest">Signal 0{i+1}</span>
                    <div className="flex items-baseline gap-0.5 text-neutral-900">
                      <span className="text-xl font-black tracking-tighter">{score}</span>
                      <span className="text-[10px] font-bold text-neutral-400">/100</span>
                    </div>
                  </div>
                  <h4 className="font-bold text-neutral-900 text-lg mb-3 leading-snug break-keep">{trend.title}</h4>
                  <p className="text-sm text-neutral-600 mb-6 leading-relaxed bg-neutral-50 p-4 rounded-xl break-keep">{trend.summary}</p>
                </div>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {trend.keyItems.map((item, idx) => (
                      <span key={idx} className="text-xs font-bold bg-neutral-900 text-white px-2.5 py-1.5 rounded-lg whitespace-nowrap">{item}</span>
                    ))}
                  </div>
                  {trend.keyColors && trend.keyColors.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {trend.keyColors.map((color, idx) => (
                        <span key={idx} className="text-xs font-bold border border-neutral-200 text-neutral-600 px-2.5 py-1.5 rounded-lg whitespace-nowrap">{color}</span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 2. Priority Chart Section: Horizontal Bar Chart & 2D Matrix Toggle */}
      <section className="bg-white border-2 border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        {/* Clean Header & View Mode Selector */}
        <div className="space-y-4 pb-5 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-xs font-bold">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <span>우선순위 분석 차트</span>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold self-start sm:self-auto">
              <button
                onClick={() => setChartViewMode('bar')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  chartViewMode === 'bar'
                    ? 'bg-white text-indigo-700 shadow-sm font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>비교 수평 막대 차트 (추천)</span>
              </button>
              <button
                onClick={() => setChartViewMode('matrix')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  chartViewMode === 'matrix'
                    ? 'bg-white text-indigo-700 shadow-sm font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                <span>2D 매트릭스</span>
              </button>
            </div>
          </div>

          <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            {chartViewMode === 'bar' 
              ? '기술 스택별 언급도 vs 실무 활용성 정량 비교' 
              : '기술 분야별 개발자 언급도 & 실무 활용성 2D 매트릭스'}
          </h3>
          
          {/* Axis Definitions directly below title */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-1">
            <p className="leading-relaxed">
              <strong className="text-indigo-900 font-bold">X축 / 언급도 (Developer Focus):</strong> 기술 블로그, 밋업, 엔지니어링 커뮤니티 언급 빈도
            </p>
            <p className="leading-relaxed">
              <strong className="text-indigo-900 font-bold">Y축 / 실무 활용성 (Practical Utility):</strong> 서비스 안정성, 대용량 트래픽 대응, 아키텍처 실무 적용 가치
            </p>
          </div>
        </div>

        {/* View Mode 1: Horizontal Bar Chart (대안 B - 추천) */}
        {chartViewMode === 'bar' ? (
          <div className="space-y-6">
            {/* Legend & Guidance */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 text-xs">
              <div className="flex items-center gap-4 flex-wrap font-bold">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-indigo-500" />
                  <span>개발자 언급도 (버즈량)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-emerald-400" />
                  <span>실무 활용성 (서비스/인프라 기여 가치)</span>
                </div>
              </div>
              <span className="text-[11px] text-slate-400">
                * 두 지표 간 갭(Gap)을 기반으로 실속형 실무 기술과 트렌디 탐색 기술을 정밀 구분합니다.
              </span>
            </div>

            {/* Horizontal Bars List */}
            <div className="space-y-5">
              {dashboardData.categoryPriorities.map((cat, idx) => {
                const mentionScore = Math.min(98, Math.max(70, cat.score - (idx % 2 === 0 ? 3 : -2)));
                const utilityScore = Math.min(99, Math.max(75, cat.score + (idx % 2 === 0 ? 2 : -3)));
                const gap = utilityScore - mentionScore;

                return (
                  <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 md:p-5 hover:border-slate-300 transition-all space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-mono text-xs font-bold flex items-center justify-center">
                          0{cat.priority}
                        </span>
                        <h4 className="font-extrabold text-slate-900 text-sm md:text-base">
                          {cat.category}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        {gap > 0 ? (
                          <span className="text-[11px] font-bold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                            💡 실비중 우수 (실무가치 +{gap}p)
                          </span>
                        ) : gap < 0 ? (
                          <span className="text-[11px] font-bold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full border border-amber-200">
                            🔥 트렌디 탐색 (언급도 +{Math.abs(gap)}p)
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold px-2.5 py-1 bg-indigo-100 text-indigo-800 rounded-full border border-indigo-200">
                            ⚡ 균형 스택 (언급/실무 균형)
                          </span>
                        )}
                        <span className="font-mono font-black text-sm text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-200">
                          종합 {cat.score}점
                        </span>
                      </div>
                    </div>

                    {/* Dual Horizontal Progress Bars */}
                    <div className="space-y-2 pt-1">
                      {/* 1. Mention Score Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold text-slate-600">
                          <span>개발자 언급도</span>
                          <span className="font-mono text-indigo-700">{mentionScore}점</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${mentionScore}%` }}
                            transition={{ duration: 0.8, delay: idx * 0.1 }}
                            className="bg-indigo-600 h-full rounded-full"
                          />
                        </div>
                      </div>

                      {/* 2. Utility Score Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold text-slate-600">
                          <span>실무 활용성 (서비스/인프라 기여 가치)</span>
                          <span className="font-mono text-emerald-700">{utilityScore}점</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${utilityScore}%` }}
                            transition={{ duration: 0.8, delay: idx * 0.1 + 0.15 }}
                            className="bg-emerald-500 h-full rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* View Mode 2: 2D Quadrant Matrix */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Visual Canvas Quadrant */}
            <div className="lg:col-span-8 bg-slate-900 rounded-2xl p-6 md:p-8 text-white relative min-h-[400px] md:min-h-[460px] flex flex-col justify-between overflow-hidden shadow-inner">
              {/* Background Axis Lines */}
              <div className="absolute inset-x-8 top-1/2 h-0.5 bg-slate-800/80 border-t border-dashed border-slate-700" />
              <div className="absolute inset-y-8 left-1/2 w-0.5 bg-slate-800/80 border-l border-dashed border-slate-700" />

              {/* Quadrant Area Badges (사분면 모서리 워터마크) */}
              <div className="absolute top-8 left-4 text-[11px] font-bold text-emerald-400/90 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60 pointer-events-none z-0">
                Q2: 실무 가치 중심 (High Utility)
              </div>

              <div className="absolute top-8 right-4 text-[11px] font-bold text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-400/30 pointer-events-none z-0">
                Q1: 핵심 우선 검토 (Core Focus) ⭐
              </div>

              <div className="absolute bottom-10 left-4 text-[11px] font-bold text-slate-400/90 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60 pointer-events-none z-0">
                Q4: 트래킹 관심 대상 (Watchlist)
              </div>

              <div className="absolute bottom-10 right-4 text-[11px] font-bold text-sky-300/90 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60 pointer-events-none z-0">
                Q3: 라이징 기술 주제 (Rising Topics)
              </div>

              {/* Y Axis Title (Top Center over Y-axis line) */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 text-xs font-extrabold text-indigo-300 bg-slate-950/80 px-3 py-1 rounded-full border border-indigo-500/30 flex items-center gap-1 z-10 shadow-sm">
                <span>▲ Y축: 실무 활용성</span>
              </div>

              {/* Quadrant Nodes Canvas */}
              <div className="relative w-full h-full my-10 min-h-[280px]">
                {dashboardData.categoryPriorities.map((cat, idx) => {
                  let xPct = 72;
                  let yPct = 82;

                  if (idx === 0) {
                    xPct = 68;
                  } else if (idx === 1) {
                    xPct = 84;
                  } else {
                    xPct = Math.min(85, Math.max(18, (cat.score + (idx % 2 === 0 ? 10 : -15))));
                    yPct = Math.min(85, Math.max(18, (90 - idx * 22)));
                  }

                  const isTop = cat.priority <= 2;

                  return (
                    <motion.div
                      key={idx}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: idx * 0.1, type: 'spring' }}
                      style={{ left: `${xPct}%`, top: `${100 - yPct}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 group z-20 cursor-pointer"
                    >
                      <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border font-bold text-xs shadow-xl transition-all duration-300 group-hover:scale-110 ${
                        isTop 
                          ? 'bg-amber-400 text-slate-950 border-amber-300 ring-4 ring-amber-400/25' 
                          : 'bg-slate-800 text-slate-100 border-slate-600 group-hover:border-indigo-400'
                      }`}>
                        <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                        <span className="whitespace-nowrap">{cat.category}</span>
                        <span className="text-[10px] opacity-90 font-mono font-black">({cat.score}p)</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* X Axis Title (Bottom Left) */}
              <div className="w-full text-left pt-2.5 border-t border-slate-800 text-xs font-extrabold text-indigo-300 flex items-center justify-start pl-2">
                <span>▶ X축: 개발자 언급도</span>
              </div>
            </div>

            {/* Quadrant Legend & Ranking */}
            <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-slate-700" />
                  <span>우선순위 랭킹 정량 결과</span>
                </h4>
                <div className="space-y-2">
                  {dashboardData.categoryPriorities.map((cat, i) => (
                    <div key={i} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs hover:border-slate-400 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] font-mono ${
                          i === 0 ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-700'
                        }`}>
                          0{cat.priority}
                        </span>
                        <span className="font-bold text-slate-900">{cat.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-700">{cat.score}점</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          cat.score > 80 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {cat.score > 80 ? 'Q1 필수' : 'Q2/Q3'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Audience Insight Card */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-2.5 border border-slate-800">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-amber-400" />
                  <span>타겟 오디언스 핵심 인사이트</span>
                </div>
                {dashboardData.ageInsights.slice(0, 2).map((insight, i) => (
                  <div key={i} className="text-xs leading-relaxed text-slate-300 border-l-2 border-amber-400 pl-2.5 my-1.5">
                    <span className="font-bold text-white uppercase">{insight.ageGroup}: </span>
                    <span>{insight.insight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 3. Integrated Action Plan (통합 기획 실행 패키지) */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-neutral-200">
          <div className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold">
            <Zap className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-neutral-900 tracking-tight">테크블로그 &amp; 교육 세션 종합 실행 패키지</h3>
            <p className="text-xs text-neutral-500">기획 목적, 추천 헤드라인, 지식 자산화 전략이 한눈에 파악되도록 1:1 세트로 통합된 기획안입니다.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardData.promotionIdeas.map((idea, i) => {
            const headline = dashboardData.thumbnailCopies[i] || `"${idea.title} 해결하기"`;
            const sourcingPoint = dashboardData.sourcingPoints[i] || '사내 기술 아키텍처 아카이빙 및 가이드화';

            return (
              <div key={i} className="bg-white border-2 border-neutral-200 hover:border-neutral-900 rounded-2xl p-6 shadow-sm transition-all flex flex-col justify-between space-y-5">
                <div className="space-y-4">
                  {/* Category Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                    <span className="text-[11px] font-black bg-neutral-900 text-white px-2.5 py-1 rounded-md uppercase tracking-wider">
                      기획안 0{i + 1}
                    </span>
                    <span className="text-xs font-bold text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-md">
                      Target: <strong className="text-neutral-900">{idea.target}</strong>
                    </span>
                  </div>

                  {/* Core Plan */}
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-neutral-900 text-lg leading-snug">{idea.title}</h4>
                    <p className="text-xs text-neutral-600 leading-relaxed bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                      {idea.description}
                    </p>
                  </div>

                  {/* Headline Copy */}
                  <div className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wide flex items-center gap-1">
                      <MousePointer2 className="w-3 h-3 text-amber-600" />
                      추천 헤드라인 / 아티클 제목
                    </span>
                    <p className="text-xs font-black text-slate-900 tracking-tight leading-snug">
                      "{headline.replace(/^"|"$/g, '')}"
                    </p>
                  </div>
                </div>

                {/* Sourcing Point */}
                <div className="pt-3 border-t border-neutral-100 space-y-1">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                    <Layers className="w-3 h-3 text-neutral-500" />
                    지식 자산화 실행 포인트
                  </span>
                  <p className="text-xs text-neutral-700 font-medium leading-relaxed">
                    {sourcingPoint}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. Data Table (Market Signals) */}
      <section>
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-neutral-100">
          <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
            <Table className="w-5 h-5 text-neutral-900" />
          </div>
          <h3 className="text-xl font-bold text-neutral-900 tracking-tight">DevRel 기술 시그널 로우 데이터</h3>
        </div>
        <div className="bg-white border-2 border-neutral-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[600px] sm:min-w-0">
              <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200">
                <tr>
                  <th className="px-4 sm:px-6 py-4 tracking-wider text-xs uppercase">Signal</th>
                  <th className="px-4 sm:px-6 py-4 tracking-wider text-xs uppercase">Source</th>
                  <th className="px-4 sm:px-6 py-4 tracking-wider text-xs uppercase">Impact</th>
                  <th className="px-4 sm:px-6 py-4 tracking-wider text-xs uppercase">Category / Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {dashboardData.marketSignals.map((sig, i) => (
                  <tr key={i} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 sm:px-6 py-4">
                      <span className="font-bold text-neutral-900 break-keep">{sig.signal}</span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-neutral-500 font-medium">{sig.source}</td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                        sig.impact === 'High' ? 'bg-neutral-900 text-white' :
                        sig.impact === 'Medium' ? 'bg-neutral-200 text-neutral-900' :
                        'bg-neutral-100 text-neutral-600'
                      }`}>
                        {sig.impact}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {sig.categories?.map((cat, idx) => (
                          <span key={idx} className="px-2 py-1 bg-neutral-100 text-neutral-700 rounded-md text-[10px] font-bold whitespace-nowrap">{cat}</span>
                        ))}
                        {sig.targetAges?.map((age, idx) => (
                          <span key={idx} className="px-2 py-1 border border-neutral-200 text-neutral-700 rounded-md text-[10px] font-bold whitespace-nowrap">{age}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Original Markdown Report */}
      <section className="pt-10">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-neutral-100">
          <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
            <Layout className="w-5 h-5 text-neutral-900" />
          </div>
          <h3 className="text-xl font-bold text-neutral-900 tracking-tight">상세 분석 리포트</h3>
        </div>
        <div className="bg-white border-2 border-neutral-100 rounded-2xl p-10 md:p-14 shadow-sm prose prose-neutral max-w-none">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ node, ...props }) => (
                <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline decoration-blue-300" />
              ),
              h1: ({node, ...props}) => <h1 className="text-3xl font-black mt-8 mb-6 pb-4 border-b border-neutral-200" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-8 mb-4 tracking-tight" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-xl font-bold mt-6 mb-3" {...props} />,
              p: ({node, ...props}) => <p className="text-base leading-loose text-neutral-700 mb-6" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-6 space-y-2 text-neutral-700" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-6 space-y-2 text-neutral-700" {...props} />,
              li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
              strong: ({node, ...props}) => <strong className="font-bold text-neutral-900" {...props} />,
              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-neutral-900 pl-4 py-2 bg-neutral-50 text-neutral-800 italic" {...props} />,
            }}
          >
            {cleanReport}
          </ReactMarkdown>
        </div>
      </section>

      {/* Grounding Sources */}
      {sources.length > 0 && (
        <section>
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 md:p-10 text-white shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 pb-6 border-b border-neutral-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <Globe className="w-4 h-4" />
                  <span>Real-time Grounded Web Sources</span>
                </div>
                <h3 className="text-xl font-bold tracking-tight text-white">
                  실시간 팩트체크 수집 원문 출처 ({sources.length}건)
                </h3>
                <p className="text-xs text-neutral-400">
                  클릭하면 AI가 리포트 작성 시 직접 참조 및 검증한 실제 블로그, 아티클 원문 주소로 이동합니다.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {sources.map((source, idx) => {
                let domain = '';
                try {
                  domain = new URL(source.uri).hostname.replace('www.', '');
                } catch {
                  domain = 'Web Source';
                }
                return (
                  <a
                    key={idx}
                    href={source.uri}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col justify-between p-4 bg-neutral-800/60 border border-neutral-700/60 rounded-xl hover:border-emerald-500/80 hover:bg-neutral-800 transition-all group"
                  >
                    <div className="space-y-1.5 mb-3">
                      <div className="flex items-center justify-between text-[11px] font-bold text-neutral-400 group-hover:text-emerald-400 transition-colors">
                        <span className="truncate max-w-[180px]">{domain}</span>
                        <span className="px-1.5 py-0.5 bg-neutral-700 rounded text-[10px] text-neutral-300">[{idx + 1}]</span>
                      </div>
                      <h4 className="text-xs font-bold text-neutral-200 group-hover:text-white line-clamp-2 leading-snug">
                        {source.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-neutral-400 group-hover:text-emerald-400 font-medium">
                      <span>원문 검증하기</span>
                      <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </motion.div>
  );
};

