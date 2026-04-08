"use client";

import React from "react";

export default function HistoryCard(props: {
  analysis: any;
  onDownloadPDF: (analysis: any) => void;
  isPro: boolean;
  langMap: Record<string, string>;
}) {
  const { analysis, onDownloadPDF, isPro } = props;

  const createdAt =
    analysis?.created_at ?? analysis?.created_date ?? analysis?.createdAt;

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm text-white/60">
            {createdAt ? new Date(createdAt).toLocaleString() : "—"}
          </div>
          <div className="font-medium text-white truncate">
            {analysis?.title ?? "Untitled analysis"}
          </div>
          <div className="text-xs text-white/40 mt-1 line-clamp-2">
            {analysis?.summary ?? analysis?.status ?? "—"}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onDownloadPDF(analysis)}
          className="shrink-0 rounded-lg bg-violet-500/20 text-violet-200 border border-violet-500/30 px-3 py-2 text-xs hover:bg-violet-500/30 transition"
          disabled={!isPro && analysis?.is_paid_analysis}
        >
          Download PDF
        </button>
      </div>
    </div>
  );
}

