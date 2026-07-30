import React, { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Download, ExternalLink, TrendingUp, Lightbulb, 
  Zap, Layers, ShieldCheck, Globe, Search, CheckCircle2, 
  Database, Sparkles, ChevronDown, ArrowUpRight, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Source, DashboardData, FactMetrics } from '../types';
import { TemplateReportBody } from './report/TemplateReportBody';

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
  period = 'recent30',
  dataSources = [],
  onCopy,
  onDownload,
  onSaveToNotion,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'sources' | 'factcheck' | 'volume' | 'queries' | null>('sources');

  const effectiveSources = sources ?? [];

  const originalSourceCount = effectiveSources.filter(
    (source) => source.sourceType === "original" || source.sourceType === "direct" || !source.isGroundingRedirect
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
        dashboardData = parsed.dashboardData || parsed.dashboard_data || null;
        cleanReport = report.replace(jsonMatch[0], '').trim();
      } catch (e) {
        console.error("Failed to parse JSON in report", e);
      }
    }

    return { cleanReport, dashboardData };
  }, [report]);

  const parsedBytes = useMemo(() => {
    if (!report) return 0;
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

  const templateId = dashboardData?.reportMeta?.templateId;

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
      className="space-y-12 pb-32 max-w-7xl mx-auto"
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
          <span>DEVREL INTEL DASHBOARD</span>
          {dashboardData.reportMeta?.templateTitle && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200">
              {dashboardData.reportMeta.templateTitle}
            </span>
          )}
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

      {/* Data Collection Transparency Dashboard */}
      <section className="bg-white border-2 border-slate-200 text-slate-900 rounded-3xl p-6 md:p-8 shadow-sm transition-all space-y-6">
        <div className="bg-slate-900 text-white rounded-2xl p-4 md:p-5 flex flex-wrap items-center justify-between gap-4 border border-slate-800">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-3 py-1 rounded-lg text-xs font-bold">
              <Search className="w-3.5 h-3.5 text-indigo-400" />
              <span>분석 기간: {period.replace("recent", "최근 ")}일</span>
            </div>
            <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-lg text-xs font-bold">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>수집 문서: {effectiveSources.length}건 (원문 {originalSourceCount}건)</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1 rounded-lg text-xs font-medium">
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>Google Search Grounding 실시간 분석</span>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            * 수집된 출처 메타데이터 및 분석 근거 현황입니다.
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: 수집 출처 */}
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

            <AnimatePresence>
              {selectedMetric === 'sources' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-indigo-100 bg-indigo-50/40 p-5 space-y-4"
                >
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

          {/* Card 2: 리포트 생성 메트릭 */}
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
                  <span>생성 리포트 크기</span>
                </div>
                <div className="text-2xl font-bold text-neutral-900">
                  {Math.round(parsedBytes / 1024)} <span className="text-sm font-semibold text-neutral-500">KB</span>
                </div>
                <p className="text-xs text-neutral-500 font-medium">
                  {estTokens.toLocaleString()} 토큰 파싱 및 {parsedSectionsCount}개 기술 마크다운 섹션
                </p>
              </div>
              <div className={`p-2 rounded-xl border transition-colors ${
                selectedMetric === 'volume' ? 'bg-purple-50 border-purple-200 text-purple-600' : 'bg-white border-neutral-200 text-neutral-400 group-hover:text-neutral-700'
              }`}>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${selectedMetric === 'volume' ? 'rotate-180' : ''}`} />
              </div>
            </button>

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
                      <span className="text-[10px] text-neutral-400 block font-semibold">생성 용량</span>
                      <span className="font-bold text-neutral-900 font-mono">{Math.round(parsedBytes / 1024)} KB</span>
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-purple-200 text-center">
                      <span className="text-[10px] text-purple-600 block font-semibold">토큰 수</span>
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
        </div>
      </section>

      {/* 1. Key Trend Signals */}
      {dashboardData.topTrends && dashboardData.topTrends.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b border-neutral-100">
            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-neutral-900" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Qualitative signals</p>
              <h3 className="text-xl font-bold text-neutral-900 tracking-tight">핵심 기술 시그널 &amp; 동향</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardData.topTrends.map((trend, i) => (
              <motion.article 
                key={i}
                whileHover={{ y: -2 }}
                className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-black bg-neutral-100 text-neutral-600 px-2.5 py-1 rounded-md uppercase tracking-wider">
                      Signal 0{i+1}
                    </span>
                    {trend.signalLevel && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        trend.signalLevel === 'high'
                          ? 'bg-emerald-100 text-emerald-800'
                          : trend.signalLevel === 'medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {trend.signalLevel} signal
                      </span>
                    )}
                  </div>
                  <h4 className="font-extrabold text-neutral-900 text-base mb-2 leading-snug">{trend.title}</h4>
                  <p className="text-xs text-neutral-600 mb-4 leading-relaxed bg-neutral-50 p-3 rounded-xl">{trend.summary}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {trend.keyItems?.map((item, idx) => (
                      <span key={idx} className="text-[11px] font-bold bg-neutral-900 text-white px-2 py-1 rounded-md">{item}</span>
                    ))}
                  </div>
                  {trend.rationale && (
                    <p className="text-[11px] text-neutral-500 italic border-t pt-2">
                      {trend.rationale}
                    </p>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        </section>
      )}

      {/* 2. Template Specific Report Body Component */}
      {templateId && (
        <TemplateReportBody
          templateId={templateId}
          dashboardData={dashboardData}
        />
      )}

      {/* 3. DevRel Content Opportunities */}
      {dashboardData.contentOpportunities && dashboardData.contentOpportunities.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b border-neutral-100">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
              <Lightbulb className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Content opportunities</p>
              <h3 className="text-xl font-bold text-neutral-900 tracking-tight">DevRel 콘텐츠 기회 제안</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardData.contentOpportunities.map((item, i) => (
              <div key={i} className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-100 text-xs">
                    <span className="font-bold bg-neutral-900 text-white px-2.5 py-1 rounded-md">
                      {item.format === 'blog' ? '기술 블로그' :
                       item.format === 'tech-talk' ? '테크 세션' :
                       item.format === 'case-study' ? '사례 연구' : '커뮤니티 포스트'}
                    </span>
                    <span className="text-neutral-500 font-medium">
                      타겟: <strong className="text-neutral-900">{item.target}</strong>
                    </span>
                  </div>

                  <h4 className="font-extrabold text-neutral-900 text-base">{item.title}</h4>
                  <p className="text-xs text-neutral-600 leading-relaxed bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                    {item.description}
                  </p>
                </div>

                {item.rationale && (
                  <div className="pt-2 border-t border-neutral-100 text-[11px] text-neutral-500 leading-relaxed">
                    <strong className="text-neutral-700">제안 이유: </strong>{item.rationale}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Action Plan */}
      {dashboardData.actionPlan && dashboardData.actionPlan.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b border-neutral-100">
            <div className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold">
              <Zap className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Next actions</p>
              <h3 className="text-xl font-black text-neutral-900 tracking-tight">다음 액션</h3>
            </div>
          </div>

          <div className="space-y-3">
            {dashboardData.actionPlan.map((item, index) => (
              <article
                key={`${item.priority}-${item.action}-${index}`}
                className="grid gap-3 rounded-2xl border border-neutral-200 bg-white p-5 md:grid-cols-[auto_1fr_auto] items-center"
              >
                <span className={`h-fit rounded-full px-3 py-1 text-xs font-black text-white ${
                  item.priority === 'P1' ? 'bg-neutral-900' :
                  item.priority === 'P2' ? 'bg-neutral-700' : 'bg-neutral-500'
                }`}>
                  {item.priority}
                </span>

                <div>
                  <h4 className="font-bold text-neutral-900 text-sm md:text-base">{item.action}</h4>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    담당: <span className="font-semibold text-neutral-800">{item.owner}</span>
                  </p>
                </div>

                <div className="text-xs font-bold text-neutral-800 bg-neutral-50 px-3 py-2 rounded-xl border border-neutral-100 shrink-0">
                  산출물: {item.expectedOutput}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Original Markdown Report Section */}
      <section className="pt-6">
        <div className="flex items-center gap-3 mb-6 pb-3 border-b border-neutral-100">
          <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
            <Info className="w-5 h-5 text-neutral-900" />
          </div>
          <h3 className="text-xl font-bold text-neutral-900 tracking-tight">상세 분석 리포트 본문</h3>
        </div>
        <div className="bg-white border-2 border-neutral-100 rounded-2xl p-8 md:p-12 shadow-sm prose prose-neutral max-w-none">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ node, ...props }) => (
                <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline decoration-blue-300" />
              ),
              h1: ({node, ...props}) => <h1 className="text-2xl font-black mt-8 mb-4 pb-3 border-b border-neutral-200" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-6 mb-3 tracking-tight" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-lg font-bold mt-5 mb-2" {...props} />,
              p: ({node, ...props}) => <p className="text-sm md:text-base leading-relaxed text-neutral-700 mb-4" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-1.5 text-neutral-700 text-sm md:text-base" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4 space-y-1.5 text-neutral-700 text-sm md:text-base" {...props} />,
              li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
              strong: ({node, ...props}) => <strong className="font-bold text-neutral-900" {...props} />,
              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-neutral-900 pl-4 py-2 bg-neutral-50 text-neutral-800 italic my-4 text-xs md:text-sm" {...props} />,
            }}
          >
            {cleanReport}
          </ReactMarkdown>
        </div>
      </section>

      {/* Grounding Sources */}
      {effectiveSources.length > 0 && (
        <section>
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8 text-white shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-4 border-b border-neutral-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <Globe className="w-4 h-4" />
                  <span>Real-time Grounded Web Sources</span>
                </div>
                <h3 className="text-xl font-bold tracking-tight text-white">
                  수집 원문 출처 ({effectiveSources.length}건)
                </h3>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {effectiveSources.map((source, idx) => {
                let domain = '';
                try {
                  domain = new URL(source.uri).hostname.replace('www.', '');
                } catch {
                  domain = 'Web Source';
                }
                const isRedirect = source.sourceType === 'grounding_redirect';
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
                      <span>{isRedirect ? "Grounding 링크" : "원문 검증하기"}</span>
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
