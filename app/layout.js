import "./globals.css";
import Script from "next/script";

export const metadata = {
  metadataBase: new URL("https://liputan-binongko-three.vercel.app"),
  title: {
    default: "Liputan Binongko",
    template: "%s | Liputan Binongko",
  },
  description: "Berita terkini dari Binongko, Wakatobi, dan sekitarnya.",
  openGraph: {
    title: "Liputan Binongko",
    description: "Berita terkini dari Binongko, Wakatobi, dan sekitarnya.",
    url: "https://liputan-binongko-three.vercel.app",
    siteName: "Liputan Binongko",
    images: [
      {
        url: "https://liputan-binongko-three.vercel.app/default.jpg",
        width: 1200,
        height: 630,
        alt: "Liputan Binongko",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Liputan Binongko",
    description: "Berita terkini dari Binongko, Wakatobi, dan sekitarnya.",
    images: ["https://liputan-binongko-three.vercel.app/default.jpg"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        {/* ✅ Dua meta verifikasi Google */}
        <meta
          name="google-site-verification"
          content="nnD-5BQzd2yRP-1dsErrVBcHtLOlwNFotRrNwHe5Fms"
        />
      </head>
      <body>
        {children}

        {/* ✅ Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-X6ZL5ETZ4N"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-X6ZL5ETZ4N');
          `}
        </Script>
      </body>
    </html>
  );
}
