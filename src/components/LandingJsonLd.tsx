import { SITE_ORIGIN } from "@/lib/site";
import { WAITLIST_OVERLAY } from "@/lib/shellConfig";

const orgId = `${SITE_ORIGIN}/#organization`;
const websiteId = `${SITE_ORIGIN}/#website`;
const webPageId = `${SITE_ORIGIN}/#webpage`;

/** Matches `<title>` on `/` (segment + layout template). */
const homeDocumentTitle = "Local-first AI assistant · Genta";

/**
 * Minimal JSON-LD for `/` only — Organization, WebSite, WebPage (`@graph` + stable `@id`s).
 */
export function LandingJsonLd() {
  const logoUrl = `${SITE_ORIGIN}/icons/android-512.png`;
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId,
        name: "Genta",
        url: SITE_ORIGIN,
        logo: {
          "@type": "ImageObject",
          url: logoUrl,
        },
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: SITE_ORIGIN,
        name: "Genta",
        description: WAITLIST_OVERLAY.tagline,
        publisher: { "@id": orgId },
      },
      {
        "@type": "WebPage",
        "@id": webPageId,
        url: `${SITE_ORIGIN}/`,
        name: homeDocumentTitle,
        description: WAITLIST_OVERLAY.tagline,
        isPartOf: { "@id": websiteId },
        about: { "@id": orgId },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
