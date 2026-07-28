/**
 * 트렌드 점수 계산을 위한 가중치 설정 인터페이스
 * 각 항목의 합은 1.0 (100%)이 되어야 합니다.
 */
export interface ScoringWeights {
  sourceDiversity: number;   // 소스 다양성 (여러 매체 노출 여부)
  frequency: number;         // 반복 출현 빈도 (절대적 언급량)
  recency: number;           // 최근성 (최신 기사 비중)
  categoryRelevance: number; // 카테고리 적합성 (선택한 카테고리와의 연관도)
  actionability: number;     // 실행 가능성 (MD가 즉시 활용 가능한 구체성)
}

/**
 * 분석 대상 트렌드 데이터 구조
 */
export interface TrendMetrics {
  uniqueSourceCount: number;  // 언급된 고유 소스 수
  totalMentionCount: number;  // 전체 언급 횟수
  daysSinceLatest: number;    // 가장 최근 언급으로부터 경과된 일수 (0 = 오늘)
  relevanceScore: number;     // 카테고리 적합성 점수 (0~10)
  actionabilityScore: number; // MD 활용 가능성 점수 (0~10)
}

/**
 * 기본 가중치 설정
 */
export const DEFAULT_WEIGHTS: ScoringWeights = {
  sourceDiversity: 0.20,   // 20%
  frequency: 0.25,         // 25%
  recency: 0.20,           // 20%
  categoryRelevance: 0.15, // 15%
  actionability: 0.20      // 20%
};

/**
 * 트렌드 점수 계산 함수 (100점 만점)
 * 
 * @param metrics - 트렌드 지표 데이터
 * @param weights - 항목별 가중치 (기본값 사용 가능)
 * @returns 0~100 사이의 트렌드 점수
 */
export function scoreTrend(
  metrics: TrendMetrics,
  weights: ScoringWeights = DEFAULT_WEIGHTS
): number {
  // 1. 소스 다양성 점수 (0~100)
  // 5개 이상의 서로 다른 소스에서 언급될 때 만점 (로그 스케일 적용 가능)
  const sourceScore = Math.min((metrics.uniqueSourceCount / 5) * 100, 100);

  // 2. 빈도 점수 (0~100)
  // 분석 대상 기사 수 대비 언급 비중 고려 (여기서는 단순 20회 이상 만점 가정)
  const frequencyScore = Math.min((metrics.totalMentionCount / 20) * 100, 100);

  // 3. 최근성 점수 (0~100)
  // 지수 감쇠 함수 적용: 오늘(0일) 100점, 7일 전 약 50점, 14일 전 약 25점
  const recencyScore = 100 * Math.exp(-0.1 * metrics.daysSinceLatest);

  // 4. 카테고리 적합성 점수 (0~100)
  // 0~10 점수를 100점 만점으로 환산
  const relevanceScore = metrics.relevanceScore * 10;

  // 5. 실행 가능성 점수 (0~100)
  // 0~10 점수를 100점 만점으로 환산
  const actionabilityScore = metrics.actionabilityScore * 10;

  // 가중치 합산 계산
  const finalScore = 
    (sourceScore * weights.sourceDiversity) +
    (frequencyScore * weights.frequency) +
    (recencyScore * weights.recency) +
    (relevanceScore * weights.categoryRelevance) +
    (actionabilityScore * weights.actionability);

  // 소수점 첫째 자리까지 반올림
  return Math.round(finalScore * 10) / 10;
}

/**
 * 트렌드 등급 판정 함수
 */
export function getTrendGrade(score: number): 'HOT' | 'RISING' | 'STABLE' | 'NICH' {
  if (score >= 85) return 'HOT';    // 폭발적 반응, 즉시 대응 필요
  if (score >= 65) return 'RISING'; // 성장 중인 트렌드, 선점 권장
  if (score >= 40) return 'STABLE'; // 안정적 수요, 기본 구색 유지
  return 'NICH';                    // 특정 타겟 중심의 니치한 반응
}

/* 
[계산식 설계 의도]
1. 소스 다양성: 한 매체에서만 밀어주는 '광고성' 트렌드를 걸러내기 위함.
2. 빈도: 대중적인 인지도를 측정.
3. 최근성: 패션의 생명인 '시의성'을 반영. 오래된 트렌드는 점수가 빠르게 하락.
4. 적합성: 우리 브랜드/카테고리와 맞지 않는 노이즈 제거.
5. 실행성: MD가 실제로 물건을 사오거나 기획전을 열 수 있는 '현실성' 반영.
*/
