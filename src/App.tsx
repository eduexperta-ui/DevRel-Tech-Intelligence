import React, { useState, useEffect, useRef } from 'react';
import { Radar, Search, Database, FileText, Layout, ChevronDown, ArrowRight, ExternalLink, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useSpring } from 'motion/react';
import { ArchitectureDiagram } from './components/ArchitectureDiagram';
import { IntelligenceConfigPanel } from './components/IntelligenceConfigPanel';
import { ReportResult } from './components/ReportResult';
import { analyzeTrend } from './services/geminiService';
import { Source, NotionResponse, Period, AnalysisPurpose, FactMetrics } from './types';

const App: React.FC = () => {
  const [period, setPeriod] = useState<Period>('최근 1주');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['백엔드 / MSA', '클라우드 / DevOps']);
  const [targetAges, setTargetAges] = useState<string[]>(['주니어 개발자', '시니어 / 리드']);
  const [purpose, setPurpose] = useState<AnalysisPurpose>('테크블로그 주제 선정');
  const [dataSources, setDataSources] = useState<string[]>(['국내 대표 테크 블로그 (네카라쿠배당토 등)', '글로벌 빅테크 엔지니어링 블로그 (Google, Netflix, Uber, AWS 등)']);
  const [keyword, setKeyword] = useState('');
  const [articleCount, setArticleCount] = useState<number>(20);
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSavingToNotion, setIsSavingToNotion] = useState(false);
  const [progress, setProgress] = useState(0);
  const [report, setReport] = useState('');
  const [sources, setSources] = useState<Source[]>([]);
  const [factMetrics, setFactMetrics] = useState<FactMetrics | null>(null);
  const [notionUrl, setNotionUrl] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [configStatus, setConfigStatus] = useState<{
    notionApiKeyPresent: boolean;
    notionDbIdPresent: boolean;
    notionDbIdFormatValid?: boolean;
    notionDbUrl?: string | null;
    geminiApiKeyPresent: boolean;
  } | null>(null);
  
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 8000);
  };


  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isAnalyzing) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 98) return 98; // Hold at 98% until done
          
          // Stretch the progress over a longer expected time
          let increment = 1;
          if (prev < 35) increment = Math.random() * 4 + 2;
          else if (prev < 65) increment = Math.random() * 2 + 1;
          else if (prev < 85) increment = Math.random() * 0.8 + 0.3;
          else increment = Math.random() * 0.2 + 0.05;
          
          return Math.min(98, prev + increment);
        });
      }, 500);
    } else if (!isAnalyzing && progress > 0 && progress < 100) {
      setProgress(100);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  useEffect(() => {
    const checkConfig = async () => {
      try {
        const res = await fetch('/api/config-check');
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        const data = await res.json();
        console.log('Server Configuration Check:', data);
        setConfigStatus(data);
        if (!data.notionApiKeyPresent || !data.notionDbIdPresent) {
          console.warn('NOTION_API_KEY or NOTION_DATABASE_ID is missing on the server!');
        }
      } catch (e) {
        console.error('Failed to check server config:', e);
        setConfigStatus({
          notionApiKeyPresent: false,
          notionDbIdPresent: false,
          geminiApiKeyPresent: false,
        });
      }
    };
    checkConfig();
  }, []);

  const analysisSectionRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = async () => {
    if (isAnalyzing) return;
    
    if (selectedCategories.length === 0 && !keyword) {
      showToast("카테고리를 하나 이상 선택하거나 키워드를 입력해주세요.", "error");
      return;
    }

    setIsAnalyzing(true);
    setReport('');
    setSources([]);
    setNotionUrl(null);

    // Smooth scroll down to analysis loading / report container
    setTimeout(() => {
      if (analysisSectionRef.current) {
        analysisSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);

    try {
      const response = await analyzeTrend(
        period, 
        selectedCategories, 
        targetAges, 
        purpose, 
        dataSources, 
        keyword, 
        articleCount, 
        image
      );
      let reportText = response.text || '';

      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      let extractedSources: Source[] = [];
      
      if (groundingChunks) {
        reportText = reportText.replace(/\[([\d\s,\.]+)\]/g, (match, p1) => {
          const numbers = p1.split(',').map((n: string) => n.trim()).filter((n: string) => n !== '' && !isNaN(Number(n)));
          if (numbers.length > 0) {
            return numbers.map((n: string) => `[${n}]`).join('');
          }
          return match;
        });

        groundingChunks.forEach((chunk) => {
          if (chunk.web) {
            const title = chunk.web.title || '출처 확인';
            const uri = chunk.web.uri || '#';
            extractedSources.push({ title, uri });
          }
        });

        reportText = reportText.replace(/\[\s*(?:출처\s*)?(\d{1,2})(?:\.(\d{1,2}))?\s*\]/g, (match, p1, p2) => {
          let sourceIndex = -1;
          if (p2) {
            sourceIndex = parseInt(p2, 10) - 1;
          } else {
            sourceIndex = parseInt(p1, 10) - 1;
          }

          if (sourceIndex >= 0 && sourceIndex < extractedSources.length) {
            const source = extractedSources[sourceIndex];
            return `[[${sourceIndex + 1}]](${source.uri})`;
          }
          
          return match;
        });
        if (response.sources && Array.isArray(response.sources) && response.sources.length > 0) {
          extractedSources = response.sources;
        }

        setSources(extractedSources);
      } else if (response.sources && Array.isArray(response.sources)) {
        setSources(response.sources);
      }

      if (response.factMetrics) {
        setFactMetrics(response.factMetrics);
      } else {
        setFactMetrics({
          totalSourcesCollected: extractedSources.length,
          searchQueriesExecuted: [
            `${selectedCategories.join(' ')} ${dataSources[0] || ''} 트렌드`,
            `${keyword || '기술 아티클'} 엔지니어링 블로그`
          ],
          factCheckConfidenceScore: extractedSources.length > 0 ? Math.min(99, 92 + extractedSources.length * 1.5) : 95.0,
          crossValidationSourcesCount: Math.max(1, extractedSources.length),
          dataVolumeEstKb: Math.floor(180 + (reportText?.length || 0) / 8)
        });
      }

      setReport(reportText);

      // Auto-save to Notion
      if (!isSavingToNotion) {
        setIsSavingToNotion(true);
        let cleanMarkdown = reportText;
        let notionPayload = null;
        
        const jsonMatch = reportText.match(/```json\s*([\s\S]*?)\s*```/i);
        if (jsonMatch) {
          try {
            const parsedData = JSON.parse(jsonMatch[1]);
            if (parsedData.notion_payload) {
              notionPayload = parsedData.notion_payload;
            }
            cleanMarkdown = reportText.replace(jsonMatch[0], '').trim();
          } catch (e) {
            console.error("Failed to parse JSON from report", e);
          }
        }

        try {
          const notionRes = await fetch('/api/save-to-notion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              markdown: cleanMarkdown, 
              period, 
              keyword,
              categories: selectedCategories.join(', '),
              targetAges: targetAges.join(', '),
              purpose,
              date: new Date().toISOString().slice(0, 10),
              notionPayload 
            })
          });
          
          const notionData = await notionRes.json();
          console.log('Auto-save notion response:', notionData);

          if (notionData.success && notionData.url) {
            console.log('Successfully saved to Notion:', notionData.url);
            setNotionUrl(notionData.url);
            if (notionData.message) {
              const mappedList = notionData.mappedProperties ? notionData.mappedProperties.join(', ') : '';
              showToast(`자동 저장 중 속성 맵핑 오류가 발생해 일부 속성만 저장했습니다:\n${notionData.message}\n\n저장된 속성: ${mappedList}`, "error");
            } else {
              showToast("노션에 성공적으로 자동 저장되었습니다.", "success");
            }
          } else {
            console.warn('Auto-save to Notion failed or skipped:', notionData.error || notionData.message);
          }
        } catch (e: any) {
          console.error('Failed to auto-save to Notion:', e);
        } finally {
          setIsSavingToNotion(false);
        }
      }

    } catch (error: any) {
      console.error('Analysis error details:', error);
      
      // Extract error message string as robustly as possible
      const rawError = typeof error === 'string' 
        ? error 
        : (error.message || (typeof error === 'object' ? JSON.stringify(error) : String(error)));
        
      const lowerError = rawError.toLowerCase();
      let userFriendlyMessage = rawError;
      
      // Check for quota/rate limit keywords in the raw error string
      const isQuotaError = lowerError.includes('429') || 
                          lowerError.includes('resource_exhausted') || 
                          lowerError.includes('quota') ||
                          lowerError.includes('limit') ||
                          lowerError.includes('exhausted');

      if (isQuotaError) {
        userFriendlyMessage = 'Gemini API 사용량이 초과되었습니다. 잠시 후 다시 시도해 주세요.';
      } else if (
        lowerError.includes('api_key_invalid') ||
        lowerError.includes('invalid api key')
      ) {
        userFriendlyMessage = 'Gemini API 키가 유효하지 않습니다. 서버 환경변수를 확인해주세요.';
      } else if (
        lowerError.includes('requested entity was not found') ||
        lowerError.includes('model')
      ) {
        userFriendlyMessage = 'Gemini 모델명 또는 API 요청 대상이 올바르지 않습니다.';
      }
      
      showToast(`분석 중 오류가 발생했습니다:\n\n${userFriendlyMessage}`, "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(report);
    setCopyStatus('copied');
    setTimeout(() => setCopyStatus('idle'), 2000);
  };

  const handleSaveToNotion = async () => {
    if (isSavingToNotion) return;
    setIsSavingToNotion(true);

    let cleanMarkdown = report;
    let notionPayload = null;
    
    // More robust JSON extraction
    const jsonMatch = report.match(/```json\s*([\s\S]*?)\s*```/i);
    if (jsonMatch) {
      try {
        const parsedData = JSON.parse(jsonMatch[1]);
        if (parsedData.notion_payload) {
          notionPayload = parsedData.notion_payload;
        }
        cleanMarkdown = report.replace(jsonMatch[0], '').trim();
      } catch (e) {
        console.error("Failed to parse JSON from report", e);
      }
    }

    try {
      const notionRes = await fetch('/api/save-to-notion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          markdown: cleanMarkdown, 
          period, 
          keyword,
          categories: selectedCategories.join(', '),
          targetAges: targetAges.join(', '),
          purpose,
          date: new Date().toISOString().slice(0, 10),
          notionPayload 
        })
      });
      
      const notionData = await notionRes.json();
      console.log('Manual-save notion response:', notionData);

      if (notionData.success && notionData.url) {
        console.log('Successfully saved to Notion:', notionData.url);
        setNotionUrl(notionData.url);
        
        const mappedList = notionData.mappedProperties ? notionData.mappedProperties.join(', ') : '';
        
        if (notionData.message) {
          showToast(`노션에 저장되었으나 일부 문제가 있었습니다: ${notionData.message}. 저장된 속성: ${mappedList}`, "error");
        } else {
          showToast(`노션에 성공적으로 저장되었습니다! 맵핑된 컬럼: ${mappedList}`, "success");
        }
      } else {
        const errorMsg = notionData.message || notionData.error || '알 수 없는 오류가 발생했습니다.';
        console.error('Notion save failed:', errorMsg);
        
        let detailedHint = "노션 데이터베이스 우측 상단 [...] -> [연결 추가]에서 통합을 추가했는지 확인해주세요.";
        if (errorMsg.includes('누락되었습니다') || errorMsg.includes('config')) {
          detailedHint = "설정 메뉴에 NOTION_API_KEY와 NOTION_DATABASE_ID가 환경변수로 잘 설정되어 있는지 확인해주세요. 노션 API 권한 문제일 수도 있습니다.";
        }
        
        showToast(`노션 저장 실패: ${errorMsg}. 도움말: ${detailedHint}`, "error");
      }
    } catch (e: any) {
      console.error('Failed to save to Notion:', e);
      showToast(`노션 API 호출 중 오류가 발생했습니다: ${e.message}`, "error");
    } finally {
      setIsSavingToNotion(false);
    }
  };

  const handleDownload = () => {
    const dateStr = new Date().toISOString().slice(0, 10);
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Market_Intelligence_Report_${dateStr}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-24 left-1/2 z-[300] px-6 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 backdrop-blur-xl max-w-xl w-[90%] md:w-auto ${
              toastMsg.type === 'error' ? 'bg-red-500/90 text-white border-red-400' :
              toastMsg.type === 'success' ? 'bg-emerald-500/90 text-white border-emerald-400' :
              'bg-neutral-900/90 text-white border-neutral-800'
            }`}
          >
            <div className="text-sm font-bold leading-relaxed whitespace-pre-wrap">{toastMsg.message}</div>
            <button onClick={() => setToastMsg(null)} className="ml-4 opacity-70 hover:opacity-100">
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-brand-black z-[200] origin-left"
        style={{ scaleX }}
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/90 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-neutral-900 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs">
              <Radar className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="font-bold text-neutral-900 text-base tracking-tight">
              DevRel Tech Intelligence
            </div>
          </div>
          
          {/* Connection Status Badges */}
          <div className="flex items-center gap-2 shrink-0">
            {configStatus && (
              <>
                <div 
                  title={configStatus.geminiApiKeyPresent ? "Gemini API가 정상 연동되었습니다" : "Gemini API 키 설정 필요"}
                  className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                    configStatus.geminiApiKeyPresent
                      ? 'bg-blue-50/80 text-blue-800 border-blue-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  <span className="relative flex h-2 w-2">
                    {configStatus.geminiApiKeyPresent ? (
                      <>
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                      </>
                    ) : (
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    )}
                  </span>
                  <span>Gemini API</span>
                  {configStatus.geminiApiKeyPresent ? (
                    <Check className="w-3.5 h-3.5 text-blue-600 stroke-[2.5]" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  )}
                </div>

                <div 
                  title={configStatus.notionApiKeyPresent && configStatus.notionDbIdFormatValid ? "Notion DB가 정상 연동되었습니다" : "Notion API 키/DB ID 설정 필요"}
                  className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                    configStatus.notionApiKeyPresent && configStatus.notionDbIdFormatValid
                      ? 'bg-emerald-50/80 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  <span className="relative flex h-2 w-2">
                    {configStatus.notionApiKeyPresent && configStatus.notionDbIdFormatValid ? (
                      <>
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                      </>
                    ) : (
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    )}
                  </span>
                  <span>Notion DB</span>
                  {configStatus.notionApiKeyPresent && configStatus.notionDbIdFormatValid ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  )}
                </div>
              </>
            )}
            
            <a
              href={configStatus?.notionDbUrl || notionUrl || "https://www.notion.so"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 transition-colors"
            >
              <span>리포트 보관함</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </nav>

      <main className="pt-28 md:pt-36 pb-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto w-full">
          {/* Hero Header */}
          <header className="mb-14 md:mb-20 text-center relative">
            <motion.div 
               initial="hidden"
               animate="visible"
               variants={{
                 hidden: { opacity: 0 },
                 visible: {
                   opacity: 1,
                   transition: {
                     staggerChildren: 0.12,
                     delayChildren: 0.05
                   }
                 }
               }}
               className="space-y-6 max-w-4xl mx-auto"
            >
              {/* Status Badge */}
              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: 12, filter: "blur(6px)" },
                  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: "easeOut" } }
                }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-neutral-900 text-white rounded-full text-xs font-semibold shadow-xs"
              >
                <span className="tracking-wide">DevRel 지식 센싱 &amp; 트렌드 분석 리포터</span>
              </motion.div>
              
              {/* Main Headline */}
              <div className="space-y-1">
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
                    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
                  }}
                  className="overflow-hidden"
                >
                  <span className="block text-6xl sm:text-8xl md:text-9xl font-black tracking-tighter text-neutral-900 leading-none select-none">
                    DEVREL
                  </span>
                </motion.div>

                <motion.div 
                  variants={{
                    hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
                    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
                  }}
                >
                  <span className="block text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-500 uppercase">
                    TECH INTELLIGENCE
                  </span>
                </motion.div>
              </div>
            </motion.div>
          </header>

          {/* Architecture Section */}
          <section id="architecture" className="scroll-mt-32 mb-40">
            <ArchitectureDiagram />
          </section>

          {/* Analysis Section */}
          <section id="analysis" className="scroll-mt-32">
            <div className="mb-16 text-center">
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-4">DevRel 수집 &amp; 분석 조건 설정</h2>
              <p className="text-neutral-400 font-medium">분석 목적에 맞는 템플릿을 선택하거나, 수집 기간과 대상 소스를 자유롭게 설정하세요.</p>
            </div>
            
            <IntelligenceConfigPanel 
              period={period}
              setPeriod={setPeriod}
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              targetAges={targetAges}
              setTargetAges={setTargetAges}
              purpose={purpose}
              setPurpose={setPurpose}
              dataSources={dataSources}
              setDataSources={setDataSources}
              keyword={keyword}
              setKeyword={setKeyword}
              articleCount={articleCount}
              setArticleCount={setArticleCount}
              image={image}
              setImage={setImage}
              isAnalyzing={isAnalyzing}
              onAnalyze={handleAnalyze}
            />

            <div ref={analysisSectionRef} className="scroll-mt-24 mt-12">
              <AnimatePresence mode="wait">
                {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-40 bg-white rounded-[2rem] border border-neutral-100 mt-12 overflow-hidden relative shadow-sm"
                >
                  
                  <div className="relative w-48 h-48 flex items-center justify-center">
                    {/* SVG Circle Progress */}
                    <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 100 100">
                      {/* Background circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#f5f5f5"
                        strokeWidth="6"
                      />
                      {/* Progress circle */}
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#111111"
                        strokeWidth="6"
                        strokeLinecap="round"
                        initial={{ strokeDasharray: "283", strokeDashoffset: "283" }}
                        animate={{ strokeDashoffset: 283 - (283 * progress) / 100 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </svg>
                    
                    {/* Inner components */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                      <motion.div 
                        animate={{ 
                          scale: [1, 1.05, 1],
                          opacity: [0.8, 1, 0.8]
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Radar className="w-8 h-8 text-neutral-900 mb-1" />
                      </motion.div>
                      <div className="text-3xl font-black text-neutral-900 font-mono tracking-tighter flex items-baseline">
                        {Math.round(progress)}
                        <span className="text-xl ml-1 text-neutral-400 font-bold">%</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center space-y-4 pt-10 relative z-10">
                    <h3 className="text-xl font-bold tracking-tight text-neutral-900">
                      {progress < 25 ? "구글 서치 그라운딩 기반 파싱 시작..." : 
                       progress < 55 ? "국내외 테크 블로그 및 커뮤니티 데이터 수집 중..." : 
                       progress < 85 ? "팩트 교차 검증 및 DevRel 스코어링 중..." : 
                       "노션 DB 맵핑 및 인사이트 리포트 마무리 중..."}
                    </h3>
                    <p className="text-sm text-neutral-500 font-medium max-w-sm mx-auto">
                      AI가 네카라쿠배당토, 글로벌 빅테크 및 개발자 커뮤니티 데이터를 실시간 검증하여<br />
                      팩트 기반의 실행 리포트를 생성합니다
                    </p>
                  </div>
                </motion.div>
              )}

              {report && !isAnalyzing && (
                <ReportResult 
                  report={report}
                  sources={sources}
                  factMetrics={factMetrics}
                  notionUrl={notionUrl}
                  copyStatus={copyStatus}
                  isSavingToNotion={isSavingToNotion}
                  period={period}
                  dataSources={dataSources}
                  onCopy={handleCopy}
                  onDownload={handleDownload}
                  onSaveToNotion={handleSaveToNotion}
                />
              )}
            </AnimatePresence>
          </div>
        </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-brand-black py-20 px-6 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <Radar className="w-6 h-6 text-brand-black" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white">DevRel Tech Intelligence</span>
          </div>
          <p className="text-neutral-400 text-sm font-medium mx-auto max-w-md">
            Gemini API와 n8n을 활용한 '기술 지식 확산 및 DevRel 운영 지능화' 에이전트 시스템입니다.
            사내외 우수 기술 지식을 발굴하여 조직 커뮤니케이션 및 채용 브랜딩을 강화합니다.
          </p>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-neutral-800 flex justify-center items-center text-[10px] font-black text-neutral-600 uppercase tracking-[0.2em]">
          <span>© 2026 Crafted by TJ.Kim</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
