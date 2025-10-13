import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://liputan-binongko-three.vercel.app"),
  title: {
    default: "Liputan Binongko",
    template: "%s | Liputan Binongko",
  },
  description:
    "Berita terkini dari Binongko, Wakatobi, dan sekitarnya.",
  openGraph: {
    title: "Liputan Binongko",
    description:
      "Berita terkini dari Binongko, Wakatobi, dan sekitarnya.",
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
    description:
      "Berita terkini dari Binongko, Wakatobi, dan sekitarnya.",
    images: ["https://liputan-binongko-three.vercel.app/default.jpg"],
  },
  // ✅ Tambahkan meta tag verifikasi Google di sini
  other: {
    "google-site-verification": "qYBO8Jrxl7ecyW-apaPOFpq1KjXSaWwt1TkpqpbdyA4",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
