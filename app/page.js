import Image from "next/image";
import Link from "next/link";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, child } from "firebase/database";
import SliderClient from "./components/SliderClient";
import Header from "./components/Header";

// ✅ Metadata resmi Next.js
export const metadata = {
  title: "Liputan Binongko - Berita Terbaru",
  description: "Berita terbaru dan populer dari Liputan Binongko.",
  openGraph: {
    title: "Liputan Binongko - Berita Terbaru",
    description: "Berita terbaru dan terpercaya dari Liputan Binongko.",
    url: "https://webkamu.com/",
    siteName: "Liputan Binongko",
    images: [
      {
        url: "/img/default.jpg",
        width: 800,
        height: 600,
        alt: "Liputan Binongko",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
};

// ✅ Revalidate untuk ISR
export const revalidate = 10; // rebuild halaman tiap 10 detik

// ✅ Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCHYqB77kPPJcoNfW8APKUQoh066eMGipA",
  authDomain: "portal-binongko-dad4d.firebaseapp.com",
  databaseURL:
    "https://portal-binongko-dad4d-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "portal-binongko-dad4d",
  storageBucket: "portal-binongko-dad4d.appspot.com",
  messagingSenderId: "582358308032",
  appId: "1:582358308032:web:9d36c636adec204ab24925",
};

// ✅ Inisialisasi Firebase hanya sekali
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ✅ Fungsi SSR: ambil semua berita dari Firebase
async function getAllBerita() {
  const dbRef = ref(db);
  const snapshot = await get(child(dbRef, `berita`));
  if (!snapshot.exists()) return [];

  const data = snapshot.val();
  return Object.entries(data)
    .map(([key, value]) => ({ id: key, ...value }))
    .filter((b) => b.status === "approved")
    .sort((a, b) => new Date(b.tanggal || 0) - new Date(a.tanggal || 0));
}

// ✅ Server Component untuk Home page
export default async function Home() {
  const allBerita = await getAllBerita();

  // Ambil berita terbaru, populer, dan lainnya
  const beritaTerbaru = allBerita.slice(0, 5);
  const beritaPopuler = [...allBerita]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);
  const beritaLainnya = allBerita.slice(5);

  return (
    <>
      {/* ✅ Header Reusable */}
      <Header />

      <main>
        {/* ✅ Slider Berita Terbaru */}
        <section id="berita">
          <h2 className="Berita-Terbaru">Berita Terbaru</h2>
          <SliderClient berita={beritaTerbaru} />
        </section>

        {/* ✅ Berita Populer */}
        <section id="berita-populer">
          <h2 className="Berita-Populer">Berita Populer</h2>
          <div id="berita-populer-list">
            {beritaPopuler.map((b) => (
              <div key={b.id} className="berita-populer-item">
                <a href={`/berita/${b.id}`} className="berita-card-title">
                  {b.judul}
                </a>
                <p className="views-info">
                  ({b.views || 0}x dilihat)
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ✅ Berita Lainnya */}
        <section id="berita-lainnya">
          <h2 className="Berita-Lainnya">Berita Lainnya</h2>
          <div id="berita-lainnya-list">
            {beritaLainnya.map((b) => (
              <div key={b.id} className="berita-lainnya-card">
                <a href={`/berita/${b.id}`} className="berita-card-title">
                  {b.judul}
                </a>
                <p className="views-info">
                  ({b.views || 0}x dilihat)
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ✅ Footer */}
        <footer>
          <p>&copy; 2025 - Liputan Binongko. Semua Hak Dilindungi.</p>
        </footer>
      </main>
    </>
  );
}
