"use client";

import React from "react";
import { motion } from "framer-motion";

export default function ProcessingState(props: { currentStep: number }) {
  const { currentStep } = props;

  const steps = [
    { label: "Preparing analysis", description: "Reading your document..." },
    { label: "Analyzing document", description: "AI is extracting key findings..." },
    { label: "Generating results", description: "Compiling your insights..." },
  ];

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-5">
      <div className="text-sm text-white/60">Status</div>

      <div className="space-y-4">
        {steps.map((step, i) => {
          const stepNum = i + 1;
          const isActive = stepNum === currentStep;
          const isComplete = stepNum < currentStep;

          return (
            <motion.div
              key={stepNum}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3"
            >
              <div
                className={[
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border transition-colors",
                  isComplete
                    ? "bg-violet-500/30 border-violet-500/50 text-violet-200"
                    : isActive
                      ? "border-violet-500/50 text-violet-200"
                      : "border-white/10 text-white/30",
                ].join(" ")}
              >
                {isComplete ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  stepNum
                )}
              </div>
              <div className="flex-1">
                <div
                  className={[
                    "text-sm font-medium transition-colors",
                    isActive ? "text-white" : isComplete ? "text-white/70" : "text-white/30",
                  ].join(" ")}
                >
                  {step.label}
                </div>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="text-xs text-white/40 mt-0.5"
                  >
                    {step.description}
                  </motion.div>
                )}
              </div>
              {isActive && (
                <motion.div
                  className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {currentStep > 1 && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: (currentStep - 1) / 3 }}
          className="h-1 bg-violet-500/30 rounded-full origin-left"
        >
          <div className="h-full bg-violet-400 rounded-full" />
        </motion.div>
      )}
    </div>
  );
}
