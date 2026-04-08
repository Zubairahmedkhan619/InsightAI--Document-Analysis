"use client";

import React, { useId } from "react";
import { motion } from "framer-motion";

export default function UploadZone(props: {
  onFileSelect: (file: File, type: string) => Promise<void> | void;
  onLinkSubmit: (url: string, type: string) => Promise<void> | void;
  selectedType: string;
  setSelectedType: (type: string) => void;
}) {
  const { onFileSelect, onLinkSubmit, selectedType, setSelectedType } = props;

  const fileInputId = useId();

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-wrap gap-3 items-center">
        {[
          { key: "pdf", label: "PDF" },
          { key: "word", label: "Word" },
          { key: "excel", label: "Excel" },
          { key: "ppt", label: "PowerPoint" },
          { key: "image", label: "Image" },
          { key: "youtube", label: "YouTube" },
          { key: "url", label: "URL" },
        ].map((t, i) => (
          <motion.button
            key={t.key}
            type="button"
            onClick={() => setSelectedType(t.key)}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={[
              "px-3 py-1.5 rounded-full text-xs border transition",
              selectedType === t.key
                ? "bg-violet-500/20 text-violet-200 border-violet-500/30"
                : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10",
            ].join(" ")}
          >
            {t.label}
          </motion.button>
        ))}
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <div className="space-y-2">
            <div className="text-sm font-medium text-white/80">Upload file</div>
            <label
              htmlFor={fileInputId}
              className="inline-flex items-center justify-center cursor-pointer w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70 hover:bg-white/10 transition"
            >
              Choose file
            </label>
            <input
              id={fileInputId}
              type="file"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                await onFileSelect(file, selectedType);
              }}
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-white/80">Paste URL</div>
            <form
              className="flex gap-2"
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const url = String(formData.get("url") ?? "").trim();
                if (!url) return;
                await onLinkSubmit(url, selectedType);
              }}
            >
              <input
                name="url"
                type="url"
                placeholder="https://example.com"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="rounded-lg bg-violet-500/20 text-violet-200 border border-violet-500/30 px-4 py-2 text-sm hover:bg-violet-500/30 transition"
              >
                Analyze
              </motion.button>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
