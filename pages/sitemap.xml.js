import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, get } from "firebase/database";

// ✅ Pakai konfigurasi yang sama dengan app/page.js
const firebaseConfig = {
  apiKey: "AIzaSyCHYqB77kPPJcoNfW8APKUQoh066eMGipA",
  authDomain: "portal-binongko-dad4d.firebaseapp.com",
  databaseURL: "https://portal-binongko-dad4d-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "portal-binongko-dad4d",
  storageBucket: "portal-binongko-dad4d.appspot.com",
  messagingSenderId: "582358308032",
  appId: "1:582358308032:web:9d36c636adec204ab24925",
};

// ✅ Inisialisasi Firebase hanya sekali
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const database = getDatabase(app);

// ✅ Fungsi pembuat sitemap
function generateSitemap(urls) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://liputan-binongko-three.vercel.app/</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <priority>1.0</priority>
  </url>
  ${urls
    .map(
      (u) => `
  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <priority>${u.priority}</priority>
  </url>`
    )
    .join("")}
</urlset>`;
}

// ✅ Ambil data dari Firebase dan tampilkan sitemap XML
export async function getServerSideProps({ res }) {
  let urls = [];

  try {
    const beritaRef = ref(database, "berita");
    const snapshot = await get(beritaRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      Object.keys(data).forEach((key) => {
        const item = data[key];
        if (item.status === "approved") {
          urls.push({
            loc: `https://liputan-binongko-three.vercel.app/berita/${key}`,
            lastmod: new Date(item.tanggal || Date.now()).toISOString().split("T")[0],
            priority: 0.8,
          });
        }
      });
    }
  } catch (err) {
    console.error("Firebase Error:", err);
  }

  const sitemap = generateSitemap(urls);
  res.setHeader("Content-Type", "text/xml");
  res.write(sitemap);
  res.end();

  return { props: {} };
}

export default function Sitemap() {
  return null;
}
