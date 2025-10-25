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
    url: "https://liputan-binongko-three.vercel.app/",
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
export const revalidate = 10;

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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ✅ Fungsi SSR: ambil semua berita
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

  const beritaTerbaru = allBerita.slice(0, 5);
  const beritaPopuler = [...allBerita]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);
  const beritaLainnya = allBerita.slice(5);

  return (
    <>
      <Header />

      <main className="p-4">
        {/* ✅ Section Pencarian Berita (baru ditambahkan) */}
        <section id="pencarian-berita" className="mb-6">
          <input
            type="text"
            id="cariInput"
            placeholder="Cari judul berita..."
            className="border p-2 rounded w-full md:w-1/2"
          />
          <button
            id="cariBtn"
            className="bg-blue-500 text-white px-4 py-2 rounded ml-2"
          >
            Cari
          </button>
        </section>

        <ul id="hasilCari" className="space-y-2 mb-6"></ul>

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
                <p className="views-info">({b.views || 0}x dilihat)</p>
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
                <p className="views-info">({b.views || 0}x dilihat)</p>
              </div>
            ))}
          </div>
        </section>

        <footer>
          <p>&copy; 2025 - Liputan Binongko. Semua Hak Dilindungi.</p>
        </footer>
      </main>

      {/* ✅ Script pencarian client-side */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            const cariInput = document.getElementById('cariInput');
            const cariBtn = document.getElementById('cariBtn');
            const hasilCari = document.getElementById('hasilCari');
            const beritaList = ${JSON.stringify(allBerita)};

            function renderHasil(items) {
              hasilCari.innerHTML = '';
              if (items.length === 0) {
                hasilCari.innerHTML = '<li class="text-gray-500">Berita tidak ditemukan</li>';
                return;
              }
              items.forEach(b => {
                const li = document.createElement('li');
                li.innerHTML = \`<a href="/berita/\${b.id}" class="text-blue-600 hover:underline">\${b.judul}</a>\`;
                hasilCari.appendChild(li);
              });
            }

            cariBtn.addEventListener('click', () => {
              const keyword = cariInput.value.toLowerCase();
              const filtered = beritaList.filter(b => b.judul.toLowerCase().includes(keyword));
              renderHasil(filtered);
            });

            cariInput.addEventListener('keyup', (e) => {
              if (e.key === 'Enter') {
                cariBtn.click();
              }
            });
          `,
        }}
      />
    </>
  );
}
