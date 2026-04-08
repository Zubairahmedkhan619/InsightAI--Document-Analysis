// "use client";

// import { useState, useRef, useEffect } from "react";
// import { useUser } from "@clerk/nextjs";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { History } from "lucide-react";
// import HeroSection from "@/components/landing/HeroSection";
// import PricingSection from "@/components/landing/PricingSection";
// import UploadZone from "@/components/analysis/UploadZone";
// import AnalysisOptions from "@/components/analysis/AnalysisOptions";
// import ProcessingState from "@/components/analysis/ProcessingState";
// import ResultCard from "@/components/analysis/ResultCard";
// import { useJobStatus } from "@/hooks/useJobStatus";
// import { generateAndDownloadPDF } from "@/lib/pdf-generator";

// interface Analysis {
//   id: string;
//   title: string;
//   status: string;
//   is_paid_analysis: boolean;
//   // Add other fields as needed
// }

// interface Credits {
//   plan: string;
//   credits_remaining: number;
//   // Add other fields
// }

// export default function HomePage() {
//   const { isSignedIn } = useUser();
//   const router = useRouter();

//   const [selectedType, setSelectedType] = useState("pdf");
//   const [options, setOptions] = useState({
//     analysisType: "summary",
//     outputLanguage: "en",
//   });
//   const [processing, setProcessing] = useState(false);
//   const [currentJobId, setCurrentJobId] = useState<string | null>(null);
//   const [analyses, setAnalyses] = useState<Analysis[]>([]);
//   const [credits, setCredits] = useState<Credits | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   const analyzeRef = useRef<HTMLDivElement>(null);

//   // Realtime job status
//   const { job: liveJob, isComplete, isFailed } = useJobStatus(currentJobId);

//   const loadHistory = async () => {
//     try {
//       const res = await fetch("/api/jobs?limit=10");
//       const { jobs } = await res.json();
//       setAnalyses(jobs || []);
//     } catch (e) {
//       console.error("Failed to load history", e);
//     }
//   };

//   const loadCredits = async () => {
//     try {
//       const res = await fetch("/api/credits");
//       const { credits } = await res.json();
//       setCredits(credits);
//     } catch (e) {
//       console.error("Failed to load credits", e);
//     }
//   };

//   // When job completes, add to analyses list and stop processing
//   useEffect(() => {
//     if (isComplete && liveJob) {
//       setAnalyses((prev) => [
//         liveJob,
//         ...prev.filter((a) => a.id !== liveJob.id),
//       ]);
//       setProcessing(false);
//       setCurrentJobId(null);
//     }
//     if (isFailed) {
//       setProcessing(false);
//       setCurrentJobId(null);
//       setError("Analysis failed. Please try again.");
//     }
//   }, [isComplete, isFailed, liveJob]);

//   useEffect(() => {
//     if (isSignedIn) {
//       loadHistory();
//       loadCredits();
//     }
//   }, [isSignedIn]);

//   const scrollToAnalyze = () => {
//     analyzeRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   const handleUpgrade = async () => {
//     const res = await fetch("/api/stripe/create-checkout", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ plan: "pro" }),
//     });
//     const { url } = await res.json();
//     window.location.href = url;
//   };

//   const detectLanguage = async (hint: string): Promise<string> => {
//     try {
//       const res = await fetch("/api/detect-language", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ hint }),
//       });
//       const { lang } = await res.json();
//       return lang || "en";
//     } catch {
//       return "en";
//     }
//   };

//   const runAnalysis = async (
//     inputUrl: string,
//     inputType: string,
//     title: string,
//   ) => {
//     if (!isSignedIn) {
//       router.push("/sign-in");
//       return;
//     }
//     if (credits && credits.credits_remaining <= 0) {
//       setError("No credits remaining. Upgrade to Pro for more.");
//       return;
//     }

//     setProcessing(true);
//     setError(null);

//     const isPaidAnalysis = credits?.plan !== "free";

//     const res = await fetch("/api/jobs", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         title,
//         input_type: inputType,
//         input_url: inputUrl,
//         output_language: options.outputLanguage,
//         analysis_type: options.analysisType,
//         is_paid_analysis: isPaidAnalysis,
//       }),
//     });

//     const { job } = await res.json();
//     if (job?.id) {
//       setCurrentJobId(job.id);
//     } else {
//       setProcessing(false);
//       setError("Failed to create job. Please try again.");
//     }
//   };

//   const handleFileSelect = async (file: File, type: string) => {
//     const detectedLang = await detectLanguage(file.name);
//     setOptions((prev) => ({ ...prev, outputLanguage: detectedLang }));

//     const res = await fetch("/api/upload", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ filename: file.name, contentType: file.type }),
//     });
//     const { uploadUrl, fileUrl } = await res.json();

//     await fetch(uploadUrl, {
//       method: "PUT",
//       body: file,
//       headers: { "Content-Type": file.type },
//     });

//     await runAnalysis(fileUrl, type, file.name);
//   };

//   const handleLinkSubmit = async (url: string, type: string) => {
//     const detectedLang = await detectLanguage(url);
//     setOptions((prev) => ({ ...prev, outputLanguage: detectedLang }));
//     await runAnalysis(url, type, url);
//   };

//   const handleDownload = (analysis: Analysis) => {
//     const isPro = credits?.plan !== "free";
//     if (!isPro && analysis.is_paid_analysis) return;
//     generateAndDownloadPDF(analysis);
//   };

//   // Determine processing step for ProcessingState component
//   const processingStep =
//     liveJob?.status === "processing"
//       ? 2
//       : liveJob?.status === "completed"
//         ? 3
//         : 1;

//   const latestResult = analyses[0];

  
//   return (
//     <div className="min-h-screen text-white relative">
//       {/* Background mesh */}
//       <div
//         className="fixed inset-0 z-0 pointer-events-none"
//         style={{
//           background: `
//           radial-gradient(ellipse 80% 60% at 10% 10%, rgba(139,92,246,0.18) 0%, transparent 60%),
//           radial-gradient(ellipse 60% 80% at 90% 20%, rgba(217,119,235,0.12) 0%, transparent 55%),
//           radial-gradient(ellipse 70% 50% at 50% 90%, rgba(99,62,180,0.15) 0%, transparent 60%)`,
//         }}
//       />

//       {/* Nav */}
//       <nav
//         className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-12 py-5
//       backdrop-blur-xl border-b border-white/[0.09]"
//       >
//         <Link
//           href="/"
//           style={{ fontFamily: "var(--font-display)" }}
//           className="text-[22px] font-light tracking-widest text-[#f5f0ff]"
//         >
//           Insight<span className="text-violet-400">AI</span>
//         </Link>
//         <div className="flex items-center gap-7">
//           {isSignedIn ? (
//             <>
//               <span className="text-[11px] tracking-[0.12em] uppercase text-violet-400/60">
//                 {credits?.credits_remaining ?? "–"} credits
//               </span>
//               <Link
//                 href="/history"
//                 className="flex items-center gap-1.5 text-white/40 hover:text-white/80 text-[12px] tracking-widest uppercase transition-colors"
//               >
//                 <History className="w-3.5 h-3.5" /> History
//               </Link>
//             </>
//           ) : (
//             <Link
//               href="/sign-in"
//               className="text-[12px] tracking-[0.1em] uppercase px-6 py-2 rounded-full
//               bg-violet-500/[0.12] border border-violet-400/30 text-violet-300
//               hover:bg-violet-500/20 hover:border-violet-400/50 transition-all"
//             >
//               Sign in
//             </Link>
//           )}
//         </div>
//       </nav>

//       {/* Hero */}
//       <div className="pt-16 relative z-10">
//         {/* <div className=" mt-20  relative z-20"> */}
//         <HeroSection onStartClick={scrollToAnalyze} />
//       </div>

//       {/* Divider */}
//       <div className="relative z-10 flex justify-center py-2">
//         <div
//           className="w-px h-14"
//           style={{
//             background:
//               "linear-gradient(to bottom, transparent, rgba(192,132,252,0.3), transparent)",
//           }}
//         />
//       </div>

//       {/* Analyze Section */}
//       <div
//         ref={analyzeRef}
//         id="analyze"
//         className="relative z-10 max-w-3xl mx-auto px-6 pb-20 pt-8"
//       >
//         {/* Glass card */}
//         <div
//           className="relative rounded-[20px] border border-white/[0.08] bg-white/[0.03]
//         backdrop-blur-2xl p-8 md:p-10 space-y-7
//         shadow-[0_32px_64px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]"
//         >
//           {/* Top shimmer line */}
//           <div
//             className="absolute top-0 left-8 right-8 h-px rounded-full"
//             style={{
//               background:
//                 "linear-gradient(90deg, transparent, rgba(192,132,252,0.5), rgba(217,119,235,0.4), transparent)",
//             }}
//           />

//           <h2
//             style={{ fontFamily: "var(--font-display)" }}
//             className="text-[26px] font-light tracking-wide "
//           >
//             Analyze a document
//           </h2>

//           {error && (
//             <div className="rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 text-sm">
//               {error}
//             </div>
//           )}

//           {processing ? (
//             <ProcessingState currentStep={processingStep} />
//           ) : latestResult && !processing ? (
//             <ResultCard analysis={latestResult} onDownload={handleDownload} />
//           ) : (
//             <>
//               <UploadZone
//                 onFileSelect={handleFileSelect}
//                 onLinkSubmit={handleLinkSubmit}
//                 selectedType={selectedType}
//                 setSelectedType={setSelectedType}
//               />
//               <AnalysisOptions options={options} setOptions={setOptions} />
//             </>
//           )}
//         </div>

//         {/* Trust strip */}
//         <div className="flex items-center justify-center gap-8 mt-8">
//           {["End-to-end encrypted", "No data stored", "SOC 2 compliant"].map(
//             (item) => (
//               <span
//                 key={item}
//                 className="flex items-center gap-2 text-[11px] tracking-[0.1em] uppercase text-white/20"
//               >
//                 <span className="w-1 h-1 rounded-full bg-violet-400/40" />
//                 {item}
//               </span>
//             ),
//           )}
//         </div>
//       </div>

//       {/* Pricing */}
//       <div className="relative z-10">
//         <PricingSection
//           onStartFreeClick={scrollToAnalyze}
//           onUpgradeClick={handleUpgrade}
//         />
//       </div>

//       {/* Footer */}
//       <footer className="relative z-10 text-center py-12 text-white/20 text-[11px] tracking-[0.15em] uppercase border-t border-white/[0.05]">
//         © {new Date().getFullYear()} InsightAI
//       </footer>
//     </div>
//   );
// }



"use client";

import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { History, Plus, AlertCircle, Zap } from "lucide-react";
import HeroSection from "@/components/landing/HeroSection";
import PricingSection from "@/components/landing/PricingSection";
import UploadZone from "@/components/analysis/UploadZone";
import AnalysisOptions from "@/components/analysis/AnalysisOptions";
import ProcessingState from "@/components/analysis/ProcessingState";
import ResultCard from "@/components/analysis/ResultCard";
import { useJobStatus } from "@/hooks/useJobStatus";
import { generateAndDownloadPDF } from "@/lib/pdf-generator";

export default function HomePage() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  const [selectedType, setSelectedType]   = useState("pdf");
  const [options, setOptions]             = useState({ analysisType: "summary", outputLanguage: "en" });
  const [processing, setProcessing]       = useState(false);
  const [currentJobId, setCurrentJobId]   = useState<string | null>(null);
  const [latestResult, setLatestResult]   = useState<any>(null);
  const [showResult, setShowResult]       = useState(false);
  const [credits, setCredits]             = useState<any>(null);
  const [error, setError]                 = useState<string | null>(null);

  const analyzeRef = useRef<HTMLDivElement>(null);
  const { job: liveJob, isComplete, isFailed, step } = useJobStatus(currentJobId);

  // When job completes → show result
  useEffect(() => {
    if (isComplete && liveJob) {
      setLatestResult(liveJob);
      setShowResult(true);
      setProcessing(false);
      setCurrentJobId(null);
      loadCredits(); // refresh credit count in nav
    }
    if (isFailed) {
      setProcessing(false);
      setCurrentJobId(null);
      setError("Analysis failed. Please try again.");
    }
  }, [isComplete, isFailed, liveJob]);

  useEffect(() => {
    if (isSignedIn) loadCredits();
  }, [isSignedIn]);

  const loadCredits = async () => {
    try {
      const res = await fetch("/api/credits");
      const { credits } = await res.json();
      setCredits(credits);
    } catch (e) {
      console.error("Failed to load credits", e);
    }
  };

  // ── Reset to upload zone for a new analysis ──────────────────────────────
  const handleAnalyzeAnother = () => {
    setShowResult(false);
    setLatestResult(null);
    setError(null);
    setSelectedType("pdf");
    setOptions({ analysisType: "summary", outputLanguage: "en" });
    // Scroll back to upload zone
    setTimeout(() => analyzeRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const scrollToAnalyze = () => {
    analyzeRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleUpgrade = async () => {
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "pro" }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      setError("Failed to start checkout. Please try again.");
    }
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

  const runAnalysis = async (inputUrl: string, inputType: string, title: string) => {
    if (!isSignedIn) { router.push("/sign-in"); return; }

    setProcessing(true);
    setShowResult(false);
    setError(null);

    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        input_type:       inputType,
        input_url:        inputUrl,
        output_language:  options.outputLanguage,
        analysis_type:    options.analysisType,
      }),
    });

    const data = await res.json();

    // Handle credit/tier errors gracefully
    if (res.status === 402) {
      setProcessing(false);
      setError("No credits remaining this month. Upgrade to Pro for 100 analyses.");
      return;
    }
    if (res.status === 403) {
      setProcessing(false);
      setError(data.error + " — Upgrade to Pro to unlock all file types.");
      return;
    }
    if (!data.job?.id) {
      setProcessing(false);
      setError(data.error || "Failed to create job. Please try again.");
      return;
    }

    setCurrentJobId(data.job.id);
  };

  const handleFileSelect = async (file: File, type: string) => {
    const detectedLang = await detectLanguage(file.name);
    setOptions((prev) => ({ ...prev, outputLanguage: detectedLang }));

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });
      const { uploadUrl, fileUrl } = await res.json();
      await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      await runAnalysis(fileUrl, type, file.name);
    } catch (e) {
      setProcessing(false);
      setError("Upload failed. Please try again.");
    }
  };

  const handleLinkSubmit = async (url: string, type: string) => {
    const detectedLang = await detectLanguage(url);
    setOptions((prev) => ({ ...prev, outputLanguage: detectedLang }));
    await runAnalysis(url, type, url);
  };

  const handleDownload = (analysis: any) => {
    generateAndDownloadPDF(analysis);
  };

  const isPro            = credits?.plan === "pro";
  const creditsRemaining = credits?.credits_remaining ?? null;

  return (
    <div className="min-h-screen text-white">

      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-sm border-b border-white/5">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Insight<span className="text-violet-400">AI</span>
        </Link>
        <div className="flex items-center gap-4">
          {isSignedIn ? (
            <>
              {/* Credits badge */}
              {creditsRemaining !== null && (
                <span className={`text-xs px-2.5 py-1 rounded-full border ${
                  creditsRemaining === 0
                    ? "bg-red-500/10 border-red-500/30 text-red-400"
                    : "bg-white/5 border-white/10 text-white/50"
                }`}>
                  {creditsRemaining} credit{creditsRemaining !== 1 ? "s" : ""} left
                </span>
              )}
              {/* Upgrade badge for free users */}
              {!isPro && (
                <button
                  onClick={handleUpgrade}
                  className="flex items-center gap-1 text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30 px-3 py-1.5 rounded-full hover:bg-violet-500/30 transition"
                >
                  <Zap className="w-3 h-3" /> Upgrade
                </button>
              )}
              <Link href="/history" className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors">
                <History className="w-4 h-4" /> History
              </Link>
            </>
          ) : (
            <Link href="/sign-in" className="text-sm bg-white text-black px-4 py-1.5 rounded-full font-medium hover:bg-white/90 transition">
              Sign in
            </Link>
          )}
        </div>
      </nav>

      {/* ── Hero ── */}
      <div className="pt-16">
        <HeroSection onStartClick={scrollToAnalyze} />
      </div>

      {/* ── Analyze Section ── */}
      <div ref={analyzeRef} id="analyze" className="max-w-4xl mx-auto px-4 py-16">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 md:p-8 space-y-6">

          {/* Header row */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Analyze a document</h2>
            {/* Show "Analyze Another" button when result is visible */}
            {showResult && (
              <button
                onClick={handleAnalyzeAnother}
                className="flex items-center gap-1.5 text-sm bg-violet-500/20 text-violet-300 border border-violet-500/30 px-4 py-2 rounded-xl hover:bg-violet-500/30 transition"
              >
                <Plus className="w-4 h-4" /> Analyze Another
              </button>
            )}
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p>{error}</p>
                {error.includes("credits") || error.includes("Upgrade") ? (
                  <button
                    onClick={handleUpgrade}
                    className="mt-2 text-violet-400 hover:text-violet-300 underline text-xs"
                  >
                    Upgrade to Pro →
                  </button>
                ) : null}
              </div>
              <button onClick={() => setError(null)} className="text-red-400/60 hover:text-red-300 ml-2">✕</button>
            </div>
          )}

          {/* No credits banner */}
          {creditsRemaining === 0 && !processing && !showResult && (
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 px-4 py-3 text-sm flex items-center justify-between">
              <span>You've used all your free analyses this month.</span>
              <button onClick={handleUpgrade} className="text-violet-400 hover:text-violet-300 underline text-xs ml-4">
                Upgrade to Pro →
              </button>
            </div>
          )}

          {/* ── Main content area ── */}
          {processing ? (
            <ProcessingState currentStep={step ?? 1} />
          ) : showResult && latestResult ? (
            <>
              <ResultCard analysis={latestResult} onDownload={handleDownload} />
              {/* Second "Analyze Another" button below result */}
              <button
                onClick={handleAnalyzeAnother}
                className="w-full flex items-center justify-center gap-2 text-sm border border-white/10 text-white/50 hover:text-white hover:border-white/20 rounded-xl py-3 transition"
              >
                <Plus className="w-4 h-4" /> Analyze Another Document
              </button>
            </>
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

      {/* ── Pricing ── */}
      <PricingSection onStartFreeClick={scrollToAnalyze} onUpgradeClick={handleUpgrade} />

      {/* ── Footer ── */}
      <footer className="text-center py-12 text-white/30 text-sm border-t border-white/5">
        © {new Date().getFullYear()} InsightAI · Powered by Groq AI
      </footer>
    </div>
  );
}