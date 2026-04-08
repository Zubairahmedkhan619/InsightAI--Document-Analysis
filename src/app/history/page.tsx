"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Zap } from "lucide-react";
import HistoryCard from "@/components/analysis/HistoryCard";
import { generateAndDownloadPDF } from "@/lib/pdf-generator";
import { LANG_MAP } from "@/lib/constants";

export default function HistoryPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  const [analyses, setAnalyses] = useState<any[]>([]);
  const [credits, setCredits] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    Promise.all([
      fetch("/api/jobs?limit=50").then((r) => r.json()),
      fetch("/api/credits").then((r) => r.json()),
    ])
      .then(([{ jobs }, { credits }]) => {
        setAnalyses(jobs || []);
        setCredits(credits);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [isSignedIn, isLoaded, router]);

  const isPro = credits?.plan !== "free";

  const handleDownloadPDF = (analysis: any) => {
    if (!isPro && !analysis.is_paid_analysis) return;
    generateAndDownloadPDF(analysis);
  };

  // Filtering logic from History.jsx — keep exact, only fix date field
  const filtered = analyses
    .filter((a) => {
      if (filterStatus !== "all" && a.status !== filterStatus) return false;
      if (filterType !== "all" && a.input_type !== filterType) return false;
      if (
        searchQuery &&
        !a.title?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !a.summary?.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      return true;
    })
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/40">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-sm border-b border-white/5">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Insight<span className="text-violet-400">AI</span>
        </Link>
        <div className="flex items-center gap-4">
          {!isPro && (
            <Link
              href="/#pricing"
              className="flex items-center gap-1.5 text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30 px-3 py-1.5 rounded-full hover:bg-violet-500/30 transition"
            >
              <Zap className="w-3 h-3" /> Upgrade to Pro
            </Link>
          )}
          <span className="text-white/50 text-sm">
            {credits?.credits_remaining ?? "–"} credits left
          </span>
        </div>
      </nav>

      <div className="pt-24 max-w-4xl mx-auto px-4 pb-16">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="text-white/40 hover:text-white transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Analysis History</h1>
            <p className="text-white/40 text-sm mt-0.5">
              {analyses.length} total analyses
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            placeholder="Search analyses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-[200px] bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm placeholder:text-white/30 focus:outline-none focus:border-violet-500/50"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
          >
            <option value="all">All statuses</option>
            <option value="completed">Completed</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
          >
            <option value="all">All types</option>
            <option value="pdf">PDF</option>
            <option value="word">Word</option>
            <option value="excel">Excel</option>
            <option value="ppt">PowerPoint</option>
            <option value="image">Image</option>
            <option value="youtube">YouTube</option>
            <option value="url">URL</option>
          </select>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-white/30">
            <p className="text-lg">No analyses found</p>
            <p className="text-sm mt-1">
              <Link href="/" className="text-violet-400 hover:underline">
                Start analyzing
              </Link>{" "}
              to see results here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((analysis) => (
              <HistoryCard
                key={analysis.id}
                analysis={analysis}
                onDownloadPDF={handleDownloadPDF}
                isPro={isPro}
                langMap={LANG_MAP}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}