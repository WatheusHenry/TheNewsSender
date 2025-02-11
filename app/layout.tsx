import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { Link } from "@heroui/link";
import clsx from "clsx";

import { Providers } from "./providers";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Navbar } from "@/components/navbar";
import { Snippet } from "@heroui/snippet";
import { Code } from "@heroui/code";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: "https://the-news-sender.vercel.app/",
    siteName: siteConfig.name,
    images: [
      {
        url: "https://ibb.co/nsPHtz2w",
        width: 800,
        height: 600,
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@watheusHenry",
    creator: "@watheusHenry",
  },
};


export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <div className="relative flex flex-col h-screen">
            <Navbar />
            <main className="container mx-auto max-w-7xl pt-10 px-6 flex-grow">
              {children}
            </main>
            <div className="mt-8 flex justify-center">
              <Snippet hideCopyButton hideSymbol variant="bordered">
                <span>
                  Em breve você poderá receber essas informações via{" "}
                  <Code color="primary">e-mail</Code>
                </span>
              </Snippet>
            </div>
            <footer className="w-full flex items-center justify-center py-3">
              <Link
                isExternal
                className="flex items-center gap-1 text-current"
                href="https://github.com/WatheusHenry"
                title="GitHub WatheusHenry page"
              >
                <span className="text-default-600">Powered by</span>
                <p className="text-primary">WatheusHenry </p>
              </Link>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
