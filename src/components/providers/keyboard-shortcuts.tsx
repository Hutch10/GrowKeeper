"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function KeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // Global shortcuts (no modifier key)
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case "g":
            // Show shortcut menu
            if (e.shiftKey) {
              e.preventDefault();
              toast.info(
                <div className="space-y-2">
                  <p className="font-semibold">Keyboard Shortcuts</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <span className="text-slate-500">g then d</span>
                    <span>Dashboard</span>
                    <span className="text-slate-500">g then p</span>
                    <span>Plants</span>
                    <span className="text-slate-500">g then r</span>
                    <span>Reminders</span>
                    <span className="text-slate-500">n</span>
                    <span>New plant</span>
                    <span className="text-slate-500">/</span>
                    <span>Search</span>
                    <span className="text-slate-500">?</span>
                    <span>Show shortcuts</span>
                  </div>
                </div>,
                { duration: 5000 }
              );
            }
            break;
          case "n":
            e.preventDefault();
            router.push("/plants/new");
            break;
          case "/":
            e.preventDefault();
            const searchInput = document.querySelector(
              'input[placeholder*="Search"]'
            ) as HTMLInputElement;
            if (searchInput) {
              searchInput.focus();
            } else {
              router.push("/plants");
            }
            break;
          case "?":
            e.preventDefault();
            toast.info(
              <div className="space-y-2">
                <p className="font-semibold">Keyboard Shortcuts</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <span className="text-slate-500">g d</span>
                  <span>Dashboard</span>
                  <span className="text-slate-500">g p</span>
                  <span>Plants</span>
                  <span className="text-slate-500">g r</span>
                  <span>Reminders</span>
                  <span className="text-slate-500">n</span>
                  <span>New plant</span>
                  <span className="text-slate-500">/</span>
                  <span>Search</span>
                </div>
              </div>,
              { duration: 5000 }
            );
            break;
        }
      }
    };

    // Two-key shortcuts (g + letter)
    let gPressed = false;
    let gTimeout: NodeJS.Timeout;

    const handleGotoShortcut = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key.toLowerCase() === "g" && !e.ctrlKey && !e.metaKey) {
        gPressed = true;
        clearTimeout(gTimeout);
        gTimeout = setTimeout(() => {
          gPressed = false;
        }, 1000);
        return;
      }

      if (gPressed && !e.ctrlKey && !e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "d":
            e.preventDefault();
            router.push("/dashboard");
            break;
          case "p":
            e.preventDefault();
            router.push("/plants");
            break;
          case "r":
            e.preventDefault();
            router.push("/reminders");
            break;
        }
        gPressed = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keydown", handleGotoShortcut);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keydown", handleGotoShortcut);
      clearTimeout(gTimeout);
    };
  }, [router]);

  return null;
}
