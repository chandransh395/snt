
import { useEffect } from "react";

const SecurityHeaders = () => {
  useEffect(() => {
    // More robust security-related meta tags
    const metaTags = [
      {
        httpEquiv: "Content-Security-Policy",
        content: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://* blob:; connect-src 'self' https://*.supabase.co wss://*.supabase.co;"
      },
      {
        httpEquiv: "X-XSS-Protection",
        content: "1; mode=block"
      },
      {
        httpEquiv: "X-Frame-Options",
        content: "SAMEORIGIN"
      },
      {
        httpEquiv: "Referrer-Policy",
        content: "strict-origin-when-cross-origin"
      },
      {
        httpEquiv: "Permissions-Policy",
        content: "camera=(), microphone=(), geolocation=(self), interest-cohort=()"
      },
      {
        httpEquiv: "X-Content-Type-Options",
        content: "nosniff"
      },
      {
        name: "Cache-Control",
        content: "no-cache, no-store, must-revalidate"
      },
      {
        name: "Pragma",
        content: "no-cache"
      },
      {
        name: "Expires",
        content: "0"
      }
    ];

    // Clean up any existing meta tags first to avoid duplicates
    metaTags.forEach(({ httpEquiv, name }) => {
      const selector = httpEquiv 
        ? `meta[http-equiv="${httpEquiv}"]` 
        : `meta[name="${name}"]`;
      const existingMeta = document.querySelector(selector);
      if (existingMeta && existingMeta.parentNode) {
        existingMeta.parentNode.removeChild(existingMeta);
      }
    });

    // Add meta tags to document head
    metaTags.forEach(({ httpEquiv, name, content }) => {
      const meta = document.createElement("meta");
      if (httpEquiv) meta.httpEquiv = httpEquiv;
      if (name) meta.name = name;
      meta.content = content;
      document.head.appendChild(meta);
    });

    // Cleanup function to remove meta tags
    return () => {
      metaTags.forEach(({ httpEquiv, name }) => {
        const selector = httpEquiv 
          ? `meta[http-equiv="${httpEquiv}"]` 
          : `meta[name="${name}"]`;
        const meta = document.querySelector(selector);
        if (meta && meta.parentNode) {
          meta.parentNode.removeChild(meta);
        }
      });
    };
  }, []);

  return null;
};

export default SecurityHeaders;
