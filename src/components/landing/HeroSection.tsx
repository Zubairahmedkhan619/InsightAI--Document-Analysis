"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

export default function HeroSection(props: { onStartClick: () => void }) {
  const { onStartClick } = props;

  return (
    <section className="relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-7 md:p-10 space-y-6">
          <div className="space-y-3">
            <motion.div
              className="text-white/60 text-sm"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
            >
              InsightAI
            </motion.div>
            <motion.h1
              className="text-3xl md:text-4xl font-semibold leading-tight"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
            >
              Understand any document, instantly.
            </motion.h1>
            <motion.p
              className="text-white/40 max-w-2xl"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={2}
            >
              Upload a file, paste a link, or analyze a shared URL. Get key
              findings and actionable insights.
            </motion.p>
          </div>

          <motion.div
            className="flex flex-col sm:flex-row gap-3"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
          >
            <motion.button
              type="button"
              onClick={onStartClick}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-violet-500/20 text-violet-200 border border-violet-500/30 px-6 py-3 font-medium hover:bg-violet-500/30 transition"
            >
              Start analyzing
              <ArrowRight className="w-4 h-4" />
            </motion.button>

            <motion.a
              href="#pricing"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center rounded-full bg-white/5 text-white/70 border border-white/10 px-6 py-3 font-medium hover:bg-white/10 transition"
            >
              View pricing
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
