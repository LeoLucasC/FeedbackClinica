import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Semáforo de Salud Preventivo | Clínica Bolívar",
  description:
    "Evalúa tus signos vitales y recibe una orientación preventiva clara en minutos.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
