import type { Metadata } from "next";
import { Geist, Poppins } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site-config";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/layout/header/header";
import { Footer } from "@/components/layout/footer";
import GoogleTagManager from "@/components/analyatics/GoogleTagManager";
import MetaPixel from "@/components/analyatics/MetaPixel";
import { WhatsAppButton } from "@/components/utils/wp";

// next/font self-hosts this at build time: no requests to Google at runtime.
// One file per weight, so only list weights you really use (see the grep in the notes).
const poppins = Geist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  fallback: ["system-ui", "arial"],
});

export const metadata: Metadata = {
  title: { default: site.name, template: `%s | ${site.name}` },
  description: "Buy quality products at affordable price.",
};

const prod = process.env.NODE_ENV === "production";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* No manual <head>: Next injects the font, favicon (app/favicon.ico, app/icon.*, app/apple-icon.*) and metadata */}
      <body className={`${poppins.className} antialiased`}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <WhatsAppButton />
        <Toaster />

        {/* Trackers: production only, after the page content */}
        {prod && (
          <>
            <MetaPixel />
            <GoogleTagManager />
          </>
        )}
      </body>
    </html>
  );
}
