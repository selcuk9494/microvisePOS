import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Microvise POS",
    short_name: "Microvise POS",
    description: "Microvise POS restoran ve adisyon yonetim uygulamasi",
    start_url: "/login",
    display: "standalone",
    background_color: "#0f0a1f",
    theme_color: "#b32786",
    lang: "tr-TR",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
