"use client";

import React from "react";
import { motion } from "framer-motion";
import { Zap, Sparkles, Lock, ShieldCheck, CreditCard } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    credits: "2 analyses / month",
    icon: Zap,
    color: "border-white/10",
    highlight: false,
    features: [
      "PDF+Word+PPT only",
      "up to 10MB",
      "2 analyses/month",
      "English only",
      "basic summary",
      "Download PDF report",
    ],
    cta: "Start Free",
    buttonStyle: "bg-white/8 text-white border-white/10",
  },
  {
    name: "Pro",
    price: "$12",
    period: "/ month",
    credits: "100 analyses / month",
    icon: Sparkles,
    color: "border-violet-500/40",
    highlight: true,
    features: [
      "All file types + YouTube",
      "up to 100MB",
      "100 analyses/month",
      "8 output languages",
      "deep analysis+sentiment",
      "AI insights+suggestions",
      "priority processing",
      "PDF+Excel download",
    ],
    cta: "Get Pro",
    buttonStyle: "bg-violet-500",
    subtext: "→ Pay with Stripe",
  },
];

export default function PricingSection(props: {
  onStartFreeClick: () => void;
  onUpgradeClick: () => void;
}) {
  const { onStartFreeClick, onUpgradeClick } = props;

  return (
    <section id="pricing" className="pt-16 pb-24">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-semibold">Choose your plan</h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Get started for free, then upgrade to unlock unlimited AI-powered
            document analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.name}
                className={`relative rounded-2xl p-6 space-y-6 ${
                  plan.highlight
                    ? "border border-violet-500/40 bg-violet-500/5 shadow-[0_0_60px_rgba(139,92,246,0.15)]"
                    : "border border-white/10 bg-white/5"
                }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-violet-500 text-black px-3 py-1 rounded-full text-xs font-medium">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-violet-400" />
                    <span className="text-lg font-semibold">{plan.name}</span>
                  </div>
                  <div className="text-3xl font-bold">
                    {plan.price}
                    <span className="text-white/60 text-base font-normal">
                      {plan.period}
                    </span>
                  </div>
                  <div className="text-white/60 text-sm">{plan.credits}</div>
                </div>

                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="text-white/80 text-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-400/60" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <motion.button
                  type="button"
                  onClick={plan.highlight ? onUpgradeClick : onStartFreeClick}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full rounded-xl px-4 py-3 text-sm font-medium transition ${
                    plan.buttonStyle === "bg-violet-500"
                      ? "bg-violet-500 text-white hover:bg-violet-600"
                      : "bg-white/8 text-white border border-white/10 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {plan.cta}
                    {plan.highlight && <CreditCard className="w-4 h-4" />}
                  </div>
                  {plan.subtext && (
                    <div className="text-xs text-violet-200 mt-1">{plan.subtext}</div>
                  )}
                </motion.button>
              </motion.div>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-8 text-white/40">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span className="text-sm">Secure checkout</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-sm">Cancel anytime</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            <span className="text-sm">Powered by Stripe</span>
          </div>
        </div>
      </div>
    </section>
  );
}
