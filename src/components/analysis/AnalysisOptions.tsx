"use client";

import React from "react";
import { motion } from "framer-motion";
import { LANG_MAP, ANALYSIS_TYPES } from "@/lib/constants";

export default function AnalysisOptions(props: {
  options: {
    analysisType: string;
    outputLanguage: string;
    [key: string]: any;
  };
  setOptions: React.Dispatch<
    React.SetStateAction<{
      analysisType: string;
      outputLanguage: string;
      [key: string]: any;
    }>
  >;
}) {
  const { options, setOptions } = props;

  return (
    <motion.div
      className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <div className="space-y-2">
        <div className="text-sm font-medium text-white/80">Analysis type</div>
        <select
          value={options.analysisType}
          onChange={(e) =>
            setOptions((prev) => ({ ...prev, analysisType: e.target.value }))
          }
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50"
        >
          {ANALYSIS_TYPES.map((type) => (
            <option key={type.id} value={type.id} className="text-black">
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium text-white/80">Output language</div>
        <select
          value={options.outputLanguage}
          onChange={(e) =>
            setOptions((prev) => ({
              ...prev,
              outputLanguage: e.target.value,
            }))
          }
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50"
        >
          {Object.entries(LANG_MAP).map(([code, name]) => (
            <option key={code} value={code} className="text-black">
              {name}
            </option>
          ))}
        </select>
      </div>
    </motion.div>
  );
}
