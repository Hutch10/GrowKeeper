"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: "white",
          border: "1px solid #e2e8f0",
          borderRadius: "0.75rem",
        },
        classNames: {
          success: "border-green-200 bg-green-50",
          error: "border-red-200 bg-red-50",
          warning: "border-amber-200 bg-amber-50",
          info: "border-blue-200 bg-blue-50",
        },
      }}
      richColors
      closeButton
    />
  );
}
