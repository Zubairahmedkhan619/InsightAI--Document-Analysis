"use client";

import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { History } from "lucide-react";
import HeroSection from "@/components/landing/HeroSection";
import PricingSection from "@/components/landing/PricingSection";
import UploadZone from "@/components/analysis/UploadZone";
import AnalysisOptions from "@/components/analysis/AnalysisOptions";
import ProcessingState from "@/components/analysis/ProcessingState";
import ResultCard from "@/components/analysis/ResultCard";
import { useJobStatus } from "@/hooks/useJobStatus";
import { generateAndDownloadPDF } from "@/lib/pdf-generator";

export default function HomePage() {
  const { user, isSignedIn } = useUser();
  const router = useRouter();

  const [selectedType, setSelectedType] = useState("pdf");
  const [options, setOptions] = useState({
    analysisType: "summary",
    outputLanguage: "en",
  });
  const [processing, setProcessing] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [credits, setCredits] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeRef = useRef<HTMLDivElement>(null);

  // Realtime job status
  const { job: liveJob, isComplete, isFailed } = useJobStatus(currentJobId);

  // When job completes, add to analyses list and stop processing
  useEffect(() => {
    if (isComplete && liveJob) {
      setAnalyses((prev) => [liveJob, ...prev.filter((a) => a.id !== liveJob.id)]);
      setProcessing(false);
      setCurrentJobId(null);
    }
    if (isFailed) {
      setProcessing(false);
      setCurrentJobId(null);
      setError("Analysis failed. Please try again.");
    }
  }, [isComplete, isFailed, liveJob]);

  useEffect(() => {
    if (isSignedIn) {
      loadHistory();
      loadCredits();
    }
  }, [isSignedIn]);

  const loadHistory = async () => {
    try {
      const res = await fetch("/api/jobs?limit=10");
      const { jobs } = await res.json();
      setAnalyses(jobs || []);
    } catch (e) {
      console.error("Failed to load history", e);
    }
  };

  const loadCredits = async () => {
    try {
      const res = await fetch("/api/credits");
      const { credits } = await res.json();
      setCredits(credits);
    } catch (e) {
      console.error("Failed to load credits", e);
    }
  };

  const scrollToAnalyze = () => {
    analyzeRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleUpgrade = async () => {
    const res = await fetch("/api/stripe/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: "pro" }),
    });
    const { url } = await res.json();
    window.location.href = url;
  };

  const detectLanguage = async (hint: string): Promise<string> => {
    try {
      const res = await fetch("/api/detect-language", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hint }),
      });
      const { lang } = await res.json();
      return lang || "en";
    } catch {
      return "en";
    }
  };

  const runAnalysis = async (
    inputUrl: string,
    inputType: string,
    title: string
  ) => {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }
    if (credits && credits.credits_remaining <= 0) {
      setError("No credits remaining. Upgrade to Pro for more.");
      return;
    }

    setProcessing(true);
    setError(null);

    const isPaidAnalysis = credits?.plan !== "free";

    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        input_type: inputType,
        input_url: inputUrl,
        output_language: options.outputLanguage,
        analysis_type: options.analysisType,
        is_paid_analysis: isPaidAnalysis,
      }),
    });

    const { job } = await res.json();
    if (job?.id) {
      setCurrentJobId(job.id);
    } else {
      setProcessing(false);
      setError("Failed to create job. Please try again.");
    }
  };

  const handleFileSelect = async (file: File, type: string) => {
    const detectedLang = await detectLanguage(file.name);
    setOptions((prev) => ({ ...prev, outputLanguage: detectedLang }));

    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: file.name, contentType: file.type }),
    });
    const { uploadUrl, fileUrl } = await res.json();

    await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });

    await runAnalysis(fileUrl, type, file.name);
  };

  const handleLinkSubmit = async (url: string, type: string) => {
    const detectedLang = await detectLanguage(url);
    setOptions((prev) => ({ ...prev, outputLanguage: detectedLang }));
    await runAnalysis(url, type, url);
  };

  const handleDownload = (analysis: any) => {
    const isPro = credits?.plan !== "free";
    if (!isPro && analysis.is_paid_analysis) return;
    generateAndDownloadPDF(analysis);
  };

  // Determine processing step for ProcessingState component
  const processingStep = liveJob?.status === "processing" ? 2
    : liveJob?.status === "completed" ? 3
    : 1;

  const latestResult = analyses[0];

  return (
    <div className="min-h-screen text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-sm border-b border-white/5">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Insight<span className="text-violet-400">AI</span>
        </Link>
        <div className="flex items-center gap-4">
          {isSignedIn ? (
            <>
              <span className="text-white/50 text-sm">
                {credits?.credits_remaining ?? "–"} credits
              </span>
              <Link
                href="/history"
                className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors"
              >
                <History className="w-4 h-4" /> History
              </Link>
            </>
          ) : (
            <Link
              href="/sign-in"
              className="text-sm bg-white text-black px-4 py-1.5 rounded-full font-medium hover:bg-white/90 transition"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>

      {/* Hero */}
      <div className="pt-16">
        <HeroSection onStartClick={scrollToAnalyze} />
      </div>

      {/* Analyze Section */}
      <div ref={analyzeRef} id="analyze" className="max-w-4xl mx-auto px-4 py-16">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 md:p-8 space-y-6">
          <h2 className="text-xl font-semibold">Analyze a document</h2>

          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {processing ? (
            <ProcessingState currentStep={processingStep} />
          ) : latestResult && !processing ? (
            <ResultCard analysis={latestResult} onDownload={handleDownload} />
          ) : (
            <>
              <UploadZone
                onFileSelect={handleFileSelect}
                onLinkSubmit={handleLinkSubmit}
                selectedType={selectedType}
                setSelectedType={setSelectedType}
              />
              <AnalysisOptions options={options} setOptions={setOptions} />
            </>
          )}
        </div>
      </div>

      {/* Pricing */}
      <PricingSection
        onStartFreeClick={scrollToAnalyze}
        onUpgradeClick={handleUpgrade}
      />

      {/* Footer */}
      <footer className="text-center py-12 text-white/30 text-sm border-t border-white/5">
        © {new Date().getFullYear()} InsightAI · Built with Next.js + Supabase + Groq
      </footer>
    </div>
  );
}