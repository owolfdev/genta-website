import type { MetadataRoute } from "next";
import { LEGAL_ROUTES } from "@/lib/legalRoutes";
import { SITE_ORIGIN } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const entries: { path: string; changeFrequency: MetadataRoute.Sitemap[0]["changeFrequency"]; priority: number }[] =
    [
      { path: "/", changeFrequency: "weekly", priority: 1 },
      { path: LEGAL_ROUTES.contact, changeFrequency: "monthly", priority: 0.7 },
      { path: LEGAL_ROUTES.privacyPolicy, changeFrequency: "monthly", priority: 0.6 },
    ];

  return entries.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_ORIGIN}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
