import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase";

export function useJobStatus(jobId: string | null) {
  const [job, setJob] = useState<any>(null);
  const supabase = createBrowserClient();

  useEffect(() => {
    if (!jobId) return;

    // Initial fetch to get current state
    supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .single()
      .then(({ data }) => {
        if (data) setJob(data);
      });

    // Realtime subscription for updates
    const channel = supabase
      .channel("job-status-" + jobId)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "jobs",
          filter: "id=eq." + jobId,
        },
        (payload) => setJob(payload.new),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [jobId]);

  // Map job status to ProcessingState step number (0–3)
  const step = !job
    ? 0
    : job.status === "pending"
      ? 0
      : job.status === "processing"
        ? 2
        : job.status === "completed"
          ? 3
          : 0;

  return {
    job,
    step,
    isComplete: job?.status === "completed",
    isFailed: job?.status === "failed",
  };
}
