import type { MetadataRoute } from "next";

import { allDocs } from "@/lib/content";

export const dynamic = "force-static";

const origin = "https://docs.newtalaria.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    {
      url: `${origin}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${origin}/search/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.3,
    },
    ...allDocs().map((doc) => ({
      url: `${origin}/${doc.slug}/`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: doc.slug.split("/").length === 1 ? 0.8 : 0.6,
    })),
  ];
}
