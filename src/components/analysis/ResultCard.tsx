"use client";

import React from "react";
import { motion } from "framer-motion";
import { Globe, Download } from "lucide-react";

export default function ResultCard(props: {
  analysis: any;
  onDownload: (analysis: any) => void;
}) {
  const { analysis, onDownload } = props;

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-xs text-white/50 flex items-center gap-2">
              <Globe className="w-3.5 h-3.5" />
              Shared analysis
            </div>
            <h2 className="text-xl font-semibold mt-2 truncate">
              {analysis?.title ?? "Untitled analysis"}
            </h2>
            <p className="text-sm text-white/40 mt-3 line-clamp-6">
              {analysis?.summary ?? analysis?.result ?? "—"}
            </p>
          </div>

          <motion.button
            type="button"
            onClick={() => onDownload(analysis)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-violet-500/20 text-violet-200 border border-violet-500/30 px-4 py-2 text-sm hover:bg-violet-500/30 transition"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
