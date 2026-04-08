"use client";

import { useEffect, useState } from "react";

export interface CreditsLike {
  plan: "free" | string;
  credits_remaining: number;
  [key: string]: any;
}

/**
 * Stub credits hook.
 *
 * Replace with real `/api/credits` fetching + any caching you want.
 */
export function useCredits() {
  const [credits, setCredits] = useState<CreditsLike | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/credits")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setCredits(data?.credits ?? null);
      })
      .catch(() => {
        if (cancelled) return;
        setCredits(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return credits;
}

