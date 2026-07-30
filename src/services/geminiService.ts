import type { TemplateId } from "../config/reportTemplates";

export const analyzeTrend = async (
  period: string,
  selectedCategories: string[],
  targetAges: string[],
  purpose: string,
  dataSources: string[],
  keyword: string,
  articleCount: number,
  imageBase64: string | null = null,
  templateId: TemplateId = "korean-engineering"
) => {
  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      period,
      selectedCategories,
      targetAges,
      purpose,
      dataSources,
      keyword,
      articleCount,
      imageBase64,
      templateId,
    }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || `API returned ${res.status}`);
  }

  return data;
};
