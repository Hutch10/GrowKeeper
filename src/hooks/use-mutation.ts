"use client";

import { useSyncStatus } from "@/components/providers/sync-status-provider";
import { ActionResult } from "@/app/actions/types";
import { useState } from "react";

export function useSyncMutation<TInput, TOutput>(
  action: (data: TInput) => Promise<ActionResult<TOutput>>
) {
  const { setStatus, setLastError } = useSyncStatus();
  const [isPending, setIsPending] = useState(false);

  const mutate = async (data: TInput): Promise<ActionResult<TOutput>> => {
    setIsPending(true);
    setStatus("pending");
    setLastError(null);

    try {
      const result = await action(data);
      if (result.success) {
        setStatus("idle");
      } else {
        setStatus("error");
        setLastError(result.error);
      }
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred.";
      setStatus("error");
      setLastError(message);
      // We cast to ActionResult<TOutput> to satisfy the return type while returning a failure
      return { 
        success: false, 
        data: null as unknown as TOutput, 
        error: message 
      } as ActionResult<TOutput>;
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending };
}
