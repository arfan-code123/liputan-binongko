// app/berita/[id]/page.js
import { notFound } from "next/navigation";
import { ref, get, set } from "firebase/database";
import { getDB } from "../../../lib/firebase";
import ShareButtons from "../../../components/ShareButtons";

// 🔹 Format paragraf agar rapi
function formatParagraf(teks) {
  if (!teks) return "";
  return teks
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((p, i) => <p key={i}>{p.trim()}</p>);
}

// 🔹 Metadata dinamis (SEO & preview sosial)
export async function generateMetadata({ params }) {
  const { id } = params;
  const db = getDB();
  const beritaRef = ref(db, "berita/" + id);
  const snapshot = await get(beritaRef);

  if (!snapshot.exists()) {
    return { title: "Berita Tidak Ditemukan - Liputan Binongko" };
  }

  const berita = snapshot.val();
  const fullUrl = `https://liputan-binongko-three.vercel.app/berita/${id}`;
  const imageUrl =
    berita.fileURL || "https://liputan-binongko-three.vercel.app/default.jpg";
  const deskripsi =
    berita.isi?.slice(0, 150) || "Berita terkini dari Binongko, Wakatobi.";

  return {
    metadataBase: new URL("https://liputan-binongko-three.vercel.app"),
    title: `${berita.judul} - Liputan Binongko`,
    description: deskripsi,
    openGraph: {
      title: berita.judul,
      description: deskripsi,
      url: fullUrl,
      siteName: "Liputan Binongko",
      type: "article",
      locale: "id_ID",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: berita.judul,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: berita.judul,
      description: deskripsi,
      images: [imageUrl],
      site: "@LiputanBinongko",
      creator: "@LiputanBinongko",
    },
  };
}

// 🔹 Halaman detail berita
export default async function BeritaDetailPage({ params }) {
  const { id } = params;
  const db = getDB();
  const beritaRef = ref(db, "berita/" + id);
  const snapshot = await get(beritaRef);

  if (!snapshot.exists()) {
    notFound();
  }

  const data = snapshot.val();

  // ✅ Update jumlah views (sementara di server)
  const currentViews = data.views || 0;
  await set(ref(db, `berita/${id}/views`), currentViews + 1);

  // 🔹 Ambil semua berita untuk populer & lainnya
  const semuaRef = ref(db, "berita");
  const semuaSnap = await get(semuaRef);
  const semua = semuaSnap.exists()
    ? Object.entries(semuaSnap.val()).map(([key, val]) => ({ id: key, ...val }))
    : [];

  const populer = semua
    .filter((b) => b.status === "approved")
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  const lainnya = semua
    .filter((b) => b.id !== id && b.status === "approved")
    .sort(
      (a, b) => new Date(b.tanggal || 0) - new Date(a.tanggal || 0)
    )
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="p-4 border-b border-gray-300">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            <a href="/">Liputan Binongko</a>
          </h1>
          <nav className="flex gap-4">
            <a href="/">Beranda</a>
            <a href="/profil">Profil</a>
            <a href="/kontak">Kontak</a>
            <a href="/tentang">Tentang</a>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4">
        <section id="detail-berita" className="mb-8">
          <h2 className="text-xl font-semibold mb-2">{data.judul}</h2>
          <div className="text-sm text-gray-600 mb-4">
            {data.tanggal && <span>Tanggal: {data.tanggal}</span>}{" "}
            {data.penulis && <span> | Penulis: {data.penulis}</span>}
          </div>

          {data.fileURL && (
            <img
              src={data.fileURL}
              alt={data.judul}
              className="w-full rounded-md mb-4"
            />
          )}

          <article id="isi" className="leading-relaxed">
            {formatParagraf(data.isi)}
          </article>
        </section>

        <ShareButtons judul={data.judul} />

        <section id="berita-populer" className="mt-10">
          <h2 className="text-lg font-semibold mb-3">Berita Populer</h2>
          <ul className="space-y-2">
            {populer.map((b) => (
              <li key={b.id}>
                <a href={`/berita/${b.id}`} className="text-blue-700">
                  {b.judul}
                </a>{" "}
                <span className="text-gray-500 text-sm">
                  ({b.views || 0}x dilihat)
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section id="berita-lainnya" className="mt-10">
          <h2 className="text-lg font-semibold mb-3">Berita Lainnya</h2>
          <ul className="space-y-2">
            {lainnya.map((b) => (
              <li key={b.id}>
                <a href={`/berita/${b.id}`} className="text-blue-700">
                  {b.judul}
                </a>{" "}
                <span className="text-gray-500 text-sm">
                  ({b.views || 0}x dilihat)
                </span>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="text-center py-4 text-sm border-t border-gray-300 mt-10">
        <p>&copy; 2025 - Liputan Binongko. Semua Hak Dilindungi.</p>
      </footer>
    </div>
  );
}
