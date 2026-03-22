export const siteConfig = {
  name: "GrowKeeper",
  description:
    "A plant care management system to track plants, log care events, and receive reminders.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001",
} as const;
