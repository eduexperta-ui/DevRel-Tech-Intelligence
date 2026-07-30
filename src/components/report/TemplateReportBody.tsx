import React from "react";
import type { DashboardData } from "../../types";
import type { TemplateId } from "../../config/reportTemplates";

export function CompanyBlogTable({ rows }: { rows?: DashboardData['companyPosts'] }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
        기업별 기술 포스트 수집 결과가 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-neutral-200">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
          <tr>
            <th className="px-4 py-3">기업</th>
            <th className="px-4 py-3">포스트</th>
            <th className="px-4 py-3">기술 주제</th>
            <th className="px-4 py-3">발행일</th>
            <th className="px-4 py-3">활용 포인트</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {rows.map((post, index) => (
            <tr key={`${post.company}-${post.title}-${index}`}>
              <td className="px-4 py-4 font-bold text-neutral-900">{post.company}</td>
              <td className="px-4 py-4 text-neutral-700">{post.title}</td>
              <td className="px-4 py-4 text-neutral-600">{post.topic}</td>
              <td className="px-4 py-4 text-neutral-600">{post.publishedAt ?? "원문 확인 필요"}</td>
              <td className="px-4 py-4 text-neutral-600">{post.whyItMatters}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function RagPatternTable({ rows }: { rows?: DashboardData['implementationPatterns'] }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
        LLM·RAG 구현 패턴 수집 결과가 없습니다.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {rows.map((item, index) => (
        <article key={`${item.pattern}-${index}`} className="rounded-2xl border border-neutral-200 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Pattern {index + 1}</p>
          <h4 className="mt-2 text-lg font-black text-neutral-900">{item.pattern}</h4>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="font-bold text-neutral-900">문제</dt>
              <dd className="mt-1 text-neutral-600">{item.problem}</dd>
            </div>
            <div>
              <dt className="font-bold text-neutral-900">접근 방식</dt>
              <dd className="mt-1 text-neutral-600">{item.approach}</dd>
            </div>
            <div>
              <dt className="font-bold text-neutral-900">운영 시사점</dt>
              <dd className="mt-1 text-neutral-600">{item.operationsNote}</dd>
            </div>
          </dl>
        </article>
      ))}
    </div>
  );
}

export function DevExMetricsPanel({ metrics }: { metrics?: DashboardData['devexSignals'] }) {
  if (!metrics || metrics.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
        DevEx·채용 브랜딩 시그널 수집 결과가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {metrics.map((item, index) => (
        <article key={`${item.theme}-${index}`} className="rounded-2xl border border-neutral-200 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Theme {index + 1}</p>
          <h4 className="mt-2 text-lg font-black text-neutral-900">{item.theme}</h4>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs font-bold text-neutral-500">관찰된 운영 방식</p>
              <p className="mt-1 text-sm leading-6 text-neutral-700">{item.observedPractice}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-500">과장 없는 브랜딩 전환</p>
              <p className="mt-1 text-sm leading-6 text-neutral-700">{item.employerBrandAngle}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export function GlobalTrendTimeline({ items }: { items?: DashboardData['globalSignals'] }) {
  if (!items || items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
        글로벌 엔지니어링 시그널 수집 결과가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <article key={`${item.signal}-${index}`} className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-bold text-neutral-700">
              {item.sourceKind === "official" ? "공식 기술 출처" : "커뮤니티 논의"}
            </span>
          </div>
          <h4 className="mt-3 text-lg font-black text-neutral-900">{item.signal}</h4>
          <p className="mt-2 text-sm leading-6 text-neutral-600">{item.interpretation}</p>
        </article>
      ))}
    </div>
  );
}

interface TemplateReportBodyProps {
  templateId: TemplateId;
  dashboardData?: DashboardData;
  data?: DashboardData;
}

export const TemplateReportBody: React.FC<TemplateReportBodyProps> = ({
  templateId,
  dashboardData,
  data,
}) => {
  const currentData = dashboardData || data || ({} as DashboardData);

  switch (templateId) {
    case "korean-engineering":
      return (
        <section className="space-y-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Company post ledger</p>
            <h3 className="mt-1 text-xl font-black text-neutral-900">기업별 기술 포스트</h3>
          </div>
          <CompanyBlogTable rows={currentData.companyPosts || (currentData as any).companyBlogs} />
        </section>
      );

    case "ai-ml-rag":
      return (
        <section className="space-y-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Implementation patterns</p>
            <h3 className="mt-1 text-xl font-black text-neutral-900">LLM·RAG 구현 패턴</h3>
          </div>
          <RagPatternTable rows={currentData.implementationPatterns || (currentData as any).ragPatterns} />
        </section>
      );

    case "devex-employer-brand":
      return (
        <section className="space-y-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Developer experience signals</p>
            <h3 className="mt-1 text-xl font-black text-neutral-900">DevEx·채용 브랜딩 시그널</h3>
          </div>
          <DevExMetricsPanel metrics={currentData.devexSignals || (currentData as any).devexMetrics} />
        </section>
      );

    case "global-engineering":
      return (
        <section className="space-y-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Official and community signals</p>
            <h3 className="mt-1 text-xl font-black text-neutral-900">글로벌 엔지니어링 시그널</h3>
          </div>
          <GlobalTrendTimeline items={currentData.globalSignals || (currentData as any).globalArticles} />
        </section>
      );

    default:
      return null;
  }
};
