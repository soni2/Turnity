import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Turnity",
    short_name: "Turnity",
    description: "Reserva citas en los mejores negocios de tu ciudad",
    start_url: "/explore",
    scope: "/",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone"],
    orientation: "portrait-primary",
    background_color: "#ffffff",
    theme_color: "#5e0089",
    categories: ["lifestyle", "productivity", "business"],
    lang: "es",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "Mi Agenda",
        short_name: "Agenda",
        description: "Ver mis citas reservadas",
        url: "/agenda",
        icons: [{ src: "/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "Explorar negocios",
        short_name: "Explorar",
        description: "Buscar negocios y servicios",
        url: "/explore",
        icons: [{ src: "/icon-192x192.png", sizes: "192x192" }],
      },
    ],
  };
}
