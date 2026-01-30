// SEO Configuration for MCA Hub Application

export const siteConfig = {
  name: "MCA - CSI Institute of Technology, Thovalai",
  title: "MCA | CSI Institute of Technology, Thovalai",
  description: "MCA Hub - Comprehensive learning portal for MCA students at CSI Institute of Technology, Thovalai. Access course materials, study resources, videos, and PDFs.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://csi-mca.vercel.app",
  ogImage: "/og-image.png",
  keywords: [
    "MCA",
    "Master of Computer Applications",
    "Computer Science Education",
    "Online Learning",
    "Programming Courses",
    "Data Science",
    "Software Engineering",
    "Web Development",
    "Database Management",
    "Algorithm Studies"
  ],
  authors: [
    {
      name: "CSI Institute of Technology, Thovalai",
      url: "https://csi-mca.vercel.app/about",
    },
  ],
  creator: "MCA CSI Institute of Technology, Thovalai",
  publisher: "MCA CSI Institute of Technology, Thovalai",
  language: "en-US",
  locale: "en_US",
};

export const socialLinks = {
  twitter: "@mcahub", // Replace with actual Twitter handle
  github: "https://github.com/mcahub", // Replace with actual GitHub
  linkedin: "https://linkedin.com/company/mcahub", // Replace with actual LinkedIn
};

export const defaultMetadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: siteConfig.authors,
  creator: siteConfig.creator,
  publisher: siteConfig.publisher,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: socialLinks.twitter,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large" as const,
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon.png" },
      { url: "/favicon.ico", rel: "icon" }
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  verification: {
    google: "cETdfQKwsKBINm-2olRvmXjb5-CkvK1XfP63Nul-qYs",
  },
};

// Helper to generate page metadata
export function generatePageMetadata({
  title,
  description,
  keywords,
  path = "/",
  image,
  noIndex = false,
}: {
  title: string;
  description: string;
  keywords?: string[];
  path?: string;
  image?: string;
  noIndex?: boolean;
}) {
  const url = `${siteConfig.url}${path}`;
  const ogImage = image || siteConfig.ogImage;

  return {
    title,
    description,
    keywords: keywords || siteConfig.keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: siteConfig.locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
      creator: socialLinks.twitter,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
        },
  };
}
