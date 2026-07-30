import { DevRelPreset } from "../constants";

export const analyzeTrend = async (
  period: string,
  selectedCategories: string[],
  targetAges: string[],
  purpose: string,
  dataSources: string[],
  keyword: string,
  articleCount: number,
  imageBase64: string | null = null,
  templatePolicy?: Pick<
    DevRelPreset,
    | "id"
    | "title"
    | "locale"
    | "analysisMode"
    | "allowedDomains"
    | "blockedDomains"
    | "requiredEvidence"
    | "sourcePolicyNote"
  >
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
      templatePolicy,
    }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || `API returned ${res.status}`);
  }

  return data;
};
