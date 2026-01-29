// Structured Data (JSON-LD) helpers for SEO

import { siteConfig } from "./seo-config";

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    sameAs: [
      // Add social media links
    ],
  };
}

export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.url}`,
    })),
  };
}

export function generateCourseSchema({
  name,
  description,
  url,
  provider = siteConfig.name,
}: {
  name: string;
  description: string;
  url: string;
  provider?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name,
    description,
    url: `${siteConfig.url}${url}`,
    provider: {
      "@type": "EducationalOrganization",
      name: provider,
      url: siteConfig.url,
    },
    educationalLevel: "Master's Degree",
    inLanguage: "en-US",
  };
}

export function generateLearningResourceSchema({
  name,
  description,
  url,
  learningResourceType = "Course Material",
}: {
  name: string;
  description: string;
  url: string;
  learningResourceType?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name,
    description,
    url: `${siteConfig.url}${url}`,
    learningResourceType,
    educationalLevel: "Master's Degree",
    inLanguage: "en-US",
    provider: {
      "@type": "EducationalOrganization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };
}

export function generateVideoObjectSchema({
  name,
  description,
  thumbnailUrl,
  uploadDate,
  contentUrl,
}: {
  name: string;
  description: string;
  thumbnailUrl?: string;
  uploadDate: string;
  contentUrl: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name,
    description,
    thumbnailUrl: thumbnailUrl || siteConfig.ogImage,
    uploadDate,
    contentUrl,
    embedUrl: contentUrl,
  };
}
