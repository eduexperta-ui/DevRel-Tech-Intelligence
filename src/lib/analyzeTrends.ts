import { SourceItem, TrendSignal, TrendCluster, MDActionItem } from '../types';

/**
 * 트렌드 분석 결과 인터페이스
 */
export interface AnalysisResult {
  topTrends: TrendCluster[];
  categoryPriorities: { category: string; score: number; priority: number }[];
  ageInsights: { ageGroup: string; insight: string }[];
  actionTable: MDActionItem[];
}

/**
 * 키워드 카테고리 정의
 */
type KeywordCategory = 'Item' | 'Fit' | 'Color' | 'Material' | 'Context';

interface CategorizedKeyword {
  word: string;
  category: KeywordCategory;
  count: number;
}

/**
 * Fashion Market Intelligence 분석 로직
 */
export class TrendAnalyzer {
  private sources: SourceItem[];

  constructor(sources: SourceItem[]) {
    this.sources = sources;
  }

  /**
   * 전체 분석 프로세스 실행
   */
  public analyze(): AnalysisResult {
    // 1. 텍스트 정규화
    const normalizedTexts = this.normalizeTexts();

    // 2. 키워드 추출 & 3. 카테고리 분류
    const categorizedKeywords = this.extractAndCategorizeKeywords(normalizedTexts);

    // 4. 유사 키워드 클러스터링 & 5. 트렌드 점수 계산
    const clusters = this.clusterAndScore(categorizedKeywords);

    // 6. MD 실행안 생성
    const actionTable = this.generateActionItems(clusters);

    // 추가: 타깃 연령별 시사점 도출 (Mock 로직 포함)
    const ageInsights = this.deriveAgeInsights(clusters);

    // 추가: 카테고리별 우선순위 계산
    const categoryPriorities = this.calculateCategoryPriorities(categorizedKeywords);

    return {
      topTrends: clusters.slice(0, 5),
      categoryPriorities,
      ageInsights,
      actionTable,
    };
  }

  /**
   * 1. 텍스트 정규화: 소문자 변환, 특수문자 제거 등
   */
  private normalizeTexts(): string[] {
    return this.sources.map(s => {
      const fullText = `${s.title} ${s.snippet || ''}`;
      return fullText
        .toLowerCase()
        .replace(/[^\w\sㄱ-ㅎㅏ-ㅣ가-힣]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    });
  }

  /**
   * 2. 키워드 추출 & 3. 카테고리 분류
   */
  private extractAndCategorizeKeywords(texts: string[]): CategorizedKeyword[] {
    // 패션 도메인 사전 (Mock)
    const dictionary: Record<string, KeywordCategory> = {
      '데님': 'Item', '자켓': 'Item', '원피스': 'Item', '셔츠': 'Item', '가디건': 'Item',
      '오버핏': 'Fit', '크롭': 'Fit', '와이드': 'Fit', '슬림': 'Fit',
      '실버': 'Color', '버터': 'Color', '레드': 'Color', '차콜': 'Color',
      '린넨': 'Material', '레더': 'Material', '나일론': 'Material', '트위드': 'Material',
      '긱시크': 'Context', '발레코어': 'Context', '오피스코어': 'Context', '고프코어': 'Context'
    };

    const keywordCounts: Record<string, { category: KeywordCategory; count: number }> = {};

    texts.forEach(text => {
      Object.entries(dictionary).forEach(([word, category]) => {
        if (text.includes(word)) {
          if (!keywordCounts[word]) {
            keywordCounts[word] = { category, count: 0 };
          }
          keywordCounts[word].count += 1;
        }
      });
    });

    return Object.entries(keywordCounts).map(([word, data]) => ({
      word,
      category: data.category,
      count: data.count
    }));
  }

  /**
   * 4. 유사 키워드 클러스터링 & 5. 트렌드 점수 계산
   */
  private clusterAndScore(keywords: CategorizedKeyword[]): TrendCluster[] {
    // 단순 빈도 기반 클러스터링 (Mock)
    const sortedKeywords = [...keywords].sort((a, b) => b.count - a.count);
    
    // 상위 키워드를 중심으로 클러스터 생성
    return sortedKeywords.slice(0, 8).map((k, index) => {
      const signals: TrendSignal[] = [
        {
          signal: `${k.word} 수요 급증`,
          source: 'Market Scan',
          impact: k.count > 10 ? 'High' : 'Medium',
          categories: [k.category],
          targetAges: ['20대 초반', '20대 후반'],
          description: `${k.word} 관련 검색량 및 기사 노출 빈도가 전주 대비 상승함.`
        }
      ];

      return {
        id: `cluster-${index}`,
        title: `${k.word} 트렌드`,
        summary: `${k.word}를 중심으로 한 시장 반응이 뜨겁습니다.`,
        signals,
        keyItems: [k.word],
        keyColors: k.category === 'Color' ? [k.word] : ['Neutral']
      };
    });
  }

  /**
   * 6. MD 실행안 생성
   */
  private generateActionItems(clusters: TrendCluster[]): MDActionItem[] {
    return clusters.slice(0, 3).map((c, i) => ({
      title: `${c.keyItems[0]} 집중 기획전`,
      description: `${c.keyItems[0]} 아이템을 메인으로 한 '신학기/오피스' 테마 기획전 구성 제안`,
      target: '20대 여성',
      priority: i === 0 ? 'P1' : 'P2',
      type: 'Strategy'
    }));
  }

  /**
   * 타깃 연령별 시사점 도출
   */
  private deriveAgeInsights(clusters: TrendCluster[]): { ageGroup: string; insight: string }[] {
    const topWord = clusters[0]?.keyItems[0] || '패션';
    return [
      { ageGroup: '10대', insight: `${topWord}를 활용한 스쿨룩/Y2K 스타일링에 대한 관심이 높음.` },
      { ageGroup: '20대', insight: `${topWord} 기반의 오피스코어 및 데일리룩 믹스매치 수요 증가.` },
      { ageGroup: '30대', insight: `고급스러운 소재감의 ${topWord} 아이템을 활용한 미니멀룩 선호.` }
    ];
  }

  /**
   * 카테고리별 우선순위 계산
   */
  private calculateCategoryPriorities(keywords: CategorizedKeyword[]): { category: string; score: number; priority: number }[] {
    const catScores: Record<string, number> = {};
    keywords.forEach(k => {
      catScores[k.category] = (catScores[k.category] || 0) + k.count;
    });

    return Object.entries(catScores)
      .map(([category, score]) => ({ category, score, priority: 0 }))
      .sort((a, b) => b.score - a.score)
      .map((item, index) => ({ ...item, priority: index + 1 }));
  }
}

/**
 * Mock 데이터를 활용한 분석 함수
 */
export const analyzeTrendsWithMock = (sources: SourceItem[]): AnalysisResult => {
  const analyzer = new TrendAnalyzer(sources);
  return analyzer.analyze();
};
